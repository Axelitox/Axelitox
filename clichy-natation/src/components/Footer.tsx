import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { activities } from "@/data/activities";
import { legalNav, site } from "@/lib/site";

const columns = [
  {
    title: "Activités",
    items: activities.map((a) => ({ label: a.name, href: `/activites/${a.slug}` })),
  },
  {
    title: "Nager au club",
    items: [
      { label: "Planning & tarifs", href: "/planning-tarifs" },
      { label: "Inscriptions", href: "/inscriptions" },
      { label: "Espace adhérent", href: site.links.memberArea },
      { label: "Boutique", href: "/boutique" },
    ],
  },
  {
    title: "Le club",
    items: [
      { label: "À propos", href: "/le-club" },
      { label: "La piscine", href: "/piscine" },
      { label: "Compétition", href: "/competition" },
      { label: "Actualités", href: "/actualites" },
    ],
  },
  {
    title: "Contact",
    items: [
      { label: "Nous écrire", href: "/contact" },
      { label: "Itinéraire", href: site.mapsUrl },
      ...site.social.map((s) => ({ label: s.label, href: s.href })),
    ],
  },
];

const external = (href: string) => /^https?:\/\//.test(href);

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-paper text-[12px] leading-[1.33] text-muted-strong">
      <div className="container-x py-5">
        <div className="space-y-2 border-b border-ink/15 pb-4">
          <p>
            Les tarifs et horaires marqués « À actualiser » proviennent d&apos;une saison précédente et seront confirmés par le
            club pour 2026/2027. Les tarifs annuels s&apos;entendent pour un cours hebdomadaire sur les périodes scolaires, hors
            vacances de la zone C.
          </p>
          <p>
            Les photographies de nageurs mineurs ne sont publiées qu&apos;avec l&apos;autorisation de leurs représentants légaux.
          </p>
        </div>

        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1 border-b border-ink/15 py-3 text-ink/80">
          <Link href="/" className="font-semibold text-ink">
            CS Clichy 92
          </Link>
          <ChevronRight aria-hidden className="size-3" />
          <span>Natation</span>
        </nav>

        <div className="grid grid-cols-1 gap-x-6 py-5 sm:grid-cols-2 md:grid-cols-4">
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title} className="border-b border-ink/10 py-3 sm:border-0 sm:py-0 sm:pb-6">
              <p className="mb-2 font-semibold text-ink">{col.title}</p>
              <ul className="space-y-2">
                {col.items.map((i) => (
                  <li key={i.label}>
                    {external(i.href) ? (
                      <a href={i.href} target="_blank" rel="noopener noreferrer" className="hover:text-ink hover:underline">
                        {i.label}
                      </a>
                    ) : (
                      <Link href={i.href} className="hover:text-ink hover:underline">
                        {i.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p className="pb-3">
          D&apos;autres questions ? Écrivez-nous à{" "}
          <a href={`mailto:${site.email}`} className="text-ink underline">
            {site.email}
          </a>{" "}
          ou passez à la {site.address.venue}, {site.address.street}, {site.address.postalCode} {site.address.city}.
        </p>

        <div className="flex flex-col gap-2 border-t border-ink/15 py-4 md:flex-row md:items-center md:justify-between">
          <p>
            Copyright © {year} {site.legalName}. Association loi 1901 — SIREN {site.siren}.
          </p>
          <ul className="flex flex-wrap items-center">
            {legalNav.map((l, i) => (
              <li key={l.href} className="flex items-center">
                {i > 0 && <span aria-hidden className="mx-2 h-3 w-px bg-ink/20" />}
                <Link href={l.href} className="text-ink/80 hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-ink/80">France</p>
        </div>
      </div>
    </footer>
  );
}
