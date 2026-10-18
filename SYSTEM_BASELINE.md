# SYSTEM BASELINE — AI BUSINESS SYSTEM
**Authoritative Known Good Baseline (LKG) & Release Governance Specification**

---

## 1. Baseline Header & Core Metadata

| Property | Verified Value | Evidence / Verification Source |
| :--- | :--- | :--- |
| **System Title** | AI Business System (Enterprise ERP SaaS) | `metadata.json`, `package.json` |
| **Baseline Version** | `1.4.0` | CR-20260907-BL04 Ratification |
| **Baseline Status** | **APPROVED** | Authoritative Last Known Good (LKG) |
| **Baseline Type** | **KNOWN GOOD BASELINE (LKG)** | Full Forensic Verification |
| **Baseline Date** | 2026-09-14 | Canonical System Date |
| **Baseline Timestamp** | 2026-09-14T13:00:00Z | Verification Run Timestamp |
| **Application Version** | `0.0.0` | `package.json` |
| **API Version** | `v1` (`/api/v1`) | `server.ts`, `openapiSpec.ts` |
| **OpenAPI Version** | `3.0.3` | `server/swagger/openapiSpec.ts` |
| **Canonical API Routes** | `160` | `server.ts`, `openApiVerifier.ts` (157 in v1.3.0 + 2 AR01-A + 1 AR01-B net-new) |
| **Documented API Routes** | `160` | `server/swagger/openapiSpec.ts` |
| **OpenAPI Route Coverage** | `100%` | `npm run test:openapi` (12/12 PASS) |
| **Missing / Orphan Routes** | `0` / `0` | Zero Drift Verified |
| **Method / Path Mismatches** | `0` / `0` | 1:1 Parity Verified |
| **Database Migration Revision** | `v030` | `server/db/migrations/` (32 scripts) |
| **Alembic Version Records** | `58` | 32 full names + 26 backward-compat numeric keys (0 unapplied) |
| **AR01-A Database Migrations** | `1` | `029_customer_master_controls.sql` (Soft-deletion & lifecycle) |
| **AR01-B Database Migrations** | `1` | `030_customer_financial_reversals.sql` (Financial reversals & cancellation) |
| **Total Persistent Base Tables** | `121` | PostgreSQL Catalog / `schema.ts` |
| **Tenant-Owned Tables** | `104` | Live Catalog (`company_id` + `companies`) |
| **Tenant-Dependent Tables** | `7` | Direct Foreign Key Dependency Scope |
| **Tenant Recovery Scope** | `111` | $104 + 7$ (CR-20260902-DR03 Certified) |
| **Non-Tenant System Tables** | `10` | Excluded System Infrastructure Scope |
| **Unresolved Tables** | `0` | 100% Categorization Parity |
| **Tenant Backup Coverage** | `111 / 111 (100%)` | `BackupService.ts` / `dr03_certification.test.ts` |
| **Tenant Restore Coverage** | `111 / 111 (100%)` | `BackupService.ts` / `dr03_certification.test.ts` |
| **Backup / Restore Registry Parity** | `100%` | CR-20260902-DR03-R1 Reconciled |
| **Atomic Restore & Rollback** | **CERTIFIED** | Mid-restore rollback verified (0 partial state) |
| **Accounting Invariant Post-Restore** | **CERTIFIED** | $\Sigma \text{Debits} = \Sigma \text{Credits}$ verified |
| **Physical Attachment Packaging** | **CERTIFIED** | CR-20260902-DR04A (12/12 PASS) |
| **Cryptographic Checksum Integrity** | **CERTIFIED** | CR-20260902-DR04B (16/16 PASS) |
| **Customer Lifecycle Test Suite (AR01-A)** | **CERTIFIED** | `customer_lifecycle_ar01a.test.ts` (7/7 PASS) |
| **Financial Reversal Test Suite (AR01-B)** | **CERTIFIED** | `cr_ar01_b_reversal_regression.test.ts` (8/8 PASS) |
| **Enterprise Settings Version** | `2.0.0` | `enterprise_settings_control_center.test.ts` (32/32 PASS) |
| **Build Status** | **PASS** | `npm run build` (Clean client & server bundle) |
| **TypeScript / Lint Status** | **PASS** | `tsc --noEmit` (0 errors) |
| **Security Status** | **PASS** | Bcrypt hash, signed JWT, zero hardcoded secrets |
| **Tenant Isolation Invariant** | **PASS** | Parameterized `company_id` query scoping |
| **Accounting Invariants** | **PASS** | Double-entry balancing ($\Sigma \text{Debits} = \Sigma \text{Credits} = 2,760,955,685.00$) |

---

## 2. Core Baseline Principle

> **GOVERNANCE MANDATE:**
> 
> "The System Baseline represents the last explicitly verified and approved state of the AI Business System.
> 
> Future changes **MUST** be evaluated against this baseline.
> 
> A change is **NOT** considered release-ready merely because the application builds successfully."

---

## 3. Comprehensive Baseline Scope

### 3.1 Application
- Single-page application (React 19 + TypeScript + Vite 6 + Tailwind CSS 4) backed by modular Express 4 backend running on Node.js.
- Clean separation of client (`/src`) and server (`/server`) architectures.

### 3.2 Frontend
- Modular dashboard view architecture organized into domain tabs (`SalesTab`, `InvoicesTab`, `LedgerTab`, `PosTab`, `EnterpriseSettingsTab`, `SwaggerTab`, `BackupTab`, `WhatsAppTab`, etc.).
- Centralized API service layer with JWT interceptors, automated authorization headers, and unified `ErrorResponse` schema handling.

### 3.3 Backend
- Express 4.21.2 server bundling cleanly via `esbuild` into `dist/server.cjs`.
- Standardized middleware pipeline: Health probes -> CORS -> JSON Body Parser (`50mb` limit + `rawBody`) -> Swagger UI -> Domain Routers -> Catch-All JSON 404 -> Error Handler.

### 3.4 API
- Authoritative base path: `/api/v1`.
- 160 canonical production endpoints covering 19 domain modules.
- Previous Baseline 1.3.0: 157 canonical routes.
- Net-New Routes ratified in Baseline 1.4.0:
  - AR01-A: `+2` (`POST /api/v1/customers/:id/deactivate`, `POST /api/v1/customers/:id/reactivate`)
  - AR01-B: `+1` (`POST /api/v1/customers/:id/transactions/:txId/reverse`)
  - Invoice cancellation (`POST /api/v1/invoices/:id/cancel`) already existed in Baseline 1.3.0 and was hardened with financial reversal and payment dependency gates rather than newly registered.
  - Reconciliation: $157 + 2 + 1 = 160$ canonical routes.
- Standardized JSON responses for all success and error states (`{ success: true, data }` / `{ success: false, error }`).

