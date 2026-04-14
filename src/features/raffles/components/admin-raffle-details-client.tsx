"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { formatCurrencyFromCents, formatDate } from "@/lib/formatters";

type AdminRaffleDetailsPayload = {
  raffle: {
    id: string;
    name: string;
    slug: string;
    purpose: string;
    beneficiary: string;
    quotaPriceInCents: number;
    durationInDays: number;
    pixLabel: string;
    pixPayload: string;
    status: string;
    createdAt: string;
    expiresAt: string;
    itemId: string | null;
    itemName: string | null;
    images: Array<{ id: string; imageUrl: string; sortOrder: number }>;
  };
  operations: {
    raffle: { id: string; slug: string; status: string };
    reservations: Array<{
      reservationId: string;
      reservationStatus: string;
      totalAmountInCents: number;
      quantity: number;
      createdAt: string;
      participantName: string;
      participantPhone: string;
    }>;
    tickets: Array<{
      ticketId: string;
      ticketNumber: string;
      paymentStatus: string;
      participantName: string;
      reservationId: string;
    }>;
    latestDraw: {
      id: string;
      winningTicketId: string;
      createdAt: string;
    } | null;
  };
};

type Props = {
  raffleId: string;
};

export function AdminRaffleDetailsClient({ raffleId }: Props): React.JSX.Element {
  const [data, setData] = useState<AdminRaffleDetailsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchDetails = useCallback(async () => {
    const response = await fetch(`/api/admin/raffles/${raffleId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Nao foi possivel carregar os detalhes da rifa.");
    }

    const payload = (await response.json()) as AdminRaffleDetailsPayload;
    setData(payload);
  }, [raffleId]);

  useEffect(() => {
    startTransition(() => {
      fetchDetails().catch((fetchError: unknown) => {
        setError(fetchError instanceof Error ? fetchError.message : "Erro inesperado.");
      });
    });
  }, [fetchDetails]);

  const winningTicketId = useMemo(() => data?.operations.latestDraw?.winningTicketId ?? null, [data]);

  async function confirmPayment(reservationId: string): Promise<void> {
    setError(null);
    const response = await fetch(`/api/admin/raffles/${raffleId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reservationId }),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { message?: string };
      setError(payload.message ?? "Nao foi possivel confirmar o pagamento.");
      return;
    }

    await fetchDetails();
  }

  async function runDraw(): Promise<void> {
    setError(null);
    const response = await fetch(`/api/admin/raffles/${raffleId}/draw`, {
      method: "POST",
    });

    if (!response.ok) {
      const payload = (await response.json()) as { message?: string };
      setError(payload.message ?? "Nao foi possivel executar o sorteio.");
      return;
    }

    await fetchDetails();
  }

  if (error && !data) {
    return <StateCard message={error} />;
  }

  if (!data) {
    return <StateCard message="Carregando detalhes da rifa..." />;
  }

  const { raffle, operations } = data;

  return (
    <>
      {error ? (
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-raffle">
          <div className="grid gap-4 md:grid-cols-2">
            <Info label="Beneficiario" value={raffle.beneficiary} />
            <Info label="Status" value={raffle.status} />
            <Info label="Valor da cota" value={formatCurrencyFromCents(raffle.quotaPriceInCents)} />
            <Info label="Expira em" value={formatDate(raffle.expiresAt)} />
          </div>

          <div className="mt-5 rounded-[1.5rem] bg-slate-50 p-4">
            <h2 className="text-lg font-bold text-ink">Proposito</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{raffle.purpose}</p>
          </div>

          <div className="mt-5 rounded-[1.5rem] bg-slate-50 p-4">
            <h2 className="text-lg font-bold text-ink">PIX</h2>
            <p className="mt-2 text-sm text-slate-600">Identificador: {raffle.pixLabel}</p>
            <p className="mt-2 break-all text-sm leading-6 text-slate-600">{raffle.pixPayload}</p>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-raffle">
            <h2 className="text-lg font-black tracking-[-0.03em] text-ink">Link publico</h2>
            <Link
              href={`/r/${raffle.slug}`}
              className="mt-4 inline-flex rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white"
            >
              Abrir pagina da rifa
            </Link>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-raffle">
            <h2 className="text-lg font-black tracking-[-0.03em] text-ink">
              Item: {raffle.itemName ?? "Nao informado"}
            </h2>
            <div className="mt-4 grid gap-3">
              {raffle.images.length ? (
                raffle.images.map((image) => (
                  <a
                    key={image.id}
                    href={image.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
                  >
                    {image.imageUrl}
                  </a>
                ))
              ) : (
                <p className="text-sm text-slate-600">Nenhuma imagem cadastrada.</p>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-raffle">
            <h2 className="text-lg font-black tracking-[-0.03em] text-ink">Sorteio</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              O sorteio usa somente cotas com pagamento confirmado e grava o resultado com contexto auditavel.
            </p>
            {operations.latestDraw ? (
              <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Sorteio realizado em {formatDate(operations.latestDraw.createdAt)}.
              </p>
            ) : (
              <button
                type="button"
                onClick={() => {
                  void runDraw();
                }}
                disabled={isPending}
                className="mt-4 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white"
              >
                Executar sorteio
              </button>
            )}
          </section>
        </aside>
      </div>

      <section className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-raffle">
          <h2 className="text-2xl font-black tracking-[-0.04em] text-ink">Reservas pendentes e pagas</h2>
          <div className="mt-5 grid gap-3">
            {operations.reservations.length ? (
              operations.reservations.map((reservation) => (
                <article
                  key={reservation.reservationId}
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-ink">{reservation.participantName}</h3>
                      <p className="text-sm text-slate-600">{reservation.participantPhone}</p>
                    </div>
                    <div className="space-y-1 text-right text-sm text-slate-600">
                      <p>{reservation.quantity} cota(s)</p>
                      <p>{formatCurrencyFromCents(reservation.totalAmountInCents)}</p>
                      <p>Status: {reservation.reservationStatus}</p>
                    </div>
                  </div>
                  {reservation.reservationStatus !== "paid" ? (
                    <button
                      type="button"
                      onClick={() => {
                        void confirmPayment(reservation.reservationId);
                      }}
                      className="mt-4 rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white"
                    >
                      Confirmar pagamento
                    </button>
                  ) : null}
                </article>
              ))
            ) : (
              <StateCard message="Nenhuma reserva registrada ainda." />
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-raffle">
          <h2 className="text-2xl font-black tracking-[-0.04em] text-ink">Cotas registradas</h2>
          <div className="mt-5 grid gap-3">
            {operations.tickets.length ? (
              operations.tickets.map((ticket) => (
                <article
                  key={ticket.ticketId}
                  className={`rounded-[1.5rem] border p-4 ${
                    winningTicketId === ticket.ticketId
                      ? "border-amber-300 bg-amber-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-2xl font-black tracking-[-0.05em] text-ink">
                      {ticket.ticketNumber}
                    </p>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                      {ticket.paymentStatus}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-ink">{ticket.participantName}</p>
                </article>
              ))
            ) : (
              <StateCard message="Nenhuma cota registrada ainda." />
            )}
          </div>
        </div>
      </section>
    </>
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

function StateCard({ message }: { message: string }): React.JSX.Element {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
      {message}
    </div>
  );
}
