const jsonCache = new Map();

export class DataLoadError extends Error {
  constructor(path, message, options = {}) {
    super(message, options);
    this.name = 'DataLoadError';
    this.path = path;
    this.status = options.status;
  }
}

export function loadJson(path) {
  if (!jsonCache.has(path)) {
    const request = fetch(path)
      .then((response) => {
        if (!response.ok) {
          throw new DataLoadError(path, `La ressource ${path} a répondu avec le statut ${response.status}.`, { status: response.status });
        }

        return response.json().catch((error) => {
          throw new DataLoadError(path, `La ressource ${path} contient un JSON invalide.`, { cause: error });
        });
      })
      .catch((error) => {
        jsonCache.delete(path);
        if (error instanceof DataLoadError) throw error;
        throw new DataLoadError(
          path,
          `La ressource ${path} est inaccessible. Vérifiez la connexion ou le cache hors ligne.`,
          { cause: error },
        );
      });

    jsonCache.set(path, request);
  }

  return jsonCache.get(path);
}

export function loadCoreCorpus() {
  return Promise.all([
    loadJson('/data/authors.json'),
    loadJson('/data/works.json'),
    loadJson('/data/movements.json'),
  ]).then(([authors, works, movements]) => ({ authors, works, movements }));
}