### 3.5 OpenAPI
- OpenAPI 3.0.3 specification in `server/swagger/openapiSpec.ts`.
- Interactive Swagger UI served at `/api-docs` and `/api/docs`.
- Automated contract verification engine in `server/services/openApiVerifier.ts`.
- 160 documented routes / 160 canonical routes (100% parity, 0 drift, 12/12 PASS).

### 3.6 Authentication
- BCrypt password hashing with 10 salt rounds.
- Signed HMAC-SHA256 JWT tokens encoding `userId`, `companyId`, `role`, and `permissions`.
- Protected endpoint enforcement returning `401 Unauthorized` on missing or invalid tokens.

### 3.7 RBAC (Role-Based Access Control)
- 70+ granular system permissions categorized by domain.
- Verified RBAC Controls:
  - Direct customer financial reversal: `accounting.reverse`
  - Invoice cancellation: `invoices:write`
  - Customer deactivation / reactivation: `customers:write`
  - Authentication: BearerAuth / verified JWT
  - Tenant: Authenticated JWT `company_id`
- Predefined role hierarchy: `COMPANY_ADMIN`, `ACCOUNTANT`, `SALES_MANAGER`, `PURCHASE_MANAGER`, `INVENTORY_CONTROLLER`, `CASHIER`.
- Middleware `requirePermission(...)` preventing privilege escalation; unauthorized reversal or cancellation requests are strictly rejected with HTTP 403 Forbidden.

### 3.8 Tenant Isolation
- Multi-tenant data segregation enforced through mandatory `company_id` column on all tenant tables.
- Parameterized SQL queries guaranteeing zero cross-tenant read or write leakages.

### 3.9 Database
- PostgreSQL engine (Neon Serverless PostgreSQL connection pool with local `@electric-sql/pglite` fallback).
- Pool telemetry tracking active, idle, waiting clients, and query latency.
- Non-destructive migration framework tracking version history.
- **Migration & Schema State**:
  - Previous migration revision: `v028`
  - Current migration revision: `v030` (`030_customer_financial_reversals`).
  - Total migration files: 32 (`server/db/migrations/`).
  - Total persistent base tables: 121.
  - Ratified migrations in Baseline 1.4.0:
    - `029_customer_master_controls.sql` (CR-20260907-AR01-A: customer master soft-deletion columns, indexes, and audit fields)
    - `030_customer_financial_reversals.sql` (CR-20260907-AR01-B: transaction reversal tracking columns, cancellation audit fields, and partial unique idempotency index)
  - Current migration sequence: `v028` → `v029` → `v030`.
  - **Alembic Version Table (`alembic_version`) Reconciliation**:
    - Total records: 58 (verified).
    - 32 records correspond 1:1 to the complete descriptive migration script keys (`001_initial_phase1_schema` through `030_customer_financial_reversals`).
    - 26 records correspond to legacy Alembic numeric prefix identifiers (`001` through `027`), preserved intentionally for backward-compatibility dual-indexing.
    - Zero orphaned, duplicate, or unapplied migration records; migration runner verifies 100% applied status across all 32 scripts.

### 3.10 Accounting
- Double-entry general ledger with immutable audit trail.
- Debit and credit balance integrity maintained across all journal postings ($\Sigma \text{Debits} = \Sigma \text{Credits} = 2,760,955,685.00$).
- Sub-ledger integration across Customers, Suppliers, Banks, and Cash accounts.
- **Baseline 1.4.0 Financial Integrity Invariants**:
  - Financial history is append-only.
  - Posted financial records cannot be directly edited or deleted.
  - Reversals create compensating financial records.
  - Original transaction records remain auditable.
  - Double-entry remains balanced ($\Sigma \text{Debits} = \Sigma \text{Credits}$).
  - Customer subledger remains synchronized with GL.
  - Historical customer transactions remain traceable.
  - Invoice cancellation cannot bypass payment dependencies.
  - Closed periods cannot be silently reopened.
  - Tenant isolation remains enforced.
- **AR01-B Reversal Model**:
  - Canonical relationship: $\text{Original Transaction} \to \text{Reversal Transaction}$ (and where applicable: $\text{Original Transaction} \to \text{Reversal} \to \text{Corrected Transaction}$).
  - Original amount remains unchanged.
  - Original posting remains auditable.
  - Reversal is a new financial event.
  - Correction is a new financial event.
  - Reversal cannot itself be directly undone.

### 3.11 Inventory
- Multi-warehouse inventory tracking via `inventory_movements` table.
- Automatic stock decrement upon sales invoice approval and increment upon purchase invoice receipt.

### 3.12 Sales
- Full sales order and invoice lifecycle management (Draft, Issued, Partially Paid, Paid, Cancelled).
- Itemized tax, discounts, customer balances, and digital PDF generation.
- **Invoice Cancellation Controls (CR-20260907-AR01-B Verified State)**:
  - Cancellation of unpaid invoices reverses accounts receivable, general ledger revenue, and output tax, and restores inventory quantities via append-only compensating entries.
  - Payment Dependency Gate: Invoices with partial or full payment receipts cannot be cancelled (`PAYMENT_DEPENDENCY_ERROR`, HTTP 400); receipts must be reversed first or sales returns issued.
  - Idempotency & concurrency guards enforced with row-level locks (`SELECT ... FOR UPDATE`) preventing duplicate restocking or balance corruption.

### 3.13 POS (Point of Sale)
- Cashier shift sessions with opening balance, cash sales, cash drops/expenses, and closing drawer reconciliation.

### 3.14 Purchasing
- Vendor purchase invoice registration, inventory valuation updates, and Accounts Payable ledger linkage.

### 3.15 Payments
- Customer receipt vouchers and supplier payment vouchers with multi-invoice allocation and real-time ledger posting.

### 3.16 Vouchers
- Sequential numbering, journal voucher entry, cash receipt, and payment voucher auditability.

### 3.17 Treasury
- Multi-account financial treasury tracking cash boxes, bank accounts, and digital wallets with balanced funds transfers.

### 3.18 Banks
- Bank account registries, IBAN tracking, deposits, withdrawals, and bank reconciliations.

### 3.19 Wallets
- Digital payment gateway and electronic wallet balance management.

### 3.20 Taxes
- Configurable tax rules (15% standard VAT) with line-item calculation and ZATCA-compliant reporting.

### 3.21 Multi-Currency
- Multi-currency transaction processing with dynamic exchange rate registry and base-currency ledger normalization.

