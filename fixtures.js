
import { loadFixtures, saveFixtures } from "./storage.js";
import { serieA2026Fixtures } from "./seriea-calendar.js";

function getStoredFixtures() {
  return loadFixtures() || [];
}

export function allFixtures() {
  const stored = getStoredFixtures();

  // Partite ufficiali nascoste dall'utente
  const hiddenIds = stored
    .filter(fixture => fixture.deleted === true)
    .map(fixture => fixture.id);

  // Partite inserite manualmente
  const customFixtures = stored.filter(
    fixture => fixture.deleted !== true
  );

  // Evita duplicati tra calendario ufficiale e partite manuali
  const officialKeys = new Set(
    serieA2026Fixtures.map(fixture =>
      `${fixture.season}-${fixture.round}-${fixture.home}-${fixture.away}`
    )
  );

  const filteredCustom = customFixtures.filter(fixture => {
    const key =
      `${fixture.season}-${fixture.round}-${fixture.home}-${fixture.away}`;

    return !officialKeys.has(key);
  });

  const officialFixtures = serieA2026Fixtures.filter(
    fixture => !hiddenIds.includes(fixture.id)
  );

  return [...officialFixtures, ...filteredCustom];
}

export function fixturesFor(season, round) {
  return allFixtures().filter(fixture =>
    Number(fixture.season) === Number(season) &&
    Number(fixture.round) === Number(round)
  );
}

export function addFixture(fixture) {
  const stored = getStoredFixtures();

  const newFixture = {
    id: crypto.randomUUID(),
    season: Number(fixture.season),
    round: Number(fixture.round),
    home: fixture.home.trim(),
    away: fixture.away.trim(),
    date: fixture.date || ""
  };

  stored.push(newFixture);
  saveFixtures(stored);

  return newFixture;
}

export function removeFixture(id) {
  const stored = getStoredFixtures();

  // Se è una partita ufficiale, la nascondiamo senza cancellare
  // il calendario originale dal codice.
  const isOfficial = serieA2026Fixtures.some(
    fixture => fixture.id === id
  );

  if (isOfficial) {
    const alreadyHidden = stored.some(
      fixture => fixture.id === id && fixture.deleted === true
    );

    if (!alreadyHidden) {
      stored.push({
        id,
        deleted: true
      });
    }
  } else {
    const updated = stored.filter(fixture => fixture.id !== id);
    saveFixtures(updated);
    return;
  }

  saveFixtures(stored);
}

export function importFixtures(fixtures) {
  if (!Array.isArray(fixtures)) {
    throw new Error("Il calendario deve essere un array.");
  }

  const validFixtures = fixtures.filter(fixture =>
    fixture &&
    fixture.home &&
    fixture.away &&
    fixture.season &&
    fixture.round
  );

  const oldStored = getStoredFixtures();

  // Mantiene le eventuali partite ufficiali nascoste
  const hiddenFixtures = oldStored.filter(
    fixture => fixture.deleted === true
  );

  const importedFixtures = validFixtures.map(fixture => ({
    id: fixture.id || crypto.randomUUID(),
    season: Number(fixture.season),
    round: Number(fixture.round),
    home: String(fixture.home).trim(),
    away: String(fixture.away).trim(),
    date: fixture.date || ""
  }));

  saveFixtures([...hiddenFixtures, ...importedFixtures]);

  return importedFixtures.length;
}
