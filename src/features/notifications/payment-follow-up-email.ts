import { sendTransactionalEmail } from "@/lib/email";

type SendPaymentFollowUpEmailInput = {
  participantName: string;
  participantEmail: string;
  raffleName: string;
  ticketNumbers: string[];
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendPaymentFollowUpEmail({
  participantName,
  participantEmail,
  raffleName,
  ticketNumbers,
}: SendPaymentFollowUpEmailInput): Promise<{ delivered: boolean; previewOnly: boolean }> {
  const safeParticipantName = escapeHtml(participantName);
  const safeRaffleName = escapeHtml(raffleName);
  const renderedTicketNumbers = ticketNumbers.map((ticketNumber) => escapeHtml(ticketNumber)).join(", ");
  const ticketCopy =
    ticketNumbers.length > 1
      ? `nos numeros ${renderedTicketNumbers}`
      : `no numero ${renderedTicketNumbers || "gerado para sua reserva"}`;

  return sendTransactionalEmail({
    to: participantEmail,
    subject: `Pagamento pendente - ${raffleName}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h1>Pagamento pendente</h1>
        <p>Ola, ${safeParticipantName}.</p>
        <p>
          Vi que voce entrou na rifa <strong>${safeRaffleName}</strong> ${ticketCopy},
          mas ainda nao identifiquei o PIX.
        </p>
        <p>Aconteceu algo de errado? Quer desistir?</p>
        <p>
          Se precisar, basta responder este email ou entrar em contato com a pessoa responsavel pela rifa.
        </p>
      </div>
    `,
  });
}
