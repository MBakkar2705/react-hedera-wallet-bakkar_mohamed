"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { getErrorMessage } from "@/lib/api";
import { ACCOUNT_ID_PATTERN } from "@/lib/accounts";
import { useActiveAccount } from "@/lib/active-account";
import { buttonClass, inputClass } from "@/lib/styles";
import {
  associateToken,
  createToken,
  transferToken,
  TOKEN_ID_PATTERN,
  type AssociateTokenResult,
  type CreatedToken,
  type TransferTokenResult,
} from "@/lib/tokens";

export default function TokensPage() {
  const { account } = useActiveAccount();

  // Create a token
  const [nameInput, setNameInput] = useState("");
  const [symbolInput, setSymbolInput] = useState("");
  const [supplyInput, setSupplyInput] = useState("1000");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedToken | null>(null);

  // Associate the active account with a token
  const [associateTokenInput, setAssociateTokenInput] = useState("");
  const [associating, setAssociating] = useState(false);
  const [associateError, setAssociateError] = useState<string | null>(null);
  const [associated, setAssociated] = useState<AssociateTokenResult | null>(
    null,
  );

  // Transfer a token from the active account
  const [toAccountIdInput, setToAccountIdInput] = useState("");
  const [transferTokenInput, setTransferTokenInput] = useState("");
  const [amountInput, setAmountInput] = useState("1");
  const [sending, setSending] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferred, setTransferred] = useState<TransferTokenResult | null>(
    null,
  );

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = nameInput.trim();
    const symbol = symbolInput.trim();
    const initialSupply = Number(supplyInput);

    if (name === "" || symbol === "") {
      setCreateError("Enter a name and a symbol.");
      return;
    }
    // The backend requires an integer of at least 1.
    if (
      supplyInput.trim() === "" ||
      !Number.isInteger(initialSupply) ||
      initialSupply < 1
    ) {
      setCreateError("Enter a whole number of tokens, at least 1.");
      return;
    }

    setCreating(true);
    setCreateError(null);
    setCreated(null);
    try {
      const token = await createToken({ name, symbol, initialSupply });
      setCreated(token);
      // Pre-fill the next forms with the new token.
      setAssociateTokenInput(token.tokenId);
      setTransferTokenInput(token.tokenId);
    } catch (caught) {
      setCreateError(getErrorMessage(caught));
    } finally {
      setCreating(false);
    }
  }

  async function handleAssociate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!account) return;

    const tokenId = associateTokenInput.trim();
    if (!TOKEN_ID_PATTERN.test(tokenId)) {
      setAssociateError("Enter a token ID like 0.0.123456.");
      return;
    }

    setAssociating(true);
    setAssociateError(null);
    setAssociated(null);
    try {
      setAssociated(
        await associateToken({
          accountId: account.accountId,
          privateKey: account.privateKey,
          tokenId,
        }),
      );
    } catch (caught) {
      setAssociateError(getErrorMessage(caught));
    } finally {
      setAssociating(false);
    }
  }

  async function handleTransfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!account) return;

    const toAccountId = toAccountIdInput.trim();
    const tokenId = transferTokenInput.trim();
    const amount = Number(amountInput);

    if (!ACCOUNT_ID_PATTERN.test(toAccountId)) {
      setTransferError("Enter a recipient account ID like 0.0.123456.");
      return;
    }
    if (!TOKEN_ID_PATTERN.test(tokenId)) {
      setTransferError("Enter a token ID like 0.0.123456.");
      return;
    }
    // The backend requires an integer of at least 1.
    if (
      amountInput.trim() === "" ||
      !Number.isInteger(amount) ||
      amount < 1
    ) {
      setTransferError("Enter a whole amount, at least 1.");
      return;
    }

    setSending(true);
    setTransferError(null);
    setTransferred(null);
    try {
      setTransferred(
        await transferToken({
          fromAccountId: account.accountId,
          fromPrivateKey: account.privateKey,
          toAccountId,
          tokenId,
          amount,
        }),
      );
    } catch (caught) {
      setTransferError(getErrorMessage(caught));
    } finally {
      setSending(false);
    }
  }

  const noActiveAccount = (
    <p>
      No active account.{" "}
      <Link href="/accounts" className="underline">
        Choose one on the Accounts page
      </Link>{" "}
      first.
    </p>
  );

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Tokens</h1>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium">Create a token</h2>
        <p>
          The new tokens are held by the operator account of the backend. To
          send them to another account, activate the operator account on the
          Accounts page.
        </p>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span>Name</span>
            <input
              className={inputClass}
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              placeholder="MyToken"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span>Symbol</span>
            <input
              className={inputClass}
              value={symbolInput}
              onChange={(event) => setSymbolInput(event.target.value)}
              placeholder="MTK"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span>Initial supply (whole number, at least 1)</span>
            <input
              className={inputClass}
              value={supplyInput}
              onChange={(event) => setSupplyInput(event.target.value)}
              inputMode="numeric"
            />
          </label>
          <button type="submit" className={buttonClass} disabled={creating}>
            {creating ? "Creating..." : "Create token"}
          </button>
        </form>

        {createError && <p role="alert">{createError}</p>}

        {created && (
          <div className="flex flex-col gap-1 rounded border border-black/20 p-4 dark:border-white/25">
            <p>
              Token <strong>{created.tokenId}</strong> created: {created.name} (
              {created.symbol}), supply {created.initialSupply}.
            </p>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium">Associate the active account</h2>
        {account ? (
          <form onSubmit={handleAssociate} className="flex flex-col gap-3">
            <p>
              Account: <strong>{account.accountId}</strong>
            </p>
            <label className="flex flex-col gap-1">
              <span>Token ID</span>
              <input
                className={inputClass}
                value={associateTokenInput}
                onChange={(event) => setAssociateTokenInput(event.target.value)}
                placeholder="0.0.123456"
              />
            </label>
            <button
              type="submit"
              className={buttonClass}
              disabled={associating}
            >
              {associating ? "Associating..." : "Associate"}
            </button>
          </form>
        ) : (
          noActiveAccount
        )}

        {associateError && <p role="alert">{associateError}</p>}

        {associated && (
          <div className="flex flex-col gap-1 rounded border border-black/20 p-4 dark:border-white/25">
            <p>Status: {associated.status}</p>
            <p>
              Account {associated.accountId} associated with token{" "}
              {associated.tokenId}.
            </p>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium">Transfer tokens</h2>
        {account ? (
          <form onSubmit={handleTransfer} className="flex flex-col gap-3">
            <p>
              From account: <strong>{account.accountId}</strong>
            </p>
            <label className="flex flex-col gap-1">
              <span>Recipient account ID (must be associated with the token)</span>
              <input
                className={inputClass}
                value={toAccountIdInput}
                onChange={(event) => setToAccountIdInput(event.target.value)}
                placeholder="0.0.123456"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Token ID</span>
              <input
                className={inputClass}
                value={transferTokenInput}
                onChange={(event) => setTransferTokenInput(event.target.value)}
                placeholder="0.0.123456"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Amount (whole number, at least 1)</span>
              <input
                className={inputClass}
                value={amountInput}
                onChange={(event) => setAmountInput(event.target.value)}
                inputMode="numeric"
              />
            </label>
            <button type="submit" className={buttonClass} disabled={sending}>
              {sending ? "Sending..." : "Send"}
            </button>
          </form>
        ) : (
          noActiveAccount
        )}

        {transferError && <p role="alert">{transferError}</p>}

        {transferred && (
          <div className="flex flex-col gap-1 rounded border border-black/20 p-4 dark:border-white/25">
            <p>Status: {transferred.status}</p>
            <p>
              {transferred.amount} of token {transferred.tokenId} sent from{" "}
              {transferred.from} to {transferred.to}
            </p>
            <p>Transaction ID:</p>
            <code className="break-all">{transferred.transactionId}</code>
          </div>
        )}
      </section>
    </main>
  );
}
