import Link from "next/link";

import { consumeEmailConfirmationToken } from "@/features/auth/magic-link";
import { BrandShell } from "@/components/brand-shell";

export const dynamic = "force-dynamic";

type ConfirmEmailPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function ConfirmEmailPage({
  searchParams,
}: ConfirmEmailPageProps): Promise<React.JSX.Element> {
  const { token } = await searchParams;
  const result = token
    ? await consumeEmailConfirmationToken(token)
    : { success: false as const, message: "Token de confirmacao nao informado." };

  return (
    <BrandShell
      badge="Confirmacao"
      title={result.success ? "E-mail confirmado" : "Nao foi possivel confirmar"}
      description={result.message}
    >
      <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-raffle">
        <p className="text-sm leading-6 text-slate-600">
          {result.success
            ? "Agora o painel administrativo ja pode publicar rifas e liberar o sorteio."
            : "Se o link expirou ou ja foi utilizado, entre no painel e gere um novo link."}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/admin" className="rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white">
            Ir para o painel
          </Link>
          <Link href="/entrar" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
            Voltar ao login
          </Link>
        </div>
      </div>
    </BrandShell>
  );
}
