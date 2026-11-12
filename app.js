
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
// DATI E SALVATAGGIO
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

function localDate() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 10);
}

function saveAll() {
  data.bets = bets;
  saveData(data);
}

function refresh() {
  renderDashboard(bets);

  $("betsList").innerHTML = renderBets(
    filterBets(
      bets,
      $("typeFilter").value,
      $("statusFilter").value,
      $("searchInput").value
    )
  );

  renderStats(bets);
  refreshFixtures();
}

function refreshBetList() {
  $("betsList").innerHTML = renderBets(
    filterBets(
      bets,
      $("typeFilter").value,
      $("statusFilter").value,
      $("searchInput").value
    )
  );
}

// --------------------------------------------------
// RICONOSCIMENTO AUTOMATICO MERCATI
// --------------------------------------------------

function detectMarket(value) {
  const pick = String(value || "").trim().toLowerCase();

  if (!pick) return "Altro";

  // Cluster risultati
  if (
    /\bcluster\b/.test(pick) ||
    /\bcluster\s*risultati\b/.test(pick)
  ) {
    return "Cluster risultati";
  }

  // Combo
  if (/[+&]/.test(pick)) {
    return "Combo";
  }

  // Multigol
  if (
    /\bmultigol\b/.test(pick) ||
    /\bmg\s*\d/.test(pick)
  ) {
    return "Multigol";
  }

  // Goal / No Goal
  if (
    /\bgoal\b/.test(pick) ||
    /\bno\s*goal\b/.test(pick) ||
    /\bgg\b/.test(pick) ||
    /\bng\b/.test(pick)
  ) {
    return "Goal / No Goal";
  }

  // Over / Under
  if (
    /\bover\b/.test(pick) ||
    /\bunder\b/.test(pick) ||
    /^\s*[ou]\s*\d/.test(pick)
  ) {
    return "Over / Under";
  }

  // Doppia chance
  if (/^(1x|x2|12)$/.test(pick)) {
    return "Doppia chance";
  }

  // Esito 1X2
  if (/^[1x2]$/.test(pick)) {
    return "Esito 1X2";
  }

  // Risultato esatto
  if (/^\d+\s*[-:]\s*\d+$/.test(pick)) {
    return "Risultato esatto";
  }

  // Altri mercati
  if (/\bcorner\b/.test(pick)) return "Corner";
  if (/\bcartellini?\b/.test(pick)) return "Cartellini";

  if (
    /\btiri?\b/.test(pick) &&
    /\bporta\b/.test(pick)
  ) {
    return "Tiri in porta";
  }

  return "Altro";
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

  $("fixturesList").innerHTML = renderFixtures(fixtures);

  return fixtures;
}

