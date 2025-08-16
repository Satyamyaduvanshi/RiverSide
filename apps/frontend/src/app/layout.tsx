import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './global.css';
import { AuthProvider } from '../components/auth/AuthProvider';
import { cookies } from 'next/headers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Riverside Clone',
  description: 'A full-stack Riverside.fm clone',
};

// This helper function will fetch the user on the server
async function getUser() {
  const token = (await cookies()).get('access-token')?.value;
  if (!token) return null;

  try {
    // We can't use our axios instance here as it's client-side.
    // We make a direct fetch call to the API Gateway.
    // In a real production Docker setup, this would be 'http://api-gateway:3000/user/me'
    const res = await fetch('http://localhost:3000/user/me', {
      headers: {
        Cookie: `access-token=${token}`,
      },
    });

    if (!res.ok) return null;

    return await res.json();
  } catch (error) {
    console.error('Failed to fetch user on server:', error);
    return null;
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <html lang="en">
      <body>
        <AuthProvider initialUser={user}>{children}</AuthProvider>
      </body>
    </html>
  );
}