### 3.22 WhatsApp
- Two-way messaging engine with incoming webhook signature validation, message persistence, document/invoice PDF dispatch, and zero hardcoded credentials.
- **WhatsApp Communication Center (CR-20260907-WA01 Verified State)**:
  - **Three-Panel UI Architecture**:
    1. *Conversation List Panel*: Active conversation feeds, full-text contact search, delivery status filters, and unread badges.
    2. *Message Thread View*: Directional chat bubbles (emerald outbound, slate inbound), delivery state indicators (`SENT`, `DELIVERED`, `READ`, `FAILED`, `RETRYING`), manual outbound message retry button, and template insertion controls.
    3. *ERP Context Inspector*: Embedded customer/supplier profile, financial balances (strictly read-only), recent sales invoices, purchase invoices, payment receipts, linked attachments with SHA-256 cryptographic digests, quick statement dispatch, payment reminders, and manual ERP record association modal.
  - **Conversation Management**: High-performance thread aggregation via PostgreSQL window CTEs with unread message counting.
  - **Inbound & Outbound Messaging**: Bi-directional message lifecycle with persistence in `whatsapp_messages`.
  - **ERP Entity Association**:
    - Customer linking (`customers`)
    - Supplier linking (`suppliers`)
    - Sales invoice linking (`invoices`)
    - Purchase invoice linking (`purchase_invoices`)
    - Payment / receipt linking (`payments`)
    - Attachment linking (`file_attachments`) with SHA-256 checksum integrity verification
  - **Operational Resiliency & Retries**: Manual outbound message retry endpoint (`POST /api/v1/whatsapp/messages/:id/retry`) with immediate provider re-dispatch and audit tracking.
  - **Message Linking Endpoint**: Retroactive ERP association endpoint (`POST /api/v1/whatsapp/messages/:id/link`) supporting customer, supplier, invoice, payment, and attachment entity types.
  - **Template Messaging**: Pre-approved WhatsApp message templates with dynamic variable interpolation (`{{1}}`, `{{2}}`).
  - **Webhook Security & Verification**:
    - `GET /webhook`: Verification handshake adhering strictly to Meta Cloud API protocols using `config.whatsapp.webhookVerifyToken`.
    - `POST /webhook`: Inbound webhook dispatch with mandatory `X-Hub-Signature-256` HMAC-SHA256 signature validation executed via constant-time comparison (`crypto.timingSafeEqual`).
    - `appsecret_proof`: Dynamic generation of HMAC-SHA256 proofs on all outbound Meta Graph API requests.
    - Webhook Idempotency: Duplicate suppression via `meta_message_id` lookup avoiding double-insertion of inbound events.
  - **Tenant Isolation**: Mandatory `company_id` parameterized query scoping across all WhatsApp operations and provider configurations.
  - **RBAC Enforcement**: Strict permission guards (`customers:read`, `customers:write`, `settings:read`, `settings:write`).
  - **Audit Logging**: Comprehensive audit events logged via `AuditService.log` (`SEND_WHATSAPP_MESSAGE`, `RETRY_WHATSAPP_MESSAGE`, `LINK_WHATSAPP_MESSAGE_ERP`, `WHATSAPP_SECURITY_VIOLATION_WEBHOOK_SIGNATURE`).
  - **Production WhatsApp E2E Boundary**:
    - *Verified in Sandbox*: Application architecture, 3-panel UI, webhook verification logic, HMAC-SHA256 signature checks, `appsecret_proof` generation, RBAC, tenant isolation, idempotency, message persistence, ERP linking, regression test suites, and clean production build.
    - *Not Proven / Out of Verification Scope*: Live production Meta webhook exchange, live production outbound cellular WhatsApp message delivery, real Meta tenant credentials, and live multi-party delivery/read lifecycle over public Meta infrastructure.

### 3.23 AI (Artificial Intelligence)
- Financial copilot and analytics forecasting powered server-side by Google Gemini SDK (`@google/genai`).
- Timeout boundaries, error categorization, and graceful client fallback.

### 3.24 OCR (Optical Character Recognition)
- Receipt and invoice image processing with automated extraction of supplier, date, line items, and totals.

### 3.25 Enterprise Settings
- 5-tier configuration hierarchy (System -> Company -> Branch -> Role -> User) with Safe Lock, Change Request approval workflows, configuration snapshots, and LKG rollback (`32/32 tests PASS`).
- **Governance Note**: UNRELATED CHANGE — TECHNICALLY VERIFIED BUT REQUIRES SEPARATE GOVERNANCE RECORD.
  Enterprise Settings optimizations (snapshot optimization, parallel resolution, and validation checks) are verified with 32/32 passing tests and remain separately tracked; they do not form part of AR01-A or AR01-B functionality.

### 3.26 Backup / Disaster Recovery
- **Baseline 1.4.0 Architecture Preservation**:
  Baseline 1.4.0 preserves the established tenant DR architecture. The customer and financial tables (`customers`, `customer_transactions`, `invoices`, `accounting_ledger`, etc.) remain fully within the established tenant recovery scope. No backup architecture modification is authorized by BL04.

- **Authoritative Scope Definition**:
  The authoritative tenant-recovery dataset consists of 111 persistent application tables:
  - 104 tenant-owned tables
  - 7 tenant-dependent tables

  The authoritative non-tenant infrastructure scope consists of 10 tables and is excluded from tenant recovery.

- **Certified Tenant-Dependent Scope (7 tables)**:
  1. `ai_messages`
  2. `invoice_items`
  3. `purchase_invoice_items`
  4. `purchase_return_items`
  5. `role_permissions`
  6. `sales_return_items`
  7. `user_roles`

- **Certified Non-Tenant Scope (10 tables)**:
  1. `alembic_version`
  2. `permissions`
  3. `system_config_definitions`
  4. `performance_regressions`
  5. `performance_snapshots`
  6. `provider_telemetry`
  7. `scheduler_locks`
  8. `system_backups`
  9. `email_verification_tokens`
  10. `password_reset_tokens`

- **Disaster Recovery Database Certification (CR-20260902-DR03)**:
  CR-20260902-DR03 is certified for:
  - Complete 111-table tenant backup coverage (111 / 111)
  - Complete 111-table tenant restore coverage (111 / 111)
  - Topological restore ordering preserving foreign key referential integrity
  - Tenant isolation enforcement (zero cross-tenant data contamination)
  - Atomic transaction rollback on mid-restore failure (0 partial state persisted)
  - SHA-256 canonical payload checksum calculation and tamper rejection
  - Accounting invariant validation ($\Sigma \text{Debits} = \Sigma \text{Credits}$)

- **Physical Attachment Packaging Certification (CR-20260902-DR04A)**:
  CR-20260902-DR04A is certified (12/12 tests PASS) for:
  - Fail-closed physical attachment binary packaging into deterministic tenant backup bundles
  - Abstract storage provider compatibility (`StorageProviderRegistry` for local and cloud storage)
  - Manifest generation with 1:1 manifest-to-binary mapping
  - Storage key traversal protection and tenant isolation enforcement
  - Atomic workspace cleanup of temporary staging and partial bundle artifacts upon failure

