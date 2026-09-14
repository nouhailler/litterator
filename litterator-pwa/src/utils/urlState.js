export function readPositivePage(value) {
  const page = Number(value || '1');
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export function readEnum(value, allowedValues, fallback) {
  return allowedValues.includes(value) ? value : fallback;
}

export function updateUrlState(searchParams, setSearchParams, changes, options = {}) {
  const next = new URLSearchParams(searchParams);

  for (const [key, value] of Object.entries(changes)) {
    if (value === '' || value === null || value === undefined || value === false) {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
  }

  setSearchParams(next, { replace: Boolean(options.replace) });
}
