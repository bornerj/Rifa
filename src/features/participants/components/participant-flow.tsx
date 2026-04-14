"use client";

import { useActionState, useMemo } from "react";

import {
  initialParticipantActionState,
  requestOtpAction,
  reserveQuotaAction,
} from "@/features/participants/actions";
import { formatCurrencyFromCents } from "@/lib/formatters";

type ParticipantFlowProps = {
  raffleId: string;
  quotaPriceInCents: number;
};

export function ParticipantFlow({
  raffleId,
  quotaPriceInCents,
}: ParticipantFlowProps): React.JSX.Element {
  const [otpState, otpFormAction, otpPending] = useActionState(
    requestOtpAction,
    initialParticipantActionState,
  );
  const [reservationState, reservationFormAction, reservationPending] = useActionState(
    reserveQuotaAction,
    initialParticipantActionState,
  );

  const helperMessage = useMemo(() => {
    if (reservationState.message) {
      return reservationState;
    }

    return otpState;
  }, [otpState, reservationState]);

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-raffle">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">
          Participar da rifa
        </p>
        <h2 className="text-2xl font-black tracking-[-0.04em] text-ink">
          Reserve suas cotas em poucos passos
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Primeiro enviamos um OTP para validar o telefone. Depois voce escolhe quantas cotas quer.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <form action={otpFormAction} className="space-y-4 rounded-[1.5rem] bg-slate-50 p-4">
          <input type="hidden" name="raffleId" value={raffleId} />
          <h3 className="text-lg font-bold text-ink">1. Validar telefone</h3>
          <Field name="name" label="Nome completo" placeholder="Seu nome" />
          <Field name="phone" label="Telefone com DDD" placeholder="11999998888" />
          <button
            type="submit"
            disabled={otpPending}
            className="w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white"
          >
            {otpPending ? "Enviando codigo..." : "Enviar OTP"}
          </button>
        </form>

        <form action={reservationFormAction} className="space-y-4 rounded-[1.5rem] bg-slate-50 p-4">
          <input type="hidden" name="raffleId" value={raffleId} />
          <h3 className="text-lg font-bold text-ink">2. Confirmar e reservar cotas</h3>
          <Field name="name" label="Nome completo" placeholder="Use o mesmo nome" />
          <Field name="phone" label="Telefone com DDD" placeholder="Use o mesmo telefone" />
          <Field name="otpCode" label="Codigo OTP" placeholder="000000" />
          <Field name="quantity" label="Quantidade de cotas" type="number" placeholder="1" />
          <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">
            Cada cota custa <strong>{formatCurrencyFromCents(quotaPriceInCents)}</strong>.
          </div>
          <button
            type="submit"
            disabled={reservationPending}
            className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white"
          >
            {reservationPending ? "Reservando..." : "Reservar cotas"}
          </button>
        </form>
      </div>

      {helperMessage.message ? (
        <div
          className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
            helperMessage.status === "error" ? "bg-rose-50 text-rose-700" : "bg-brand-50 text-brand-700"
          }`}
        >
          <p>{helperMessage.message}</p>
          {helperMessage.previewCode ? (
            <p className="mt-2 font-semibold">Codigo de preview: {helperMessage.previewCode}</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
}): React.JSX.Element {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500"
      />
    </label>
  );
}
