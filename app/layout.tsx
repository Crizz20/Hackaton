import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'TutorMatch · Matching inteligente de tutores',
  description:
    'Sistema de asignación automática de tutores por afinidad — Hackathon',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 sm:px-6">
          {children}
        </main>
        <footer className="border-t border-slate-800 py-6 text-center text-sm text-slate-500">
          TutorMatch · Hackathon — Matching automático de tutores
        </footer>
      </body>
    </html>
  );
}
