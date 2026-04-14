import Link from "next/link";

export default function NotFound(): React.JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-6 text-center text-ink">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-700">404</p>
      <h1 className="text-4xl font-black tracking-[-0.04em]">Pagina nao encontrada</h1>
      <p className="max-w-md text-sm leading-6 text-slate-600">
        O endereco acessado nao existe nesta fase do projeto. Volte para a pagina inicial para
        continuar a validacao do ambiente.
      </p>
      <Link
        href="/"
        className="rounded-2xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white"
      >
        Voltar para o inicio
      </Link>
    </main>
  );
}