- **Cryptographic Checksum Integrity & Ingress Enforcement (CR-20260902-DR04B)**:
  CR-20260902-DR04B is closed and fully ratified (16/16 tests PASS) for:
  - Ingress SHA-256 calculation: Deterministic lowercase hexadecimal SHA-256 digests computed in-memory from binary buffers during upload in `fileService.ts` and `realBusinessOperationsService.ts`
  - Backup-time physical verification: Recalculation and validation of physical binary SHA-256 against database digests before archive packaging
  - Fail-closed integrity violation handling: Immediate abort, cleanup, and audit logging under `[Category: CRYPTOGRAPHIC_INTEGRITY_VIOLATION]` upon checksum or byte-level mismatch
  - Standardized error categorization: `CRYPTOGRAPHIC_INTEGRITY_VIOLATION`, `UNREADABLE_OR_MISSING_BINARY`, `BINARY_SIZE_MISMATCH`, `SECURITY_VIOLATION_CROSS_TENANT`, `SECURITY_VIOLATION_PATH_TRAVERSAL`
  - Historical NULL checksum compatibility: Attachments with `NULL` checksums are safely preserved, computing binary hashes dynamically and recording `HISTORICAL_UNPOPULATED` in manifests without mutating database records
  - Multi-tenant storage boundary isolation: Rejection of cross-tenant storage keys (`companies/${companyId}/...`) and directory traversal sequences (`..`)
  - Exactly six authorized files reconciled with zero scope creep

- **Schema Delta Introduced by DR04B (Migration 028)**:
  - `file_attachments.sha256_checksum`: VARCHAR(64) NULL, default NULL
  - `business_documents.sha256_checksum`: VARCHAR(64) NULL, default NULL
  - `ocr_documents`: Unchanged (inline Base64 data architecture preserved)
  - Indexes added: 0 (No index overhead introduced on checksum columns)
  - Foreign keys added: 0 (No relational constraints added)
  - Total persistent base tables invariant at 121

- **Baseline 1.2.0 Certified Verification Results**:
  - DR04B Cryptographic Integrity: 16/16 PASS
  - DR04A Attachment Packaging: 12/12 PASS
  - DR03 Full Certification: 6/6 PASS
  - Phase 15C Atomic Restore: 15/15 PASS
  - OpenAPI Contract Verification: 155/155 PASS (12/12 checks PASS)
  - TypeScript Compilation: Clean (0 errors)
  - Production Build (`npm run build`): PASS (`dist/server.cjs`)
  - API Health Probe (`/api/health`): HTTP 200 `{"status":"ok"}`
  - Tenant Isolation Invariants: PASS (Zero leakage across dual-tenant tests)
  - Accounting Invariants: PASS ($\Sigma \text{Debits} = \Sigma \text{Credits} = 150.00$)
  - Authentication & RBAC: PASS

- **Documented Known Limitations**:
  1. *No Destructive Down-Migration Test*: Schema idempotency verified via `ADD COLUMN IF NOT EXISTS`; no executable destructive `DROP COLUMN` script was executed against the database.
  2. *No Dedicated High-Concurrency Ingress Stress Test*: Dual-tenant isolation verified sequentially; multi-threaded concurrent upload burst stress testing remains an operational profiling item.
  3. *Historical Pre-DR04B Records Handling*: Pre-existing records may contain `NULL` `sha256_checksum` values and are handled dynamically during backup verification as `HISTORICAL_UNPOPULATED` without database mutation.
  *(These are documented verification boundaries and limitations, not failures).*

- **Production Boundary Directives**:
  - No production deployment was performed.
  - No production database write was performed.
  - No production cloud-storage write was performed.
  - No production secret was modified or rotated.
  - All BL02 evidence was gathered strictly in the local container sandbox environment.

### 3.27 Exports
- Tenant-isolated data exports in CSV, Excel (`.xlsx`), JSON, and print-ready PDF formats.

### 3.28 Observability
- Distributed request tracing, structured JSON application logging, DB pool health metrics, and automated health endpoints.
- **Verified Health Architecture**:
  - `GET /health` (System operational status probe)
  - `GET /api/health` (API health probe)
  - `GET /api/v1/health` (Versioned domain health probe)
  - All verified operational and healthy without modifying routing.

### 3.29 Security
- Parameterized SQL execution preventing SQL injection.
- Zero committed production secrets; all sensitive variables managed strictly through environment configuration.

### 3.30 Testing
- Comprehensive regression suites spanning OpenAPI contracts, unit authentication, multi-tenancy, enterprise settings, and financial reporting.

### 3.31 Documentation
- Synchronized OpenAPI 3.0.3 spec, embedded Swagger UI, and engineering governance directives in `AGENTS.md`.

### 3.32 Runtime
- Development mode: `npm run dev` (`tsx server.ts`).
- Production mode: `npm start` (`node dist/server.cjs`).

### 3.33 Deployment Artifact
- Standalone CommonJS bundle `dist/server.cjs` compiled with `--packages=external` and pre-compiled client assets in `dist/`.

---

## 4. Protected System Registry

| Protected Subsystem | Protected? | Criticality | Allowed Change Scope | Mandatory Regression Suite |
| :--- | :---: | :--- | :--- | :--- |
| **Double-Entry Accounting & Ledger** | **YES** | **CRITICAL** | Corrections via journal entries only; zero balance corruption | `phase9_5_financial_reporting.test.ts` |
| **Customer Lifecycle & Master Controls** | **YES** | **HIGH** | Soft deactivation, safe hard-delete stubs only, tenant isolation | `customer_lifecycle_ar01a.test.ts` |
| **Financial Reversals & Invoice Cancellation** | **YES** | **CRITICAL** | Append-only compensating entries, payment dependency gate, GL parity | `cr_ar01_b_reversal_regression.test.ts` |
| **Tenant Isolation Engine** | **YES** | **CRITICAL** | Zero unscoped database queries | `auth_registration_regression.test.ts` |
| **Enterprise Settings & Safe Lock** | **YES** | **CRITICAL** | Changes via Change Request only | `enterprise_settings_control_center.test.ts` |
| **OpenAPI Contract Specification** | **YES** | **CRITICAL** | 100% 1:1 route synchronization | `openapi_contract_verification.test.ts` |
| **Authentication & RBAC** | **YES** | **CRITICAL** | Password hash & JWT invariants | `auth_http_endpoints_regression.test.ts` |
| **Disaster Recovery & Backup Engine** | **YES** | **CRITICAL** | Non-destructive snapshot creation & verification | `dr03_certification.test.ts`, `dr04a_attachment_packaging.test.ts`, `dr04b_attachment_integrity.test.ts` |
| **WhatsApp Integration Engine** | **YES** | **HIGH** | Webhook verification & secret isolation | `phase7_4_whatsapp.test.ts` |
| **Sales, Invoicing & POS** | **YES** | **HIGH** | Inventory/ledger integration preserved | Core integration test suites |
| **Purchasing & AP** | **YES** | **HIGH** | Inventory/ledger integration preserved | Core integration test suites |
| **Payments & Treasury** | **YES** | **HIGH** | Balanced account transfers preserved | Core integration test suites |

