"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";

type CopyStatus = "idle" | "copied" | "failed";

// An identifier or a key in a monospace font, with a Copy button.
// "warning" is shown under the value, for example for a private key.
export function CodeValue({
  label,
  value,
  warning,
}: {
  label: string;
  value: string;
  warning?: string;
}) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    if (timer.current) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    timer.current = setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-start gap-2">
        <code className="min-w-0 flex-1 select-all break-all rounded-lg bg-surface px-3 py-2 font-mono text-sm">
          {value}
        </code>
        <Button variant="secondary" className="shrink-0" onClick={copy}>
          {status === "copied" ? "Copied" : "Copy"}
        </Button>
      </div>
      {status === "failed" && (
        <span className="text-sm text-danger" role="status">
          Could not copy. Select the text and press Ctrl+C.
        </span>
      )}
      {warning && <span className="text-sm text-muted">{warning}</span>}
    </div>
  );
}
