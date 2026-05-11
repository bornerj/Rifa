import { sendTransactionalEmail } from "@/lib/email";

type SendWinnerOfficialEmailInput = {
  participantEmail: string;
  participantName: string;
  raffleName: string;
  winnerName: string;
  winningTicketNumber: string;
  attachmentUrls: {
    imageUrl: string | null;
    videoUrl: string | null;
  };
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendWinnerOfficialEmail({
  participantEmail,
  participantName,
  raffleName,
  winnerName,
  winningTicketNumber,
  attachmentUrls,
}: SendWinnerOfficialEmailInput): Promise<{ delivered: boolean; previewOnly: boolean }> {
  const safeParticipantName = escapeHtml(participantName);
  const safeRaffleName = escapeHtml(raffleName);
  const safeWinnerName = escapeHtml(winnerName);
  const safeWinningTicketNumber = escapeHtml(winningTicketNumber);
  const safeVideoUrl = attachmentUrls.videoUrl ? escapeHtml(attachmentUrls.videoUrl) : null;

  const attachments = [
    attachmentUrls.imageUrl
      ? {
          filename: "imagem-rifa.jpg",
          path: attachmentUrls.imageUrl,
          contentType: "image/jpeg",
        }
      : null,
    attachmentUrls.videoUrl
      ? {
          filename: "sorteio-rifa.webm",
          path: attachmentUrls.videoUrl,
          contentType: "video/webm",
        }
      : null,
  ].filter((attachment): attachment is { filename: string; path: string; contentType: string } =>
    Boolean(attachment),
  );

  return sendTransactionalEmail({
    to: participantEmail,
    subject: `Resultado oficial da rifa - ${raffleName}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h1>Resultado oficial da rifa</h1>
        <p>Ola, ${safeParticipantName}.</p>
        <p>Temos o resultado oficial da rifa <strong>${safeRaffleName}</strong>.</p>
        <p><strong>Ganhador:</strong> ${safeWinnerName}</p>
        <p><strong>Numero sorteado:</strong> ${safeWinningTicketNumber}</p>
        ${
          safeVideoUrl
            ? `<p>O video do sorteio tambem esta disponivel aqui: <a href="${safeVideoUrl}">${safeVideoUrl}</a></p>`
            : ""
        }
        <p>Obrigado por acompanhar e participar.</p>
        <p>Atraso a divulgacao devido a problemas de saude. Muito Obrigado</p>
      </div>
    `,
    attachments,
  });
}
