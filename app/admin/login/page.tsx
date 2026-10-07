import type { Metadata } from 'next';
import LoginForm from '@/components/LoginForm';

export const metadata: Metadata = {
  title: 'Acceso coordinador · TutorMatch',
};

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const raw = searchParams.from;
  const desde = typeof raw === 'string' ? raw : undefined;

  return <LoginForm desde={desde} />;
}
