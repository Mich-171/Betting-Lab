
import {
  money,
  totals,
  byType,
  outcomeStats,
  marketStats
} from "./calculations.js";

// ================================
// ELEMENTI HTML
// ================================

export const $ = id => document.getElementById(id);

// ================================
// NOTIFICHE
// ================================

export function toast(message) {
  const element = $("toast");

  if (!element) return;

  element.textContent = message;
  element.classList.add("show");

  clearTimeout(toast.timeout);

  toast.timeout = setTimeout(() => {
    element.classList.remove("show");
  }, 2500);
}

// ================================
// DASHBOARD
// ================================

export function renderDashboard(bets) {
  const result = totals(bets);

  $("statStake").textContent = money(result.stake);
  $("statReturn").textContent = money(result.returned);
  $("statProfit").textContent = money(result.profit);
  $("statRoi").textContent = result.roi.toFixed(2) + "%";

  $("statProfit").className =
    result.profit >= 0 ? "positive" : "negative";
}

// ================================
// ETICHETTE DEGLI ESITI
// ================================

function statusLabel(status) {
  const labels = {
    pending: "In attesa",
    won: "Vinta",
    lost: "Persa",
    void: "Annullata"
  };

  return labels[status] || "In attesa";
}

// ================================
// VISUALIZZAZIONE SCHEDINE
// ================================