function refreshPicker() {
  const round = Number($("betRound").value) || currentRound();

  const fixtures = fixturesFor(
    currentSeason(),
    round
  );

  $("fixturePicker").innerHTML = renderFixturePicker(fixtures);
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

$("fixtureForm").addEventListener("submit", event => {
  event.preventDefault();

  const home = $("fixtureHome").value.trim();
  const away = $("fixtureAway").value.trim();

  if (!home || !away) {
    toast("Inserisci entrambe le squadre");
    return;
  }

  try {
    addFixture({
      season: $("fixtureSeason").value,
      round: $("fixtureRound").value,
      home,
      away,
      date: $("fixtureDate").value
    });

    $("fixtureDialog").close();
    refreshFixtures();
    refreshPicker();

    toast("Partita aggiunta");
  } catch (error) {
    toast(error.message || "Errore nell'aggiunta della partita");
  }
});

$("fixturesList").addEventListener("click", event => {
  const button = event.target.closest("[data-remove-fixture]");

  if (!button) return;

  if (!confirm("Vuoi nascondere questa partita dal calendario?")) {
    return;
  }

  removeFixture(button.dataset.removeFixture);
  refreshFixtures();
  refreshPicker();

  toast("Partita nascosta");
});

// --------------------------------------------------
// APERTURA SCHEDINA
// --------------------------------------------------

function openBet(bet = null) {
  $("betForm").reset();

  events = bet
    ? (bet.events || []).map(item => ({
        ...item,
        result: item.result || "pending"
      }))
    : [];

  editingOdds = false;
  editingPotential = false;

  $("betId").value = bet?.id || "";

  $("betDialogTitle").textContent = bet
    ? "Modifica schedina"
    : "Nuova schedina";

  $("betRound").value = bet?.round ?? currentRound() || "";
  $("betType").value = bet?.type || "Easy";
  $("betDate").value = bet?.date || localDate();

  $("betStake").value = bet?.stake ?? (
    $("betType").value === "Hard" ? "2.50" : "7.50"
  );

  $("betOdds").value = bet?.odds ?? "";
  $("betPotential").value = bet?.potential ?? "";
  $("betStatus").value = bet?.status || "pending";
  $("betActual").value = bet?.actual ?? 0;

  $("eventPick").value = "";
  $("eventOdds").value = "";
  $("eventMarket").value = "Esito 1X2";

  renderEventList();
  refreshPicker();
  updateCalculations();

  $("betDialog").showModal();
}

function renderEventList() {
  $("eventsEditor").innerHTML = renderEvents(events);
}

$("newBetBtn").addEventListener("click", () => {
  openBet();
});

// --------------------------------------------------
// MODIFICA DATI SCHEDINA
// --------------------------------------------------

$("betType").addEventListener("change", () => {
  $("betStake").value =
    $("betType").value === "Hard" ? "2.50" : "7.50";

  editingPotential = false;
  updateCalculations();
});

$("betRound").addEventListener("change", refreshPicker);

$("betStake").addEventListener("input", () => {
  editingPotential = false;
  updateCalculations();
});

$("betOdds").addEventListener("input", () => {
  editingOdds = true;
  editingPotential = false;
  updateCalculations();
});

$("betPotential").addEventListener("input", () => {
  editingPotential = true;
});

// --------------------------------------------------
// RICONOSCIMENTO MERCATO NELL'INSERIMENTO RAPIDO
// --------------------------------------------------

$("eventPick").addEventListener("input", () => {
  $("eventMarket").value = detectMarket($("eventPick").value);
});

// --------------------------------------------------
// AGGIUNTA RAPIDA EVENTO
// --------------------------------------------------

$("addEventBtn").addEventListener("click", () => {
  const fixtureId = $("fixturePicker").value;
  const pick = $("eventPick").value.trim();
  const odds = Number($("eventOdds").value);

  if (!fixtureId) {
    toast("Seleziona prima una partita");
    return;
  }

  if (!pick) {
    toast("Inserisci la giocata");
    return;
  }

  if (!Number.isFinite(odds) || odds <= 0) {
    toast("Inserisci una quota valida");
    return;
  }

  const fixture = allFixtures().find(
    item => String(item.id) === String(fixtureId)
  );

  if (!fixture) {
    toast("Partita non trovata");
    return;
  }

  events.push({
    home: fixture.home,
    away: fixture.away,
    market: $("eventMarket").value,
    pick,
    odds,
    result: "pending"
  });

  editingOdds = false;
  editingPotential = false;

  renderEventList();
  updateCalculations();

  // Prepara l'inserimento della partita successiva
  $("fixturePicker").value = "";
  $("eventPick").value = "";
  $("eventOdds").value = "";
  $("eventMarket").value = "Esito 1X2";

  toast("Evento aggiunto alla schedina");
});

// --------------------------------------------------
// MODIFICA SINGOLI EVENTI
// --------------------------------------------------

$("eventsEditor").addEventListener("input", event => {
  const input = event.target.closest("[data-field]");

  if (!input) return;

  const index = Number(input.dataset.index);
  const field = input.dataset.field;

  if (!events[index]) return;

  events[index][field] = input.value;

  // Se cambia la giocata, riconosci nuovamente il mercato
  if (field === "pick") {
    events[index].market = detectMarket(input.value);

    const marketSelect = $("eventsEditor").querySelector(
      `[data-field="market"][data-index="${index}"]`
    );

    if (marketSelect) {
      marketSelect.value = events[index].market;
    }
  }

  if (field === "odds") {
    editingOdds = false;
    editingPotential = false;
    updateCalculations();
  }
});

$("eventsEditor").addEventListener("change", event => {
  const input = event.target.closest("[data-field]");

  if (!input) return;

  const index = Number(input.dataset.index);
  const field = input.dataset.field;

  if (!events[index]) return;

  events[index][field] = input.value;

  if (field === "odds") {
    editingOdds = false;
    editingPotential = false;
    updateCalculations();
  }
});

$("eventsEditor").addEventListener("click", event => {
  const button = event.target.closest("[data-remove-event]");

  if (!button) return;

  const index = Number(button.dataset.removeEvent);

  events.splice(index, 1);

  editingOdds = false;
  editingPotential = false;

  renderEventList();
  updateCalculations();

  toast("Evento rimosso");
});

// --------------------------------------------------
// SALVATAGGIO SCHEDINA
// --------------------------------------------------

$("betForm").addEventListener("submit", event => {
  event.preventDefault();

  const id = $("betId").value || createId();
  const stake = Number($("betStake").value);
  const odds = Number($("betOdds").value) || calcOdds(events);

  const potentialInput = $("betPotential").value;

  const potential = potentialInput.trim() !== ""
    ? Number(potentialInput)
    : calcPotential(stake, odds);

  const actual = Number($("betActual").value) || 0;

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

  if (!Number.isFinite(actual) || actual < 0) {
    toast("Incasso effettivo non valido");
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
    actual,
    events: events.map(item => ({
      ...item,
      result: item.result || "pending"
    }))
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

// --------------------------------------------------
// MODIFICA, DUPLICAZIONE ED ELIMINAZIONE
// --------------------------------------------------

$("betsList").addEventListener("click", event => {
  const editButton = event.target.closest("[data-edit-bet]");
  const copyButton = event.target.closest("[data-copy-bet]");
  const deleteButton = event.target.closest("[data-delete-bet]");

  if (editButton) {
    const bet = bets.find(
      item => item.id === editButton.dataset.editBet
    );

    if (bet) openBet(bet);
    return;
  }

  if (copyButton) {
    const original = bets.find(
      item => item.id === copyButton.dataset.copyBet
    );

    if (!original) return;

    if (!confirm("Vuoi creare una copia di questa schedina?")) {
      return;
    }

    const copy = {
      ...original,
      id: createId(),
      status: "pending",
      actual: 0,
      events: (original.events || []).map(item => ({
        ...item,
        result: "pending"
      }))
    };

    bets.push(copy);
    saveAll();
    refresh();

    toast("Schedina duplicata");
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

$("typeFilter").addEventListener("change", refreshBetList);
$("statusFilter").addEventListener("change", refreshBetList);
$("searchInput").addEventListener("input", refreshBetList);

// --------------------------------------------------
// NAVIGAZIONE
// --------------------------------------------------

document.querySelectorAll("[data-tab]").forEach(button => {
  button.addEventListener("click", () => {
    const tab = button.dataset.tab;

    document.querySelectorAll("[data-tab]").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    document.querySelectorAll(".tab-panel").forEach(panel => {
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
    version: 3,
    exportedAt: new Date().toISOString(),
    bets,
    fixtures: loadFixtures() || []
  };

  downloadJSON("betting-lab-backup.json", backup);

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
      status: bet.status || "pending",
      actual: Number(bet.actual) || 0,
      events: Array.isArray(bet.events)
        ? bet.events.map(item => ({
            ...item,
            result: item.result || "pending"
          }))
        : []
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
