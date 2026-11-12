
const rounds = [
  // Giornata 1
  `Atalanta-Sassuolo|Bologna-Lazio|Frosinone-Juventus|Genoa-Napoli|Inter-Monza|Parma-Cagliari|Roma-Fiorentina|Torino-Milan|Udinese-Como|Venezia-Lecce`,

  // Giornata 2
  `Atalanta-Bologna|Cagliari-Inter|Fiorentina-Frosinone|Juventus-Parma|Lazio-Genoa|Lecce-Roma|Milan-Venezia|Monza-Udinese|Napoli-Como|Sassuolo-Torino`,

  // Giornata 3
  `Bologna-Sassuolo|Cagliari-Lecce|Fiorentina-Torino|Frosinone-Venezia|Genoa-Como|Inter-Napoli|Juventus-Milan|Parma-Monza|Roma-Atalanta|Udinese-Lazio`,

  // Giornata 4
  `Atalanta-Cagliari|Como-Parma|Genoa-Frosinone|Inter-Udinese|Lazio-Milan|Lecce-Monza|Napoli-Bologna|Sassuolo-Juventus|Torino-Roma|Venezia-Fiorentina`,

  // Giornata 5
  `Bologna-Torino|Fiorentina-Napoli|Frosinone-Como|Juventus-Atalanta|Milan-Lecce|Monza-Sassuolo|Parma-Genoa|Roma-Inter|Udinese-Cagliari|Venezia-Lazio`,

  // Giornata 6
  `Atalanta-Venezia|Cagliari-Juventus|Como-Roma|Genoa-Fiorentina|Inter-Parma|Lazio-Monza|Lecce-Bologna|Napoli-Frosinone|Sassuolo-Milan|Torino-Udinese`,

  // Giornata 7
  `Bologna-Inter|Fiorentina-Como|Frosinone-Sassuolo|Juventus-Lazio|Milan-Atalanta|Monza-Cagliari|Parma-Torino|Roma-Genoa|Udinese-Lecce|Venezia-Napoli`,

  // Giornata 8
  `Atalanta-Frosinone|Cagliari-Bologna|Como-Sassuolo|Genoa-Venezia|Inter-Fiorentina|Lazio-Parma|Lecce-Juventus|Napoli-Roma|Torino-Monza|Udinese-Milan`,

  // Giornata 9
  `Fiorentina-Atalanta|Frosinone-Lecce|Genoa-Juventus|Milan-Bologna|Monza-Napoli|Parma-Udinese|Roma-Cagliari|Sassuolo-Lazio|Torino-Como|Venezia-Inter`,

  // Giornata 10
  `Atalanta-Parma|Bologna-Monza|Como-Venezia|Frosinone-Torino|Juventus-Napoli|Lazio-Cagliari|Lecce-Genoa|Milan-Inter|Sassuolo-Fiorentina|Udinese-Roma`,

  // Giornata 11
  `Cagliari-Frosinone|Fiorentina-Juventus|Genoa-Milan|Inter-Como|Monza-Atalanta|Napoli-Lazio|Parma-Bologna|Roma-Sassuolo|Torino-Lecce|Venezia-Udinese`,

  // Giornata 12
  `Atalanta-Inter|Bologna-Udinese|Como-Cagliari|Juventus-Venezia|Lazio-Lecce|Milan-Frosinone|Monza-Fiorentina|Napoli-Torino|Parma-Roma|Sassuolo-Genoa`,

  // Giornata 13
  `Cagliari-Milan|Como-Juventus|Frosinone-Parma|Inter-Genoa|Lecce-Atalanta|Roma-Monza|Sassuolo-Napoli|Torino-Lazio|Udinese-Fiorentina|Venezia-Bologna`,

  // Giornata 14
  `Bologna-Roma|Fiorentina-Cagliari|Frosinone-Inter|Genoa-Torino|Juventus-Udinese|Lazio-Atalanta|Milan-Parma|Monza-Como|Napoli-Lecce|Venezia-Sassuolo`,

  // Giornata 15
  `Atalanta-Genoa|Cagliari-Venezia|Como-Bologna|Inter-Torino|Juventus-Monza|Lazio-Roma|Lecce-Sassuolo|Napoli-Milan|Parma-Fiorentina|Udinese-Frosinone`,

  // Giornata 16
  `Atalanta-Napoli|Fiorentina-Bologna|Frosinone-Lazio|Genoa-Udinese|Lecce-Inter|Milan-Como|Roma-Juventus|Sassuolo-Parma|Torino-Cagliari|Venezia-Monza`,

  // Giornata 17
  `Bologna-Juventus|Cagliari-Genoa|Como-Lecce|Fiorentina-Lazio|Inter-Sassuolo|Monza-Milan|Parma-Napoli|Roma-Frosinone|Torino-Venezia|Udinese-Atalanta`,

  // Giornata 18
  `Atalanta-Como|Frosinone-Bologna|Genoa-Monza|Juventus-Torino|Lazio-Inter|Lecce-Parma|Milan-Fiorentina|Napoli-Cagliari|Sassuolo-Udinese|Venezia-Roma`,

  // Giornata 19
  `Bologna-Genoa|Cagliari-Sassuolo|Como-Lazio|Fiorentina-Lecce|Inter-Juventus|Monza-Frosinone|Parma-Venezia|Roma-Milan|Torino-Atalanta|Udinese-Napoli`,

  // Giornata 20
  `Atalanta-Roma|Cagliari-Como|Juventus-Genoa|Lazio-Bologna|Lecce-Udinese|Milan-Torino|Napoli-Fiorentina|Parma-Inter|Sassuolo-Monza|Venezia-Frosinone`,

  // Giornata 21
  `Bologna-Atalanta|Como-Napoli|Fiorentina-Sassuolo|Frosinone-Milan|Genoa-Parma|Inter-Venezia|Juventus-Cagliari|Lecce-Torino|Monza-Lazio|Roma-Udinese`,

  // Giornata 22
  `Atalanta-Fiorentina|Cagliari-Parma|Genoa-Lecce|Lazio-Venezia|Milan-Juventus|Monza-Roma|Napoli-Inter|Sassuolo-Como|Torino-Frosinone|Udinese-Bologna`,

  // Giornata 23
  `Atalanta-Lazio|Bologna-Milan|Como-Monza|Fiorentina-Udinese|Inter-Cagliari|Juventus-Sassuolo|Lecce-Napoli|Parma-Frosinone|Roma-Torino|Venezia-Genoa`,

  // Giornata 24
  `Bologna-Como|Cagliari-Lazio|Frosinone-Fiorentina|Genoa-Atalanta|Inter-Milan|Monza-Lecce|Napoli-Juventus|Roma-Parma|Torino-Sassuolo|Udinese-Venezia`,

  // Giornata 25
  `Atalanta-Monza|Como-Torino|Fiorentina-Inter|Juventus-Bologna|Lazio-Napoli|Lecce-Frosinone|Milan-Genoa|Sassuolo-Roma|Udinese-Parma|Venezia-Cagliari`,

  // Giornata 26
  `Bologna-Lecce|Cagliari-Udinese|Como-Milan|Frosinone-Napoli|Genoa-Lazio|Inter-Atalanta|Monza-Juventus|Parma-Sassuolo|Roma-Venezia|Torino-Fiorentina`,

  // Giornata 27
  `Atalanta-Torino|Fiorentina-Venezia|Juventus-Roma|Lazio-Frosinone|Lecce-Como|Milan-Cagliari|Monza-Genoa|Napoli-Parma|Sassuolo-Bologna|Udinese-Inter`,

  // Giornata 28
  `Bologna-Napoli|Cagliari-Fiorentina|Como-Udinese|Frosinone-Monza|Genoa-Roma|Lazio-Juventus|Milan-Sassuolo|Parma-Lecce|Torino-Inter|Venezia-Atalanta`,

  // Giornata 29
  `Atalanta-Milan|Fiorentina-Genoa|Inter-Frosinone|Juventus-Como|Monza-Bologna|Napoli-Venezia|Parma-Lazio|Roma-Lecce|Sassuolo-Cagliari|Udinese-Torino`,

  // Giornata 30
  `Cagliari-Napoli|Como-Fiorentina|Frosinone-Udinese|Genoa-Inter|Lecce-Lazio|Milan-Monza|Roma-Bologna|Sassuolo-Atalanta|Torino-Juventus|Venezia-Parma`,

  // Giornata 31
  `Bologna-Venezia|Cagliari-Atalanta|Fiorentina-Milan|Frosinone-Genoa|Inter-Roma|Juventus-Lecce|Lazio-Torino|Napoli-Sassuolo|Parma-Como|Udinese-Monza`,

  // Giornata 32
  `Atalanta-Udinese|Bologna-Cagliari|Como-Frosinone|Fiorentina-Parma|Milan-Napoli|Monza-Inter|Roma-Lazio|Sassuolo-Lecce|Torino-Genoa|Venezia-Juventus`,

  // Giornata 33
  `Cagliari-Monza|Frosinone-Roma|Genoa-Sassuolo|Inter-Bologna|Juventus-Fiorentina|Lazio-Como|Lecce-Milan|Napoli-Udinese|Parma-Atalanta|Venezia-Torino`,

  // Giornata 34
  `Atalanta-Juventus|Bologna-Fiorentina|Como-Inter|Lecce-Cagliari|Milan-Lazio|Monza-Venezia|Roma-Napoli|Sassuolo-Frosinone|Torino-Parma|Udinese-Genoa`,

  // Giornata 35
  `Fiorentina-Roma|Frosinone-Atalanta|Genoa-Cagliari|Inter-Lecce|Lazio-Sassuolo|Napoli-Monza|Parma-Milan|Torino-Bologna|Udinese-Juventus|Venezia-Como`,

  // Giornata 36
  `Bologna-Frosinone|Cagliari-Torino|Como-Atalanta|Juventus-Inter|Lazio-Udinese|Lecce-Fiorentina|Milan-Roma|Monza-Parma|Napoli-Genoa|Sassuolo-Venezia`,

  // Giornata 37
  `Atalanta-Lecce|Fiorentina-Monza|Frosinone-Cagliari|Genoa-Bologna|Inter-Lazio|Parma-Juventus|Roma-Como|Torino-Napoli|Udinese-Sassuolo|Venezia-Milan`,

  // Giornata 38
  `Bologna-Parma|Cagliari-Roma|Como-Genoa|Juventus-Frosinone|Lazio-Fiorentina|Lecce-Venezia|Milan-Udinese|Monza-Torino|Napoli-Atalanta|Sassuolo-Inter`
];

export const serieA2026Fixtures = rounds.flatMap(
  (roundMatches, roundIndex) =>
    roundMatches.split("|").map((match, matchIndex) => {
      const [home, away] = match.split("-");

      return {
        id: `seriea-2026-${roundIndex + 1}-${matchIndex + 1}`,
        season: 2026,
        round: roundIndex + 1,
        home,
        away,
        date: ""
      };
    })
);
