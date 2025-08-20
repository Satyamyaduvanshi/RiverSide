'use client';

import { useAuthStore } from '../../stores/authStore';
import { useEffect, useRef } from 'react';

interface User {
  id: string;
  name: string;
}

interface AuthProviderProps {
  initialUser: User | null;
  children: React.ReactNode;
}

export function AuthProvider({ initialUser, children }: AuthProviderProps) {
  // Use a ref to ensure we only hydrate the store once
  const hydrated = useRef(false);
  const { setUser } = useAuthStore();

  useEffect(() => {
    if (!hydrated.current) {
      // If the store hasn't been hydrated yet, set the user from the server
      setUser(initialUser);
      hydrated.current = true;
    }
  }, [initialUser, setUser]);

  return <>{children}</>;
}