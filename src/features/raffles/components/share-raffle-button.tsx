"use client";

import { useState } from "react";

export function ShareRaffleButton(): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  async function copyRaffleLink() {
    const url = window.location.href;

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopied(true);
    window.setTimeout(() => {
      setCopied(false);
    }, 2200);
  }

  return (
    <button
      type="button"
      onClick={copyRaffleLink}
      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
    >
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
        <path d="m16 6-4-4-4 4" />
        <path d="M12 2v13" />
      </svg>
      {copied ? "Link copiado" : "Mande para um amigo"}
    </button>
  );
}
