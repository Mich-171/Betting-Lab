
import {
  money,
  totals,
  byType,
  outcomeStats,
  eventStats,
  marketStats,
  getBetStatus,
  getBetReturn,
  betWinRate
} from "./calculations.js";

export function $(id) {
  return document.getElementById(id);
}

export function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

export function toast(message) {
  const element = $("toast");
  if (!element) return;

  element.textContent = message;
  element.classList.add("show");

  clearTimeout(element._timer);
  element._timer = setTimeout(() => {
    element.classList.remove("show");
  }, 2600);
}

function statusLabel(status) {
  const labels = {
    pending: "In attesa",
    won: "Vinta",
    lost: "Persa",
    void: "Annullata"
  };

  return labels[status] || "In attesa";
}

function statusOptions(current) {
  const selected = current || "pending";

  return [
    ["pending", "In attesa"],
    ["won", "Vinto"],
    ["lost", "Perso"],
    ["void", "Annullato"]
  ].map(([value, label]) => `
    <option value="${value}" ${selected === value ? "selected" : ""}>
      ${label}
    </option>
  `).join("");
}

const marketOptions = [
  "Esito 1X2",
  "Doppia chance",
  "Chance Mix",
  "Goal / No Goal",
  "Over / Under",
  "Multigol",
  "Cluster risultati",
  "Risultato esatto",
  "Corner",
  "Cartellini",
  "Tiri in porta",
  "Combo",
  "Altro"
];

export function renderDashboard(bets) {
  const result = totals(bets);

  $("statStake").textContent = money(result.stake);
  $("statReturn").textContent = money(result.returned);
  $("statProfit").textContent = money(result.profit);
  $("statRoi").textContent = `${result.roi.toFixed(2)}%`;

  $("statProfit").classList.toggle("positive", result.profit > 0);
  $("statProfit").classList.toggle("negative", result.profit < 0);
}

export function renderBets(bets) {
  if (!bets.length) {
    return `
      <div class="empty-state">
        <h3>Nessuna schedina presente</h3>
        <p>Crea la tua prima schedina per iniziare a monitorare i risultati.</p>
      </div>
    `;
  }

  return bets.map(bet => {
    const events = bet.events || [];
    const status = getBetStatus(bet);
    const actual = getBetReturn(bet);

    return `
      <article class="bet-card">
        <div class="bet-card-header">
          <div>
            <span class="bet-type ${escapeHTML(bet.type || "Easy")}">
              ${escapeHTML(bet.type || "Easy")}
            </span>
            <h3>Giornata ${escapeHTML(bet.round || "-")}</h3>
            <small>${escapeHTML(bet.date || "")}</small>
          </div>

          <span class="status-badge status-${escapeHTML(status)}">
            ${statusLabel(status)}
          </span>
        </div>

        <div class="bet-summary">
          <div>
            <span>Puntata</span>
            <strong>${money(bet.stake)}</strong>
          </div>
          <div>
            <span>Quota</span>
            <strong>${Number(bet.odds || 0).toFixed(2)}</strong>
          </div>
          <div>
            <span>Vincita potenziale</span>
            <strong>${money(bet.potential)}</strong>
          </div>
          <div>
            <span>Incasso calcolato</span>
            <strong>${status === "pending" ? "—" : money(actual)}</strong>
          </div>
        </div>

        <div class="bet-events-summary">
          <strong>${events.length} eventi</strong>

          ${events.map(event => `
            <div class="bet-event-line">
              <span>
                ${escapeHTML(event.home || "")}
                - ${escapeHTML(event.away || "")}
              </span>
              <span>${escapeHTML(event.market || "Altro")}</span>
              <span>${escapeHTML(event.pick || "")}</span>
              <span class="event-result-label result-${escapeHTML(event.result || "pending")}">
                ${statusLabel(event.result)}
              </span>
            </div>
          `).join("")}
        </div>

        <div class="bet-card-actions">
          <button type="button" class="secondary-btn" data-edit-bet="${escapeHTML(bet.id)}">
            Modifica
          </button>
          <button type="button" class="secondary-btn" data-copy-bet="${escapeHTML(bet.id)}">
            Duplica
          </button>
          <button type="button" class="danger-btn" data-delete-bet="${escapeHTML(bet.id)}">
            Elimina
          </button>
        </div>
      </article>
    `;
  }).join("");
}

