
import {
  loadData,
  saveData,
  loadFixtures,
  downloadJSON
} from "./storage.js";

import {
  allFixtures,
  fixturesFor,
  addFixture,
  removeFixture
} from "./fixtures.js";

import {
  calcOdds,
  calcPotential
} from "./calculations.js";

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

// --------------------------------------------------
// DATI
// --------------------------------------------------

const data = loadData() || {};
data.bets = Array.isArray(data.bets) ? data.bets : [];

let bets = data.bets;
let events = [];

let editingOdds = false;
let editingPotential = false;

function createId() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function saveAll() {
  data.bets = bets;
  saveData(data);
}

function refresh() {
  renderDashboard(bets);
  renderBets(filterBets(bets));
  renderStats(bets);
  refreshFixtures();
}

// --------------------------------------------------
// CALCOLI AUTOMATICI
// --------------------------------------------------

function updateCalculations() {
  const stake = Number($("betStake").value) || 0;

  if (!editingOdds) {
    const odds = calcOdds(events);
    $("betOdds").value = odds ? odds.toFixed(2) : "";
  }

  const odds = Number($("betOdds").value) || 0;

  if (!editingPotential) {
    const potential = calcPotential(stake, odds);
    $("betPotential").value = potential
      ? potential.toFixed(2)
      : "";
  }
}

// --------------------------------------------------
// CALENDARIO
// --------------------------------------------------

function currentSeason() {
  return Number($("seasonSelect").value);
}

function currentRound() {
  return Number($("roundSelect").value);
}

function refreshFixtures() {
  const fixtures = fixturesFor(
    currentSeason(),
    currentRound()
  );

  renderFixtures(fixtures);

  return fixtures;
}

function refreshPicker() {
  const round = Number($("betRound").value) || currentRound();

  const fixtures = fixturesFor(
    currentSeason(),
    round
  );

  renderFixturePicker(fixtures);
}

$("loadFixturesBtn").addEventListener("click", () => {
  const fixtures = refreshFixtures();

  toast(`${fixtures.length} partite trovate`);
});

$("seasonSelect").addEventListener("change", refreshFixtures);
$("roundSelect").addEventListener("change", refreshFixtures);

$("addFixtureBtn").addEventListener("click", () => {
  $("fixtureForm").reset();

  $("fixtureSeason").value = currentSeason();
  $("fixtureRound").value = currentRound();

  $("fixtureDialog").showModal();
});

// Aggiunta manuale partita
$("fixtureForm").addEventListener("submit", event => {
  event.preventDefault();

  const home = $("fixtureHome").value.trim();
  const away = $("fixtureAway").value.trim();

  if (!home || !away) {
    toast("Inserisci entrambe le squadre");
    return;
  }

  addFixture({
    season: $("fixtureSeason").value,
    round: $("fixtureRound").value,
    home,
    away,
    date: $("fixtureDate").value
  });

  $("fixtureDialog").close();

  refreshFixtures();
  toast("Partita aggiunta");
});

// Nascondi partita
$("fixturesList").addEventListener("click", event => {
  const button = event.target.closest("[data-remove-fixture]");

  if (!button) return;

  const id = button.dataset.removeFixture;

  if (!confirm("Vuoi nascondere questa partita dal calendario?")) {
    return;
  }

  removeFixture(id);
  refreshFixtures();

  toast("Partita nascosta");
});

// --------------------------------------------------
// SCHEDINE
// --------------------------------------------------

