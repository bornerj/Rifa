"use client";

import { useEffect } from "react";
import { useActionState } from "react";

import {
  createRaffleAction,
  type CreateRaffleActionState,
} from "@/features/raffles/actions";

const initialState: CreateRaffleActionState = {
  status: "idle",
};

const imageFields = ["image-1", "image-2", "image-3"];

export function CreateRaffleForm(): React.JSX.Element {
  const [state, formAction, pending] = useActionState(createRaffleAction, initialState);

  useEffect(() => {
    if (state.status === "success" && state.redirectTo) {
      window.location.assign(state.redirectTo);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome da rifa" name="name" placeholder="Ex: Rifa da bicicleta beneficente" />
        <Field label="Beneficiario" name="beneficiary" placeholder="Ex: Projeto Amigos do Bairro" />
      </div>

      <Field
        label="Proposito"
        name="purpose"
        placeholder="Explique o objetivo da arrecadacao"
        textarea
        error={state.fieldErrors?.purpose}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Prazo em dias"
          name="durationInDays"
          type="number"
          placeholder="30"
        />
        <Field
          label="Valor da cota"
          name="quotaPriceInCents"
          placeholder="Ex: 10,00"
          inputMode="decimal"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome do item" name="itemName" placeholder="Ex: Bicicleta aro 29" />
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          O PIX nao precisa ser cadastrado agora. Voce podera configurar isso depois, na tela de
          detalhes da rifa.
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-ink">Imagens do item</h2>
          <p className="text-sm text-slate-600">Use ate 3 URLs externas no MVP.</p>
        </div>
        <div className="grid gap-4">
          {imageFields.map((fieldName, index) => (
            <Field
              key={fieldName}
              label={`URL da imagem ${index + 1}`}
              name="images"
              placeholder="https://..."
            />
          ))}
        </div>
      </div>

      {state.message ? (
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            state.status === "error" ? "bg-rose-50 text-rose-700" : "bg-brand-50 text-brand-700"
          }`}
        >
          {state.message}
          {state.status === "success" && state.redirectTo ? (
            <p className="mt-2 break-all font-semibold">{state.redirectTo}</p>
          ) : null}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-brand-700 px-5 py-4 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:opacity-70"
      >
        {pending ? "Salvando rifa..." : "Criar rifa"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
  textarea = false,
  inputMode,
  error,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  error?: string;
}): React.JSX.Element {
  return (
    <div className="flex w-full flex-col items-stretch gap-2">
      <label
        htmlFor={name}
        className={`block text-sm font-semibold ${error ? "text-rose-700" : "text-slate-700"}`}
      >
        {label}
      </label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          placeholder={placeholder}
          rows={4}
          className={`block min-h-32 w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white ${
            error
              ? "border-rose-300 text-rose-900 focus:border-rose-500"
              : "border-slate-200 focus:border-brand-500"
          }`}
          required
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          inputMode={inputMode}
          placeholder={placeholder}
          className={`block w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white ${
            error
              ? "border-rose-300 text-rose-900 focus:border-rose-500"
              : "border-slate-200 focus:border-brand-500"
          }`}
          required
        />
      )}
      {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
    </div>
  );
}
