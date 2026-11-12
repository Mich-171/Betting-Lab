
import {
  loadData,
  saveData,
  loadFixtures,
  saveFixtures,
  downloadJSON
} from "./storage.js";

import {
  money,
  calcOdds,
  calcPotential
} from "./calculations.js";

import {
  allFixtures,
  fixturesFor,
  addFixture,
  removeFixture,
  importFixtures
} from "./fixtures.js";

import {
  $,
  toast,
  renderDashboard,
  renderBets,
  renderStats,
  renderFixtures,
  renderFixturePicker,
  renderEvents,
  filterBets
} from "./ui.js";

// ================================
// DATI INIZIALI
// ================================

let data = loadData();
data.bets ??= [];

let events = [];

let manualOdds = false;
let manualPotential = false;

// ================================
// AGGIORNAMENTO INTERFACCIA
// ================================

function refresh() {
  renderDashboard(data.bets);
  renderBets(filterBets(data.bets));
  renderStats(data.bets);
  refreshFixtures();
}

function persist() {
  saveData(data);
  refresh();
}

function refreshFixtures() {
  const season = $("seasonSelect").value;
  const round = $("roundSelect").value;

  const fixtures = fixturesFor(season, round);

  renderFixtures(fixtures, removeFixture);
}

// ================================
// CALCOLI AUTOMATICI
// ================================

function updateCalc() {
  const odds = calcOdds(events);
  const stake = Number($("betStake").value) || 0;

  if (!manualOdds) {
    $("betOdds").value = odds ? odds.toFixed(2) : "";
  }

  const currentOdds = Number($("betOdds").value) || odds;

  if (!manualPotential) {
    const potential = calcPotential(stake, currentOdds);

    $("betPotential").value = potential
      ? potential.toFixed(2)
      : "";
  }
}

// ================================
// EVENTI DELLA SCHEDINA
// ================================

function refreshEvents() {
  renderEvents(events);
  updateCalc();
}

function addEvent(event = {}) {
  events.push({
    home: event.home || "",
    away: event.away || "",
    market: event.market || "",
    pick: event.pick || "",
    odds: Number(event.odds) || 1
  });

  refreshEvents();
}

function removeEvent(index) {
  events.splice(index, 1);
  refreshEvents();
}

function bindEventEditor() {
  $("eventsEditor").addEventListener("input", event => {
    const row = event.target.closest(".event-row");

    if (!row) return;

    const index = Number(row.dataset.eventIndex);
    const field = event.target.dataset.field;

    if (!events[index] || !field) return;

    events[index][field] =
      field === "odds"
        ? Number(event.target.value)
        : event.target.value;

    updateCalc();
  });

  $("eventsEditor").addEventListener("click", event => {
    const button = event.target.closest("[data-remove-event]");

    if (!button) return;

    removeEvent(Number(button.dataset.removeEvent));
  });
}

// ================================
// APERTURA MODALE SCHEDINA
// ================================

function openBet(bet = null) {
  $("betForm").reset();

  $("betId").value = bet?.id || "";

  $("betDialogTitle").textContent =
    bet ? "Modifica schedina" : "Nuova schedina";

  $("betType").value = bet?.type || "Easy";

  $("betStake").value =
    bet?.stake ?? (bet?.type === "Hard" ? 2.50 : 7.50);

  $("betDate").value =
    bet?.date || new Date().toISOString().slice(0, 10);

  $("betRound").value = bet?.round || "";

  $("betStatus").value = bet?.status || "pending";

  $("betActual").value = bet?.actual ?? 0;

  $("betOdds").value = bet?.odds ?? "";

  $("betPotential").value = bet?.potential ?? "";

  manualOdds = Boolean(bet);
  manualPotential = Boolean(bet);

  events = (bet?.events || []).map(event => ({
    ...event
  }));

  refreshEvents();

  const season = $("seasonSelect").value;
  const round = $("betRound").value || $("roundSelect").value;

  renderFixturePicker(fixturesFor(season, round));

  $("betDialog").showModal();
}

