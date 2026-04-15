## System (Technical and Organizational Rules)

These rules define the engineering standards for the project.
Process, continuity, and memory rules are in `kernel/RULES.md`.
Must be reviewed BEFORE the start of the project.

## Language and Stack
- TypeScript with strict mode.
- Node.js 20+ with ESM modules.
- Frontend and backend in Next.js App Router.
- Backend via Route Handlers and Server Actions.
- ORM: Drizzle ORM with PostgreSQL.
- Database target: Neon Postgres.
- E2E Tests: Playwright.
- Auth: admin with email/password and email confirmation by magic link.
- Participant flow: no OTP, SMS, or WhatsApp verification in the revised MVP.
- Participant receipt: transactional email via Brevo after manual PIX confirmation by the raffle admin.
- Payments: PIX QR Code with manual payment confirmation by the raffle admin in MVP.

## Code Style
- Use functional components (React).
- Prefer `const` over `let`.
- Use explicit return types in TypeScript.
- Avoid `any` (use only when strictly necessary).
- Use `async/await`; do not use callbacks when a clear async alternative exists.

## Logging
- NEVER use `console.log()`.
- Use the project logger abstraction from the app codebase.
- Allowed levels: `logger.info()`, `logger.warn()`, `logger.error()`.
- Never log sensitive data (passwords, tokens, OTPs, PIX payloads, PII).

## Error Handling
- Handle errors structurally and with user-safe messages.

```ts
try {
  const result = await operation();
  return { success: true, data: result };
} catch (error) {
  logger.error('Operation failed', { error });
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error',
  };
}
```

## Security and Input Validation
- Validate all input with an explicit Zod schema.
- Assume all external input is malicious.
- Use parameterized ORM/database queries only; never concatenate user input in SQL.
- Rate-limit public reservation creation by email, phone, raffle, and IP when possible.
- Do not persist secrets, tokens, email provider responses, or sensitive participant data in logs.

## Technical Architecture
- Business rules and functions live in server-side modules behind Next.js Route Handlers and Server Actions.
- Client components never access the database directly.
- Transport handlers call services/repositories; business logic must not live in UI components.
- Sensitive routes must use `requireAuth` and `requireAdmin`.
- Public participant actions must be isolated from admin-only actions.
- Validation responses return `detail` only in `NODE_ENV=development`.

## Zod and Message Consistency
- All input must have an explicit Zod schema.
- Messages should be normalized to pt-BR.
- Phone and email validations must be consistent between backend and frontend.
- Brazilian phone numbers must be normalized before participant reservation persistence.

## Drizzle + PostgreSQL
- Drizzle is the only database access layer in the backend.
- Migrations must be versioned and committed.
- Create seeds for base, feature, and error scenarios when necessary.
- Ticket numbers must be unique per raffle and generated with collision protection.
- Persist authoritative raffle, participant, quota, payment, and draw records in PostgreSQL.

## Frontend (Next.js)
- Frontend consumes server actions or route handlers; no direct database queries.
- The participant purchase flow must prioritize mobile screens first.
- Public raffle pages must show quota value clearly before user input.
- Participant identity, quota selection, PIX view, generated numbers, and payment instructions must work well in one-hand mobile usage.
- The quota grid must render one entry per sold quota, even when the same participant has multiple quotas.

## Payments (PIX)
- Persist the authoritative PIX payload and metadata for each raffle.
- Generate the QR Code from stored PIX data when needed.
- Store payment confirmation status separately from reservation/ticket generation.
- The MVP payment confirmation flow is manual and restricted to the raffle admin.
- Future automatic reconciliation must be added behind explicit provider/webhook contracts.

## Authentication, Reservation, and Email
- Admin accounts require email/password plus email confirmation before accessing protected raffle operations.
- Participants reserve quotas by providing name, email, phone, and quota quantity without OTP.
- Generated ticket numbers must be shown immediately after reservation.
- Payment confirmation email must only be sent after the admin manually confirms the PIX as received.
- Email sending logic must be provider-abstracted, with Brevo as the current provider.

## File and Media Rules
- Each raffle item supports up to 3 images.
- Enforce the 3-image limit in validation and business rules.
- Prefer storing canonical media references rather than binary payloads in the database.
- At least one image can be marked as the real item image with the label "Imagem real do objeto".
- Upload storage must be persistent in production; serverless local filesystem must not be treated as durable storage on Vercel.

## Draw Rules
- Only the creator/admin of the raffle can execute the draw.
- The winner must be selected only from eligible recorded quotas.
- The random draw must persist executor, timestamp, winning quota, and auditable context.
- UI animation for the draw may exist, but the persisted selection is the source of truth.

## State Management
- Use React Context only when it meaningfully reduces prop drilling for auth or UI state.
- Avoid unnecessary global state.
- Server state remains on the server.
- Client state should be minimal.

## Engineering Philosophy
- Readability above cleverness.
- Explicit above implicit.
- Simple above complex.
- Prefer removing obsolete code rather than commenting it out.

## Tests (technical standard)
- Write tests for business logic.
- Cover edge cases and error states.
- Use descriptive test names.
- Prefer integration tests when they deliver more practical confidence.
- Cover raffle creation, quota reservation without OTP, manual payment confirmation, Brevo receipt dispatch, and admin-only draw authorization.
