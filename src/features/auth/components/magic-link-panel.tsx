"use client";

import { useActionState } from "react";

import { resendMagicLinkAction, type AuthActionState } from "@/features/auth/actions";

const initialState: AuthActionState = {
  status: "idle",
};

export function MagicLinkPanel(): React.JSX.Element {
  const [state, formAction, pending] = useActionState(resendMagicLinkAction, initialState);

  return (
    <form action={formAction} className="rounded-[2rem] border border-brand-100 bg-white/90 p-5 shadow-raffle">
      <h2 className="text-lg font-black tracking-[-0.03em] text-ink">Confirme seu e-mail</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        O painel administrativo fica completo depois da confirmacao por link magico. Em ambiente
        local com `development-preview`, o link aparece aqui na tela apos o reenvio.
      </p>

      {state.message ? (
        <div className="mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
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
        className="mt-4 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
      >
        {pending ? "Enviando..." : "Enviar novo link"}
      </button>
    </form>
  );
}