// ================================
// SALVATAGGIO SCHEDINA
// ================================

function saveBet(event) {
  event.preventDefault();

  const id = $("betId").value;

  const odds = Number($("betOdds").value) || calcOdds(events);

  const stake = Number($("betStake").value) || 0;

  const potential = Number($("betPotential").value) ||
    calcPotential(stake, odds);

  const bet = {
    id: id || crypto.randomUUID(),

    round: Number($("betRound").value) || null,

    type: $("betType").value,

    date: $("betDate").value,

    stake,

    odds,

    potential,

    status: $("betStatus").value,

    actual: Number($("betActual").value) || 0,

    events: events.map(item => ({ ...item })),

    updatedAt: new Date().toISOString()
  };

  if (id) {
    const index = data.bets.findIndex(item => item.id === id);

    if (index !== -1) {
      bet.createdAt = data.bets[index].createdAt;
      data.bets[index] = bet;
    }
  } else {
    bet.createdAt = new Date().toISOString();
    data.bets.push(bet);
  }

  persist();

  $("betDialog").close();

  toast("Schedina salvata!");
}

// ================================
// ELIMINAZIONE SCHEDINA
// ================================

function deleteBet(id) {
  if (!confirm("Vuoi davvero eliminare questa schedina?")) {
    return;
  }

  data.bets = data.bets.filter(bet => bet.id !== id);

  persist();

  toast("Schedina eliminata");
}

// ================================
// AGGIUNTA PARTITA DAL CALENDARIO
// ================================

function addSelectedFixture() {
  const id = $("fixturePicker").value;

  if (!id) {
    toast("Seleziona prima una partita");
    return;
  }

  const fixture = allFixtures().find(item => item.id === id);

  if (!fixture) return;

  addEvent({
    home: fixture.home,
    away: fixture.away,
    market: "",
    pick: "",
    odds: 1
  });

  toast("Partita aggiunta");
}

// ================================
// GESTIONE CALENDARIO
// ================================

function openFixtureDialog() {
  $("fixtureForm").reset();

  $("fixtureSeason").value = $("seasonSelect").value;

  $("fixtureRound").value = $("roundSelect").value;

  $("fixtureDialog").showModal();
}

function saveFixture(event) {
  event.preventDefault();

  try {
    addFixture({
      season: $("fixtureSeason").value,
      round: $("fixtureRound").value,
      home: $("fixtureHome").value,
      away: $("fixtureAway").value,
      date: $("fixtureDate").value
    });

    $("fixtureDialog").close();

    refreshFixtures();

    toast("Partita aggiunta al calendario");
  } catch (error) {
    toast(error.message);
  }
}

// ================================
// IMPORTAZIONE BACKUP
// ================================

async function readJSONFile(file) {
  return JSON.parse(await file.text());
}

async function importBackup(file) {
  try {
    const backup = await readJSONFile(file);

    if (!backup || typeof backup !== "object") {
      throw new Error("Backup non valido");
    }

    const importedBets = Array.isArray(backup)
      ? backup
      : backup.bets;

    if (!Array.isArray(importedBets)) {
      throw new Error("Nel backup non trovo le schedine");
    }

    if (!confirm("L'importazione sostituirà le schedine attuali. Continuare?")) {
      return;
    }

    data = { bets: importedBets };

    if (Array.isArray(backup.fixtures)) {
      saveFixtures(backup.fixtures);
    }

    persist();

    toast("Backup importato correttamente");
  } catch (error) {
    toast("Errore importazione: " + error.message);
  }
}

// ================================
// ESPORTAZIONE BACKUP
// ================================

function exportBackup() {
  const backup = {
    version: 2,
    exportedAt: new Date().toISOString(),
    bets: data.bets,
    fixtures: allFixtures()
  };

  downloadJSON("betting-lab-backup.json", backup);

  toast("Backup esportato");
}

// ================================
// IMPORTAZIONE CALENDARIO
// ================================

