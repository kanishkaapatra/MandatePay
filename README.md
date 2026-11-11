# MandatePay

**Autonomous payments. Human-defined boundaries.**

MandatePay is an AI bill-payment agent that can pay vendor invoices on your behalf without ever having the authority to overspend. You describe your spending rules in plain English. AI reads the invoices. Deterministic code decides whether each one gets paid.

> **The AI extracts. The policy engine decides. The payment executor acts. The audit log records.**

> **Status:** Hackathon demonstration, not a production financial service. See [Current Limitations](#current-limitations).

---

## Why this exists

AI agents are moving from recommending actions to taking them, and spending money is one of the highest-stakes actions an agent can take. The question MandatePay explores: **how do you let an agent handle payments without giving it unrestricted access to funds?**

The answer here is to keep authorization out of the model entirely. The AI never approves a payment. It only produces structured data, and plain backend code checks that data against rules you defined. A model's output cannot talk its way past a hard limit.

## How it works

```
Mandate  →  Invoice  →  AI extraction  →  Policy engine  →  Decision  →  PayPal  →  Audit log
```

1. **Define a mandate.** Describe limits, budgets and approved vendors in natural language.
2. **Submit an invoice.** Upload a text-based PDF.
3. **Extract.** The AI pulls out vendor, amount, invoice number and payment details, validated with Zod.
4. **Evaluate.** A deterministic policy engine checks the invoice against your mandate.
5. **Decide.** The invoice is auto-approved, blocked, or sent to a human for review.
6. **Execute and record.** Approved payments go out via PayPal Payouts, and every step is logged.

## Demo

The app ships with three seeded invoices and this mandate:

> *"Automatically pay invoices under $200, only to approved vendors, with a maximum monthly spending limit of $1,000. Require manual approval for anything outside these conditions."*

| Invoice | Vendor | Amount | Outcome | Why |
|---|---|---:|---|---|
| AC-1024 | Acme Cloud Services | $149 | ✅ Auto-approved | Approved vendor, under the auto-pay threshold |
| US-2026-01 | Unknown Solutions | $175 | ⛔ Blocked | Vendor is not approved |
| AC-1025 | Acme Cloud Services | $450 | ⏳ Pending approval | Exceeds the auto-pay threshold |

Manual approval can release the $450 invoice, but it can never override a hard restriction like the unapproved vendor.

---

## Features

### Invoice processing
- Upload text-based PDF invoices
- Extract vendor, amount, invoice number and payment details
- Validate all extracted data against Zod schemas
- Flag missing or ambiguous fields rather than guessing
- Detect likely duplicate invoices
- Never invent missing vendor or payment information

### Deterministic spending enforcement
- Natural-language mandate interpretation
- Per-transaction limits
- Monthly budgets, including reserved in-flight spend
- Approved-vendor lists
- Manual-approval thresholds
- Duplicate invoice prevention

### Payment execution
- PayPal Payouts API with OAuth 2.0
- Unique payout batch and request IDs
- Payment status tracking
- Verified PayPal webhooks
- Duplicate payout protection

### Human-in-the-loop approval
- Review invoice details and the full policy evaluation
- Approve or reject eligible transactions
- Approvals re-run the policy check and cannot override hard restrictions

### Audit trail
Every significant event is recorded: invoice submissions, AI extraction results, policy evaluations, approval decisions, payment attempts, PayPal responses, webhook events and final outcomes.

---

## Architecture

| Component | Responsibility | Trusted to authorize payments? |
|---|---|:---:|
| AI agent | Invoice extraction, mandate interpretation | No |
| Policy engine | Deterministic financial authorization | Yes |
| Payment executor | Executes authorized payments only | Yes |
| Audit logger | Traceable, read-only event recording | n/a |

**Safeguards**
- Server-side credential handling
- Structured input validation
- Payment idempotency and duplicate prevention
- PayPal webhook signature verification
- Explicit payment state transitions
- Approval authorization checks

Unknown payout outcomes must be reconciled with PayPal before any new payout attempt.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Next.js API routes, Node.js |
| Validation | Zod |
| Database | PostgreSQL, Prisma ORM |
| AI | Configurable LLM API |
| Payments | PayPal Payouts API |
| Testing | Automated policy engine tests |

## Routes

| Route | Description |
|---|---|
| `/` | Public landing page |
| `/dashboard` | Interactive command center |

---

## Getting started

**Prerequisites:** Node.js 20+, npm, Git

```bash
git clone https://github.com/kanishkaapatra/MandatePay.git
cd MandatePay
npm install
cp .env.example .env
```

Fill in `.env`:

```env
DATABASE_URL=

AI_API_KEY=
AI_MODEL=

PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
PAYPAL_WEBHOOK_ID=

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Keep all credentials server-side and never commit `.env`.

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) or go straight to [/dashboard](http://localhost:3000/dashboard).

## Execution modes

| | Demo mode (default) | PayPal Sandbox mode |
|---|---|---|
| Setting | `DEMO_MODE=true` | `DEMO_MODE=false` |
| Invoices | Seeded fixtures | Real submissions |
| Storage | In-memory demo store | In-memory demo store |
| Payments | Simulated | Sandbox payout requests |
| Needs PayPal credentials | No | Yes |

Sandbox transactions do not move real money. Payouts may need to be enabled on your PayPal sandbox business account.

## Database setup

```bash
npm run db:generate                 # generate the Prisma client
npm run db:migrate -- --name init   # run migrations
npm run db:seed                     # seed data
```

The Prisma schema covers users, spending mandates, vendors, invoices, policy evaluations, payments, payment attempts, approvals, audit events and verified webhook receipts.

> **Note:** The bundled UI currently runs on an in-memory store. The Prisma schema, migrations and seed data are provided for database integration, but the in-memory store is not suitable for multi-user or production use.

## API reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/mandates` | Interpret and create spending mandates |
| POST | `/api/invoices` | Validate an invoice and evaluate policy |
| POST | `/api/invoices/upload` | Upload a PDF and extract invoice data |
| POST | `/api/invoices/[id]/approval` | Submit an approval decision |
| GET | `/api/payments/[invoiceId]/status` | Check payout status |
| POST | `/api/webhooks/paypal` | Receive verified PayPal webhooks |
| GET | `/api/audit` | Retrieve audit events (read-only) |

**Behavior to know about**
- Activating a mandate requires an explicit `activate: true`.
- Invoices are validated before policy evaluation.
- Approval re-evaluates policy before any payment is executed.
- Webhook authenticity is verified before an event is processed.
- Missing vendor or invoice identifiers are never invented.
- PDF extraction supports text-based PDFs only.

## Testing

```bash
npm test          # policy engine tests
npm run build     # production build
```

The policy tests cover approved vendors, unapproved vendors, transaction thresholds, monthly limits, duplicate invoices, unsupported currencies and reserved in-flight spending.

---

## Current limitations

- Single seeded admin; no production multi-user authentication
- Demo data and audit events live in memory
- The bundled UI does not yet use the Prisma database
- No OCR, so scanned PDFs and images are unsupported
- AI extraction requires an `AI_API_KEY`
- A production deployment would need authenticated sessions, database-backed transactions with locking, and persistent audit storage

## Philosophy

**Autonomy should not mean unrestricted authority.**

The goal isn't just to make AI capable of spending money. It's to make autonomous spending controlled, transparent and accountable to rules a human wrote.

*Your money. Your rules. Your autonomous agent.*
