<img width="1883" height="911" alt="image" src="https://github.com/user-attachments/assets/0f8d6af7-c26f-487e-8f5a-bae3c0372d30" />

# MandatePay

### Autonomous payments. Human-defined boundaries.

**An AI-powered bill payment agent that executes financial decisions within deterministic spending mandates.**

MandatePay explores a future where AI agents can autonomously handle financial operations without compromising user control.

Define spending rules in natural language. Let AI process vendor invoices. Enforce financial boundaries through deterministic code. Execute authorized payments through PayPal.

**The AI proposes. The policy engine decides. The payment executor acts. The audit log records.**

---

## The Problem

AI agents are increasingly capable of taking actions on behalf of users, including making financial transactions.

But granting an AI agent the ability to spend money introduces a fundamental question:

**How do we give autonomous agents financial authority without giving them unrestricted control?**

MandatePay addresses this challenge through programmable spending mandates that establish clear, enforceable boundaries around autonomous payments.

## How It Works

<pre>
  INCOMING INVOICE
         |
         v
   AI INVOICE READER
         |
         v
  STRUCTURED EXTRACTION
         |
         v
   ANOMALY DETECTION
         |
         v
 DETERMINISTIC POLICY ENGINE
         |
    +----+----+
    |    |    |
    v    v    v
   AUTO BLOCK REVIEW
    |    |    |
    v    v    v
 PAYPAL REJECT APPROVAL
 PAYOUT       QUEUE
    |
    v
  AUDIT LOG
</pre>

1. **Define a mandate** — Describe spending permissions using natural language.
2. **Process invoices** — AI extracts vendor, amount, invoice number, and payment information.
3. **Evaluate policies** — A deterministic backend engine checks every transaction against the active mandate.
4. **Determine the outcome** — Automatically approve, block, or request human approval.
5. **Execute payments** — Authorized transactions are processed through PayPal Payouts.
6. **Maintain accountability** — Every decision and payment event is recorded.

---

## Core Features

### 01 — Intelligent Invoice Processing

AI-powered invoice extraction and validation.

- Upload text-based PDF invoices.
- Extract structured invoice information.
- Validate extracted fields using Zod.
- Identify missing or ambiguous information.
- Detect potential duplicate invoices.
- Never invent missing payment or vendor details.

### 02 — Deterministic Spending Enforcement

Financial restrictions are enforced through backend code, not AI instructions.

- Natural-language mandate interpretation.
- Per-transaction spending limits.
- Monthly spending budgets.
- Approved vendor restrictions.
- Manual approval thresholds.
- Duplicate invoice prevention.
- Reserved in-flight spending calculations.

The LLM cannot authorize its own restricted transactions or modify an approved mandate.

### 03 — Autonomous Payment Execution

PayPal-powered payment infrastructure.

- PayPal Payouts API integration.
- OAuth 2.0 authentication.
- Unique payout batch and item identifiers.
- Payment status tracking.
- Verified PayPal webhooks.
- Idempotency and duplicate payout protection.

### 04 — Human-in-the-Loop Approval

Transactions requiring additional authorization are routed to an approval queue.

Users can inspect invoice information, review policy evaluation results, and approve or reject eligible transactions.

Manual approval cannot override hard spending restrictions.

### 05 — Transparent Audit Trail

Every important operation is recorded, including:

- Invoice uploads.
- AI extraction.
- Policy evaluations.
- Approval decisions.
- Payment attempts.
- PayPal responses.
- Webhook events.
- Payment completion or failure.

---

## Application

| Route | Description |
|---|---|
| `/` | Cinematic public landing page |
| `/dashboard` | Interactive financial command center |

---

## Demo Scenario

The application includes three seeded invoices demonstrating how the spending mandate engine handles different financial decisions.

**Example mandate:**

> Automatically pay invoices under $200, only to approved vendors, with a maximum monthly spending limit of $1,000. Require manual approval for anything outside these conditions.

| Invoice | Vendor | Amount | Decision |
|---|---|---:|---|
| AC-1024 | Acme Cloud Services | $149 | Auto-approved |
| US-2026-01 | Unknown Solutions | $175 | Blocked |
| AC-1025 | Acme Cloud Services | $450 | Pending approval |

**Expected outcomes:**

- **AC-1024:** Approved vendor, transaction within the automatic payment threshold.
- **US-2026-01:** Blocked because the vendor is not approved.
- **AC-1025:** Requires human approval because it exceeds the transaction threshold.

