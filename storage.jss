
const DATA_KEY = "bettingLabData_v2";
const FIXTURES_KEY = "bettingLabFixtures_v1";

// ================================
// SCHEDINE
// ================================

export function loadData() {
  try {
    const raw = localStorage.getItem(DATA_KEY);

    if (!raw) {
      return { bets: [] };
    }

    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return { bets: parsed };
    }

    if (parsed && typeof parsed === "object" && Array.isArray(parsed.bets)) {
      return parsed;
    }

    return { bets: [] };
  } catch (error) {
    console.error("Errore nel caricamento delle schedine:", error);
    return { bets: [] };
  }
}

export function saveData(data) {
  if (!data || !Array.isArray(data.bets)) {
    throw new Error("Formato dei dati delle schedine non valido");
  }

  localStorage.setItem(DATA_KEY, JSON.stringify(data));
}

// ================================
// CALENDARIO
// ================================

export function loadFixtures() {
  try {
    const raw = localStorage.getItem(FIXTURES_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Errore nel caricamento del calendario:", error);
    return [];
  }
}

export function saveFixtures(fixtures) {
  if (!Array.isArray(fixtures)) {
    throw new Error("Il calendario deve essere un array");
  }

  localStorage.setItem(FIXTURES_KEY, JSON.stringify(fixtures));
}

// ================================
// ESPORTAZIONE BACKUP
// ================================

export function downloadJSON(filename, data) {
  const json = JSON.stringify(data, null, 2);

  const blob = new Blob(
    [json],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
