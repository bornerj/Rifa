"use client";

import { useState } from "react";

import { formatCurrencyFromCents } from "@/lib/formatters";

type PixPaymentCardProps = {
  pixLabel: string;
  pixPayload: string;
  qrCodeDataUrl: string;
  quotaPriceInCents: number;
};

export function PixPaymentCard({
  pixLabel,
  pixPayload,
  qrCodeDataUrl,
  quotaPriceInCents,
}: PixPaymentCardProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  async function copyPixPayload(): Promise<void> {
    await navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    window.setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-100">
        Pagamento PIX
      </p>
      <p className="mt-3 text-4xl font-black tracking-[-0.04em]">
        {formatCurrencyFromCents(quotaPriceInCents)}
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-300">
        Depois de validar o telefone e reservar as cotas, use este QR Code para concluir o
        pagamento.
      </p>

      <div className="mt-5 rounded-[1.5rem] bg-white p-4">
        <img src={qrCodeDataUrl} alt="QR Code PIX" className="mx-auto h-56 w-56 rounded-2xl" />
      </div>

      <div className="mt-4 rounded-[1.5rem] bg-white/10 p-4 text-sm leading-6 text-slate-200">
        <p className="font-semibold text-white">PIX:</p>
        <p>{pixLabel}</p>
        <p className="mt-3 break-all text-xs text-slate-300">{pixPayload}</p>
        <button
          type="button"
          onClick={() => {
            void copyPixPayload();
          }}
          className="mt-4 w-full rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white"
        >
          {copied ? "PIX copiado" : "Copiar PIX"}
        </button>
      </div>
    </>
  );
}
