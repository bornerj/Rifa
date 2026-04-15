import Link from "next/link";
import { ArrowRight, MailCheck, Ticket, Trophy } from "lucide-react";

const highlights = [
  {
    title: "Crie a rifa em minutos",
    description:
      "Cadastre o objetivo, beneficiario, valor da cota e o item da rifa em um fluxo pensado para o celular.",
    icon: Trophy,
  },
  {
    title: "Confirme por email apos o PIX",
    description:
      "O participante informa nome, email e telefone, ve os numeros na hora e recebe o recibo depois da confirmacao manual.",
    icon: MailCheck,
  },
  {
    title: "Organize cotas e sorteio",
    description:
      "Cada cota fica registrada com numero aleatorio de 5 digitos, grade publica e area exclusiva de sorteio para o admin.",
    icon: Ticket,
  },
];

export default function HomePage(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-paper bg-raffle-glow text-ink">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-between px-5 py-8 sm:px-8 lg:px-10">
        <div className="rounded-full border border-brand-100 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-brand-700 shadow-raffle backdrop-blur">
          MVP em preparacao
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-accent-700">
              rifa digital, simples e segura
            </p>
            <div className="space-y-4">
              <h1 className="max-w-xl text-5xl font-black leading-[0.95] tracking-[-0.05em] sm:text-6xl">
                Venda cotas, confirme PIX e envie recibos por email no mesmo lugar.
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                A base do produto ja esta pronta para evoluir com Next.js, Neon, Drizzle e um fluxo
                mobile-first de participacao por PIX.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/cadastrar"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-700 px-5 py-4 text-sm font-semibold text-white shadow-raffle transition hover:bg-brand-900"
              >
                Criar conta de admin
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/entrar"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
              >
                Entrar no painel
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-raffle backdrop-blur">
            <div className="rounded-[1.5rem] bg-ink p-5 text-white">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-brand-100">Rifa beneficente</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em]">
                  mobile first
                </span>
              </div>
              <div className="mt-6 space-y-3">
                <p className="text-sm text-slate-300">Valor da cota</p>
                <p className="text-4xl font-black tracking-[-0.04em]">R$ 10,00</p>
                <p className="text-sm leading-6 text-slate-300">
                  Reserva sem OTP, QR Code PIX e grade de cotistas com uma entrada por cota.
                </p>
              </div>
            </div>

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
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">fase 1</p>
            <h3 className="mt-2 text-lg font-bold">Fundacao</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Scaffold Next.js, auth do admin, schema base e email transacional.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">fase 2</p>
            <h3 className="mt-2 text-lg font-bold">Operacao da rifa</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Criacao de rifa, item com ate 3 URLs de imagem, cotas aleatorias e QR Code PIX.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">fase 3</p>
            <h3 className="mt-2 text-lg font-bold">Sorteio auditavel</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Confirmacao manual de pagamento, grade publica e sorteio restrito ao criador da rifa.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
