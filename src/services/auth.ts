// Auth service placeholder - prepared for future Supabase integration

export interface User {
  id: string;
  email: string;
}

// Simulated login for now
export const loginWithEmail = async (email: string, _password: string): Promise<User> => {
  // TODO: Replace with Supabase auth
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: crypto.randomUUID(), email });
    }, 800);
  });
};

export const logout = async (): Promise<void> => {
  // TODO: Replace with Supabase auth
  return new Promise((resolve) => {
    setTimeout(resolve, 300);
  });
};
