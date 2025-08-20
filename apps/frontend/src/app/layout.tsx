import { cookies } from 'next/headers';
import './global.css';
import { AuthProvider } from '../components/auth/AuthProvider';

export const metadata = {
  title: 'Riverside Clone',
  description: 'A full-stack Riverside.fm clone',
};

// This helper function will fetch the user on the server using the cookie
async function getUser() {
  const token = (await cookies()).get('access-token')?.value;
  //console.log("token in app layout: ",token)
  if (!token) return null;

  try {
    const res = await fetch('http://localhost:3000/api/user/me', {
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