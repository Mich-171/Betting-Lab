# BETTING LAB

Applicazione web per registrare, organizzare e analizzare le proprie schedine sportive.

## Funzionalità

- Inserimento e modifica delle schedine.
- Gestione separata delle schedine Easy e Hard.
- Calcolo automatico della quota totale.
- Calcolo automatico della vincita potenziale.
- Possibilità di modificare manualmente quota e vincita potenziale.
- Registrazione di puntate, vincite e risultati.
- Dashboard con bilancio, profitto e ROI.
- Statistiche per tipologia, esito e mercato.
- Calendario delle partite organizzato per stagione e giornata.
- Selezione delle partite per inserirle più velocemente nelle schedine.
- Esportazione e importazione dei backup JSON.
- Salvataggio dei dati direttamente nel browser.

## Struttura dei file

Tutti i file si trovano nella cartella principale del repository.

- `index.html` - struttura dell'applicazione.
- `style.css` - grafica e layout.
- `storage.js` - salvataggio e caricamento dei dati.
- `calculations.js` - calcoli e statistiche.
- `fixtures.js` - gestione del calendario.
- `ui.js` - visualizzazione dell'interfaccia.
- `app.js` - logica principale dell'applicazione.
- `manifest.webmanifest` - configurazione installazione PWA.
- `icon.svg` - icona dell'applicazione.

## Pubblicazione

Il progetto può essere pubblicato tramite GitHub Pages.

1. Aprire le impostazioni del repository.
2. Accedere alla sezione Pages.
3. Selezionare Deploy from a branch.
4. Scegliere il branch `main`.
5. Selezionare la cartella `/ (root)`.
6. Salvare.

## Salvataggio dei dati

I dati vengono salvati localmente nel browser tramite localStorage.

**Attenzione:** i dati non vengono sincronizzati automaticamente tra dispositivi o browser.

È consigliato esportare periodicamente un backup JSON e conservarlo in un luogo sicuro.

## Note

BETTING LAB è uno strumento personale di registrazione e analisi delle schedine.

Le quote e i risultati devono essere inseriti e verificati dall'utente.