---

## 5. Change Classification Framework

To protect system stability, all proposed changes are strictly classified into four governance classes:

### CLASS A — DOCUMENTATION ONLY
- **Scope**: README, user guides, code comments, OpenAPI description text (no schema or route changes), architecture documentation.
- **Runtime Impact**: None.
- **Verification Requirements**: Documentation formatting check.

### CLASS B — NON-CRITICAL UI / PRESENTATION
- **Scope**: Button labels, UI styling, component padding/margins, dashboard layout, non-functional visual enhancements.
- **Runtime Impact**: Frontend presentation only.
- **Verification Requirements**: `tsc --noEmit`, `npm run lint`, `npm run build`, Smoke test.

### CLASS C — FUNCTIONAL CHANGE
- **Scope**: New API endpoints, service enhancements, business logic updates, workflow adjustments, third-party integrations.
- **Runtime Impact**: Backend and frontend execution paths.
- **Verification Requirements**: `tsc --noEmit`, `npm run lint`, `npm run build`, `npm run test:openapi`, module unit/integration tests, tenant isolation verification, security verification.

### CLASS D — CRITICAL SYSTEM CHANGE
- **Scope**: Accounting/ledger rules, tenant isolation mechanism, authentication/JWT logic, database migrations/schema changes, Enterprise Settings engine, backup/restore logic, financial calculations, production infrastructure.
- **Runtime Impact**: Mission-critical system invariants and data persistence.
- **Verification Requirements**: Full regression suite, invariant verification ($\Sigma \text{Debits} = \Sigma \text{Credits}$), explicit change request approval, baseline comparison, rollback strategy, new baseline ratification.

---

## 6. Change Request Governance & Template

Every **CLASS C** or **CLASS D** change proposal must document a Change Request prior to implementation using the following format:

```markdown
### CHANGE REQUEST RECORD
- **Change ID**: CR-YYYYMMDD-XXX
- **Date**: YYYY-MM-DD
- **Requester**: [Name / Agent]
- **Change Class**: CLASS C / CLASS D
- **Purpose**: [Clear statement of functional requirement]
- **Scope**: [Specific files and components to be modified]
- **Affected Modules**: [List of affected domains]
- **Protected Modules Touched**: [YES / NO - Details]
- **Risk Level**: LOW / MEDIUM / HIGH / CRITICAL
- **Expected Files**: [List of file paths]
- **Expected Tests**: [List of test commands to run]
- **Rollback Plan**: [Step-by-step procedure to revert if regression occurs]
- **Approval Status**: PENDING / APPROVED / REJECTED
```

---

## 7. Pre-Implementation Checkpoint

Before writing or modifying any code for a functional change:
1. **Inspect Current Baseline**: Review `SYSTEM_BASELINE.md` for baseline invariants.
2. **Identify Protected Modules**: Verify if any protected subsystem is affected.
3. **Identify Affected API Routes**: Verify if routes are modified, added, or deleted.
4. **Identify Affected Database Entities**: Verify if schema or columns are altered.
5. **Identify Affected Accounting Invariants**: Confirm zero impact on double-entry balance.
6. **Identify Required Regression Tests**: Determine the test suites required.
7. **Define Rollback Strategy**: Document exact rollback steps.

---

## 8. Post-Implementation Checkpoint

After implementing any code change:
1. **Static Analysis**: Execute `tsc --noEmit` and `npm run lint`.
2. **Build Verification**: Execute `npm run build` and confirm 0 errors.
3. **API Contract Verification**: Execute `npm run test:openapi` and confirm 100% route coverage and 0 violations.
4. **Domain Regression Execution**: Execute the specific test suites identified in the Pre-Implementation Checkpoint.
5. **Zero Undocumented Side-Effects**: Confirm that no unexpected files were created or modified.

---

## 9. Baseline Comparison Matrix

Future releases must evaluate the modified state against this baseline using the following comparison matrix:

| Metric / Aspect | Baseline State (v1.3.0 / Superseded) | Baseline State (v1.4.0 / Authoritative LKG) | Delta Classification |
| :--- | :--- | :--- | :--- |
| **Application Version** | `0.0.0` | `0.0.0` | UNCHANGED |
| **API Version** | `v1` | `v1` | UNCHANGED |
| **OpenAPI Revision** | `3.0.3` | `3.0.3` | UNCHANGED |
| **API Route Count** | `157` | `160` | RATIFIED DELTA (+2 AR01-A, +1 AR01-B net-new) |
| **Database Migration Revision** | `v028` (30 scripts) | `v030` (32 scripts: 029, 030) | RATIFIED DELTA (+2 migrations) |
| **Alembic Version Records** | `56` (30 full + 26 legacy) | `58` (32 full + 26 legacy) | RATIFIED DELTA (+2 verified) |
| **Total Database Tables** | `121` | `121` | UNCHANGED |
| **Tenant Recovery Scope** | `111` tables ($104 + 7$) | `111` tables ($104 + 7$) | PRESERVED |
| **Tenant Backup / Restore Coverage** | `100%` (111 / 111) | `100%` (111 / 111) | PRESERVED |
| **Physical Attachment Packaging** | DR04A Certified (12/12) | DR04A Certified (12/12) | PRESERVED |
| **Cryptographic Integrity Gate** | DR04B Certified (16/16) | DR04B Certified (16/16) | PRESERVED |
| **WhatsApp Communication Center** | WA01 Certified (7/7 tests) | WA01 Certified (7/7 tests) | PRESERVED |
| **Customer Master Controls** | Pre-AR01-A | AR01-A Certified (7/7 tests PASS) | RATIFIED DELTA |
| **Financial Reversals & Cancellation** | Pre-AR01-B | AR01-B Certified (8/8 tests PASS) | RATIFIED DELTA |
| **Enterprise Settings Engine** | `2.0.0` (29/29) | `2.0.0` (32/32 tests PASS) | TECHNICALLY VERIFIED (Separate Record) |
| **Build Status** | PASS | PASS | VERIFIED |
| **OpenAPI Contract Status** | PASS (100% Coverage, 157/157) | PASS (100% Coverage, 160/160) | VERIFIED |
| **Tenant Isolation Status** | PASS (Strict Scoping) | PASS (Strict Scoping) | VERIFIED |
| **Accounting Invariants** | PASS ($\Sigma \text{Dr} = \Sigma \text{Cr}$) | PASS ($\Sigma \text{Dr} = \Sigma \text{Cr} = 2,760,955,685.00$) | VERIFIED |
| **Security Status** | PASS (Zero Secrets) | PASS (Zero Secrets) | VERIFIED |

