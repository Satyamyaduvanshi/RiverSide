'use client';

import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      setIsVerified(true);
    }
  }, [isAuthenticated, router]);

  // Render nothing or a loading spinner until verification is complete
  if (!isVerified) {
    return null;
  }

  return <>{children}</>;
}