"use client";

import { useState, type FormEvent } from "react";
import { getErrorMessage } from "@/lib/api";
import {
  ACCOUNT_ID_PATTERN,
  createAccount,
  getAccount,
  type AccountInfo,
  type CreatedAccount,
} from "@/lib/accounts";
import {
  INACTIVITY_LIMIT_MINUTES,
  useActiveAccount,
} from "@/lib/active-account";
import { buttonClass, inputClass } from "@/lib/styles";

export default function AccountsPage() {
  const { activate } = useActiveAccount();

  // Create an account
  const [balanceInput, setBalanceInput] = useState("10");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedAccount | null>(null);

  // Look up an account
  const [accountIdInput, setAccountIdInput] = useState("");
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [info, setInfo] = useState<AccountInfo | null>(null);

  // Use an existing account
  const [activateIdInput, setActivateIdInput] = useState("");
  const [activateKeyInput, setActivateKeyInput] = useState("");
  const [activateError, setActivateError] = useState<string | null>(null);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const initialBalance = Number(balanceInput);
    if (
      balanceInput.trim() === "" ||
      !Number.isFinite(initialBalance) ||
      initialBalance < 0
    ) {
      setCreateError("Enter a number greater than or equal to 0.");
      return;
    }

    setCreating(true);
    setCreateError(null);
    setCreated(null);
    try {
      setCreated(await createAccount(initialBalance));
    } catch (error) {
      setCreateError(getErrorMessage(error));
    } finally {
      setCreating(false);
    }
  }

  async function handleLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const accountId = accountIdInput.trim();
    if (!ACCOUNT_ID_PATTERN.test(accountId)) {
      setLookupError("Enter an account ID like 0.0.123456.");
      return;
    }

    setLookingUp(true);
    setLookupError(null);
    setInfo(null);
    try {
      setInfo(await getAccount(accountId));
    } catch (error) {
      setLookupError(getErrorMessage(error));
    } finally {
      setLookingUp(false);
    }
  }

  function handleActivate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const accountId = activateIdInput.trim();
    const privateKey = activateKeyInput.trim();
    if (!ACCOUNT_ID_PATTERN.test(accountId)) {
      setActivateError("Enter an account ID like 0.0.123456.");
      return;
    }
    if (privateKey === "") {
      setActivateError("Enter the private key of this account.");
      return;
    }

    activate({ accountId, privateKey });
    setActivateError(null);
    // The key must not stay in the form once it is in the active account.
    setActivateKeyInput("");
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Accounts</h1>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium">Create an account</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span>Initial balance (HBAR)</span>
            <input
              className={inputClass}
              value={balanceInput}
              onChange={(event) => setBalanceInput(event.target.value)}
              inputMode="decimal"
            />
          </label>
          <button type="submit" className={buttonClass} disabled={creating}>
            {creating ? "Creating..." : "Create account"}
          </button>
        </form>

        {createError && <p role="alert">{createError}</p>}

        {created && (
          <div className="flex flex-col gap-2 rounded border border-black/20 p-4 dark:border-white/25">
            <p>
              Account <strong>{created.accountId}</strong> created with{" "}
              {created.initialBalance} HBAR.
            </p>
            <p>Public key:</p>
            <code className="break-all">{created.publicKey}</code>
            <p>Private key (testnet only):</p>
            <code className="break-all">{created.privateKey}</code>
            <p>
              Copy the private key now. It is kept in this page&apos;s memory
              only and is lost when you reload or hide it.
            </p>
            <button
              type="button"
              className={buttonClass}
              onClick={() =>
                activate({
                  accountId: created.accountId,
                  privateKey: created.privateKey,
                })
              }
            >
              Use this account
            </button>
            <button
              type="button"
              className={buttonClass}
              onClick={() => setCreated(null)}
            >
              Hide the keys
            </button>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium">Look up an account</h2>
        <form onSubmit={handleLookup} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span>Account ID</span>
            <input
              className={inputClass}
              value={accountIdInput}
              onChange={(event) => setAccountIdInput(event.target.value)}
              placeholder="0.0.123456"
            />
          </label>
          <button type="submit" className={buttonClass} disabled={lookingUp}>
            {lookingUp ? "Searching..." : "Get balance"}
          </button>
        </form>

        {lookupError && <p role="alert">{lookupError}</p>}

        {info && (
          <div className="rounded border border-black/20 p-4 dark:border-white/25">
            <p>
              Account <strong>{info.accountId}</strong>
            </p>
            <p>Balance: {info.hbarBalance}</p>
            <p>Token associations: {info.tokenAssociations.length}</p>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium">Use an existing account</h2>
        <form onSubmit={handleActivate} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span>Account ID</span>
            <input
              className={inputClass}
              value={activateIdInput}
              onChange={(event) => setActivateIdInput(event.target.value)}
              placeholder="0.0.123456"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span>Private key (testnet only)</span>
            {/* Not type="password": the browser would offer to save the key
                in its password manager. The characters are hidden with CSS. */}
            <input
              className={`${inputClass} [-webkit-text-security:disc]`}
              type="text"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              value={activateKeyInput}
              onChange={(event) => setActivateKeyInput(event.target.value)}
            />
          </label>
          <button type="submit" className={buttonClass}>
            Use this account
          </button>
        </form>

        {activateError && <p role="alert">{activateError}</p>}

        <p>
          The active account is kept in memory only. It is forgotten when you
          click Forget, after {INACTIVITY_LIMIT_MINUTES} minutes without a
          click or key press, or when you reload the page.
        </p>
      </section>
    </main>
  );
}
