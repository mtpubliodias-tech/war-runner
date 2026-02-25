// src/services/auth.ts

export interface User {
  id: string;
  email: string;
}

const LS_KEY = "warunner:user";

export const getCurrentUser = (): User | null => {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.id || !parsed?.email) return null;
    return parsed as User;
  } catch {
    return null;
  }
};

export const loginWithEmail = async (email: string, _password: string): Promise<User> => {
  // MVP: auth fake, mas persistente.
  const user: User = { id: crypto.randomUUID(), email };
  localStorage.setItem(LS_KEY, JSON.stringify(user));
  return user;
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem(LS_KEY);
};