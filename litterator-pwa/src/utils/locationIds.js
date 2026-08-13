export const getLocationId = (value = '') => value
  .normalize('NFD')
  .replace(/[đĐ]/g, 'd')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

export const isSpecificLocation = (value = '') => {
  const id = getLocationId(value);
  return Boolean(id && id !== 'france' && value.includes(','));
};
