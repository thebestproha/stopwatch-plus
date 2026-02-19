// Storage utility that wraps localStorage
const storage = {
  async get(key) {
    try {
      const value = localStorage.getItem(key);
      if (value === null) {
        throw new Error('Key not found');
      }
      return { value };
    } catch (error) {
      throw error;
    }
  },

  async set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      throw error;
    }
  },

  async delete(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      throw error;
    }
  }
};

// Make storage available globally
if (typeof window !== 'undefined') {
  window.storage = storage;
}

export default storage;
