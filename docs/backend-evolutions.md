# Backend evolutions to consider

Changes in `src/` that would help the frontend or the project. None of them is done. Each item says how it is known: **Observed** (seen when running the application) or **From the code** (read in the source, not tested).

1. **An unknown account returns 500, not 404.** Observed: a lookup of an unknown account ID returns HTTP 500 "Internal server error". From the code: `getAccountInfo` wraps every error in `new Error(...)`. Effect: the frontend can only show a generic message. Needs a proper HTTP exception and tests.
2. **Other errors are probably 500 too.** From the code: `transferHbar` and the tokens service throw plain errors, and the tokens controller documents a 400 in Swagger. A failing transfer (for example an insufficient balance) was not tried, so the real status is not known.
3. **The account lookup returns token IDs only.** Observed: an account that received 10 tokens shows `Token associations: 1` and nothing else. From the code: `tokenAssociations` is built from `rel.tokenId.toString()`. Returning the balance and the symbol of each token needs a change of the response shape, and so changes in the tests, Swagger and the README. What the SDK provides for each relation was not checked.
4. **Amounts are formatted strings.** Observed: `hbarBalance` is `"3.99888384 ℏ"` and the `amount` of a transfer is `"1 ℏ"`. A number and a unit would be easier to use.
5. **There is no endpoint to list the tokens.** From the code: created tokens are saved in SQLite (`TokenEntity`), but nothing reads them back.
6. **The treasury of a new token is always the operator account.** From the code: `createToken` uses the operator account as treasury and admin key. To send the new tokens, the operator key must be typed in the frontend (see ADR 0001).
7. **No authentication, and keys in request bodies.** ADR 0001 states that the backend has no authentication. The tokens controller has no guard, so anyone who reaches the API can create tokens paid by the operator account. Signing with a wallet is the evolution named in ADR 0001.
8. **Minimum amounts.** From the DTOs: a HBAR transfer needs `amount >= 1`, so less than 1 HBAR cannot be sent. Token amounts are integers, and tokens are created with 0 decimals.
9. **The CORS origin is written in the code.** `src/main.ts` allows `http://localhost:3001` only. A deployment would need it to come from a variable.
10. **Two pairs of environment variables** (`OPERATOR_*` and `HEDERA_*`) for what can be one account (ADR 0003).
11. **Folder layout.** The backend is at the repository root. Moving it to `backend/` is postponed (ADR 0002, decision 6).
12. **A Jest warning** ("worker process has failed to exit gracefully") appeared once, with an unknown cause (ADR 0002).