---

## 10. Core Invariant Governance Directives

### 10.1 OpenAPI Governance
- Every production API route registered in Express **MUST** have exactly one corresponding operation in `server/swagger/openapiSpec.ts`.
- `npm run test:openapi` **MUST** pass with 100% coverage, 0 missing, 0 orphaned, 0 method mismatches, 0 parameter violations, and 0 security violations.

### 10.2 Accounting Governance
- Total debits must equal total credits for every posted transaction ($\Sigma \text{Debits} = \Sigma \text{Credits}$).
- Transactions must post atomically within database transaction boundaries.
- General ledger entries are immutable; corrections must post reversing entries.

### 10.3 Tenant Isolation Governance
- Every database query in domain services **MUST** include `WHERE company_id = $1` or equivalent parameterized scoping.
- Authenticated JWT token context binds the caller's tenant identity. Cross-tenant reads or writes are strictly forbidden.

### 10.4 Database Governance
- Direct manual schema modifications on production databases are strictly prohibited.
- All schema evolutions must occur via sequential, versioned SQL migration scripts (`server/db/migrations/`).
- Destructive operations (`DROP TABLE`, `TRUNCATE`) are blocked by production safety guards.

### 10.5 Security & Secret Governance
- Never commit production secrets, private keys, database credentials, or API tokens to source code, documentation, or OpenAPI specs.
- All secrets must be injected via runtime environment variables (`process.env`).

---

## 11. Release Readiness Definition

A release candidate is classified as **RELEASE READY** if and only if:
1. **Scope Approved**: All changes correspond to an approved Change Request.
2. **Build Passed**: `npm run build` completes with 0 errors.
3. **TypeScript Passed**: `tsc --noEmit` completes with 0 errors.
4. **OpenAPI Contract Passed**: `npm run test:openapi` achieves 100% coverage and 0 violations.
5. **Regressions Passed**: All domain-specific regression test suites pass.
6. **Invariants Verified**: Accounting double-entry, tenant isolation, and security invariants verified.
7. **Documentation Synchronized**: OpenAPI, `AGENTS.md`, and `SYSTEM_BASELINE.md` updated and approved.

---

## 12. Baseline Ratification & Revision History

- **Engineering Governance Lead**: Google AI Studio AI Coding Agent
- **Baseline Classification**: **KNOWN GOOD BASELINE (LKG)**
- **Current Baseline Version**: `1.4.0`
- **Ratification Date**: 2026-09-14
- **Status**: **APPROVED & ACTIVE (AUTHORITATIVE LKG)**

> **BASELINE GOVERNANCE STATUS:**
> - **Baseline 1.4.0** is now the **AUTHORITATIVE LAST KNOWN GOOD (LKG)** baseline.
> - **Baseline 1.3.0** becomes the immediate predecessor baseline (SUPERSEDED).
> - **CR-20260907-AR01-A** is the authorized and ratified change record establishing Customer Master Controlled Edit, Soft Deletion & Safe Hard-Deletion Guards (+2 routes, Migration 029, 7/7 tests PASS).
> - **CR-20260907-AR01-B** is the authorized and ratified change record establishing Customer Financial Reversal & Controlled Invoice Cancellation (+1 net-new route, 1 hardened route, Migration 030, 8/8 tests PASS).
> - **CR-20260907-BL04** is the formal governance order ratifying Baseline 1.4.0.
> - Baseline 1.3.0 → CR-20260907-AR01-A & CR-20260907-AR01-B VERIFIED → Accelerated Final Reconciliation PASSED (All 6 Gates) → Baseline 1.4.0 RATIFIED.

> **BASELINE INTEGRITY STATEMENT:**
> Baseline 1.4.0 incorporates only the verified and reconciled changes authorized under CR-20260907-AR01-A and CR-20260907-AR01-B, with all protected financial, security, tenant, audit, and disaster-recovery invariants preserved.

### Ratification Metadata (CR-20260907-BL04)
- **Ratification CR**: CR-20260907-BL04
- **Previous Baseline**: 1.3.0 (SUPERSEDED)
- **New Baseline**: 1.4.0 (AUTHORITATIVE LAST KNOWN GOOD)
- **Ratification Status**: RATIFIED — AUTHORITATIVE LAST KNOWN GOOD
- **Verification Basis**: CR-20260907-BL04 Accelerated Final Reconciliation (6/6 Gates PASSED)
- **Route Count**: 160 canonical / 160 documented (157 in Baseline 1.3.0 + 2 AR01-A + 1 AR01-B net-new = 160; 100% parity, 0 drift)
- **Migration Head**: v030 (`029_customer_master_controls.sql`, `030_customer_financial_reversals.sql`; 58 Alembic records)
- **Financial Integrity**: VERIFIED (Append-only, double-entry balanced, payment dependency gated, closed periods preserved)
- **Tenant Isolation**: VERIFIED (Mandatory `company_id` scoping across all routes and services)
- **RBAC**: VERIFIED (`accounting.reverse`, `invoices:write`, `customers:write`)
- **OpenAPI**: 100% PARITY (0 drift, 0 missing, 0 orphaned, 12/12 PASS)
- **Build**: PASS (`npm run build`, clean client & `dist/server.cjs`)
- **Health**: HEALTHY (`/health`, `/api/health`, `/api/v1/health`)

### Revision History

