"use client";

import Link from "next/link";
import { useActiveAccount } from "@/lib/active-account";

// Shows which account is active. It never shows the private key.
export function ActiveAccountBar() {
  const { account, forget } = useActiveAccount();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-black/20 px-6 py-3 dark:border-white/25">
      <Link href="/" className="font-medium">
        Hedera Minimalist Wallet
      </Link>
      {account ? (
        <div className="flex items-center gap-3">
          <span>
            Active account: <strong>{account.accountId}</strong>
          </span>
          <button type="button" className="underline" onClick={forget}>
            Forget
          </button>
        </div>
      ) : (
        <span>No active account</span>
      )}
    </header>
  );
}
