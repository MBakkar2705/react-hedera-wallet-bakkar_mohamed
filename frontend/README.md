# Frontend of the Hedera Minimalist Wallet

Next.js 16.4.0 application (App Router, React 19.3.0, Tailwind CSS 4). It calls the REST API of the backend, which is in the `backend/` folder at the root of the repository, and has four screens: `/accounts`, `/transfer`, `/tokens` and `/topics`.

## Run

From the repository root, with the backend running on http://localhost:3000:

```
pnpm install
pnpm --filter frontend dev
```

The dev server listens on http://localhost:3001. The backend allows only this origin (CORS).

## Scripts

`dev`, `build`, `start` and `lint` are defined in `package.json`. From the repository root, run them with `pnpm --filter frontend <script>`. There is no test script yet.

## Configuration

The API address is defined in one place, `lib/api.ts` (variable `NEXT_PUBLIC_API_URL`, default `http://localhost:3000`). Only this public address may use `NEXT_PUBLIC_`: never put a secret there.

## More

The README at the root of the repository describes the whole project. The private keys, the active account and the design are explained in ADR 0009, ADR 0010 and ADR 0011 in `docs/adr/`.
