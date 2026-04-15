import { randomInt, randomUUID } from "node:crypto";

export function normalizeBrazilPhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) {
    throw new Error("Telefone invalido");
  }

  if (digits.startsWith("55")) {
    return `+${digits}`;
  }

  return `+55${digits}`;
}

export function createAuditReference(): string {
  return `${new Date().toISOString()}::${randomUUID()}`;
}

export function generateTicketNumber(): string {
  return String(randomInt(0, 100_000)).padStart(5, "0");
}
