
import {
  loadFixtures,
  saveFixtures
} from "./storage.js";

// ================================
// RECUPERA TUTTE LE PARTITE
// ================================

export function allFixtures() {
  return loadFixtures();
}

// ================================
// PARTITE DI UNA GIORNATA
// ================================

export function fixturesFor(season, round) {
  return allFixtures().filter(fixture =>
    String(fixture.season) === String(season) &&
    Number(fixture.round) === Number(round)
  );
}

// ================================
// AGGIUNGI UNA PARTITA
// ================================

export function addFixture(fixture) {
  const fixtures = allFixtures();

  const normalized = {
    id: fixture.id || crypto.randomUUID(),
    season: Number(fixture.season),
    round: Number(fixture.round),
    home: String(fixture.home || "").trim(),
    away: String(fixture.away || "").trim(),
    date: fixture.date || ""
  };

  if (
    !normalized.season ||
    !normalized.round ||
    !normalized.home ||
    !normalized.away
  ) {
    throw new Error("Completa tutti i dati obbligatori della partita");
  }

  fixtures.push(normalized);

  saveFixtures(fixtures);

  return fixtures;
}

// ================================
// ELIMINA UNA PARTITA
// ================================

export function removeFixture(id) {
  const fixtures = allFixtures();

  const updated = fixtures.filter(
    fixture => fixture.id !== id
  );

  saveFixtures(updated);

  return updated;
}

// ================================
// IMPORTA UN CALENDARIO JSON
// ================================

export function importFixtures(items) {
  if (!Array.isArray(items)) {
    throw new Error("Il calendario deve essere un array JSON");
  }

  const normalized = items.map(fixture => ({
    id: fixture.id || crypto.randomUUID(),
    season: Number(fixture.season || 2026),
    round: Number(fixture.round),
    home: String(fixture.home || "").trim(),
    away: String(fixture.away || "").trim(),
    date: fixture.date || ""
  }));

  const invalid = normalized.some(fixture =>
    !fixture.season ||
    !fixture.round ||
    !fixture.home ||
    !fixture.away
  );

  if (invalid) {
    throw new Error(
      "Una o più partite contengono dati mancanti o non validi"
    );
  }

  saveFixtures(normalized);

  return normalized;
}
