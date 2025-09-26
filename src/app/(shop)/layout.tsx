import { Footer } from '../../components/ui/Footer';
import { Navbar } from '../../components/ui/Navbar';
import { headers } from 'next/headers';
import { auth } from '@/lib/utils/auth';

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  let user = null;
  const session = await auth.api.getSession({
    headers: headersList,
  });
  if (session?.user) {
    user = {
      id: session.user.id,
    };
  }

  return (
    <>
      <Navbar user={user} />
      {children}
      <Footer />
    </>
  );
}
