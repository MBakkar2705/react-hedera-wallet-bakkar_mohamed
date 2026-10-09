"use client";

import { useState, type FormEvent } from "react";
import { getErrorMessage } from "@/lib/api";
import { ACCOUNT_ID_PATTERN } from "@/lib/accounts";
import { useActiveAccount } from "@/lib/active-account";
import { transferHbar, type TransferHbarResult } from "@/lib/transfer";
import { NoActiveAccount } from "@/components/NoActiveAccount";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { CodeValue } from "@/components/ui/CodeValue";
import { Field, Input } from "@/components/ui/Field";
import { PageHeader, Panel, PanelList } from "@/components/ui/Panel";

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
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-6 py-10">
      <PageHeader
        title="Transfer HBAR"
        description="Send HBAR from the active account to another account."
      />

      <PanelList>
        <Panel
          title="Send HBAR"
          description="Signed with the active account. The amount must be at least 1 HBAR."
        >
          {account ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <p>
                From account:{" "}
                <strong className="font-mono">{account.accountId}</strong>
              </p>
              <Field label="Recipient account ID">
                <Input
                  value={toAccountIdInput}
                  onChange={(event) => setToAccountIdInput(event.target.value)}
                  placeholder="0.0.123456"
                />
              </Field>
              <Field label="Amount (HBAR, at least 1)">
                <Input
                  value={amountInput}
                  onChange={(event) => setAmountInput(event.target.value)}
                  inputMode="decimal"
                />
              </Field>
              <Button type="submit" disabled={sending}>
                {sending ? "Sending..." : "Send"}
              </Button>
            </form>
          ) : (
            <NoActiveAccount />
          )}

          {error && <Callout tone="danger">{error}</Callout>}

          {result && (
            <Callout tone="success">
              <p>Status: {result.status}</p>
              <p>
                {result.amount} sent from {result.from} to {result.to}
              </p>
              <CodeValue label="Transaction ID" value={result.transactionId} />
            </Callout>
          )}
        </Panel>
      </PanelList>
    </main>
  );
}