| Version | Publication Date | Change Request | Reason for Update | Affected Sections | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `1.0.0` | 2026-09-01 | CR-20260901-LKG01 | Initial baseline establishment and forensic ratification | Sections 1–12 | SUPERSEDED |
| `1.1.0` | 2026-09-04 | CR-20260902-BL01 | Publication of certified 111-table tenant disaster recovery scope (Phase 15E-R3.1A, DR03, DR03-R1) | Sections 1, 3.26, 4, 9, 12 | SUPERSEDED |
| `1.2.0` | 2026-09-05 | CR-20260902-DR04B / CR-20260905-BL02 | Formal ratification of verified post-DR04B state: cryptographic ingress SHA-256 calculation, backup-time physical binary verification, fail-closed integrity gating, and Migration 028 | Sections 1, 3.26, 4, 9, 12 | SUPERSEDED |
| `1.3.0` | 2026-09-07 | CR-20260907-WA01 / CR-20260907-BL03 | Formal ratification of verified WA01 state: WhatsApp Communication Center (3-panel UI, conversation management, ERP linking, HMAC webhook security, retry/link endpoints, 157 canonical routes, zero accounting mutation) | Sections 1, 3.9, 3.10, 3.22, 9, 12 | SUPERSEDED (Immediate Predecessor) |
| `1.4.0` | 2026-09-14 | CR-20260907-AR01-A / CR-20260907-AR01-B / CR-20260907-BL04 | Formal ratification of verified AR01-A (Customer Master Controls & Soft Deletion) and AR01-B (Customer Financial Reversal & Controlled Invoice Cancellation), Migrations 029 & 030, 160 canonical routes, 100% OpenAPI parity, and verified accounting invariants | Sections 1, 3.4, 3.7, 3.9, 3.10, 3.12, 3.25, 3.26, 3.28, 4, 9, 12 | **APPROVED & ACTIVE (AUTHORITATIVE LKG)** |
| `1.4.1` | 2026-09-22 | CR-20260922-PROD-AUTH-STALE-TOKEN-HANDLING-FIX-01 | Controlled Authentication Client Fix: Nested error extraction (data.error.message), automatic stale-token clearance on 401 protected requests, data.token consumption, and zero-leakage session teardown (13/13 tests PASS) | Client Auth (`api.ts`, `AuthContext.tsx`), Tests | **VERIFIED & ACTIVE** |
| `1.4.2` | 2026-09-24 | CR-20260923-SEC-XSS-PRINTING-OUTPUT-ENCODING-FIX-01 | Controlled XSS Output-Encoding Remediation (SEC-04): 46/46 dynamic HTML sinks encoded, 0 unencoded sinks to document.write(), 91/91 XSS tests PASS, Arabic & RTL layouts preserved, verified via CR-20260924-SEC04-POST-RESTORE-FINAL-ACCEPTANCE-01 | Printing / Export (`exportUtils.ts`, `api.ts`), Tests | **RATIFIED / VERIFIED** |
| `1.4.3` | 2026-09-24 | CR-20260924-SEC03-SECURITY-HEADERS-HARDENING-01 | Security Response Headers Hardening (SEC-03) & Strict Production CSP Enforcement (CR-20260924-SEC03-CSP-STRICT-PRODUCTION-ENFORCEMENT-01): script-src 'self' (0 unsafe-eval, 0 unsafe-inline in prod), script-src-attr 'none', style separation (style-src-attr 'unsafe-inline', style-src-elem 'self' fonts), static /assets/print.css, print HTML 0 scripts/0 onclicks, isolated dev wss/eval, verified via CR-20260924-SEC03-CSP-FINAL-ACCEPTANCE-VERIFY-01 (17/17 security headers PASS, 14/14 strict CSP PASS, 91/91 XSS PASS, 13/13 auth PASS, 162/162 OpenAPI PASS) | Security Middleware (`securityHeaders.ts`, `server.ts`), Printing (`exportUtils.ts`, `api.ts`, `print.css`), Tests | **RATIFIED / VERIFIED** |
| `1.4.4` | 2026-09-24 | CR-20260925-SEC06-AUTH-RATE-LIMITING-IMPLEMENTATION-01 | Distributed Authentication Rate Limiting (SEC-06): PostgreSQL-backed distributed rate limiting via migration 032, multi-instance Cloud Run compatibility, atomic concurrent counter updates (INSERT ... ON CONFLICT), login account failure threshold (5/15m), login IP request threshold (30/1m), registration rate limiting (5/1h), forgot-password IP (10/15m) & email (3/30m) limits, reset-password IP limit (10/15m), standardized 429 TOO_MANY_REQUESTS with Retry-After header, anti-enumeration preservation, zero permanent account lockout, production trust proxy = 1, dev spoofed-IP protection, 29/29 rate limiting tests PASS, 162/162 OpenAPI PASS | Rate Limiting (`rateLimiter.ts`, `auth.ts`, `server.ts`, `032_auth_rate_limiting.sql`), OpenAPI (`openapiSpec.ts`), Tests | **RATIFIED / VERIFIED** |
| `1.4.5` | 2026-09-25 | CR-20260928-SEC06-LOGGING-HASH-INTEGRITY-AUDIT-01 / CR-20260928-GOV-SEC06-HASH-RATIFICATION-01 | Forensic Security Telemetry Hash Integrity Ratification: SHA-256 deterministic normalization (trim + lowercase), empty-identifier rejection prior to hashing, zero empty SHA-256 telemetry or rate-limit keys, zero raw identifier/credential leakage, 162/162 OpenAPI parity, future security consideration documented | Section 12 (Governance) | **RATIFIED / VERIFIED** |
| `1.4.6` | 2026-09-26 | CR-20260928-FIN-OPENING-BALANCE-DOUBLE-COUNT-FIX-01 | Account Statement Opening Balance Double-Counting Correction: Opening Balance established strictly as immutable baseline state, excluded from transactions, movement counts, period debit/credit totals, and running balance accumulation; mathematical parity enforced (closing = opening + debits - credits); 163/163 OpenAPI parity, Scenarios A–I PASS | Financial Reporting (`reportService.ts`, `customers.ts`, `suppliers.ts`, `customersAndSuppliers.ts`), UI/Export (`CustomersAndSuppliersModule.tsx`), OpenAPI (`openapiSpec.ts`), Tests | **RATIFIED / FROZEN (NEW AUTHORITATIVE LKG)** |

### Security Hardening Ratification Entry (SEC-03)
- **Change Request**: CR-20260924-SEC03-SECURITY-HEADERS-HARDENING-01
- **Title**: Security Response Headers Hardening
- **Related Strict CSP CR**: CR-20260924-SEC03-CSP-STRICT-PRODUCTION-ENFORCEMENT-01
- **Acceptance Record**: CR-20260924-SEC03-CSP-FINAL-ACCEPTANCE-VERIFY-01
- **Finding**: SEC-03
- **Ratification Status**: RATIFIED / VERIFIED
- **Evidence**:
  - Production CSP contains `script-src 'self'`
  - Production CSP contains `script-src-attr 'none'`
  - Production CSP contains no `unsafe-eval`
  - Production CSP contains no script `unsafe-inline`
  - Development-only unsafe-eval/wss allowances isolated from Production
  - Print inline scripts removed
  - Print inline event handlers removed
  - Static `/assets/print.css` implemented
  - `style-src` / `style-src-attr` / `style-src-elem` separated
  - Security Headers tests 17/17 passed (`cr_20260923_sec03_security_headers.test.ts`)
  - Strict CSP tests 14/14 passed (`cr_20260924_sec03_csp_strict_production.test.ts`)
  - XSS regression 91/91 passed (`cr_20260923_xss_print_encoding.test.ts`)
  - Authentication regression 13/13 passed (`cr_20260922_auth_stale_token_handling.test.ts`)
  - OpenAPI 162/162 passed (100% route coverage, zero drift)
  - TypeScript passed (`tsc --noEmit`, 0 errors)
  - Production build passed (`npm run build`, clean client & server bundles)
  - Database unchanged (0 mutations)
  - Migrations unchanged (0 migrations executed)
  - Dependencies unchanged (0 packages added/modified)
  - Deployment not performed (strictly local governance verification)

