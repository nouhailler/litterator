export const getHashId = (hash) => decodeURIComponent(hash.replace(/^#/, ''));

export const scrollToHash = (hash) => {
  const id = getHashId(hash);

  if (!id) {
    return;
  }

  window.requestAnimationFrame(() => {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
};
