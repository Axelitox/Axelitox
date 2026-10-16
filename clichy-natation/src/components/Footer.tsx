import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { footerNav, legalNav, site } from "@/lib/site";
import { Logo } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer data-header="dark" className="overflow-hidden bg-ink text-white">
      <div className="container-x pt-20 md:pt-28">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-4">
            <Logo tone="light" />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/60">
              Club de natation et d&apos;activités aquatiques à Clichy. Apprendre, progresser, performer — ensemble.
            </p>
            <ul className="mt-8 flex gap-5">
              {site.social.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/70 transition-colors hover:text-signal"
                  >
                    {s.label}
                    <span className="sr-only"> (nouvel onglet)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {footerNav.map((col) => (
            <nav key={col.title} aria-label={col.title} className="md:col-span-2">
              <p className="eyebrow text-white/40">{col.title}</p>
              <ul className="mt-5 space-y-3">
                {col.items.map((i) => (
                  <li key={i.href}>
                    <Link href={i.href} className="text-sm text-white/80 transition-colors hover:text-signal">
                      {i.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="md:col-span-4">
            <p className="eyebrow text-white/40">Nous trouver</p>
            <address className="mt-5 space-y-1 text-sm not-italic leading-relaxed text-white/80">
              <span className="block">{site.address.venue}</span>
              <span className="block">{site.address.street}</span>
              <span className="block">
                {site.address.postalCode} {site.address.city}
              </span>
            </address>
            <a href={`mailto:${site.email}`} className="mt-5 block text-sm text-white hover:text-signal">
              {site.email}
            </a>
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-signal"
            >
              Itinéraire <ArrowUpRight aria-hidden className="size-3.5" />
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-white/10 py-6 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {site.legalName} · Association loi 1901 · SIREN {site.siren}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legalNav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p
        aria-hidden
        className="select-none whitespace-nowrap pb-2 text-center font-display text-[7.4vw] font-bold uppercase leading-[0.8] tracking-[-0.06em] text-white/[0.06]"
      >
        CS Clichy 92 Natation
      </p>
    </footer>
  );
}
