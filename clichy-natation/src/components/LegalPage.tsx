import type { ReactNode } from "react";
import { PageHero } from "./PageHero";

export function LegalPage({ title, href, children }: { title: string; href: string; children: ReactNode }) {
  return (
    <>
      <PageHero eyebrow="Informations légales" title={[title]} crumbs={[{ label: title, href }]} />
      <section data-header="light" className="bg-paper py-16 md:py-24">
        <div className="container-x">
          <div className="max-w-3xl space-y-10 leading-relaxed text-muted-strong [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink [&_p+p]:mt-3 [&_a]:underline [&_strong]:text-ink">
            {children}
          </div>
        </div>
      </section>
    </>
  );
}
