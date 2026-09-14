export const normalizeText = (value = '') => value
  .toLocaleLowerCase('fr-FR')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

export const slugify = (value) => normalizeText(value)
  .replace(/œ/g, 'oe')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

export function enrichGlossary(terms, glossaryCategories) {
  const detailedTermsByName = new Map(terms.map((term) => [normalizeText(term.term), term]));
  const catalogTermNames = new Set();
  const catalogTerms = glossaryCategories.flatMap((category) => category.terms.map((termLabel) => {
    const detailedTerm = detailedTermsByName.get(normalizeText(termLabel));
    catalogTermNames.add(normalizeText(termLabel));
    return {
      ...(detailedTerm || {}),
      id: detailedTerm?.id || slugify(termLabel),
      term: detailedTerm?.term || termLabel,
      category: category.label,
      categoryId: category.id,
      definition: detailedTerm?.definition || 'Définition à compléter.',
      example: detailedTerm?.example || 'Cette entrée est classée dans le catalogue du glossaire et pourra recevoir une fiche détaillée.',
      isPendingDefinition: !detailedTerm,
    };
  }));
  const uncataloguedTerms = terms
    .filter((term) => !catalogTermNames.has(normalizeText(term.term)))
    .map((term) => ({ ...term, categoryId: `legacy-${slugify(term.category)}`, isPendingDefinition: false }));

  return [...catalogTerms, ...uncataloguedTerms].sort((a, b) => a.term.localeCompare(b.term, 'fr'));
}

export function buildGlossaryCategories(enrichedTerms, glossaryCategories) {
  const uncatalogued = new Map();
  enrichedTerms.filter((term) => term.categoryId?.startsWith('legacy-')).forEach((term) => {
    const category = uncatalogued.get(term.categoryId) || { id: term.categoryId, label: term.category, terms: [] };
    category.terms.push(term.term);
    uncatalogued.set(term.categoryId, category);
  });
  return [...glossaryCategories, ...uncatalogued.values()];
}
