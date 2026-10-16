import Link from "next/link";
import type { ReactNode } from "react";
import { Eyebrow } from "./ui";
import { RevealLines, Reveal } from "./Reveal";

export function PageHero({
  eyebrow,
  title,
  intro,
  crumbs = [],
  children,
}: {
  eyebrow: string;
  title: ReactNode[];
  intro?: ReactNode;
  crumbs?: { label: string; href: string }[];
  children?: ReactNode;
}) {
  return (
    <section data-header="dark" className="bg-ink pb-16 pt-36 text-white md:pb-24 md:pt-48">
      <div className="container-x">
        <nav aria-label="Fil d'Ariane" className="mb-10 text-xs text-white/50">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-white">
                Accueil
              </Link>
            </li>
            {crumbs.map((c) => (
              <li key={c.href} className="flex items-center gap-2">
                <span aria-hidden>/</span>
                <Link href={c.href} className="hover:text-white">
                  {c.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <Eyebrow tone="light">{eyebrow}</Eyebrow>
        <h1 className="display-lg mt-8 max-w-6xl">
          <RevealLines lines={title} />
        </h1>
        {intro && (
          <Reveal delay={0.2} className="mt-10 max-w-2xl text-lg leading-relaxed text-white/70">
            {intro}
          </Reveal>
        )}
        {children && <Reveal delay={0.3} className="mt-10">{children}</Reveal>}
      </div>
    </section>
  );
}

/** Encadré signalant les données à faire valider par le club. */
export function ValidationNote({ children }: { children: ReactNode }) {
  return (
    <aside className="flex gap-4 border-l-2 border-signal bg-white p-5 text-sm leading-relaxed text-muted-strong">
      <span className="eyebrow shrink-0 pt-0.5 text-[0.65rem] text-ink">À noter</span>
      <div>{children}</div>
    </aside>
  );
}
