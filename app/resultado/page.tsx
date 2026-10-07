import type { Metadata } from 'next';
import ResultadoContent from '@/components/ResultadoContent';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Resultado del matching · TutorMatch',
};

export default function ResultadoPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const raw = searchParams.solicitudId;
  const solicitudId = typeof raw === 'string' ? raw : undefined;

  return (
    <div>
      <h1 className="mb-2 text-3xl font-extrabold tracking-tight">
        Resultado del matching
      </h1>
      <p className="mb-8 text-slate-400">
        Recomendación automática basada en el score de afinidad.
      </p>

      {solicitudId ? (
        <ResultadoContent solicitudId={solicitudId} />
      ) : (
        <div className="card text-center">
          <p className="text-slate-300">
            No se recibió ninguna solicitud. Crea una solicitud para ver la
            recomendación de tutor.
          </p>
          <Link href="/solicitud" className="btn mt-6 inline-block">
            Crear solicitud
          </Link>
        </div>
      )}
    </div>
  );
}
