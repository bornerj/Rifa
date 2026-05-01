"use client";

import { useEffect, useRef, useState } from "react";

import { formatDate } from "@/lib/formatters";

type DrawSimulationPayload = {
  raffle: {
    id: string;
    name: string;
    status: string;
  };
  operations: {
    tickets: Array<{
      ticketId: string;
      ticketNumber: string;
      paymentStatus: string;
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

export function DrawSimulationClient({ raffleId }: Props): React.JSX.Element {
  const [data, setData] = useState<DrawSimulationPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [simulatedWinnerId, setSimulatedWinnerId] = useState<string | null>(null);
  const [simulationMessage, setSimulationMessage] = useState<string | null>(null);
  const timeoutIdsRef = useRef<number[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      try {
        const response = await fetch(`/api/admin/raffles/${raffleId}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Nao foi possivel carregar a tela de simulacao.");
        }

        const payload = (await response.json()) as DrawSimulationPayload;
        if (!cancelled) {
          setData(payload);
          setError(null);
        }
      } catch (loadError: unknown) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Erro inesperado.");
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [raffleId]);

  useEffect(() => {
    return () => {
      for (const timeoutId of timeoutIdsRef.current) {
        window.clearTimeout(timeoutId);
      }
      timeoutIdsRef.current = [];
    };
  }, []);

  if (error && !data) {
    return <StateCard message={error} />;
  }

  if (!data) {
    return <StateCard message="Carregando tela de simulacao..." />;
  }

  const confirmedTickets = data.operations.tickets
    .filter((ticket) => ticket.paymentStatus === "confirmed")
    .sort((left, right) => left.ticketNumber.localeCompare(right.ticketNumber, "pt-BR"));

  const displayedWinner = confirmedTickets.find((ticket) => ticket.ticketId === simulatedWinnerId) ?? null;

  function clearSimulationTimers(): void {
    for (const timeoutId of timeoutIdsRef.current) {
      window.clearTimeout(timeoutId);
    }
    timeoutIdsRef.current = [];
  }

  function startSimulation(): void {
    if (!confirmedTickets.length || isSimulating) {
      return;
    }

    clearSimulationTimers();
    setIsSimulating(true);
    setActiveTicketId(null);
    setSimulatedWinnerId(null);
    setSimulationMessage("Simulando a roleta das cotas confirmadas...");

    const winnerIndex = Math.floor(Math.random() * confirmedTickets.length);
    const totalSteps = confirmedTickets.length * 5 + winnerIndex + 1;
    let accumulatedDelay = 0;
    let currentDelay = 70;

    for (let step = 0; step < totalSteps; step += 1) {
      const ticket = confirmedTickets[step % confirmedTickets.length];
      const isLastStep = step === totalSteps - 1;

      accumulatedDelay += currentDelay;
      const timeoutId = window.setTimeout(() => {
        setActiveTicketId(ticket.ticketId);

        if (isLastStep) {
          setSimulatedWinnerId(ticket.ticketId);
          setIsSimulating(false);
          setSimulationMessage(`Simulacao encerrada no numero ${ticket.ticketNumber}.`);
        }
      }, accumulatedDelay);

      timeoutIdsRef.current.push(timeoutId);

      if (step > confirmedTickets.length) {
        currentDelay += step > totalSteps * 0.7 ? 26 : 12;
      }
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
      <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-raffle">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
              Simulacao visual
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-ink">{data.raffle.name}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Esta tela usa apenas as cotas com pagamento confirmado. A simulacao nao grava ganhador e nao encerra a rifa.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-slate-50 px-4 py-3 text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Cotas elegiveis</p>
            <p className="mt-1 text-3xl font-black tracking-[-0.05em] text-ink">{confirmedTickets.length}</p>
          </div>
        </div>

        <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4">
          {confirmedTickets.length ? (
            <div className="flex flex-wrap gap-3">
              {confirmedTickets.map((ticket) => {
                const isActive = ticket.ticketId === activeTicketId;
                const isWinner = ticket.ticketId === simulatedWinnerId;

                return (
                  <div
                    key={ticket.ticketId}
                    className={`min-w-20 rounded-2xl border px-4 py-3 text-center transition-all duration-150 ${
                      isWinner
                        ? "scale-[1.03] border-amber-300 bg-amber-100 shadow-sm"
                        : isActive
                          ? "border-brand-400 bg-brand-100"
                          : "border-slate-200 bg-white"
                    }`}
                  >
                    <p className="text-lg font-black tracking-[-0.04em] text-ink">{ticket.ticketNumber}</p>
                    <p className="mt-1 text-[11px] font-medium text-slate-500">{ticket.participantName}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <StateCard message="Ainda nao existem cotas com pagamento confirmado para simular." />
          )}
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-raffle">
          <h3 className="text-lg font-black tracking-[-0.03em] text-ink">Controle da simulacao</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Clique em `Simular` para acender os numeros em sequencia, como uma roleta desacelerando ate parar.
          </p>
          <button
            type="button"
            onClick={startSimulation}
            disabled={!confirmedTickets.length || isSimulating}
            className="mt-4 w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSimulating ? "Simulando..." : "Simular"}
          </button>
          {simulationMessage ? (
            <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">{simulationMessage}</p>
          ) : null}
          {displayedWinner ? (
            <div className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Numero parado na simulacao: <strong>{displayedWinner.ticketNumber}</strong>
            </div>
          ) : null}
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-raffle">
          <h3 className="text-lg font-black tracking-[-0.03em] text-ink">Status oficial</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            O sorteio oficial continua separado desta simulacao e ainda nao sera gravado por aqui.
          </p>
          {data.operations.latestDraw ? (
            <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Sorteio oficial ja realizado em {formatDate(data.operations.latestDraw.createdAt)}.
            </p>
          ) : (
            <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Nenhum sorteio oficial foi gravado ainda.
            </p>
          )}
        </section>
      </aside>
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
