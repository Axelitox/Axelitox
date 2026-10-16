import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { Reveal } from "./Reveal";

/** Barre secondaire collante : nom de la page à gauche, raccourcis et pilule « S'inscrire » à droite. */
export function LocalNav({ title, href, links = [] }: { title: string; href: string; links?: { label: string; href: string }[] }) {
  return (
    <div className="sticky top-0 z-40 border-b border-ink/10 bg-[rgba(255,255,255,0.8)] backdrop-blur-xl backdrop-saturate-[1.8]">
      <div className="container-x flex h-[52px] items-center justify-between gap-4">
        <Link href={href} className="truncate text-[19px] font-semibold tracking-[-0.01em] md:text-[21px]">
          {title}
        </Link>
        <nav aria-label="Sur cette page" className="flex shrink-0 items-center gap-5">
          <ul className="hidden items-center gap-5 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-[12px] text-ink/80 hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/inscriptions" className="rounded-full bg-signal px-3 py-1 text-[12px] font-medium text-ink hover:brightness-95">
            S&apos;inscrire
          </Link>
        </nav>
      </div>
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  intro,
  crumbs = [],
  links,
  children,
}: {
  eyebrow: string;
  title: ReactNode[];
  intro?: ReactNode;
  crumbs?: { label: string; href: string }[];
  links?: { label: string; href: string }[];
  children?: ReactNode;
}) {
  const current = crumbs[crumbs.length - 1] ?? { label: eyebrow, href: "/" };
  return (
    <>
      <LocalNav title={current.label} href={current.href} links={links} />
      <section className="bg-white pb-14 pt-16 text-center md:pb-20 md:pt-24">
        <div className="container-x">
          <Reveal y={12}>
            <p className="text-[17px] font-semibold text-muted-strong md:text-[21px]">{eyebrow}</p>
            <h1 className="display-xl mx-auto mt-2 max-w-4xl">
              {title.map((t, i) => (
                <Fragment key={i}>
                  {i > 0 && " "}
                  {t}
                </Fragment>
              ))}
            </h1>
          </Reveal>
          {intro && (
            <Reveal delay={0.1} y={12} className="subhead mx-auto mt-5 max-w-2xl text-muted-strong">
              {intro}
            </Reveal>
          )}
          {children && (
            <Reveal delay={0.2} y={12} className="mt-8 flex justify-center [&>*]:justify-center">
              {children}
            </Reveal>
          )}
        </div>
      </section>
    </>
  );
}

/** Encadré signalant les données à faire valider par le club. */
export function ValidationNote({ children }: { children: ReactNode }) {
  return (
    <aside className="flex gap-4 rounded-[18px] bg-paper p-5 text-[14px] leading-relaxed text-muted-strong">
      <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full bg-signal ring-1 ring-ink/30" />
      <div>{children}</div>
    </aside>
  );
}
