import { readFile, writeFile } from 'node:fs/promises';

const worksPath = new URL('../public/data/works.json', import.meta.url);

const adaptationDates = {
  Q111435055: { year: 1892, dateType: 'première', source: 'https://www.wikidata.org/wiki/Q111435055' },
  Q3211426: { year: 1959, dateType: 'première', source: 'https://operone.de/opern/die-toedlichen-wuensche-von-klebe/' },
  Q116622161: { year: 2018, dateType: 'sortie', source: 'https://cineuropa.org/en/film/362683/' },
  Q96676071: { year: 1978, dateType: 'diffusion', source: 'https://www.wikidata.org/wiki/Q96676071' },
  Q16959513: { year: 1939, dateType: 'première', source: 'https://www.wikidata.org/wiki/Q16959513' },
  Q1213757: { year: 1982, dateType: 'diffusion', source: 'https://www.wikidata.org/wiki/Q1213757' },
  Q23021858: { year: 1889, dateType: 'achèvement de la composition', source: 'https://fr.wikipedia.org/wiki/Cinq_po%C3%A8mes_de_Charles_Baudelaire' },
  Q139620460: { year: 1888, dateType: 'première', source: 'https://www.wikidata.org/wiki/Q139620460' },
  Q124252758: { year: 1980, dateType: 'diffusion', source: 'https://www.wikidata.org/wiki/Q124252758' },
  Q7796958: { year: 2001, dateType: 'première', source: 'https://www.ibdb.com/broadway-production/thou-shalt-not-12881' },
  Q7799905: { year: 2001, dateType: 'première', source: 'https://tobiaspicker.com/opera/therese-raquin' },
  Q61450954: { year: 2007, dateType: 'première', source: 'https://www.wikidata.org/wiki/Q61450954' },
  Q1637772: { year: 1912, dateType: 'première', source: 'https://www.wikidata.org/wiki/Q1637772' },
  Q5553458: { year: 1995, dateType: 'première', source: 'https://www.wikidata.org/wiki/Q5553458' },
  Q28228307: { year: 1958, dateType: 'première', source: 'https://en.wikipedia.org/wiki/Nana_(opera)' },
  Q108894557: { year: 2021, dateType: 'diffusion', source: 'https://www.wikidata.org/wiki/Q108894557' },
  Q130267117: { year: 1915, dateType: 'sortie', source: 'https://fr.wikipedia.org/wiki/P%C3%AAcheur_d%27Islande_(film,_1915)', yearNote: 'Date à confirmer : 1915 selon Wikipédia ; la Cinémathèque de Bretagne indique 1916.', alternateYearSource: 'https://www.cinematheque-bretagne.bzh/dossiers/Bretagne_et_Cinema/fiches/fiche_1_0_2_1.html' },
  Q2325830: { year: 1905, dateType: 'première', source: 'https://www.wikidata.org/wiki/Q2325830' },
  Q15991008: { year: 1900, dateType: 'première', source: 'https://www.wikidata.org/wiki/Q15991008' },
  Q3138293: { year: 1907, dateType: 'première', source: 'https://fr.wikipedia.org/wiki/Histoires_naturelles_(Ravel)' },
  Q138379453: { year: 1984, dateType: 'première', source: 'https://www.wikidata.org/wiki/Q138379453' },
  Q15964351: { year: 1985, dateType: 'création', source: 'https://it.wikipedia.org/wiki/La_Boule_de_neige' },
  Q109242789: { year: 1973, dateType: 'première', source: 'https://www.wikidata.org/wiki/Q109242789' },
  Q108260386: { year: 2019, dateType: 'création', source: 'https://www.mbam.qc.ca/fr/expositions/sisyphe-performance-marathon-de-victor-pilon/' },
  Q8012971: { year: 2008, dateType: 'première', source: 'https://guerillaopera.org/repertoire/no-exit' },
  Q108538047: { year: 1995, dateType: 'première', source: 'https://www.wikidata.org/wiki/Q108538047' },
  Q47421175: { year: 1960, dateType: 'première', source: 'https://www.wikidata.org/wiki/Q47421175' },
  Q17028907: { year: 1960, dateType: 'première', source: 'https://www.wikidata.org/wiki/Q17028907' },
  Q133839248: { year: 2022, dateType: 'première', source: 'https://www.wikidata.org/wiki/Q133839248' },
  Q65153341: { year: 2019, dateType: 'diffusion', source: 'https://www.wikidata.org/wiki/Q65153341' },
  Q60848291: { year: 2018, dateType: 'diffusion', source: 'https://www.wikidata.org/wiki/Q60848291' },
};

const getWikidataId = (link = '') => link.match(/\/wiki\/(Q\d+)/)?.[1];

// Nature de l'adaptation, vérifiée dans les notices Wikidata liées et les sources de date.
const adaptationTypes = {
  Q111435055: 'opera', Q3211426: 'opera', Q16959513: 'opera', Q139620460: 'opera',
  Q7799905: 'opera', Q5553458: 'opera', Q28228307: 'opera', Q109242789: 'opera', Q8012971: 'opera',
  Q23021858: 'music', Q15991008: 'music', Q3138293: 'music', Q2325830: 'music',
  Q1637772: 'ballet', Q15964351: 'ballet', Q108260386: 'performance',
  Q61450954: 'stage', Q138379453: 'stage', Q108538047: 'stage',
  Q47421175: 'stage', Q17028907: 'stage', Q133839248: 'stage',
};

const works = JSON.parse(await readFile(worksPath, 'utf8'));
let removedInlineCovers = 0;
let completedAdaptations = 0;
let correctedTypes = 0;

for (const work of works) {
  if (work.cover?.startsWith('data:image/svg+xml')) {
    delete work.cover;
    removedInlineCovers += 1;
  }

  work.adaptations = (work.adaptations || []).map((adaptation) => {
    const wikidataId = getWikidataId(adaptation.link);
    const date = adaptationDates[wikidataId];
    if (adaptationTypes[wikidataId] && adaptationTypes[wikidataId] !== adaptation.type) {
      adaptation = { ...adaptation, type: adaptationTypes[wikidataId] };
      correctedTypes += 1;
    }

    if (Number.isInteger(adaptation.year)) {
      return date?.yearNote ? { ...adaptation, yearNote: date.yearNote, alternateYearSource: date.alternateYearSource } : adaptation;
    }

    if (!date) {
      throw new Error(`Aucune date éditoriale pour ${work.id} / ${adaptation.title}`);
    }

    completedAdaptations += 1;
    return {
      ...adaptation,
      year: date.year,
      dateType: date.dateType,
      yearSource: date.source,
      ...(date.yearNote && { yearNote: date.yearNote, alternateYearSource: date.alternateYearSource }),
    };
  });
}

await writeFile(worksPath, `${JSON.stringify(works, null, 2)}\n`);
console.log(`Couvertures SVG retirées : ${removedInlineCovers}`);
console.log(`Années d’adaptation complétées : ${completedAdaptations}`);
console.log(`Types d’adaptation corrigés : ${correctedTypes}`);
