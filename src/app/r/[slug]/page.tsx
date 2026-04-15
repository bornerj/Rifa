import { notFound } from "next/navigation";
import QRCode from "qrcode";

import { ParticipantFlow } from "@/features/participants/components/participant-flow";
import { ImageShowcaseGrid } from "@/features/raffles/components/image-showcase-grid";
import { PixPaymentCard } from "@/features/raffles/components/pix-payment-card";
import { ShareRaffleButton } from "@/features/raffles/components/share-raffle-button";
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

  const hasPixConfigured = Boolean(raffle.pixLabel.trim() && raffle.pixPayload.trim());
  const qrCodeDataUrl = hasPixConfigured
    ? await QRCode.toDataURL(raffle.pixPayload, {
        width: 220,
        margin: 1,
      })
    : null;

  return (
    <main className="min-h-screen bg-paper bg-raffle-glow px-5 py-8 text-ink sm:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-raffle">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">
              Rifa publicada
            </p>
            <ShareRaffleButton />
          </div>
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
                <div className="mt-4">
                  <ImageShowcaseGrid images={raffle.images} />
                </div>
              </div>
            </div>
            {hasPixConfigured ? (
              <ParticipantFlow raffleId={raffle.id} quotaPriceInCents={raffle.quotaPriceInCents} />
            ) : (
              <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 shadow-raffle">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
                  Pagamento ainda nao liberado
                </p>
                <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-amber-950">
                  O admin ainda precisa configurar o PIX desta rifa
                </h2>
                <p className="mt-3 text-sm leading-6 text-amber-900/80">
                  Assim que o PIX for cadastrado, a pagina libera a reserva de cotas e mostra o QR
                  Code para pagamento.
                </p>
              </section>
            )}
          </div>

          <aside className="rounded-[2rem] border border-ink bg-ink p-6 text-white shadow-raffle">
            {hasPixConfigured ? (
              <PixPaymentCard
                pixLabel={raffle.pixLabel}
                pixPayload={raffle.pixPayload}
                qrCodeDataUrl={qrCodeDataUrl ?? ""}
                quotaPriceInCents={raffle.quotaPriceInCents}
              />
            ) : (
              <div className="mt-5 rounded-[1.5rem] bg-white/10 p-4 text-sm leading-6 text-slate-200">
                O QR Code PIX aparecera aqui assim que o admin concluir a configuracao de
                pagamento.
              </div>
            )}

            <a
              href="#participar"
              className="mt-5 inline-flex rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white"
            >
              Realizar nova cota
            </a>
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
