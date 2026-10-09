"use client";

import Link from "next/link";
import { useActiveAccount } from "@/lib/active-account";

// Shows which account is active. It never shows the private key.
export function ActiveAccountBar() {
  const { account, forget } = useActiveAccount();

  if (!account) {
    return (
      <Link
        href="/accounts"
        className="rounded-full border border-dashed border-line px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        No active account
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-3 pr-1 text-sm">
      <span aria-hidden className="size-2 rounded-full bg-success" />
      <span className="text-muted">Active account</span>
      <strong className="font-mono font-semibold">{account.accountId}</strong>
      <button
        type="button"
        onClick={forget}
        className="rounded-full px-3 py-1 font-medium text-brand transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-brand"
      >
        Forget
      </button>
    </div>
  );
}
