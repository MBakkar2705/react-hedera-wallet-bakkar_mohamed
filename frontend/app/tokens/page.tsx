"use client";

import { useState, type FormEvent } from "react";
import { getErrorMessage } from "@/lib/api";
import { ACCOUNT_ID_PATTERN } from "@/lib/accounts";
import { useActiveAccount } from "@/lib/active-account";
import {
  associateToken,
  createToken,
  transferToken,
  TOKEN_ID_PATTERN,
  type AssociateTokenResult,
  type CreatedToken,
  type TransferTokenResult,
} from "@/lib/tokens";
import { NoActiveAccount } from "@/components/NoActiveAccount";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { CodeValue } from "@/components/ui/CodeValue";
import { Field, Input } from "@/components/ui/Field";
import { PageHeader, Panel, PanelList } from "@/components/ui/Panel";

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

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-6 py-10">
      <PageHeader
        title="Tokens"
        description="Create a token, associate an account with it, and send tokens between accounts."
      />

      <PanelList>
        <Panel
          title="Create a token"
          description="The new tokens are held by the operator account of the backend. To send them to another account, activate the operator account on the Accounts page."
        >
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Field label="Name">
              <Input
                value={nameInput}
                onChange={(event) => setNameInput(event.target.value)}
                placeholder="MyToken"
              />
            </Field>
            <Field label="Symbol">
              <Input
                value={symbolInput}
                onChange={(event) => setSymbolInput(event.target.value)}
                placeholder="MTK"
              />
            </Field>
            <Field label="Initial supply (whole number, at least 1)">
              <Input
                value={supplyInput}
                onChange={(event) => setSupplyInput(event.target.value)}
                inputMode="numeric"
              />
            </Field>
            <Button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create token"}
            </Button>
          </form>

          {createError && <Callout tone="danger">{createError}</Callout>}

          {created && (
            <Callout tone="success">
              <p>
                Token <strong>{created.tokenId}</strong> created:{" "}
                {created.name} ({created.symbol}), supply{" "}
                {created.initialSupply}.
              </p>
              <CodeValue label="Token ID" value={created.tokenId} />
            </Callout>
          )}
        </Panel>

        <Panel
          title="Associate the active account"
          description="An account must be associated with a token before it can receive it. This uses the active account."
        >
          {account ? (
            <form onSubmit={handleAssociate} className="flex flex-col gap-4">
              <p>
                Account:{" "}
                <strong className="font-mono">{account.accountId}</strong>
              </p>
              <Field label="Token ID">
                <Input
                  value={associateTokenInput}
                  onChange={(event) =>
                    setAssociateTokenInput(event.target.value)
                  }
                  placeholder="0.0.123456"
                />
              </Field>
              <Button type="submit" disabled={associating}>
                {associating ? "Associating..." : "Associate"}
              </Button>
            </form>
          ) : (
            <NoActiveAccount />
          )}

          {associateError && <Callout tone="danger">{associateError}</Callout>}

          {associated && (
            <Callout tone="success">
              <p>Status: {associated.status}</p>
              <p>
                Account {associated.accountId} associated with token{" "}
                {associated.tokenId}.
              </p>
            </Callout>
          )}
        </Panel>

        <Panel
          title="Transfer tokens"
          description="Sent from the active account. The recipient must be associated with the token first."
        >
          {account ? (
            <form onSubmit={handleTransfer} className="flex flex-col gap-4">
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
              <Field label="Token ID">
                <Input
                  value={transferTokenInput}
                  onChange={(event) =>
                    setTransferTokenInput(event.target.value)
                  }
                  placeholder="0.0.123456"
                />
              </Field>
              <Field label="Amount (whole number, at least 1)">
                <Input
                  value={amountInput}
                  onChange={(event) => setAmountInput(event.target.value)}
                  inputMode="numeric"
                />
              </Field>
              <Button type="submit" disabled={sending}>
                {sending ? "Sending..." : "Send"}
              </Button>
            </form>
          ) : (
            <NoActiveAccount />
          )}

          {transferError && <Callout tone="danger">{transferError}</Callout>}

          {transferred && (
            <Callout tone="success">
              <p>Status: {transferred.status}</p>
              <p>
                {transferred.amount} of token {transferred.tokenId} sent from{" "}
                {transferred.from} to {transferred.to}
              </p>
              <CodeValue
                label="Transaction ID"
                value={transferred.transactionId}
              />
            </Callout>
          )}
        </Panel>
      </PanelList>
    </main>
  );
}
