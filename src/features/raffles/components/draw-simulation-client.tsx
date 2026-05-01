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
  const [notice, setNotice] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [simulatedWinnerId, setSimulatedWinnerId] = useState<string | null>(null);
  const [simulationMessage, setSimulationMessage] = useState<string | null>(null);
  const [recordingSupported, setRecordingSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [isSendingWinnerEmail, setIsSendingWinnerEmail] = useState(false);
  const timeoutIdsRef = useRef<number[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const captureStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

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
    setRecordingSupported(
      typeof window !== "undefined" &&
        typeof MediaRecorder !== "undefined" &&
        Boolean(navigator.mediaDevices?.getDisplayMedia),
    );

    return () => {
      for (const timeoutId of timeoutIdsRef.current) {
        window.clearTimeout(timeoutId);
      }
      timeoutIdsRef.current = [];
      if (recordedVideoUrl) {
        URL.revokeObjectURL(recordedVideoUrl);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (captureStreamRef.current) {
        for (const track of captureStreamRef.current.getTracks()) {
          track.stop();
        }
      }
    };
  }, [recordedVideoUrl]);

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

  async function startRecording(): Promise<void> {
    if (!recordingSupported || isRecording) {
      return;
    }

    setError(null);
    setNotice(null);

    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
      setRecordedVideoUrl(null);
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      captureStreamRef.current = stream;
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const recordedBlob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });

        if (recordedBlob.size > 0) {
          const nextUrl = URL.createObjectURL(recordedBlob);
          setRecordedVideoUrl(nextUrl);
          setNotice("Gravacao concluida. Voce pode assistir ao video gerado abaixo.");
        }

        if (captureStreamRef.current) {
          for (const track of captureStreamRef.current.getTracks()) {
            track.stop();
          }
        }

        captureStreamRef.current = null;
        mediaRecorderRef.current = null;
        recordedChunksRef.current = [];
      };

      for (const track of stream.getTracks()) {
        track.onended = () => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
          }
          setIsRecording(false);
        };
      }

      recorder.start(250);
      setIsRecording(true);
      setNotice("Gravacao iniciada. Escolha a aba/janela da simulacao e rode o teste.");
    } catch (recordingError: unknown) {
      setError(
        recordingError instanceof Error
          ? recordingError.message
          : "Nao foi possivel iniciar a gravacao da simulacao.",
      );
    }
  }

  function stopRecording(): void {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
      return;
    }

    mediaRecorderRef.current.stop();
    setIsRecording(false);
  }

  async function sendWinnerOfficialEmail(): Promise<void> {
    if (!simulatedWinnerId) {
      setError("Simule a roleta primeiro para definir o numero vencedor antes de enviar o email oficial.");
      return;
    }

    setError(null);
    setNotice(null);
    setIsSendingWinnerEmail(true);

    const response = await fetch(`/api/admin/raffles/${raffleId}/winner-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winningTicketId: simulatedWinnerId }),
    });

    try {
      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        setError(payload.message ?? "Nao foi possivel enviar o email oficial do ganhador.");
        return;
      }

      const payload = (await response.json()) as {
        sentCount?: number;
        winnerName?: string;
        winningTicketNumber?: string;
      };

      setNotice(
        `Email oficial enviado/preparado para ${payload.sentCount ?? 0} cadastro(s) com o ganhador ${payload.winnerName ?? "-"} e o numero ${payload.winningTicketNumber ?? "-"}.`,
      );
    } finally {
      setIsSendingWinnerEmail(false);
    }
  }

  function startSimulation(): void {
    if (!confirmedTickets.length || isSimulating) {
      return;
    }

    clearSimulationTimers();
    setIsSimulating(true);
    setError(null);
    setNotice(null);
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
      {error ? (
        <div className="xl:col-span-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}
      {notice ? (
        <div className="xl:col-span-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>
      ) : null}

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
                    className={`min-w-20 rounded-2xl border px-4 py-4 text-center transition-all duration-150 ${
                      isWinner
                        ? "scale-[1.05] border-amber-400 bg-amber-200 shadow-[0_0_0_3px_rgba(251,191,36,0.25)]"
                        : isActive
                          ? "border-brand-500 bg-brand-100 shadow-sm"
                          : "border-slate-200 bg-white"
                    }`}
                  >
                    <p className="text-2xl font-black tracking-[-0.05em] text-ink">{ticket.ticketNumber}</p>
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
          <button
            type="button"
            onClick={() => {
              void sendWinnerOfficialEmail();
            }}
            disabled={!simulatedWinnerId || isSendingWinnerEmail}
            className="mt-3 w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSendingWinnerEmail ? "Enviando..." : "Enviar email oficial"}
          </button>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-raffle">
          <h3 className="text-lg font-black tracking-[-0.03em] text-ink">Gravacao de teste</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Use a captura da aba ou janela da simulacao para avaliarmos se a gravacao da roleta funciona bem no ambiente real.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                void startRecording();
              }}
              disabled={!recordingSupported || isRecording}
              className="rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isRecording ? "Gravando..." : "Iniciar gravacao"}
            </button>
            <button
              type="button"
              onClick={stopRecording}
              disabled={!isRecording}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              Parar gravacao
            </button>
          </div>
          {!recordingSupported ? (
            <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Este navegador/ambiente nao expoe captura de tela para teste de gravacao.
            </p>
          ) : null}
          {recordedVideoUrl ? (
            <div className="mt-4 space-y-3">
              <video controls className="w-full rounded-2xl border border-slate-200 bg-black" src={recordedVideoUrl} />
              <a
                href={recordedVideoUrl}
                download={`simulacao-rifa-${raffleId}.webm`}
                className="inline-flex rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Baixar video
              </a>
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
