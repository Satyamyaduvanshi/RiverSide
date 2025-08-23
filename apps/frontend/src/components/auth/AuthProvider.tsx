'use client';

import { ReactNode, createContext, useContext, useRef } from 'react';
import { useStore } from 'zustand';
import { createAuthStore, AuthState, User } from '../../stores/authStore';

const AuthStoreContext = createContext<ReturnType<typeof createAuthStore> | null>(null);

export function AuthProvider({ initialUser, children }: { children: ReactNode }) {
  const storeRef = useRef<ReturnType<typeof createAuthStore>>();
  if (!storeRef.current) {
    // Create the store instance only once
    storeRef.current = createAuthStore({ user: initialUser });
  }

  return (
    <AuthStoreContext.Provider value={storeRef.current}>
      {children}
    </AuthStoreContext.Provider>
  );
}

// did not understant this (read about it)
// This is the new hook that all your components MUST use to access the auth state.
export const useAuthContext = <T,>(selector: (state: AuthState) => T): T => {
  const store = useContext(AuthStoreContext);
  if (!store) throw new Error('Missing AuthStoreContext.Provider');
  return useStore(store, selector);
};