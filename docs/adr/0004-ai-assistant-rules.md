# ADR 0004: Rules for the AI coding assistant

- Status: Accepted (the paths of rules 4, 7 and 8 amended by ADR 0007: `src/` is now `backend/src/`, and the protected backend files are in `backend/`)
- Date: 2026-10-08

## Context

The repository has a `CLAUDE.md` file with project rules for Claude Code. It was added on 2026-10-07 for the backend (commit `e9ac603`) and adapted on 2026-10-08 for frontend work (commit `dd036cb`).

The author writes the frontend code himself and must be able to explain every line of it.

## Decision

The `CLAUDE.md` file sets these rules:

1. Never read, create or print a `.env` file or a private key.
2. No secret in frontend code. Only the API base URL may use a `NEXT_PUBLIC_` variable, because those variables are readable by any visitor.
3. Private keys stay in page memory only: never in `localStorage`, `sessionStorage`, cookies, URLs or logs (see ADR 0001).
4. Work only in `frontend/`. Do not modify `src/`, the `Dockerfile`, `.github/`, the root `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `jest.config.js`, `nest-cli.json`, the tsconfig files or `eslint.config.mjs` unless asked explicitly.
5. The author writes the application code in `frontend/`. The assistant explains, reviews, points out bugs, proposes plans and asks questions.
6. The assistant states its plan before writing any file and explains each choice after.
7. After a backend change, run `pnpm test` at the repository root. After a change in `frontend/`, run `pnpm --filter frontend lint` and `pnpm --filter frontend build`. Report the results.
8. Keep the API base URL in a single place and import no code between `frontend/` and `src/` (see ADR 0002).
9. No `git commit` and no `git push` by the assistant. The author commits after reviewing.
10. Stay on the current branch: no creating or deleting branches.

## Alternatives considered

Letting the assistant write the application code. Not chosen: the author must be able to explain every line, so he writes it and uses the assistant to explain and review.

## Consequences

- Progress on the frontend is slower than with generated code, and the author owns the result.
- The rules are written instructions to a tool. They are not technical protections: nothing in the repository enforces them.
- The rule on `src/` has an exception ("unless asked explicitly"), which allowed the one-line CORS change in `src/main.ts`.
- Frontend commands (dev, lint, build) are listed in `CLAUDE.md`. There is no frontend test script yet.

## Verification

### Proven

- The rules are in `CLAUDE.md` at the repository root. The frontend rules were first committed in `dd036cb`; the frontend commands and the lint and build rule were added afterwards.

### Not proven

- That the assistant follows each rule in every session: it has not been measured.
- Whether the rules are enough to prevent a secret from reaching the frontend: no frontend code exists yet.