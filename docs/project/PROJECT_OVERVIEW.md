# Project Overview

## Summary
- Project: Rifa
- Created: 2026-04-13
- Status: MVP scope approved and implementation in progress

## Problem Statement
- Permitir a criacao e gestao de rifas online com fluxo simples no celular, reserva de cotas sem OTP e pagamento por PIX com confirmacao manual pelo admin.

## Target Users
- Primary users: organizadores de rifas e participantes em dispositivos moveis
- Secondary users: beneficiarios da rifa e administradores responsaveis pelo sorteio

## Scope
- In scope: criacao de rifa, cadastro do item, reserva de cotas sem OTP, coleta de nome/email/telefone, exibicao de QR Code PIX, confirmacao manual de pagamento, email de recibo via Brevo, grid de cotistas, sorteio administrativo
- Out of scope: conciliacao automatica de pagamento no MVP, OTP/SMS/WhatsApp para participante, marketplace de rifas, multi-admin por organizacao

## Scope Reference
- Documento consolidado: `docs/project/SCOPE.md`
- Decisoes formais: `memory/decisions/DECISION-001.md` a `DECISION-005.md`

## Technical Direction (Initial)
- Frontend: Next.js App Router mobile-first
- Backend: Next.js Route Handlers + Server Actions
- Database: Neon Postgres com Drizzle ORM
- Infrastructure: Vercel + Neon

## Milestones
- M1: scaffold do projeto e modelagem de dados
- M2: fluxo administrativo de criacao da rifa
- M3: fluxo publico de participacao, PIX e sorteio
