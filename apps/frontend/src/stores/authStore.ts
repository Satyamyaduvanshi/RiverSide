import { createStore } from 'zustand';

export interface User {
  id: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
}

export const createAuthStore = (initialState: Partial<AuthState> = {}) => {
  return createStore<AuthState>((set) => ({
    user: initialState.user || null,
    isAuthenticated: !!initialState.user,
    setUser: (user) => set({ user, isAuthenticated: !!user }),
  }));
};