async function handleFixtureImport(file) {
  try {
    const fixtures = await readJSONFile(file);

    if (!confirm("Il calendario attuale verrà sostituito. Continuare?")) {
      return;
    }

    importFixtures(fixtures);

    refreshFixtures();

    toast("Calendario importato");
  } catch (error) {
    toast("Errore: " + error.message);
  }
}

// ================================
// ESPORTAZIONE CALENDARIO
// ================================

function exportFixtureData() {
  downloadJSON("betting-lab-calendario.json", allFixtures());

  toast("Calendario esportato");
}

// ================================
// NAVIGAZIONE
// ================================

function bindTabs() {
  document.querySelectorAll("[data-tab]").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(tab => {
        tab.classList.remove("active");
      });

      document.querySelectorAll(".panel").forEach(panel => {
        panel.classList.remove("active");
      });

      button.classList.add("active");

      $(button.dataset.tab + "Panel").classList.add("active");
    });
  });
}

// ================================
// FILTRI
// ================================

function bindFilters() {
  ["typeFilter", "statusFilter", "searchInput"].forEach(id => {
    $(id).addEventListener("input", () => {
      renderBets(filterBets(data.bets));
    });
  });
}

// ================================
// PULSANTI E MODALI
// ================================

function bindButtons() {
  $("newBetBtn").addEventListener("click", () => openBet());

  $("betForm").addEventListener("submit", saveBet);

  $("addEventBtn").addEventListener("click", () => addEvent());

  $("addSelectedFixture").addEventListener("click", addSelectedFixture);

  $("addFixtureBtn").addEventListener("click", openFixtureDialog);

  $("fixtureForm").addEventListener("submit", saveFixture);

  $("loadFixturesBtn").addEventListener("click", refreshFixtures);

  $("seasonSelect").addEventListener("change", refreshFixtures);

  $("roundSelect").addEventListener("change", refreshFixtures);

  $("exportBtn").addEventListener("click", exportBackup);

  $("importBtn").addEventListener("click", () => $("importFile").click());

  $("importFile").addEventListener("change", event => {
    const file = event.target.files[0];

    if (file) importBackup(file);

    event.target.value = "";
  });

  $("exportFixturesBtn").addEventListener("click", exportFixtureData);

  $("importFixturesBtn").addEventListener("click", () => {
    $("fixturesFile").click();
  });

  $("fixturesFile").addEventListener("change", event => {
    const file = event.target.files[0];

    if (file) handleFixtureImport(file);

    event.target.value = "";
  });

  $("betsList").addEventListener("click", event => {
    const editButton = event.target.closest("[data-edit-bet]");
    const deleteButton = event.target.closest("[data-delete-bet]");

    if (editButton) {
      const bet = data.bets.find(
        item => item.id === editButton.dataset.editBet
      );

      if (bet) openBet(bet);
    }

    if (deleteButton) {
      deleteBet(deleteButton.dataset.deleteBet);
    }
  });

  $("fixturesList").addEventListener("click", event => {
    const button = event.target.closest("[data-remove-fixture]");

    if (!button) return;

    removeFixture(button.dataset.removeFixture);

    refreshFixtures();

    toast("Partita eliminata");
  });

  document.querySelectorAll("[data-close]").forEach(button => {
    button.addEventListener("click", () => {
      $(button.dataset.close).close();
    });
  });

  $("betStake").addEventListener("input", updateCalc);

  $("betOdds").addEventListener("input", () => {
    manualOdds = true;
    updateCalc();
  });

  $("betPotential").addEventListener("input", () => {
    manualPotential = true;
  });

  $("betType").addEventListener("change", () => {
    if (!$("betId").value) {
      $("betStake").value =
        $("betType").value === "Hard" ? "2.50" : "7.50";

      updateCalc();
    }
  });
}

// ================================
// AVVIO APPLICAZIONE
// ================================

function init() {
  bindTabs();
  bindFilters();
  bindButtons();
  bindEventEditor();

  refresh();

  renderFixturePicker(
    fixturesFor($("seasonSelect").value, $("roundSelect").value)
  );
}

init();