export function renderBets(bets) {
  const container = $("betsList");

  if (!bets.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Nessuna schedina presente</h3>
        <p>Premi "Nuova schedina" per iniziare.</p>
      </div>
    `;
    return;
  }

  const ordered = [...bets].sort((a, b) => {
    return new Date(b.date || 0) - new Date(a.date || 0);
  });

  container.innerHTML = ordered.map(bet => {
    const events = bet.events || [];

    const eventNames = events.map(event => `
      <p>
        ${escapeHTML(event.home || event.match || "Partita")}
        ${event.away ? " - " + escapeHTML(event.away) : ""}
        · ${escapeHTML(event.market || "")}
        ${event.pick ? ": " + escapeHTML(event.pick) : ""}
      </p>
    `).join("");

    const status = bet.status || "pending";

    return `
      <article class="bet-card">
        <div class="bet-info">
          <h3>
            ${escapeHTML(bet.type || "Easy")}
            ${bet.round ? " · " + bet.round + "ª giornata" : ""}
          </h3>

          <p>Data: ${escapeHTML(bet.date || "Non specificata")}</p>

          <p>
            Puntata: <strong>${money(bet.stake)}</strong>
            · Quota: ${Number(bet.odds || 0).toFixed(2)}
          </p>

          <p>
            Vincita potenziale: <strong>${money(bet.potential)}</strong>
            · Incasso: <strong>${money(bet.actual)}</strong>
          </p>

          <span class="status status-${status}">
            ${statusLabel(status)}
          </span>

          <div class="bet-events">
            ${eventNames}
          </div>
        </div>

        <div class="bet-actions">
          <button type="button" data-edit-bet="${escapeHTML(bet.id)}">
            Modifica
          </button>

          <button type="button" data-delete-bet="${escapeHTML(bet.id)}">
            Elimina
          </button>
        </div>
      </article>
    `;
  }).join("");
}

// ================================
// SICUREZZA TESTI HTML
// ================================

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return entities[character];
  });
}

// ================================
// STATISTICHE
// ================================

export function renderStats(bets) {
  const easy = byType(bets, "Easy");
  const hard = byType(bets, "Hard");

  $("typeStats").innerHTML = `
    ${typeBlock("Easy", easy)}
    ${typeBlock("Hard", hard)}
  `;

  const outcomes = outcomeStats(bets);

  $("outcomeStats").innerHTML = `
    <p>Vinte: <strong class="positive">${outcomes.won}</strong></p>
    <p>Perse: <strong class="negative">${outcomes.lost}</strong></p>
    <p>In attesa: <strong>${outcomes.pending}</strong></p>
    <p>Annullate: <strong>${outcomes.void}</strong></p>
  `;

  const markets = marketStats(bets);
  const entries = Object.entries(markets);

  $("marketStats").innerHTML = entries.length
    ? entries.map(([name, data]) => `
        <p>
          ${escapeHTML(name)}:
          <strong>${data.count}</strong> selezioni
        </p>
      `).join("")
    : "<p>Nessun mercato registrato.</p>";
}

function typeBlock(name, data) {
  const profitClass = data.profit >= 0 ? "positive" : "negative";

  return `
    <div class="type-stat-block">
      <h4>${name}</h4>
      <p>Schedine: <strong>${data.count}</strong></p>
      <p>Puntato: <strong>${money(data.stake)}</strong></p>
      <p>Incassato: <strong>${money(data.returned)}</strong></p>
      <p>
        Profitto:
        <strong class="${profitClass}">${money(data.profit)}</strong>
      </p>
      <p>ROI: <strong>${data.roi.toFixed(2)}%</strong></p>
      <p>
        Vinte: ${data.won} · Perse: ${data.lost}
        · In attesa: ${data.pending}
      </p>
    </div>
  `;
}

// ================================
// CALENDARIO
// ================================

export function renderFixtures(fixtures, onRemove) {
  const container = $("fixturesList");

  if (!fixtures.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Nessuna partita inserita</h3>
        <p>Aggiungi le partite o importa un calendario JSON.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = fixtures.map(fixture => `
    <article class="fixture-card">
      <div>
        <h3>
          ${escapeHTML(fixture.home)}
          - ${escapeHTML(fixture.away)}
        </h3>

        <p>
          Giornata ${fixture.round}
          · Stagione ${fixture.season}/${Number(fixture.season) + 1}
        </p>

        <p>${escapeHTML(fixture.date || "Data non specificata")}</p>
      </div>

      <button
        type="button"
        data-remove-fixture="${escapeHTML(fixture.id)}"
      >
        Elimina
      </button>
    </article>
  `).join("");
}

// ================================
// SELETTORE PARTITE NELLA SCHEDINA
// ================================

export function renderFixturePicker(fixtures) {
  const select = $("fixturePicker");

  select.innerHTML = `
    <option value="">Seleziona una partita dal calendario</option>
    ${fixtures.map(fixture => `
      <option value="${escapeHTML(fixture.id)}">
        ${escapeHTML(fixture.home)} - ${escapeHTML(fixture.away)}
      </option>
    `).join("")}
  `;
}

// ================================
// EDITOR DELLE SELEZIONI
// ================================

export function renderEvents(events, onRemove) {
  const container = $("eventsEditor");

  if (!events.length) {
    container.innerHTML = `
      <p class="empty-state">Nessuna partita aggiunta.</p>
    `;
    return;
  }

  container.innerHTML = events.map((event, index) => `
    <div class="event-row" data-event-index="${index}">

      <input
        type="text"
        data-field="home"
        placeholder="Partita"
        value="${escapeHTML(event.home || event.match || "")}"
      >

      <input
        type="text"
        data-field="market"
        placeholder="Mercato"
        value="${escapeHTML(event.market || "")}"
      >

      <input
        type="text"
        data-field="pick"
        placeholder="Pronostico"
        value="${escapeHTML(event.pick || "")}"
      >

      <input
        type="number"
        data-field="odds"
        min="1"
        step="0.01"
        placeholder="Quota"
        value="${escapeHTML(event.odds || "")}"
      >

      <button
        type="button"
        data-remove-event="${index}"
        aria-label="Rimuovi selezione"
      >
        ×
      </button>

    </div>
  `).join("");
}

// ================================
// FILTRI
// ================================

export function filterBets(bets) {
  const type = $("typeFilter").value;
  const status = $("statusFilter").value;
  const search = $("searchInput").value.toLowerCase().trim();

  return bets.filter(bet => {
    const matchesType =
      type === "all" || bet.type === type;

    const matchesStatus =
      status === "all" || bet.status === status;

    const searchable = [
      bet.type,
      bet.date,
      bet.round,
      ...(bet.events || []).map(event =>
        `${event.home || ""} ${event.away || ""} ${event.market || ""} ${event.pick || ""}`
      )
    ].join(" ").toLowerCase();

    const matchesSearch =
      !search || searchable.includes(search);

    return matchesType && matchesStatus && matchesSearch;
  });
}
