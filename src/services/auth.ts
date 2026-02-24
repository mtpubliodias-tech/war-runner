export interface User {
  id: string;
  email: string;
}

const STORAGE_KEY = "warunner_user";

export const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const storeUser = (user: User) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

export const loginWithEmail = async (email: string, _password: string): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user: User = { id: crypto.randomUUID(), email };
      storeUser(user);
      resolve(user);
    }, 800);
  });
};

export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
