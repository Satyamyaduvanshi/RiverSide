'use client';

import { useAuthStore } from '../../stores/authStore';
import { useEffect } from 'react';

// Define the User type to be consistent
interface User {
  id: string;
  name: string;
}

interface AuthProviderProps {
  initialUser: User | null;
  children: React.ReactNode;
}

export function AuthProvider({ initialUser, children }: AuthProviderProps) {
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    // On mount, hydrate the store with the data passed from the server.
    // We only do this once, or if the initialUser prop changes.
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialUser, setUser]);

  return <>{children}</>;
}