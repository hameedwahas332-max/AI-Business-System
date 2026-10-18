# AI BUSINESS SYSTEM — AGENT & ENGINEERING GOVERNANCE DIRECTIVES

## Core Architectural Invariants
1. **Inspect Before Modify**: Always inspect existing implementations, routes, types, and services before proposing or executing changes.
2. **Preserve Protected Modules**: Never mutate or destabilize accounting logic, general ledger, journal balancing, WhatsApp integrations, multi-tenant isolation, or enterprise control center configurations without explicit instructions.
3. **Verify Existing Routes Before Creating Routes**: Always check `server.ts` and `server/routes/v1/` to ensure no duplicate, conflicting, or conflictingly named routes are introduced.
4. **Use Existing Services**: Reuse existing domain services (`AuthService`, `UserService`, `RoleService`, `ReportService`, etc.) rather than writing duplicate query logic.
5. **No Speculative Fixes**: Implement targeted, verified solutions directly matching requirements.
6. **Run Regression Tests**: Always execute full test suites (`npm test` and specific regression suites) to confirm zero regressions across all modules.
7. **No Production Secrets in Code**: Never commit or expose `JWT_SECRET`, `DATABASE_URL`, WhatsApp tokens, API keys, or private credentials in code or OpenAPI documentation.
8. **No Unapproved Deployment**: Do not trigger unauthorized deployment or external publishing actions.
9. **Document Fixed Bugs**: Record bug fixes and route changes systematically to prevent regressions.
10. **Preserve Accounting Invariants**: Ensure all financial transactions adhere strictly to double-entry debit/credit balancing principles.
11. **Preserve Tenant Isolation**: Ensure all database queries and route handlers enforce `tenantId` / `companyId` scoping.
12. **OpenAPI Synchronization**: Maintain the OpenAPI 3.0 specification (`server/swagger/openapiSpec.ts`) synchronized 1:1 with all implemented production API routes.
13. **Contract Drift Prevention**: Whenever a new API route or endpoint handler is added or modified in Express, immediately update `server/swagger/openapiSpec.ts` with accurate path parameters, HTTP method, BearerAuth security tags, and request/response schemas.
14. **Contract Verification Enforcement**: Always execute `npm run test:openapi` before merging or concluding any API modifications to ensure 100% route coverage, zero missing endpoints, zero orphaned endpoints, and 100% governance compliance score.
15. **Standardized Error Response Contracts**: All API endpoints must adhere to the standardized `ErrorResponse` schema (`{ success: false, error: string | { code, message, timestamp } }`) to maintain contract predictability across web and mobile clients.
16. **Baseline Adherence & LKG Governance**: All future changes must be benchmarked against `SYSTEM_BASELINE.md`. No change is release-ready merely because it builds.
17. **Change Classification Enforcement**: Classify all changes into CLASS A (Doc), CLASS B (UI Presentation), CLASS C (Functional), or CLASS D (Critical System Change).
18. **Change Request Prerequisite**: Require a documented Change Request record prior to modifying any CLASS C or CLASS D systems.
19. **Pre/Post-Implementation Checkpoints**: Execute pre-implementation baseline assessment and post-implementation regression verification.
20. **Protected Invariant Registry**: Strictly safeguard all 27 protected subsystems documented in `SYSTEM_BASELINE.md`.

