
// ================================
// FORMATO VALUTE
// ================================

export function money(value) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR"
  }).format(Number(value) || 0);
}

// ================================
// ARROTONDAMENTO
// ================================

export function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

// ================================
// CALCOLO QUOTA TOTALE
// ================================

export function calcOdds(events) {
  if (!Array.isArray(events) || events.length === 0) {
    return 0;
  }

  return round2(
    events.reduce((total, event) => {
      const odds = Number(event.odds);

      return total * (odds > 0 ? odds : 1);
    }, 1)
  );
}

// ================================
// CALCOLO VINCITA POTENZIALE
// ================================

export function calcPotential(stake, odds) {
  return round2(
    (Number(stake) || 0) * (Number(odds) || 0)
  );
}

// ================================
// CALCOLO TOTALI
// ================================

export function totals(bets) {
  const stake = bets.reduce(
    (total, bet) => total + (Number(bet.stake) || 0),
    0
  );

  const returned = bets.reduce(
    (total, bet) => total + (Number(bet.actual) || 0),
    0
  );

  const profit = returned - stake;

  const roi = stake > 0
    ? (profit / stake) * 100
    : 0;

  return {
    stake: round2(stake),
    returned: round2(returned),
    profit: round2(profit),
    roi: round2(roi)
  };
}

// ================================
// STATISTICHE EASY / HARD
// ================================

export function byType(bets, type) {
  const filtered = bets.filter(
    bet => bet.type === type
  );

  const result = totals(filtered);

  return {
    ...result,

    count: filtered.length,

    won: filtered.filter(
      bet => bet.status === "won"
    ).length,

    lost: filtered.filter(
      bet => bet.status === "lost"
    ).length,

    pending: filtered.filter(
      bet => bet.status === "pending"
    ).length,

    void: filtered.filter(
      bet => bet.status === "void"
    ).length
  };
}

// ================================
// STATISTICHE PER ESITO
// ================================

export function outcomeStats(bets) {
  return {
    won: bets.filter(bet => bet.status === "won").length,
    lost: bets.filter(bet => bet.status === "lost").length,
    pending: bets.filter(bet => bet.status === "pending").length,
    void: bets.filter(bet => bet.status === "void").length
  };
}

// ================================
// STATISTICHE PER MERCATO
// ================================

export function marketStats(bets) {
  const markets = {};

  bets.forEach(bet => {
    (bet.events || []).forEach(event => {
      const market = event.market || "Altro";

      if (!markets[market]) {
        markets[market] = {
          count: 0
        };
      }

      markets[market].count++;
    });
  });

  return markets;
}
