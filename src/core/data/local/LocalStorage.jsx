const localStorageService = {
  setItem: (key, value) => {
    localStorage.setItem(key, value);
  },
  getItem: (key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  removeItem: (key) => {
    localStorage.removeItem(key);
  },
  clear: () => {
    localStorage.clear();
  },
};

export default localStorageService;
