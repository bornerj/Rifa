import Link from "next/link";

import { logoutAdminAction } from "@/features/auth/actions";
import { requireCurrentAdmin } from "@/features/auth/session";
import { getRafflesByAdmin } from "@/features/raffles/repository";
import { formatCurrencyFromCents, formatDate } from "@/lib/formatters";
import { BrandShell } from "@/components/brand-shell";

export const dynamic = "force-dynamic";

export default async function AdminPage(): Promise<React.JSX.Element> {
  const admin = await requireCurrentAdmin();
  const raffles = await getRafflesByAdmin(admin.id);

  return (
    <BrandShell
      badge="Painel do admin"
      title={`Ola, ${admin.name}`}
      description="Daqui voce cadastra rifas, acompanha o status da publicacao e depois gerencia o fluxo de pagamento e sorteio."
    >
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-raffle">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black tracking-[-0.04em] text-ink">Suas rifas</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {admin.emailConfirmed
                  ? "Conta confirmada. Voce ja pode publicar e testar o fluxo completo no Vercel."
                  : "Conta ainda aguardando confirmacao de e-mail."}
              </p>
            </div>
            <Link
              href={admin.emailConfirmed ? "/admin/rifas/nova" : "/confirmar-email/pendente"}
              className="rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white"
            >
              Nova rifa
            </Link>
          </div>

          <div className="mt-5 grid gap-3">
            {raffles.length ? (
              raffles.map((raffle) => (
                <article
                  key={raffle.id}
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-ink">{raffle.name}</h3>
                      <p className="text-sm text-slate-600">Beneficiario: {raffle.beneficiary}</p>
                      <p className="text-sm text-slate-600">
                        Cota: {formatCurrencyFromCents(raffle.quotaPriceInCents)}
                      </p>
                    </div>
                    <div className="space-y-2 text-right text-sm text-slate-600">
                      <p>Status: {raffle.status}</p>
                      <p>Expira em {formatDate(raffle.expiresAt)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href={`/admin/rifas/${raffle.id}`}
                      className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
                    >
                      Ver detalhes
                    </Link>
                    <Link
                      href={`/r/${raffle.slug}`}
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                    >
                      Abrir pagina publica
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                Nenhuma rifa criada ainda. Use o botao acima para abrir a primeira.
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          {!admin.emailConfirmed ? (
            <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5">
              <h2 className="text-lg font-black tracking-[-0.03em] text-amber-900">Confirmacao pendente</h2>
              <p className="mt-2 text-sm leading-6 text-amber-900/80">
                Voce pode entrar no painel, mas a criacao de rifas fica liberada somente depois do link magico.
              </p>
              <Link
                href="/confirmar-email/pendente"
                className="mt-4 inline-flex rounded-2xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white"
              >
                Resolver agora
              </Link>
            </section>
          ) : null}

          <section className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-raffle">
            <h2 className="text-lg font-black tracking-[-0.03em] text-ink">Conta</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{admin.email}</p>
            <form action={logoutAdminAction} className="mt-4">
              <button
                type="submit"
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Sair
              </button>
            </form>
          </section>
        </aside>
      </div>
    </BrandShell>
  );
}
