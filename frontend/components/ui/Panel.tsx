import type { ReactNode } from "react";

// The title of a page, with one sentence that says what the page is for.
export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      {description && <p className="max-w-prose text-muted">{description}</p>}
    </header>
  );
}

// The sections of a page go in a PanelList. Each Panel puts its title and its
// explanation on the left and its content on the right.
export function PanelList({ children }: { children: ReactNode }) {
  return <div className="flex flex-col divide-y divide-line">{children}</div>;
}

export function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-4 py-8 first:pt-0 last:pb-0 md:grid-cols-[15rem_1fr] md:gap-10">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted">{description}</p>
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-4">{children}</div>
    </section>
  );
}
