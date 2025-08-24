'use client';

import { ReactNode, createContext, useContext, useRef } from 'react';
import { useStore } from 'zustand';
import { createAuthStore, AuthState, User } from '../../stores/authStore';

interface AuthProviderProps {
  initialUser: User | null;
  children: ReactNode;
}

const AuthStoreContext = createContext<ReturnType<typeof createAuthStore> | null>(null);

export function AuthProvider({ initialUser, children }: AuthProviderProps) {
  const storeRef = useRef<ReturnType<typeof createAuthStore>>(null);
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

export const useAuthContext = <T,>(selector: (state: AuthState) => T): T => {
  const store = useContext(AuthStoreContext);
  if (!store) throw new Error('Missing AuthStoreContext.Provider');
  return useStore(store, selector);
};