import Link from "next/link";

type BrandShellProps = {
  badge?: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function BrandShell({
  badge = "Rifa",
  title,
  description,
  children,
}: BrandShellProps): React.JSX.Element {
  return (
    <main className="min-h-screen bg-paper bg-raffle-glow px-5 py-8 text-ink sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-5 rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-raffle backdrop-blur md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex rounded-full border border-brand-100 bg-brand-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">
              {badge}
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-[-0.04em] text-ink">{title}</h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/" className="rounded-full border border-slate-200 px-4 py-2 text-slate-700">
              Inicio
            </Link>
            <Link href="/admin" className="rounded-full bg-ink px-4 py-2 text-white">
              Painel
            </Link>
          </nav>
        </header>
        {children}
      </div>
    </main>
  );
}
