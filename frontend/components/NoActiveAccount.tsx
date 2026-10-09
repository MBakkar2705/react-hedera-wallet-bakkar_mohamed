import Link from "next/link";
import { Callout } from "./ui/Callout";

// Shown instead of a form that needs the active account.
export function NoActiveAccount() {
  return (
    <Callout tone="info">
      <p>
        No active account.{" "}
        <Link
          href="/accounts"
          className="font-medium text-brand underline underline-offset-4"
        >
          Choose one on the Accounts page
        </Link>{" "}
        first.
      </p>
    </Callout>
  );
}