function openBet(bet = null) {
  $("betForm").reset();

  events = bet
    ? (bet.events || []).map(item => ({ ...item }))
    : [];

  editingOdds = false;
  editingPotential = false;

  $("betId").value = bet?.id || "";

  $("betDialogTitle").textContent = bet
    ? "Modifica schedina"
    : "Nuova schedina";

  $("betRound").value = bet?.round ?? currentRound();

  $("betType").value = bet?.type || "Easy";

  $("betDate").value = bet?.date || new Date()
    .toLocaleDateString("en-CA");

  $("betStake").value = bet?.stake ?? (
    $("betType").value === "Hard" ? "2.50" : "7.50"
  );

  $("betOdds").value = bet?.odds ?? "";
  $("betPotential").value = bet?.potential ?? "";
  $("betStatus").value = bet?.status || "pending";
  $("betActual").value = bet?.actual ?? 0;

  renderEvents(events);
  refreshPicker();
  updateCalculations();

  $("betDialog").showModal();
}

$("newBetBtn").addEventListener("click", () => {
  openBet();
});

// Tipo di schedina
$("betType").addEventListener("change", () => {
  $("betStake").value =
    $("betType").value === "Hard" ? "2.50" : "7.50";

  editingPotential = false;
  updateCalculations();
});

// Giornata della schedina
$("betRound").addEventListener("change", refreshPicker);

// Puntata
$("betStake").addEventListener("input", () => {
  editingPotential = false;
  updateCalculations();
});

// Modifica manuale quota
$("betOdds").addEventListener("input", () => {
  editingOdds = true;
  editingPotential = false;
  updateCalculations();
});

// Modifica manuale vincita potenziale
$("betPotential").addEventListener("input", () => {
  editingPotential = true;
});

// Aggiunta evento vuoto
$("addEventBtn").addEventListener("click", () => {
  events.push({
    home: "",
    away: "",
    market: "",
    pick: "",
    odds: ""
  });

  editingOdds = false;
  editingPotential = false;

  renderEvents(events);
  updateCalculations();
});

// Modifica o rimozione eventi
$("eventsEditor").addEventListener("input", event => {
  const input = event.target.closest("[data-field]");

  if (!input) return;

  const row = input.closest("[data-event-index]");
  const index = Number(row.dataset.eventIndex);

  if (!events[index]) return;

  const field = input.dataset.field;

  events[index][field] = input.value;

  editingOdds = false;
  editingPotential = false;

  updateCalculations();
});

$("eventsEditor").addEventListener("click", event => {
  const button = event.target.closest("[data-remove-event]");

  if (!button) return;

  const index = Number(button.dataset.removeEvent);

  events.splice(index, 1);

  editingOdds = false;
  editingPotential = false;

  renderEvents(events);
  updateCalculations();
});

// Inserimento partita dal calendario
$("addSelectedFixture").addEventListener("click", () => {
  const id = $("fixturePicker").value;

  if (!id) {
    toast("Seleziona prima una partita");
    return;
  }

  const fixture = allFixtures().find(item => item.id === id);

  if (!fixture) {
    toast("Partita non trovata");
    return;
  }

  const alreadyAdded = events.some(event =>
    event.home === fixture.home &&
    event.away === fixture.away
  );

  if (alreadyAdded) {
    toast("Partita già presente");
    return;
  }

  events.push({
    home: fixture.home,
    away: fixture.away,
    market: "",
    pick: "",
    odds: ""
  });

  editingOdds = false;
  editingPotential = false;

  renderEvents(events);
  updateCalculations();

  toast("Partita aggiunta alla schedina");
});

// Salvataggio schedina
$("betForm").addEventListener("submit", event => {
  event.preventDefault();

  const id = $("betId").value || createId();

  const stake = Number($("betStake").value);

  const odds = Number($("betOdds").value) || calcOdds(events);

  const potentialInput = $("betPotential").value;

  const potential = potentialInput.trim() !== ""
    ? Number(potentialInput)
    : calcPotential(stake, odds);

  if (!Number.isFinite(stake) || stake <= 0) {
    toast("Inserisci una puntata valida");
    return;
  }

  if (!Number.isFinite(odds) || odds < 0) {
    toast("Quota non valida");
    return;
  }

  if (!Number.isFinite(potential) || potential < 0) {
    toast("Vincita potenziale non valida");
    return;
  }

  const bet = {
    id,
    round: Number($("betRound").value) || null,
    type: $("betType").value,
    date: $("betDate").value,
    stake,
    odds,
    potential,
    status: $("betStatus").value,
    actual: Number($("betActual").value) || 0,
    events: events.map(item => ({ ...item }))
  };

  const index = bets.findIndex(item => item.id === id);

  if (index >= 0) {
    bets[index] = bet;
  } else {
    bets.push(bet);
  }

  saveAll();

  $("betDialog").close();

  refresh();

  toast("Schedina salvata");
});

