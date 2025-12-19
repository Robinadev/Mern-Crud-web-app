const STORAGE_KEY = 'user_management_data';

export const localStorageBackup = {
  saveUsers: (users) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
      return true;
    } catch (error) {
      console.error('LocalStorage save failed:', error);
      return false;
    }
  },

  loadUsers: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('LocalStorage load failed:', error);
      return [];
    }
  },

  addUser: (user) => {
    const users = localStorageBackup.loadUsers();
    users.push(user);
    localStorageBackup.saveUsers(users);
    return user._id;
  },

  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};