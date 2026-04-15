"use client";

import { useActionState, useState } from "react";

import { reserveQuotaAction } from "@/features/participants/actions";
import { initialParticipantActionState } from "@/features/participants/state";
import { formatCurrencyFromCents } from "@/lib/formatters";

type ParticipantFlowProps = {
  raffleId: string;
  quotaPriceInCents: number;
};

export function ParticipantFlow({
  raffleId,
  quotaPriceInCents,
}: ParticipantFlowProps): React.JSX.Element {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reservationState, reservationFormAction, reservationPending] = useActionState(
    reserveQuotaAction,
    initialParticipantActionState,
  );

  return (
    <section id="participar" className="scroll-mt-6 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-raffle">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">
          Participar da rifa
        </p>
        <h2 className="text-2xl font-black tracking-[-0.04em] text-ink">
          Garanta sua cota agora
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Informe seus dados, confirme a participacao e veja seu numero na hora. O recibo chega por
          email depois que o admin confirmar o PIX recebido.
        </p>
      </div>

      <div className="mt-6">
        <form
          action={reservationFormAction}
          className="space-y-4 rounded-[1.5rem] bg-slate-50 p-4"
        >
          <input type="hidden" name="raffleId" value={raffleId} />
          <h3 className="text-lg font-bold text-ink">Dados do participante</h3>
          <Field
            name="name"
            label="Nome completo"
            placeholder="Seu nome"
            value={name}
            onChange={setName}
          />
          <Field
            name="email"
            label="E-mail para receber o recibo"
            type="email"
            placeholder="voce@exemplo.com"
            value={email}
            onChange={setEmail}
          />
          <Field
            name="phone"
            label="Telefone com DDD"
            placeholder="11999998888"
            value={phone}
            onChange={setPhone}
          />
          <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">
            Cada cota custa <strong>{formatCurrencyFromCents(quotaPriceInCents)}</strong>.
          </div>
          <button
            type="submit"
            disabled={reservationPending}
            className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white"
          >
            {reservationPending
              ? "Gerando numero..."
              : reservationState.status === "success"
                ? "Realizar nova cota"
                : "Confirmar participacao"}
          </button>
        </form>
      </div>

      {reservationState.message ? (
        <div
          className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
            reservationState.status === "error" ? "bg-rose-50 text-rose-700" : "bg-brand-50 text-brand-700"
          }`}
        >
          <p>{reservationState.message}</p>
          {reservationState.ticketNumbers?.length ? (
            <div className="mt-4 rounded-2xl bg-white p-4 text-ink">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
                Seu numero
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {reservationState.ticketNumbers.map((ticketNumber) => (
                  <span
                    key={ticketNumber}
                    className="rounded-full bg-brand-100 px-3 py-1 text-sm font-black text-brand-800"
                  >
                    {ticketNumber}
                  </span>
                ))}
              </div>
              {reservationState.totalAmountInCents ? (
                <p className="mt-3 text-sm text-slate-600">
                  Total: <strong>{formatCurrencyFromCents(reservationState.totalAmountInCents)}</strong>
                </p>
              ) : null}
            </div>
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
  value,
  onChange,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (_value: string) => void;
}): React.JSX.Element {
  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={name} className="text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={
          onChange
            ? (event) => {
                onChange(event.target.value);
              }
            : undefined
        }
        className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500"
      />
    </div>
  );
}