// Modifica schedina
$("betsList").addEventListener("click", event => {
  const editButton = event.target.closest("[data-edit-bet]");
  const deleteButton = event.target.closest("[data-delete-bet]");

  if (editButton) {
    const bet = bets.find(item =>
      item.id === editButton.dataset.editBet
    );

    if (bet) openBet(bet);
    return;
  }

  if (deleteButton) {
    const id = deleteButton.dataset.deleteBet;

    if (!confirm("Vuoi eliminare questa schedina?")) {
      return;
    }

    bets = bets.filter(item => item.id !== id);

    saveAll();
    refresh();

    toast("Schedina eliminata");
  }
});

// --------------------------------------------------
// MODALI
// --------------------------------------------------

$("closeBetDialog").addEventListener("click", () => {
  $("betDialog").close();
});

$("cancelBetBtn").addEventListener("click", () => {
  $("betDialog").close();
});

$("closeFixtureDialog").addEventListener("click", () => {
  $("fixtureDialog").close();
});

$("cancelFixtureBtn").addEventListener("click", () => {
  $("fixtureDialog").close();
});

// --------------------------------------------------
// FILTRI
// --------------------------------------------------

$("typeFilter").addEventListener("change", () => {
  renderBets(filterBets(bets));
});

$("statusFilter").addEventListener("change", () => {
  renderBets(filterBets(bets));
});

$("searchInput").addEventListener("input", () => {
  renderBets(filterBets(bets));
});

// --------------------------------------------------
// NAVIGAZIONE
// --------------------------------------------------

document.querySelectorAll("[data-tab]").forEach(button => {
  button.addEventListener("click", () => {
    const tab = button.dataset.tab;

    document.querySelectorAll(".tab").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    document.querySelectorAll(".panel").forEach(panel => {
      panel.classList.toggle(
        "active",
        panel.id === `${tab}Panel`
      );
    });

    if (tab === "fixtures") {
      refreshFixtures();
    }
  });
});

// --------------------------------------------------
// BACKUP
// --------------------------------------------------

$("exportBtn").addEventListener("click", () => {
  const backup = {
    version: 2,
    exportedAt: new Date().toISOString(),
    bets,
    fixtures: loadFixtures() || []
  };

  downloadJSON(
    "betting-lab-backup.json",
    backup
  );

  toast("Backup esportato");
});

$("importFile").addEventListener("change", async event => {
  const file = event.target.files?.[0];

  if (!file) return;

  try {
    const content = await file.text();
    const backup = JSON.parse(content);

    let importedBets;

    if (Array.isArray(backup)) {
      importedBets = backup;
    } else if (Array.isArray(backup.bets)) {
      importedBets = backup.bets;
    } else {
      throw new Error("Formato backup non riconosciuto");
    }

    if (!confirm(
      `Il backup contiene ${importedBets.length} schedine. ` +
      "Vuoi sostituire quelle attualmente presenti?"
    )) {
      event.target.value = "";
      return;
    }

    bets = importedBets.map(bet => ({
      ...bet,
      id: bet.id || createId(),
      events: Array.isArray(bet.events) ? bet.events : []
    }));

    saveAll();

    refresh();

    toast("Backup importato correttamente");
  } catch (error) {
    console.error(error);
    toast("Errore durante l'importazione del backup");
  }

  event.target.value = "";
});

// --------------------------------------------------
// AVVIO
// --------------------------------------------------

refresh();
refreshPicker();