The approval workflow cannot override hard policy restrictions.

---

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes, Node.js |
| Validation | Zod |
| Database | PostgreSQL, Prisma ORM |
| AI Processing | Configurable LLM API |
| Payment Infrastructure | PayPal Payouts API |
| Testing | Automated policy engine tests |

---

## Getting Started

### Prerequisites

- Node.js 20+
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

Create a local environment file:

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

Keep credentials private. Never commit your `.env` file.

### 4. Start the development server

```bash
npm run dev
```

Open the application:

- Landing page: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard

---

## Payment Configuration

MandatePay supports two execution modes.

### Demo Mode

The default configuration is:

```env
DEMO_MODE=true
```

Demo mode:
- Uses seeded invoice fixtures.
- Uses an in-memory demo store.
- Simulates payment execution.
- Does not send money.

### PayPal Sandbox Mode

To enable actual PayPal Sandbox payout requests:

```env
DEMO_MODE=false
```

Configure valid PayPal Sandbox credentials and ensure Payouts are enabled for your sandbox business account.

The integration supports:
- OAuth 2.0 access tokens.
- Payout creation.
- Payment status tracking.
- Webhook verification.
- Duplicate payout protection.

Unknown payout outcomes must be reconciled with PayPal before retrying.

**Note:** PayPal Sandbox transactions do not transfer real money.

---

## Database Setup

Configure `DATABASE_URL` with your PostgreSQL connection string.

Generate the Prisma client:

```bash
npm run db:generate
```

Run database migrations:

```bash
npm run db:migrate -- --name init
```

Seed the database:

```bash
npm run db:seed
```

The Prisma schema includes relational models and constraints for:

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

**Implementation note:** The bundled demo UI currently uses an in-memory store. Prisma schema, migrations, and seed data are provided for database integration. The in-memory implementation is not suitable for multi-user or production deployments.

---

## API Reference

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/mandates` | Interpret and create spending mandates |
| POST | `/api/invoices` | Validate invoices and evaluate policies |
| POST | `/api/invoices/upload` | Upload and extract invoice data |
| POST | `/api/invoices/[id]/approval` | Process approval decisions |
| GET | `/api/payments/[invoiceId]/status` | Check payout status |
| POST | `/api/webhooks/paypal` | Process verified PayPal webhooks |
| GET | `/api/audit` | Retrieve audit events |

### Important Implementation Details

- Mandate activation requires explicit `activate: true` confirmation.
- Invoice submissions are validated before policy evaluation.
- PDF extraction currently supports text-based PDFs.
- Missing vendor or invoice identifiers are not invented.
- Approval processing re-evaluates the policy before payment execution.
- PayPal webhook authenticity is checked before processing events.
- Audit events are read-only through the API.

---

## Security & Trust

MandatePay follows a strict separation of responsibilities.

| Component | Responsibility |
|---|---|
| AI Agent | Invoice extraction and mandate interpretation |
| Policy Engine | Deterministic financial authorization |
| Payment Executor | Authorized payment execution |
| Audit Logger | Traceable event recording |

Security measures include:

- Server-side credential management.
- Structured input validation.
- Duplicate invoice prevention.
- Payment idempotency.
- Webhook signature verification.
- Explicit payment state transitions.
- Spending-limit enforcement.
- Approval authorization checks.

The AI agent never receives unrestricted access to payment execution.

---

## Current Limitations

MandatePay is currently a hackathon demonstration, not a production-ready financial service.

Known limitations:

- The demo uses a single seeded admin rather than production multi-user authentication.
- The bundled UI uses in-memory demo storage.
- Audit events are append-only in process memory and are not persistently stored in the demo implementation.
- Invoice uploads support text-based PDFs.
- OCR for scanned PDFs and image invoices is not included.
- AI extraction requires an `AI_API_KEY`.
- Production deployment requires authenticated sessions, database-backed transactions and locking, and persistent audit storage.

---

## Testing

Run the automated policy engine tests:

```bash
npm test
```

Coverage includes:

- Compliant approved vendors.
- Unapproved vendors.
- Transaction threshold violations.
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

**Autonomy without unrestricted authority.**

MandatePay explores how AI agents can move beyond recommendations and execute real financial workflows while remaining accountable to explicit user-defined permissions.

The objective is not simply to make AI capable of spending money.

It is to make autonomous spending controlled, transparent, and auditable.

---

### MandatePay

*Your money. Your rules. Your autonomous agent.*


 
