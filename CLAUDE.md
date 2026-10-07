# Project: Hedera wallet backend

NestJS (TypeScript) backend that talks to the Hedera network (testnet) through @hashgraph/sdk.
Modules: accounts, tokens, topics (in src/). Tests: Jest.

## Commands
- Install: pnpm install
- Test: pnpm test   (4 suites, 20 tests; all must pass)

## Rules
- Never read, create or print any .env file or any private key.
- Do not modify anything in src/ unless I explicitly ask.
- Before writing files, tell me your plan in a few lines. After writing, explain each choice.
- Run pnpm test after any change and report the result.
- Do not run git commit or git push. I do the commits myself after reviewing.
- Stay on the current branch; do not create or delete branches.