"use client";

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
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Prazo em dias"
          name="durationInDays"
          type="number"
          placeholder="30"
        />
        <Field
          label="Valor da cota em centavos"
          name="quotaPriceInCents"
          type="number"
          placeholder="1000"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome do item" name="itemName" placeholder="Ex: Bicicleta aro 29" />
        <Field label="Identificador PIX" name="pixLabel" placeholder="Chave ou descricao" />
      </div>

      <Field
        label="Payload copia e cola do PIX"
        name="pixPayload"
        placeholder="Cole o payload completo do PIX"
        textarea
      />

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
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
}): React.JSX.Element {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          placeholder={placeholder}
          rows={4}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white"
        />
      ) : (
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white"
        />
      )}
    </label>
  );
}
