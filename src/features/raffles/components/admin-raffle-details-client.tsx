"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { ImageShowcaseGrid } from "@/features/raffles/components/image-showcase-grid";
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
    images: Array<{ id: string; imageUrl: string; isRealItemImage: boolean; sortOrder: number }>;
  };
  operations: {
    raffle: { id: string; slug: string; status: string };
    reservations: Array<{
      reservationId: string;
      reservationStatus: string;
      totalAmountInCents: number;
      quantity: number;
      createdAt: string;
      participantId: string;
      participantName: string;
      participantEmail: string;
      participantPhone: string;
      receiptEmailSentAt: string | null;
      ticketNumbers: string[];
    }>;
    tickets: Array<{
      ticketId: string;
      ticketNumber: string;
      paymentStatus: string;
      participantId: string;
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
  const [notice, setNotice] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [pixForm, setPixForm] = useState({
    pixLabel: "",
    pixPayload: "",
  });
  const [detailsForm, setDetailsForm] = useState({
    name: "",
    purpose: "",
    beneficiary: "",
    quotaPriceInCents: "",
  });
  const [itemForm, setItemForm] = useState({
    itemName: "",
    images: ["", "", ""],
  });
  const [selectedReservationIds, setSelectedReservationIds] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [reservationPendingDeletion, setReservationPendingDeletion] = useState<{
    reservationId: string;
    participantName: string;
    ticketNumbers: string[];
  } | null>(null);
  const [isDeletingReservation, setIsDeletingReservation] = useState(false);
  const [participantPendingEdit, setParticipantPendingEdit] = useState<{
    participantId: string;
    participantName: string;
  } | null>(null);
  const [participantForm, setParticipantForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isSavingParticipant, setIsSavingParticipant] = useState(false);

  const fetchDetails = useCallback(async () => {
    const response = await fetch(`/api/admin/raffles/${raffleId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Nao foi possivel carregar os detalhes da rifa.");
    }

    const payload = (await response.json()) as AdminRaffleDetailsPayload;
    setData(payload);
    setPixForm({
      pixLabel: payload.raffle.pixLabel,
      pixPayload: payload.raffle.pixPayload,
    });
    setDetailsForm({
      name: payload.raffle.name,
      purpose: payload.raffle.purpose,
      beneficiary: payload.raffle.beneficiary,
      quotaPriceInCents: (payload.raffle.quotaPriceInCents / 100).toFixed(2).replace(".", ","),
    });
    setItemForm({
      itemName: payload.raffle.itemName ?? "",
      images: [
        payload.raffle.images[0]?.imageUrl ?? "",
        payload.raffle.images[1]?.imageUrl ?? "",
        payload.raffle.images[2]?.imageUrl ?? "",
      ],
    });
  }, [raffleId]);

  useEffect(() => {
    startTransition(() => {
      fetchDetails().catch((fetchError: unknown) => {
        setError(fetchError instanceof Error ? fetchError.message : "Erro inesperado.");
      });
    });
  }, [fetchDetails]);

  useEffect(() => {
    if (!data) {
      return;
    }

    const unpaidReservationIds = new Set(
      data.operations.reservations
        .filter((reservation) => reservation.reservationStatus !== "paid")
        .map((reservation) => reservation.reservationId),
    );

    setSelectedReservationIds((current) =>
      current.filter((reservationId) => unpaidReservationIds.has(reservationId)),
    );
  }, [data]);

  const winningTicketId = useMemo(() => data?.operations.latestDraw?.winningTicketId ?? null, [data]);
  const sortedReservations = useMemo(() => {
    if (!data) {
      return [];
    }

    return [...data.operations.reservations].sort((left, right) => {
      const leftRank = left.reservationStatus === "paid" ? 1 : 0;
      const rightRank = right.reservationStatus === "paid" ? 1 : 0;

      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }

      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });
  }, [data]);

  async function confirmPayments(reservationIds: string[]): Promise<void> {
    if (!reservationIds.length) {
      setError("Selecione ao menos uma reserva para confirmar.");
      return;
    }

    setError(null);
    setNotice(null);
    const response = await fetch(`/api/admin/raffles/${raffleId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reservationIds }),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { message?: string };
      setError(payload.message ?? "Nao foi possivel confirmar o pagamento.");
      return;
    }

    const payload = (await response.json()) as { confirmedCount?: number; deliveredCount?: number };
    setSelectedReservationIds([]);
    setNotice(
      `Pagamento confirmado para ${payload.confirmedCount ?? reservationIds.length} reserva(s) e email enviado/preparado para ${payload.deliveredCount ?? 0}.`,
    );
    await fetchDetails();
  }

  async function checkPayment(reservationIds: string[]): Promise<void> {
    if (!reservationIds.length) {
      setError("Selecione ao menos uma reserva para checar.");
      return;
    }

    setError(null);
    setNotice(null);
    const response = await fetch(`/api/admin/raffles/${raffleId}/payments/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reservationIds }),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { message?: string };
      setError(payload.message ?? "Nao foi possivel enviar o email de checagem.");
      return;
    }

    const payload = (await response.json()) as { sentCount?: number };
    setNotice(`Email de checagem enviado/preparado para ${payload.sentCount ?? reservationIds.length} reserva(s).`);
  }

  async function uploadRealItemImage(file: File): Promise<void> {
    setUploadingImage(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/admin/raffles/${raffleId}/item/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        setError(payload.message ?? "Nao foi possivel enviar a imagem.");
        return;
      }

      const payload = (await response.json()) as { imageUrl: string };
      setItemForm((current) => {
        const nextImages = [...current.images];
        nextImages[0] = payload.imageUrl;
        return { ...current, images: nextImages };
      });
      await fetchDetails();
    } finally {
      setUploadingImage(false);
    }
  }

  async function deletePendingReservation(reservationId: string): Promise<void> {
    setError(null);
    setNotice(null);
    setIsDeletingReservation(true);

    const response = await fetch(
      `/api/admin/raffles/${raffleId}/reservations/${reservationId}`,
      {
        method: "DELETE",
      },
    );

    try {
      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        setError(payload.message ?? "Nao foi possivel excluir a pendencia.");
        return;
      }

      setSelectedReservationIds((current) => current.filter((id) => id !== reservationId));
      setReservationPendingDeletion(null);
      setNotice("Pendencia excluida com sucesso.");
      await fetchDetails();
    } finally {
      setIsDeletingReservation(false);
    }
  }

  async function saveParticipantDetails(): Promise<void> {
    if (!participantPendingEdit) {
      return;
    }

    setError(null);
    setNotice(null);
    setIsSavingParticipant(true);

    const response = await fetch(
      `/api/admin/raffles/${raffleId}/participants/${participantPendingEdit.participantId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(participantForm),
      },
    );

    try {
      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        setError(payload.message ?? "Nao foi possivel salvar os dados do participante.");
        return;
      }

      setParticipantPendingEdit(null);
      setNotice("Dados do participante atualizados com sucesso.");
      await fetchDetails();
    } finally {
      setIsSavingParticipant(false);
    }
  }

  async function saveRaffleDetails(): Promise<void> {
    setError(null);
    const response = await fetch(`/api/admin/raffles/${raffleId}/details`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(detailsForm),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { message?: string };
      setError(payload.message ?? "Nao foi possivel salvar os dados da rifa.");
      return;
    }

    await fetchDetails();
  }

  async function savePixConfiguration(): Promise<void> {
    setError(null);
    const response = await fetch(`/api/admin/raffles/${raffleId}/pix`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pixForm),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { message?: string };
      setError(payload.message ?? "Nao foi possivel salvar o PIX.");
      return;
    }

    await fetchDetails();
  }

  async function saveItemConfiguration(): Promise<void> {
    setError(null);
    const response = await fetch(`/api/admin/raffles/${raffleId}/item`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemName: itemForm.itemName,
        images: itemForm.images.filter((value) => value.trim().length > 0),
      }),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { message?: string };
      setError(payload.message ?? "Nao foi possivel salvar o item.");
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
  const hasPixConfigured = Boolean(raffle.pixLabel.trim() && raffle.pixPayload.trim());
  const confirmedPaymentsCount = operations.reservations.filter(
    (reservation) => reservation.reservationStatus === "paid",
  ).length;

  return (
    <>
      {error ? (
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}
      {notice ? (
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>
      ) : null}

      {reservationPendingDeletion ? (
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50/90 p-5 shadow-raffle">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-700">
            Confirmar exclusao
          </p>
          <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-ink">
            Deseja excluir esta pendencia?
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            Participante: <strong>{reservationPendingDeletion.participantName}</strong>
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            As seguintes cotas serao excluidas:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {reservationPendingDeletion.ticketNumbers.map((ticketNumber) => (
              <span
                key={`delete-ticket-${ticketNumber}`}
                className="rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-black text-rose-700"
              >
                {ticketNumber}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-600">
            A exclusao so acontece se voce confirmar no botao <strong>SIM</strong>.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                void deletePendingReservation(reservationPendingDeletion.reservationId);
              }}
              disabled={isDeletingReservation}
              className="rounded-2xl bg-rose-700 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-rose-300"
            >
              {isDeletingReservation ? "Excluindo..." : "SIM"}
            </button>
            <button
              type="button"
              onClick={() => {
                setReservationPendingDeletion(null);
              }}
              disabled={isDeletingReservation}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      {participantPendingEdit ? (
        <div className="rounded-[2rem] border border-brand-200 bg-brand-50/90 p-5 shadow-raffle">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
            Editar participante
          </p>
          <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-ink">
            Atualizar cadastro de {participantPendingEdit.participantName}
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">Nome</span>
              <input
                value={participantForm.name}
                onChange={(event) => {
                  setParticipantForm((current) => ({ ...current, name: event.target.value }));
                }}
                className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">Email</span>
              <input
                value={participantForm.email}
                onChange={(event) => {
                  setParticipantForm((current) => ({ ...current, email: event.target.value }));
                }}
                className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700">Telefone</span>
              <input
                value={participantForm.phone}
                onChange={(event) => {
                  setParticipantForm((current) => ({ ...current, phone: event.target.value }));
                }}
                className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                void saveParticipantDetails();
              }}
              disabled={isSavingParticipant}
              className="rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-brand-300"
            >
              {isSavingParticipant ? "Salvando..." : "Salvar participante"}
            </button>
            <button
              type="button"
              onClick={() => {
                setParticipantPendingEdit(null);
              }}
              disabled={isSavingParticipant}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </div>
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
            <h2 className="text-lg font-bold text-ink">Dados da rifa</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              O valor editado aqui passa a valer para novas reservas. Reservas ja criadas preservam
              o valor original combinado.
            </p>
            <div className="mt-4 grid gap-3">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">Nome da rifa</span>
                <input
                  value={detailsForm.name}
                  onChange={(event) => {
                    setDetailsForm((current) => ({ ...current, name: event.target.value }));
                  }}
                  className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">Beneficiario</span>
                <input
                  value={detailsForm.beneficiary}
                  onChange={(event) => {
                    setDetailsForm((current) => ({ ...current, beneficiary: event.target.value }));
                  }}
                  className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">Valor da cota</span>
                <input
                  value={detailsForm.quotaPriceInCents}
                  onChange={(event) => {
                    setDetailsForm((current) => ({
                      ...current,
                      quotaPriceInCents: event.target.value,
                    }));
                  }}
                  placeholder="10,00"
                  inputMode="decimal"
                  className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">Proposito</span>
                <textarea
                  value={detailsForm.purpose}
                  onChange={(event) => {
                    setDetailsForm((current) => ({ ...current, purpose: event.target.value }));
                  }}
                  rows={4}
                  className="block min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  void saveRaffleDetails();
                }}
                className="rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white"
              >
                Salvar dados da rifa
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-[1.5rem] bg-slate-50 p-4">
            <h2 className="text-lg font-bold text-ink">PIX</h2>
            {hasPixConfigured ? (
              <>
                <p className="mt-2 text-sm text-slate-600">Identificador: {raffle.pixLabel}</p>
                <p className="mt-2 break-all text-sm leading-6 text-slate-600">{raffle.pixPayload}</p>
              </>
            ) : (
              <p className="mt-2 text-sm leading-6 text-amber-700">
                PIX ainda nao configurado. Sem isso, a pagina publica nao libera a reserva de cotas.
              </p>
            )}

            <div className="mt-4 grid gap-3">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">Identificador PIX</span>
                <input
                  value={pixForm.pixLabel}
                  onChange={(event) => {
                    setPixForm((current) => ({ ...current, pixLabel: event.target.value }));
                  }}
                  placeholder="Chave ou descricao"
                  className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">Payload copia e cola</span>
                <textarea
                  value={pixForm.pixPayload}
                  onChange={(event) => {
                    setPixForm((current) => ({ ...current, pixPayload: event.target.value }));
                  }}
                  rows={4}
                  placeholder="Cole o payload completo do PIX"
                  className="block min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  void savePixConfiguration();
                }}
                className="rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white"
              >
                Salvar PIX
              </button>
            </div>
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
            <div className="mt-4">
              <ImageShowcaseGrid
                images={raffle.images}
                emptyMessage="Nenhuma imagem cadastrada."
              />
            </div>
            <div className="mt-4 grid gap-3">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">Nome do item</span>
                <input
                  value={itemForm.itemName}
                  onChange={(event) => {
                    setItemForm((current) => ({ ...current, itemName: event.target.value }));
                  }}
                  placeholder="Ex: Bicicleta aro 29"
                  className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500"
                />
              </label>
              <label className="flex flex-col gap-2 rounded-2xl border border-brand-100 bg-brand-50 p-4">
                <span className="text-sm font-semibold text-brand-800">Imagem real do objeto</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void uploadRealItemImage(file);
                    }
                  }}
                  className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-xl file:border-0 file:bg-brand-700 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                />
                <span className="text-xs leading-5 text-brand-900/70">
                  A imagem enviada ocupa a primeira posicao e aparece com o label "Imagem real do objeto".
                </span>
                {uploadingImage ? <span className="text-xs font-semibold text-brand-800">Enviando...</span> : null}
              </label>
              {itemForm.images.map((imageUrl, index) => (
                <label key={`item-image-${index}`} className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-700">
                    {index === 0 ? "URL da imagem real" : `URL da imagem ${index + 1}`}
                  </span>
                  <input
                    value={imageUrl}
                    onChange={(event) => {
                      const nextImages = [...itemForm.images];
                      nextImages[index] = event.target.value;
                      setItemForm((current) => ({ ...current, images: nextImages }));
                    }}
                    placeholder="https://..."
                    className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500"
                  />
                </label>
              ))}
              <button
                type="button"
                onClick={() => {
                  void saveItemConfiguration();
                }}
                className="rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white"
              >
                Salvar item e imagens
              </button>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-raffle">
            <h2 className="text-lg font-black tracking-[-0.03em] text-ink">Sorteio</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              A simulacao do sorteio agora acontece em uma tela separada, mostrando apenas cotas com pagamento confirmado.
            </p>
            {operations.latestDraw ? (
              <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Sorteio oficial realizado em {formatDate(operations.latestDraw.createdAt)}.
              </p>
            ) : null}
            <Link
              href={`/admin/rifas/${raffle.id}/sorteio`}
              className="mt-4 inline-flex rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white"
            >
              Abrir tela de simulacao
            </Link>
          </section>
        </aside>
      </div>

      <section className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-raffle">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
                Confirmacao em lote
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-ink">
                Reservas pendentes e pagas
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                void confirmPayments(selectedReservationIds);
              }}
              disabled={!selectedReservationIds.length}
              className="rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Confirmar selecionadas
            </button>
          </div>
          <div className="mt-5 grid gap-2.5">
            {sortedReservations.length ? (
              sortedReservations.map((reservation, index) => {
                const previousReservation = sortedReservations[index - 1];
                const showStatusDivider =
                  index === 0 ||
                  previousReservation?.reservationStatus !== reservation.reservationStatus;

                return (
                  <div key={reservation.reservationId} className="space-y-2.5">
                    {showStatusDivider ? (
                      <div className="px-1">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                          {reservation.reservationStatus === "paid"
                            ? `Pagamentos confirmados (${confirmedPaymentsCount})`
                            : "Aguardando confirmacao"}
                        </p>
                      </div>
                    ) : null}
                <article
                  key={reservation.reservationId}
                  className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedReservationIds.includes(reservation.reservationId)}
                        disabled={reservation.reservationStatus === "paid"}
                        onChange={(event) => {
                          setSelectedReservationIds((current) => {
                            if (event.target.checked) {
                              return Array.from(new Set([...current, reservation.reservationId]));
                            }

                            return current.filter((id) => id !== reservation.reservationId);
                          });
                        }}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-brand-700"
                        aria-label={`Selecionar reserva de ${reservation.participantName}`}
                      />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-ink">{reservation.participantName}</h3>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                              reservation.reservationStatus === "paid"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {reservation.reservationStatus === "paid" ? "Pago" : "Pendente"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{reservation.participantEmail}</p>
                        <p className="text-xs text-slate-600">{reservation.participantPhone}</p>
                        <p className="text-[11px] text-slate-500">
                          Reserva {reservation.reservationId.slice(0, 8)} • {formatDate(reservation.createdAt)}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {reservation.ticketNumbers.map((ticketNumber) => (
                            <span
                              key={ticketNumber}
                              className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-ink"
                            >
                              {ticketNumber}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 text-right text-xs leading-5 text-slate-600">
                      <p>{reservation.quantity} cota(s)</p>
                      <p>{formatCurrencyFromCents(reservation.totalAmountInCents)}</p>
                      <p>Email: {reservation.receiptEmailSentAt ? "enviado" : "pendente"}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setParticipantPendingEdit({
                          participantId: reservation.participantId,
                          participantName: reservation.participantName,
                        });
                        setParticipantForm({
                          name: reservation.participantName,
                          email: reservation.participantEmail,
                          phone: reservation.participantPhone,
                        });
                      }}
                      className="rounded-2xl border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-800"
                    >
                      Editar participante
                    </button>
                  {reservation.reservationStatus !== "paid" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          void confirmPayments([reservation.reservationId]);
                        }}
                        className="rounded-2xl bg-brand-700 px-3 py-2 text-xs font-semibold text-white"
                      >
                        Confirmar e enviar email
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void checkPayment([reservation.reservationId]);
                        }}
                        className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                      >
                        Checar pagamento
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReservationPendingDeletion({
                            reservationId: reservation.reservationId,
                            participantName: reservation.participantName,
                            ticketNumbers: reservation.ticketNumbers,
                          });
                        }}
                        className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"
                      >
                        Excluir pendencia
                      </button>
                    </>
                  ) : null}
                  </div>
                </article>
                  </div>
                );
              })
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
