import { sendTransactionalEmail } from "@/lib/email";
import { formatCurrencyFromCents } from "@/lib/formatters";

type SendPaymentReceiptEmailInput = {
  participantName: string;
  participantEmail: string;
  raffleName: string;
  reservationId: string;
  ticketNumbers: string[];
  totalAmountInCents: number;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendPaymentReceiptEmail({
  participantName,
  participantEmail,
  raffleName,
  reservationId,
  ticketNumbers,
  totalAmountInCents,
}: SendPaymentReceiptEmailInput): Promise<{ delivered: boolean; previewOnly: boolean }> {
  const ticketList = ticketNumbers.map((ticketNumber) => `<li>${escapeHtml(ticketNumber)}</li>`).join("");
  const safeParticipantName = escapeHtml(participantName);
  const safeRaffleName = escapeHtml(raffleName);
  const safeReservationId = escapeHtml(reservationId);

  return sendTransactionalEmail({
    to: participantEmail,
    subject: `Pagamento confirmado - ${raffleName}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h1>Pagamento confirmado</h1>
        <p>Ola, ${safeParticipantName}.</p>
        <p>Confirmamos o recebimento do PIX da sua participacao na rifa <strong>${safeRaffleName}</strong>.</p>
        <p><strong>Valor confirmado:</strong> ${formatCurrencyFromCents(totalAmountInCents)}</p>
        <p><strong>Reserva:</strong> ${safeReservationId}</p>
        <p>Seus numeros da rifa:</p>
        <ul>${ticketList}</ul>
        <p>Guarde este email como recibo da sua participacao.</p>
      </div>
    `,
  });
}
