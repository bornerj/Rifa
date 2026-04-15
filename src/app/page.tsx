import Link from "next/link";
import { ArrowRight, BadgeCheck, HeartHandshake, ShieldCheck, Ticket } from "lucide-react";

import { getLatestPublishedRaffleForLanding } from "@/features/raffles/repository";
import { formatCurrencyFromCents, formatDate } from "@/lib/formatters";

export const dynamic = "force-dynamic";

const highlights = [
  {
    title: "Campanhas para qualquer causa",
    description:
      "Arrecade para tratamentos, projetos, viagens, times, escolas, comunidades ou prêmios entre amigos.",
    icon: HeartHandshake,
  },
  {
    title: "Pagamento simples por PIX",
    description:
      "Mostre o QR Code, confirme pagamentos recebidos e envie o recibo com os números por email.",
    icon: BadgeCheck,
  },
  {
    title: "Transparência até o sorteio",
    description:
      "Cada cota fica registrada, a grade pública mostra os participantes e o sorteio usa apenas cotas pagas.",
    icon: ShieldCheck,
  },
];

export default async function HomePage(): Promise<React.JSX.Element> {
  const latestRaffle = await getLatestPublishedRaffleForLanding();

  return (
    <main className="min-h-screen bg-paper bg-raffle-glow text-ink">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-between px-5 py-8 sm:px-8 lg:px-10">
        <nav className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="text-xl font-black tracking-[-0.04em] text-ink">
            Rifa
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/entrar"
              className="rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
            >
              Entrar
            </Link>
            <Link
              href="/cadastrar"
              className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-raffle transition hover:bg-brand-900"
            >
              Criar rifa
            </Link>
          </div>
        </nav>

        <div className="grid gap-8 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-accent-700">
              rifa online para causas reais
            </p>
            <div className="space-y-4">
              <h1 className="max-w-xl text-5xl font-black leading-[0.95] tracking-[-0.05em] sm:text-6xl">
                Transforme apoio em números da sorte.
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Crie uma campanha, publique a página da rifa e receba participações por PIX. O
                participante vê os números na hora e recebe a confirmação por email quando o
                pagamento é validado.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/cadastrar"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-700 px-5 py-4 text-sm font-semibold text-white shadow-raffle transition hover:bg-brand-900"
              >
                Criar rifa online
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={latestRaffle ? `/r/${latestRaffle.slug}` : "/entrar"}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
              >
                {latestRaffle ? "Ver rifa ativa" : "Entrar no painel"}
              </Link>
            </div>

            <div className="grid max-w-xl gap-3 sm:grid-cols-3">
              <Metric value="PIX" label="Pagamento direto" />
              <Metric value="Email" label="Recibo automático" />
              <Metric value="5 dígitos" label="Cotas aleatórias" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-raffle backdrop-blur">
            {latestRaffle ? (
              <article className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
                {latestRaffle.imageUrl ? (
                  <a href={`/r/${latestRaffle.slug}`} className="relative block aspect-[4/3] bg-slate-100">
                    <img
                      src={latestRaffle.imageUrl}
                      alt={`Imagem da rifa ${latestRaffle.name}`}
                      className="h-full w-full object-cover"
                    />
                    {latestRaffle.isRealItemImage ? (
                      <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-brand-800 shadow-sm">
                        Imagem real do objeto
                      </span>
                    ) : null}
                  </a>
                ) : null}
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-brand-700">Campanha ativa</span>
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-800">
                      {formatCurrencyFromCents(latestRaffle.quotaPriceInCents)}
                    </span>
                  </div>
                  <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-ink">
                    {latestRaffle.name}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {latestRaffle.purpose.length > 180
                      ? `${latestRaffle.purpose.slice(0, 180)}...`
                      : latestRaffle.purpose}
                  </p>
                  <div className="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                    <p>
                      <strong>Beneficiário:</strong> {latestRaffle.beneficiary}
                    </p>
                    <p>
                      <strong>Encerramento:</strong> {formatDate(latestRaffle.expiresAt)}
                    </p>
                  </div>
                  <Link
                    href={`/r/${latestRaffle.slug}`}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white"
                  >
                    Participar desta rifa
                    <Ticket className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ) : (
              <div className="rounded-[1.5rem] bg-ink p-5 text-white">
                <p className="text-sm font-semibold text-brand-100">Sua primeira campanha</p>
                <h2 className="mt-6 text-3xl font-black tracking-[-0.04em]">
                  Publique uma rifa e compartilhe o link com seus apoiadores.
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Assim que houver uma rifa ativa, ela aparece aqui com foto, valor da cota e botão
                  de participação.
                </p>
              </div>
            )}

            <div id="stack" className="mt-5 grid gap-4">
              {highlights.map(({ title, description, icon: Icon }) => (
                <article
                  key={title}
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-brand-100 p-3 text-brand-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-base font-bold">{title}</h2>
                      <p className="text-sm leading-6 text-slate-600">{description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <section
          id="roadmap"
          className="mt-10 grid gap-4 rounded-[2rem] border border-brand-100 bg-white/80 p-5 shadow-raffle sm:grid-cols-3"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">como funciona</p>
            <h3 className="mt-2 text-lg font-bold">Crie sua campanha</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Cadastre a rifa, o valor da cota, o objeto e as imagens em poucos minutos.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">participação</p>
            <h3 className="mt-2 text-lg font-bold">Receba por PIX</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              O participante escolhe as cotas, paga por PIX e recebe o recibo depois da confirmação.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">sorteio</p>
            <h3 className="mt-2 text-lg font-bold">Conduza com clareza</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Confirme pagamentos, acompanhe a grade pública e sorteie apenas entre cotas pagas.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}

function Metric({ value, label }: { value: string; label: string }): React.JSX.Element {
  return (
    <div className="rounded-[1.25rem] border border-brand-100 bg-white/80 p-4 shadow-sm">
      <p className="text-lg font-black tracking-[-0.04em] text-ink">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
    </div>
  );
}
