<img width="1883" height="911" alt="image" src="https://github.com/user-attachments/assets/0f8d6af7-c26f-487e-8f5a-bae3c0372d30" />

# MandatePay
### Autonomous payments. Human-defined boundaries.

MandatePay is an AI-powered bill payment agent that processes vendor invoices, evaluates them against deterministic spending mandates, and executes authorized payments through PayPal.

As AI agents gain the ability to move money, financial control becomes essential. MandatePay addresses this by separating AI intelligence from financial authorization.

**The AI proposes. The policy engine decides. The payment executor acts. The audit log records.**

---

## Overview

MandatePay enables users to define spending rules in natural language and delegate routine bill payments to an autonomous agent without surrendering financial control.

Users can define:
- Per-transaction spending limits.
- Monthly spending budgets.
- Approved vendor lists.
- Manual approval requirements.
- Duplicate invoice restrictions.

The agent extracts invoice information, evaluates spending permissions, and determines whether a payment can proceed automatically.

Every decision is governed by backend policy enforcement rather than LLM-generated authorization.

## Application

| Route | Description |
|---|---|
| `/` | Cinematic public landing page |
| `/dashboard` | Interactive financial command center |

## How It Works

```text
       Vendor Invoice
             |
             v
      AI Invoice Reader
             |
             v
     Structured Extraction
             |
             v
      Anomaly Detection
             |
             v
    Deterministic Policy Engine
             |
       +-----+-----+
       |     |     |
       v     v     v
     AUTO  BLOCK  REVIEW
       |     |     |
       v     v     v
    PayPal  Reject Approval
    Payout          Queue
       |
       v
   Audit Log
```

### Core Capabilities

**1. Intelligent Invoice Processing**

- Extracts invoice details from uploaded PDF documents.
- Uses structured AI outputs with Zod validation.
- Detects missing information and potential duplicates.
- Never invents missing vendor or payment details.

**2. Deterministic Spending Enforcement**

- Converts natural-language mandates into structured spending rules.
- Enforces transaction and monthly limits in backend code.
- Validates vendor authorization.
- Accounts for reserved in-flight spending.
- Prevents AI-generated decisions from bypassing financial restrictions.

**3. Autonomous Payment Execution**

- Integrates with the PayPal Payouts API.
- Supports OAuth 2.0 authentication.
- Uses unique payout identifiers and request IDs.
- Tracks payout statuses.
- Processes verified PayPal webhooks.

**4. Human-in-the-Loop Approvals**

- Routes restricted transactions to an approval queue.
- Displays policy evaluation results and decision reasons.
- Prevents manual approval from overriding hard policy restrictions.

**5. Transparent Audit Trail**

Records invoice extraction, policy evaluations, approval decisions, payment attempts, webhook events, and payment outcomes.

---

## Demo Scenario

The application includes three seeded invoices demonstrating the spending mandate workflow.

**Active spending mandate:**

> Automatically pay invoices under $200, only to approved vendors, with a maximum monthly spending limit of $1,000. Require manual approval for anything outside these conditions.

| Invoice | Vendor | Amount | Expected outcome |
|---|---|---:|---|
| AC-1024 | Acme Cloud Services | $149 | Auto-approved |
| US-2026-01 | Unknown Solutions | $175 | Blocked |
| AC-1025 | Acme Cloud Services | $450 | Pending approval |

### Expected Decisions

- **$149 — Automatic:** Approved vendor, within transaction limit, and compliant with the mandate.
- **$175 — Blocked:** Vendor is not on the approved vendor list.
- **$450 — Review:** Exceeds the automatic transaction threshold and requires human approval.

The approval workflow cannot override hard policy restrictions.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes, Node.js |
| Validation | Zod |
| Database | PostgreSQL, Prisma ORM |
| AI | Configurable LLM API |
| Payments | PayPal Payouts API |
| Testing | Automated policy engine tests |

---

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/kanishkaapatra/MandatePay.git
cd MandatePay
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Configure the required variables:

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

The default demo configuration uses `DEMO_MODE=true`.

Keep all API credentials server-side. Never commit your `.env` file.

