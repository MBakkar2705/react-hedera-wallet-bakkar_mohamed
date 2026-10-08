# ADR 0001: Private keys in the frontend

- Status: Accepted
- Date: 2026-10-08

## Context

The NestJS backend has no authentication. Some endpoints take a Hedera private key in the request body: for example, the `POST /tokens/transfer` example in the README sends `fromPrivateKey`.

A Next.js frontend is being added in `frontend/`. To call these endpoints, the frontend needs the private key of the account that signs the operation.

This project targets the Hedera testnet and is a demonstration.

## Decision

1. The user enters the key explicitly in the page. The frontend keeps it in page memory only and never stores it in `localStorage`, `sessionStorage`, cookies, URLs or logs.
2. The backend is not changed for this: it keeps receiving the key in the request body.
3. Operator credentials (`OPERATOR_ID`, `OPERATOR_KEY`) stay in the backend `.env` file and never appear in the frontend. In the frontend, only the API base URL may use a `NEXT_PUBLIC_` variable, because those variables are readable by any visitor.
4. CORS on the backend is limited to one explicit origin: `app.enableCors({ origin: 'http://localhost:3001' })` in `src/main.ts`.
5. In the frontend, the key is typed once and held in an active account in memory, shared by the screens (see ADR 0005).

## Alternatives considered

Signing in the browser with a wallet, so that no private key is sent to the API. This is a possible evolution and it is not implemented. It would require changing the backend (`src/`) and its unit tests (4 suites, 20 tests). It was not chosen because the first goal is a working frontend on the existing API, and this project is a testnet demo.

## Consequences

- No change to `src/` services and no change to the 20 existing tests.
- The user types a private key into a web page. A key held in page memory can still be read by any script that runs in that page.
- This approach is acceptable for a testnet demo only. It must not be used with real funds.
- CORS is enforced by the browser; it is not access control. Any client that is not a browser can still call the API.
- Moving to wallet signing later is possible but is a backend change and needs its own ADR.

## Verification

### Proven

- `src/main.ts` contains the line `app.enableCors({ origin: 'http://localhost:3001' });` (commit `3b498dd`).
- The CORS response header was checked with `curl` against the running backend.
- The README documents a request body with `fromPrivateKey` for `POST /tokens/transfer`.
- From the accounts page of the frontend, in a browser, a JSON POST to `/accounts` got a preflight response (204) and then a 201 response, which the page displayed. No CORS error appeared in the console.
- After a page reload, the active account and its key were gone (observed in the browser, see ADR 0005).

### Not proven

- That the frontend never stores a key: the keys are held in React state only. A search in the files of the accounts screen, the transfer screen and the active account (`app/`, `components/`, `lib/active-account.tsx`, `lib/transfer.ts`, `lib/accounts.ts`) found no call to `localStorage`, `sessionStorage` or cookies, but the browser storage was not inspected, and the token and topic screens do not exist yet.
- The effort of wallet signing: the statement that it requires changes in `src/` and in the tests is an assessment, not a measurement.