# CLAUDE.md

## Project

NestJS backend (Hedera wallet API) at the repo root, source in `src/`. A Next.js frontend is being added in `frontend/` on a feature branch. The repo uses pnpm. I write the frontend code myself and must be able to explain every line of it.

## Commands (backend)

- Install: `pnpm install`
- Test: `pnpm test` (4 suites, 20 tests; all must pass)

## Rules

- Never read, create or print any `.env` file (including `.env.local`) or any private key.
- Never put a secret in frontend code. Anything prefixed `NEXT_PUBLIC_` is readable by any visitor: only the API base URL may go there, never `OPERATOR_ID`, `OPERATOR_KEY` or any private key.
- Some backend endpoints take a private key in the request body (Hedera testnet demo only). In the frontend, keys stay in page memory only: never in `localStorage`, `sessionStorage`, cookies, URLs or logs.
- Work only in `frontend/`. Do not modify `src/`, the `Dockerfile`, `.github/`, the root `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `jest.config.js`, `nest-cli.json`, `tsconfig*.json` or `eslint.config.mjs` unless I explicitly ask.
- I write the application code in `frontend/` (pages, components, hooks, API calls). Do not write it unless I explicitly ask. Explain, review, point out bugs, propose plans and ask me questions.
- Before writing any file, tell me your plan in a few lines. After writing, explain each choice.
- Backend: run `pnpm test` at the repo root after any change that touches the backend, and report the result. Frontend commands (install, dev, build, test) are not defined yet: do not assume them. I will add them here once `frontend/package.json` exists.
- Keep the API base URL in a single place in the frontend, and do not import code between `frontend/` and `src/`, so the backend can later be split into services without changing the frontend.
- Do not run `git commit` or `git push`. I do the commits myself after reviewing.
- Stay on the current branch; do not create or delete branches.
