"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { getErrorMessage } from "@/lib/api";
import { ACCOUNT_ID_PATTERN } from "@/lib/accounts";
import { useActiveAccount } from "@/lib/active-account";
import { buttonClass, inputClass } from "@/lib/styles";
import { transferHbar, type TransferHbarResult } from "@/lib/transfer";

export default function TransferPage() {
  const { account } = useActiveAccount();

  const [toAccountIdInput, setToAccountIdInput] = useState("");
  const [amountInput, setAmountInput] = useState("1");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TransferHbarResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!account) return;

    const toAccountId = toAccountIdInput.trim();
    const amount = Number(amountInput);

    if (!ACCOUNT_ID_PATTERN.test(toAccountId)) {
      setError("Enter a recipient account ID like 0.0.123456.");
      return;
    }
    // The backend requires an amount of at least 1 HBAR.
    if (amountInput.trim() === "" || !Number.isFinite(amount) || amount < 1) {
      setError("Enter an amount greater than or equal to 1.");
      return;
    }

    setSending(true);
    setError(null);
    setResult(null);
    try {
      setResult(
        await transferHbar({
          fromAccountId: account.accountId,
          fromPrivateKey: account.privateKey,
          toAccountId,
          amount,
        }),
      );
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Transfer HBAR</h1>

      {account ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <p>
            From account: <strong>{account.accountId}</strong>
          </p>
          <label className="flex flex-col gap-1">
            <span>Recipient account ID</span>
            <input
              className={inputClass}
              value={toAccountIdInput}
              onChange={(event) => setToAccountIdInput(event.target.value)}
              placeholder="0.0.123456"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span>Amount (HBAR, at least 1)</span>
            <input
              className={inputClass}
              value={amountInput}
              onChange={(event) => setAmountInput(event.target.value)}
              inputMode="decimal"
            />
          </label>
          <button type="submit" className={buttonClass} disabled={sending}>
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      ) : (
        <p>
          No active account.{" "}
          <Link href="/accounts" className="underline">
            Choose one on the Accounts page
          </Link>{" "}
          first.
        </p>
      )}

      {error && <p role="alert">{error}</p>}

      {result && (
        <div className="flex flex-col gap-1 rounded border border-black/20 p-4 dark:border-white/25">
          <p>Status: {result.status}</p>
          <p>
            {result.amount} sent from {result.from} to {result.to}
          </p>
          <p>Transaction ID:</p>
          <code className="break-all">{result.transactionId}</code>
        </div>
      )}
    </main>
  );
}