### Authentication Rate Limiting Ratification Entry (SEC-06)
- **Change Request**: CR-20260925-SEC06-AUTH-RATE-LIMITING-IMPLEMENTATION-01
- **Title**: Distributed Authentication Rate Limiting
- **Finding**: SEC-06
- **Classification**: Controlled Security Functional Change
- **Status**: RATIFIED / VERIFIED
- **Authorized Migration**: `032_auth_rate_limiting.sql` (Table `auth_rate_limits`, index `idx_auth_rate_limits_expire`)
- **Evidence**:
  - PostgreSQL-backed distributed rate limiting implemented
  - Multi-instance Cloud Run compatibility verified
  - Atomic concurrent counter updates verified (`INSERT ... ON CONFLICT (key) DO UPDATE`)
  - Login account failure threshold verified (5 failed attempts per 15-minute window)
  - Login IP request threshold verified (30 requests per 1-minute window)
  - Registration rate limiting verified (5 requests per 1-hour window per IP)
  - Forgot-password IP and email limits verified (10 req / 15 min per IP, 3 req / 30 min per email)
  - Reset-password IP limit verified (10 req / 15 min per IP)
  - Generic 429 TOO_MANY_REQUESTS responses verified
  - Retry-After behavior verified
  - Account enumeration protection verified
  - Permanent account lockout not implemented
  - Production trust-proxy handling verified (`app.set('trust proxy', 1)` in production)
  - Development spoofed forwarded-IP protection verified (`trust proxy` disabled in dev)
  - Authentication regression tests passed (13/13 PASS)
  - XSS regression tests passed (91/91 PASS)
  - Security header regression passed (17/17 PASS)
  - CSP regression passed (14/14 PASS)
  - Rate limiting comprehensive test suite passed (29/29 PASS)
  - RBAC verified
  - Tenant isolation verified
  - TypeScript passed (`tsc --noEmit`, 0 errors)
  - Production build passed (`npm run build`, clean client & server bundles)
  - OpenAPI 162/162 passed (`npm run test:openapi`, 100% route coverage, zero drift)
  - No third-party dependencies added
  - No unrelated modules modified
  - Database changes limited to migration 032
  - No deployment performed

### Security Telemetry & Rate-Limit Hash Integrity Ratification Entry (CR-20260928-SEC06-LOGGING-HASH-INTEGRITY-AUDIT-01)
- **Change Request**: CR-20260928-SEC06-LOGGING-HASH-INTEGRITY-AUDIT-01
- **Ratification Order**: CR-20260928-GOV-SEC06-HASH-RATIFICATION-01
- **Title**: Forensic Verification of Telemetry Hash Integrity & Empty Hash Analysis
- **Status**: RATIFIED / CLOSED
- **Classification**: CLASS A — READ-ONLY SECURITY FORENSIC VERIFICATION
- **Audit Verdict**: SEC06-HASH-INTEGRITY-AUDIT-CLEAN
- **Verified Properties**:
  1. Authentication identifier hashes use SHA-256 (`crypto.createHash('sha256')`).
  2. Identifier normalization is deterministic: `identifier.trim().toLowerCase()`.
  3. Empty, whitespace-only, null, undefined, or malformed identifiers are rejected before hashing (Zod schema validation gates return HTTP 400).
  4. Empty SHA-256 digest (`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`) is not generated by authentication telemetry.
  5. Empty SHA-256 digest is not generated by rate-limit keys.
  6. Raw email identifiers are not stored in security telemetry (`security_audit_logs`).
  7. Raw passwords are not stored in telemetry or logs.
  8. Password hashes are not stored in telemetry or logs.
  9. JWTs are not stored in telemetry or logs.
  10. Authorization headers are not stored in telemetry or logs.
  11. Reset tokens are not stored in telemetry or logs.
  12. Rate-limit identifiers are stored as SHA-256-derived namespaced keys (`login:failure:email:<hash>`, etc.).
  13. Hashes are verified as 64-character hexadecimal values.
  14. Security audit telemetry contains zero empty identifier hashes across all logged events.
  15. Database schema remained unchanged.
  16. No migration was created or executed.
  17. No files were modified during the forensic audit.
  18. No deployment occurred.
  19. OpenAPI remained synchronized at 162/162 routes (100% coverage, zero drift).
  20. Tenant isolation and protected security subsystems remained intact.

#### Future Security Consideration
- **Evaluation**: Direct SHA-256 hashing of low-entropy identifiers such as email addresses can be susceptible to offline dictionary pre-computation.
- **Guidance**: A future architecture review MAY evaluate keyed HMAC-SHA-256 with a protected server-side secret/pepper for stronger pseudonymization.
- **Governance Constraint**: This is NOT a current defect. Current SHA-256 identifier design is acceptable for telemetry pseudonymization. No implementation of HMAC, hashing modification, or rate-limit key restructuring is authorized under this ratification.

### Account Statement Opening Balance Invariant Ratification & Freeze Entry (CR-20260928-FIN-OPENING-BALANCE-DOUBLE-COUNT-FIX-01)
- **Change Request**: CR-20260928-FIN-OPENING-BALANCE-DOUBLE-COUNT-FIX-01
- **Title**: Customer & Supplier Account Statement Opening Balance Double-Counting Correction
- **Status**: CLOSED / FROZEN (NEW AUTHORITATIVE LKG BASELINE)
- **Classification**: CLASS C — FUNCTIONAL CORRECTION
- **Verified Invariants**:
  1. **Opening Balance = Baseline State Only**: Opening balance is strictly an immutable baseline state, NOT a financial transaction movement.
  2. **Zero Movement Pollution**: Opening Balance is NEVER inserted into `statement.transactions` / `statement.movements`.
  3. **Zero Period Total Inflation**: Opening Balance is NEVER added to `totalDebit` or `totalCredit`.
  4. **Strict Transaction Counting**: `transactionCount === actualFinancialTransactions.length` (excludes opening balance completely).
  5. **Running Balance Invariant**: $\text{runningBalance}_0 = \text{openingBalance}$; for each transaction $n$, $\text{runningBalance}_n = \text{previous} + \text{debit} - \text{credit}$.
  6. **Mathematical Parity**: $\text{closingBalance} = \text{openingBalance} + \text{totalPeriodDebit} - \text{totalPeriodCredit}$.
  7. **Final Balance Parity**: Final running balance strictly equals `closingBalance`.
  8. **Defect Remediation Verified**: $100,000 + 2,000 + 3,000 = 105,000\text{ YER}$ (The previous $205,000\text{ YER}$ result is permanently prevented).
  9. **Tenant Isolation**: Statements strictly enforce tenant boundary scoping on customers, suppliers, and transaction queries.
  10. **OpenAPI Synchronization**: 163/163 canonical routes documented and verified with 100% governance score.