### 4. Start the development server

```bash
npm run dev
```

Open:

http://localhost:3000

Access the dashboard at:

http://localhost:3000/dashboard

---

## Demo Mode vs PayPal Sandbox

MandatePay supports a demo mode and a PayPal Sandbox integration.

**Demo Mode (`DEMO_MODE=true`)**

- Uses seeded invoice fixtures.
- Uses an in-memory demo store.
- Simulates payment execution.
- Does not send money.

**PayPal Sandbox (`DEMO_MODE=false`)**

- Uses configured PayPal Sandbox credentials.
- Connects to the PayPal Payouts API.
- Initiates actual sandbox payout requests.
- Tracks payout statuses and verified webhook events.

PayPal Payouts may need to be enabled for your sandbox business account.

Never use production payment credentials for the hackathon demonstration.

---

## Database Setup

Configure `DATABASE_URL` with your PostgreSQL connection string.

Generate the Prisma client:

```bash
npm run db:generate
```

Run migrations:

```bash
npm run db:migrate -- --name init
```

Seed the database:

```bash
npm run db:seed
```

The Prisma schema defines relational models and constraints for:

- Users
- Spending mandates
- Approved vendors
- Invoices
- Invoice extractions
- Policy evaluations
- Payments
- Payment attempts
- Approvals
- Audit logs
- Verified webhook events

**Note:** The bundled demo UI currently uses an in-memory store. Prisma schema, migrations, and seed data are provided for database integration. The in-memory store is not suitable for multi-user or production deployments.

---

## API Overview

| Endpoint | Function |
|---|---|
| `POST /api/mandates` | Interpret and create spending mandates |
| `POST /api/invoices` | Validate invoices and evaluate policies |
| `POST /api/invoices/upload` | Upload and extract invoice data |
| `POST /api/invoices/[id]/approval` | Process approval decisions |
| `GET /api/payments/[invoiceId]/status` | Check payout status |
| `POST /api/webhooks/paypal` | Process verified PayPal webhooks |
| `GET /api/audit` | Retrieve audit events |

---

## Security & Trust

Financial authorization must never depend on an LLM's output alone.

MandatePay follows a separation-of-concerns architecture:

| Component | Responsibility |
|---|---|
| AI Agent | Extract information and interpret mandates |
| Policy Engine | Deterministically enforce financial rules |
| Payment Executor | Execute authorized payout requests |
| Audit Logger | Record system and user actions |

Additional safeguards include:

- Server-side credential management.
- Zod input validation.
- Duplicate payment prevention.
- Payment idempotency.
- Verified PayPal webhook signatures.
- Explicit payment state transitions.
- Spending-limit enforcement.
- Approval authorization checks.

Unknown payout outcomes must be reconciled against PayPal before another payout attempt.

### Current Demo Limitations

- The demo uses a single seeded admin rather than production multi-user authentication.
- The demo store is in-memory and does not provide production persistence.
- Invoice upload currently supports text-based PDFs.
- OCR for scanned PDFs and image invoices is not included in the demo adapter.
- AI extraction requires an `AI_API_KEY`.

Before production deployment, implement authenticated user sessions, database-backed transactions and locking, persistent audit storage, and production-grade authorization.

---

## Testing

Run the automated policy engine tests:

```bash
npm test
```

The tests cover:

- Compliant approved vendors.
- Unapproved vendors.
- Transaction thresholds.
- Monthly spending limits.
- Duplicate invoices.
- Unsupported currencies.
- Reserved in-flight spending.

Build the application:

```bash
npm run build
```

---

## Project Philosophy

MandatePay is built around one fundamental principle:

**Autonomy should not mean unrestricted authority.**

AI agents should be able to execute routine financial operations while remaining bound by explicit, deterministic, and auditable permissions.

The goal is not simply to make AI capable of spending money.

It is to make autonomous spending accountable.

---

## Built For

An AI-powered payments hackathon project exploring autonomous agents, financial infrastructure, and programmable spending controls.

**Payments powered by PayPal Payouts API.**

---

*MandatePay — Your money. Your rules. Your autonomous agent.*
 