export function renderStats(bets) {
  const easy = byType(bets, "Easy");
  const hard = byType(bets, "Hard");
  const outcomes = outcomeStats(bets);
  const events = eventStats(bets);
  const markets = marketStats(bets);
  const winRate = betWinRate(bets);
  const overall = totals(bets);

  $("typeStats").innerHTML = `
    <div class="stats-grid">
      ${[
        ["Easy", easy],
        ["Hard", hard]
      ].map(([name, item]) => `
        <article class="stats-card">
          <h4>${name}</h4>
          <p>Schedine: <strong>${item.count}</strong></p>
          <p>Puntato (concluse): <strong>${money(item.stake)}</strong></p>
          <p>Incassato: <strong>${money(item.returned)}</strong></p>
          <p>Profitto: <strong>${money(item.profit)}</strong></p>
          <p>ROI: <strong>${item.roi.toFixed(2)}%</strong></p>
          <p>Win Rate: <strong>${betWinRate(bets.filter(bet => bet.type === name)).toFixed(2)}%</strong></p>
          <p>Vinte: <strong>${item.won}</strong></p>
          <p>Perse: <strong>${item.lost}</strong></p>
          <p>In attesa: <strong>${item.pending}</strong></p>
          <p>Annullate: <strong>${item.void}</strong></p>
        </article>
      `).join("")}
    </div>

    <div class="stats-grid">
      <article class="stats-card">
        <h4>Rendimento complessivo</h4>
        <p>ROI: <strong>${overall.roi.toFixed(2)}%</strong></p>
        <p>Win Rate: <strong>${winRate.toFixed(2)}%</strong></p>
        <p>Capitale considerato: <strong>${money(overall.stake)}</strong></p>
        <p>Profitto: <strong>${money(overall.profit)}</strong></p>
      </article>
    </div>
  `;

  $("outcomeStats").innerHTML = `
    <div class="stats-grid">
      <article class="stats-card">
        <h4>Esito schedine</h4>
        <p>Vinte: <strong>${outcomes.won}</strong></p>
        <p>Perse: <strong>${outcomes.lost}</strong></p>
        <p>In attesa: <strong>${outcomes.pending}</strong></p>
        <p>Annullate: <strong>${outcomes.void}</strong></p>
      </article>
    </div>
  `;

  $("eventStats").innerHTML = `
    <div class="stats-grid">
      <article class="stats-card">
        <h4>Totale eventi</h4>
        <strong class="large-stat">${events.total}</strong>
        <p>Vinti: <strong>${events.won}</strong></p>
        <p>Persi: <strong>${events.lost}</strong></p>
        <p>In attesa: <strong>${events.pending}</strong></p>
        <p>Annullati: <strong>${events.void}</strong></p>
      </article>

      <article class="stats-card">
        <h4>Percentuali eventi conclusi</h4>
        <strong class="large-stat">${events.winRate.toFixed(2)}%</strong>
        <p>Percentuale vinti</p>
        <p>Percentuale persi: <strong>${events.lossRate.toFixed(2)}%</strong></p>
        <p class="section-description">
          Le percentuali considerano solo gli eventi vinti e persi.
        </p>
      </article>
    </div>
  `;

  const marketEntries = Object.entries(markets);

  const sortedBest = [...marketEntries].sort((a, b) => {
    if (b[1].winRate !== a[1].winRate) {
      return b[1].winRate - a[1].winRate;
    }
    return b[1].won - a[1].won;
  });

  const sortedWorst = [...marketEntries].sort((a, b) => {
    if (a[1].winRate !== b[1].winRate) {
      return a[1].winRate - b[1].winRate;
    }
    return b[1].lost - a[1].lost;
  });

  function marketTable(entries) {
    if (!entries.length) {
      return `<p class="empty-state">Non ci sono ancora eventi registrati.</p>`;
    }

    return `
      <div class="table-wrapper">
        <table class="market-table">
          <thead>
            <tr>
              <th>Mercato</th>
              <th>Eventi</th>
              <th>Vinti</th>
              <th>Persi</th>
              <th>In attesa</th>
              <th>% vinti</th>
              <th>% persi</th>
            </tr>
          </thead>
          <tbody>
            ${entries.map(([name, item]) => `
              <tr>
                <td><strong>${escapeHTML(name)}</strong></td>
                <td>${item.count}</td>
                <td class="positive">${item.won}</td>
                <td class="negative">${item.lost}</td>
                <td>${item.pending}</td>
                <td>${item.winRate.toFixed(2)}%</td>
                <td>${item.lossRate.toFixed(2)}%</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  $("marketStats").innerHTML = `
    <div class="market-ranking">
      <h4>Mercati più vincenti</h4>
      ${marketTable(sortedBest)}
    </div>

    <div class="market-ranking">
      <h4>Mercati più perdenti</h4>
      ${marketTable(sortedWorst)}
    </div>
  `;
}

export function renderFixtures(fixtures) {
  if (!fixtures.length) {
    return `<div class="empty-state">Nessuna partita trovata per questa giornata.</div>`;
  }

  return fixtures.map(fixture => `
    <article class="fixture-card">
      <div>
        <strong>${escapeHTML(fixture.home)}</strong>
        <span> - </span>
        <strong>${escapeHTML(fixture.away)}</strong>
      </div>
      <small>${escapeHTML(fixture.date || "")}</small>
      <button
        type="button"
        class="secondary-btn"
        data-remove-fixture="${escapeHTML(fixture.id)}"
      >
        Rimuovi
      </button>
    </article>
  `).join("");
}

export function renderFixturePicker(fixtures) {
  return `
    <option value="">Seleziona una partita</option>
    ${fixtures.map(fixture => `
      <option value="${escapeHTML(fixture.id)}">
        ${escapeHTML(fixture.home)} - ${escapeHTML(fixture.away)}
      </option>
    `).join("")}
  `;
}

export function renderEvents(events) {
  if (!events.length) {
    return `
      <div class="empty-state">
        <p>Non hai ancora aggiunto eventi a questa schedina.</p>
      </div>
    `;
  }

  return events.map((event, index) => `
    <article class="event-card" data-event-index="${index}">
      <div class="event-card-heading">
        <strong>
          ${escapeHTML(event.home || "")} - ${escapeHTML(event.away || "")}
        </strong>
        <button
          type="button"
          class="danger-btn"
          data-remove-event="${index}"
        >
          Rimuovi
        </button>
      </div>

      <div class="form-grid event-fields">
        <label>
          Mercato
          <select data-field="market" data-index="${index}">
            ${marketOptions.map(market => `
              <option value="${escapeHTML(market)}" ${(event.market || "Altro") === market ? "selected" : ""}>
                ${escapeHTML(market)}
              </option>
            `).join("")}
          </select>
        </label>

        <label>
          Giocata
          <input
            type="text"
            data-field="pick"
            data-index="${index}"
            value="${escapeHTML(event.pick || "")}"
          >
        </label>

        <label>
          Quota
          <input
            type="number"
            min="1"
            step="0.01"
            data-field="odds"
            data-index="${index}"
            value="${escapeHTML(event.odds ?? "")}"
          >
        </label>

        <label>
          Esito evento
          <select data-field="result" data-index="${index}">
            ${statusOptions(event.result)}
          </select>
        </label>
      </div>
    </article>
  `).join("");
}

export function filterBets(bets, type, status, search) {
  const query = String(search || "").toLowerCase().trim();

  return bets.filter(bet => {
    const betStatus = getBetStatus(bet);
    const matchesType = type === "all" || bet.type === type;
    const matchesStatus = status === "all" || betStatus === status;

    const searchable = [
      bet.round,
      bet.type,
      bet.date,
      betStatus,
      ...(bet.events || []).flatMap(event => [
        event.home,
        event.away,
        event.market,
        event.pick
      ])
    ].join(" ").toLowerCase();

    return matchesType && matchesStatus && searchable.includes(query);
  });
}
