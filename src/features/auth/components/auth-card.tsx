"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { AuthActionState } from "@/features/auth/actions";

const initialState: AuthActionState = {
  status: "idle",
};

type AuthCardProps = {
  title: string;
  description: string;
  action: (..._args: [AuthActionState, FormData]) => Promise<AuthActionState>;
  submitLabel: string;
  footerLabel: string;
  footerHref: string;
  footerAction: string;
  fields: Array<{
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
  }>;
};

export function AuthCard({
  title,
  description,
  action,
  submitLabel,
  footerAction,
  footerHref,
  footerLabel,
  fields,
}: AuthCardProps): React.JSX.Element {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-raffle backdrop-blur">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-[-0.04em] text-ink">{title}</h1>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </div>

      <form action={formAction} className="mt-6 space-y-4">
        {fields.map((field) => (
          <label key={field.name} className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">{field.label}</span>
            <input
              name={field.name}
              type={field.type ?? "text"}
              placeholder={field.placeholder}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white"
              required
            />
          </label>
        ))}

        {state.message ? (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              state.status === "error"
                ? "bg-rose-50 text-rose-700"
                : "bg-brand-50 text-brand-700"
            }`}
          >
            <p>{state.message}</p>
            {state.previewLink ? (
              <a
                href={state.previewLink}
                className="mt-2 block break-all font-semibold underline underline-offset-4"
              >
                {state.previewLink}
              </a>
            ) : null}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-2xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? "Processando..." : submitLabel}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        {footerLabel}{" "}
        <Link href={footerHref} className="font-semibold text-brand-700 underline underline-offset-4">
          {footerAction}
        </Link>
      </p>
    </div>
  );
}
