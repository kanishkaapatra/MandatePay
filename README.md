# MandatePay

### Autonomous payments. Human-defined boundaries.

**An AI-powered bill payment agent that puts financial control at the centre of autonomous transactions.**

MandatePay enables users to delegate routine vendor payments to an AI agent while retaining complete control over how their money is spent.

Define spending mandates in natural language. Let AI process incoming invoices. Enforce financial restrictions through deterministic policy code. Execute authorized payments through PayPal.

**The AI extracts. The policy engine decides. The payment executor acts. The audit log records.**

---

## The Problem

AI agents are evolving from systems that simply provide recommendations into systems capable of taking real-world actions.

One of the most consequential actions an autonomous agent can take is spending money.

But how do we allow AI agents to manage financial operations without giving them unrestricted access to funds?

MandatePay explores this problem through programmable spending mandates, deterministic authorization, and auditable payment execution.

## How It Works

1. **Define a spending mandate:** Set transaction limits, monthly budgets, and approved vendors using natural language.
2. **Receive an invoice:** Upload a vendor invoice for processing.
3. **Extract information:** AI identifies invoice details and structures the extracted data.
4. **Evaluate the mandate:** A deterministic policy engine checks the transaction against financial restrictions.
5. **Determine the outcome:** The invoice is automatically approved, blocked, or sent for human review.
6. **Execute and record:** Authorized payments are processed through PayPal and recorded in the audit trail.

---

## Core Features

### 01. Intelligent Invoice Processing

AI-powered invoice extraction and validation.

- Upload text-based PDF invoices.
- Extract vendor, amount, invoice number, and payment details.
- Validate structured outputs using Zod.
- Identify missing or ambiguous information.
- Detect potential duplicate invoices.
- Never invent missing vendor or payment information.

### 02. Deterministic Spending Enforcement

Financial authorization is enforced by backend code, not by AI instructions.

- Natural-language spending mandate interpretation.
- Per-transaction spending limits.
- Monthly spending budgets.
- Approved vendor restrictions.
- Manual approval thresholds.
- Duplicate invoice prevention.
- Reserved in-flight spending calculations.

The AI cannot bypass hard financial restrictions through its generated output.

### 03. Autonomous Payment Execution

PayPal-powered payment infrastructure.

- PayPal Payouts API integration.
- OAuth 2.0 authentication.
- Unique payout batch and request identifiers.
- Payment status tracking.
- Verified PayPal webhooks.
- Duplicate payout protection.

### 04. Human-in-the-Loop Approval

Transactions requiring additional authorization are routed to an approval queue.

- Review invoice information.
- Inspect policy evaluation results.
- Approve or reject eligible transactions.
- Prevent manual approvals from overriding hard policy restrictions.

### 05. Transparent Audit Trail

Every important operation is recorded, including:

- Invoice submissions.
- AI extraction results.
- Policy evaluations.
- Approval decisions.
- Payment attempts.
- PayPal responses.
- Webhook events.
- Payment outcomes.

---

## Demo Scenario

The application includes three seeded invoices demonstrating different spending decisions.

**Example spending mandate:**

"Automatically pay invoices under $200, only to approved vendors, with a maximum monthly spending limit of $1,000. Require manual approval for anything outside these conditions."

| Invoice | Vendor | Amount | Outcome |
|---|---|---:|---|
| AC-1024 | Acme Cloud Services | $149 | Auto-approved |
| US-2026-01 | Unknown Solutions | $175 | Blocked |
| AC-1025 | Acme Cloud Services | $450 | Pending approval |

**Three decisions. Three different outcomes. One enforceable spending mandate.**

- $149: Approved vendor and within the automatic payment threshold.
- $175: Blocked because the vendor is not approved.
- $450: Requires human approval because it exceeds the automatic transaction threshold.

Manual approval cannot override hard policy restrictions.

---

## Application

| Route | Description |
|---|---|
| `/` | Cinematic public landing page |
| `/dashboard` | Interactive financial command center |

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

Keep all credentials server-side. Never commit your `.env` file.

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

Set:

```env
DEMO_MODE=false
```

Configure valid PayPal Sandbox credentials to enable actual sandbox payout requests.

The integration supports:

- OAuth 2.0 authentication.
- Payout creation.
- Payment status tracking.
- Webhook verification.
- Duplicate payout protection.

PayPal Payouts may need to be enabled on your sandbox business account.

**Sandbox transactions do not transfer real money.**

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

The Prisma schema includes relational models and constraints for:

- Users
- Spending mandates
- Vendors
- Invoices
- Policy evaluations
- Payments
- Payment attempts
- Approvals
- Audit events
- Verified webhook receipts

**Implementation note:** The bundled demo UI currently uses an in-memory store. Prisma schema, migrations, and seed data are provided for database integration. The in-memory store is not suitable for multi-user or production deployments.

---

## API Reference

| Method | Endpoint | Description |
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
- PayPal webhook authenticity is verified before processing events.
- Audit events are read-only through the API.

---

## Security and Trust

MandatePay separates intelligence, authorization, and execution.

| Component | Responsibility |
|---|---|
| AI Agent | Invoice extraction and mandate interpretation |
| Policy Engine | Deterministic financial authorization |
| Payment Executor | Authorized payment execution |
| Audit Logger | Traceable event recording |

Additional safeguards include:

- Server-side credential management.
- Structured input validation.
- Duplicate invoice prevention.
- Payment idempotency.
- PayPal webhook verification.
- Explicit payment state transitions.
- Spending-limit enforcement.
- Approval authorization checks.

Unknown payout outcomes must be reconciled with PayPal before another payout attempt.

---

## Testing

Run the automated policy engine tests:

```bash
npm test
```

Test coverage includes:

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

## Current Limitations

MandatePay is currently a hackathon demonstration, not a production-ready financial service.

- The demo uses a single seeded admin rather than production multi-user authentication.
- Demo data and audit events are stored in memory.
- The bundled UI does not yet use the Prisma database for persistent storage.
- Invoice upload supports text-based PDFs.
- OCR for scanned PDFs and images is not included.
- AI extraction requires an `AI_API_KEY`.
- Production deployment requires authenticated sessions, database-backed transactions and locking, and persistent audit storage.

---

## Project Philosophy

**Autonomy should not mean unrestricted authority.**

MandatePay explores how AI agents can execute financial operations while remaining accountable to explicit, deterministic, and auditable user-defined permissions.

The objective is not simply to make AI capable of spending money.

It is to make autonomous spending controlled, transparent, and accountable.

---

**MandatePay**

*Your money. Your rules. Your autonomous agent.*
 
