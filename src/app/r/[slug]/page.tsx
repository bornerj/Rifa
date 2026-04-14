import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";

import { ParticipantFlow } from "@/features/participants/components/participant-flow";
import { TicketGrid } from "@/features/participants/components/ticket-grid";
import { getPublicRaffleBySlug } from "@/features/raffles/repository";
import { formatCurrencyFromCents, formatDate } from "@/lib/formatters";

export const dynamic = "force-dynamic";
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return [];
}

type PublicRafflePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PublicRafflePage({
  params,
}: PublicRafflePageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  if (!slug) {
    notFound();
  }
  const raffle = await getPublicRaffleBySlug(slug);

  if (!raffle) {
    notFound();
  }

  const qrCodeDataUrl = await QRCode.toDataURL(raffle.pixPayload, {
    width: 220,
    margin: 1,
  });

  return (
    <main className="min-h-screen bg-paper bg-raffle-glow px-5 py-8 text-ink sm:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-raffle">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">
            Rifa publicada
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">{raffle.name}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{raffle.purpose}</p>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-raffle">
              <div className="grid gap-4 sm:grid-cols-2">
                <Info label="Beneficiario" value={raffle.beneficiary} />
                <Info label="Valor da cota" value={formatCurrencyFromCents(raffle.quotaPriceInCents)} />
                <Info label="Item" value={raffle.itemName ?? "Em definicao"} />
                <Info label="Encerramento" value={formatDate(raffle.expiresAt)} />
              </div>

              <div className="mt-6 rounded-[1.5rem] bg-slate-50 p-4">
                <h2 className="text-lg font-bold text-ink">Imagens do item</h2>
                <div className="mt-4 grid gap-3">
                  {raffle.images.length ? (
                    raffle.images.map((image) => (
                      <a
                        key={image.imageUrl}
                        href={image.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600"
                      >
                        {image.imageUrl}
                      </a>
                    ))
                  ) : (
                    <p className="text-sm text-slate-600">As imagens serao carregadas em breve.</p>
                  )}
                </div>
              </div>
            </div>

            <ParticipantFlow raffleId={raffle.id} quotaPriceInCents={raffle.quotaPriceInCents} />
          </div>

          <aside className="rounded-[2rem] border border-ink bg-ink p-6 text-white shadow-raffle">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-100">
              Pagamento PIX
            </p>
            <p className="mt-3 text-4xl font-black tracking-[-0.04em]">
              {formatCurrencyFromCents(raffle.quotaPriceInCents)}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Depois de validar o telefone e reservar as cotas, use este QR Code para concluir o pagamento.
            </p>

            <div className="mt-5 rounded-[1.5rem] bg-white p-4">
              <img src={qrCodeDataUrl} alt="QR Code PIX" className="mx-auto h-56 w-56 rounded-2xl" />
            </div>

            <div className="mt-4 rounded-[1.5rem] bg-white/10 p-4 text-sm leading-6 text-slate-200">
              <p className="font-semibold text-white">PIX:</p>
              <p>{raffle.pixLabel}</p>
              <p className="mt-3 break-all text-xs text-slate-300">{raffle.pixPayload}</p>
            </div>

            <Link
              href="/cadastrar"
              className="mt-5 inline-flex rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white"
            >
              Quero criar uma rifa assim
            </Link>
          </aside>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-raffle">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">
                Grade de cotistas
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-ink">
                Uma entrada por cota reservada
              </h2>
            </div>
            {raffle.latestDraw ? (
              <p className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800">
                Sorteio realizado em {formatDate(raffle.latestDraw.createdAt)}
              </p>
            ) : null}
          </div>

          <div className="mt-5">
            {raffle.soldTickets.length ? (
              <TicketGrid
                tickets={raffle.soldTickets}
                winningTicketId={raffle.latestDraw?.winningTicketId ?? null}
              />
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                Ainda nao existem cotas reservadas nesta rifa.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="rounded-[1.5rem] bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
