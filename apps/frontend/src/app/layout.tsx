import { cookies } from 'next/headers';
import './global.css';
import { AuthProvider } from '../components/auth/AuthProvider';
import type { User } from '../stores/authStore';

export const metadata = {
  title: 'Riverside Clone',
  description: 'A full-stack Riverside.fm clone',
};

async function getUser(): Promise<User | null> {
  const token = (await cookies()).get('access-token')?.value;
  if (!token) return null;

  try {
    const res = await fetch('http://localhost:3000/api/user/me', {
      headers: {
        Cookie: `access-token=${token}`,
      },
      cache: 'no-store',
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

  console.log("user in layout: ",user)

  return (
    <html lang="en">
      <body>
        <AuthProvider initialUser={user}>{children}</AuthProvider>
      </body>
    </html>
  );
}