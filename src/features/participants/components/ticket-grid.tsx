import { cn } from "@/lib/utils";

type TicketGridProps = {
  tickets: Array<{
    ticketId: string;
    ticketNumber: string;
    paymentStatus: string;
    participantName: string;
    participantEmail?: string;
    participantPhone: string;
    reservationStatus: string;
    reservedAt: Date;
  }>;
  winningTicketId?: string | null;
};

export function TicketGrid({
  tickets,
  winningTicketId,
}: TicketGridProps): React.JSX.Element {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {tickets.map((ticket) => (
        <article
          key={ticket.ticketId}
          className={cn(
            "rounded-[1.5rem] border p-4 shadow-sm",
            winningTicketId === ticket.ticketId
              ? "border-accent-500 bg-amber-50"
              : "border-slate-200 bg-slate-50",
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Cota</p>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
                ticket.paymentStatus === "confirmed"
                  ? "bg-brand-100 text-brand-700"
                  : "bg-slate-200 text-slate-600",
              )}
            >
              {ticket.paymentStatus}
            </span>
          </div>
          <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-ink">{ticket.ticketNumber}</p>
          <p className="mt-3 text-sm font-semibold text-ink">{ticket.participantName}</p>
          <p className="text-xs text-slate-600">{ticket.participantEmail ?? ticket.participantPhone}</p>
          {winningTicketId === ticket.ticketId ? (
            <p className="mt-3 text-sm font-semibold text-amber-700">Cota vencedora</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
