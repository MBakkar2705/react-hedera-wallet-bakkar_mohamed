import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Hedera Minimalist Wallet
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Hedera testnet demo. Choose a section.
      </p>
      <ul className="flex flex-col gap-2">
        <li>
          <Link href="/accounts" className="font-medium underline">
            Accounts
          </Link>
        </li>
        <li>
          <Link href="/transfer" className="font-medium underline">
            Transfer HBAR
          </Link>
        </li>
        <li>
          <Link href="/tokens" className="font-medium underline">
            Tokens
          </Link>
        </li>
      </ul>
    </main>
  );
}
