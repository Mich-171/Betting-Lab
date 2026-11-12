
export function money(value) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR"
  }).format(Number(value) || 0);
}

export function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

export function calcOdds(events) {
  if (!Array.isArray(events) || events.length === 0) return 0;

  return round2(
    events.reduce((total, event) => {
      const odds = Number(event.odds);
      return total * (odds > 0 ? odds : 1);
    }, 1)
  );
}

export function calcPotential(stake, odds) {
  return round2((Number(stake) || 0) * (Number(odds) || 0));
}

export function totals(bets) {
  const stake = bets.reduce(
    (sum, bet) => sum + (Number(bet.stake) || 0),
    0
  );

  const returned = bets.reduce(
    (sum, bet) => sum + (Number(bet.actual) || 0),
    0
  );

  const profit = returned - stake;

  return {
    stake: round2(stake),
    returned: round2(returned),
    profit: round2(profit),
    roi: stake > 0 ? round2(profit / stake * 100) : 0
  };
}

export function byType(bets, type) {
  const filtered = bets.filter(bet => bet.type === type);

  return {
    ...totals(filtered),
    count: filtered.length,
    won: filtered.filter(bet => bet.status === "won").length,
    lost: filtered.filter(bet => bet.status === "lost").length,
    pending: filtered.filter(
      bet => !bet.status || bet.status === "pending"
    ).length,
    void: filtered.filter(bet => bet.status === "void").length
  };
}

export function outcomeStats(bets) {
  return {
    won: bets.filter(bet => bet.status === "won").length,
    lost: bets.filter(bet => bet.status === "lost").length,
    pending: bets.filter(
      bet => !bet.status || bet.status === "pending"
    ).length,
    void: bets.filter(bet => bet.status === "void").length
  };
}

export function eventStats(bets) {
  const result = {
    total: 0,
    won: 0,
    lost: 0,
    pending: 0,
    void: 0,
    winRate: 0,
    lossRate: 0
  };

  bets.forEach(bet => {
    (bet.events || []).forEach(event => {
      result.total++;

      const status = event.result || "pending";

      if (status === "won") result.won++;
      else if (status === "lost") result.lost++;
      else if (status === "void") result.void++;
      else result.pending++;
    });
  });

  const evaluated = result.won + result.lost;

  if (evaluated > 0) {
    result.winRate = round2(result.won / evaluated * 100);
    result.lossRate = round2(result.lost / evaluated * 100);
  }

  return result;
}

export function marketStats(bets) {
  const markets = {};

  bets.forEach(bet => {
    (bet.events || []).forEach(event => {
      const name = event.market || "Altro";

      if (!markets[name]) {
        markets[name] = {
          count: 0,
          won: 0,
          lost: 0,
          pending: 0,
          void: 0,
          winRate: 0,
          lossRate: 0
        };
      }

      const market = markets[name];
      market.count++;

      const status = event.result || "pending";

      if (status === "won") market.won++;
      else if (status === "lost") market.lost++;
      else if (status === "void") market.void++;
      else market.pending++;
    });
  });

  Object.values(markets).forEach(market => {
    const evaluated = market.won + market.lost;

    if (evaluated > 0) {
      market.winRate = round2(market.won / evaluated * 100);
      market.lossRate = round2(market.lost / evaluated * 100);
    }
  });

  return markets;
}
