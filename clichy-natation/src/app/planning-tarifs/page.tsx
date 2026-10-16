import type { Metadata } from "next";
import Link from "next/link";
import { activities } from "@/data/activities";
import { prices, pricingNotes } from "@/data/pricing";
import { scheduleGaps } from "@/data/schedule";
import { site } from "@/lib/site";
import { PageHero, ValidationNote } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { ScheduleExplorer } from "@/components/ScheduleExplorer";
import { RegistrationBand } from "@/components/RegistrationBand";
import { Button, Eyebrow, StatusBadge, formatPrice } from "@/components/ui";

export const metadata: Metadata = {
  title: "Planning & Tarifs",
  description:
    "Horaires des cours et tarifs du CS Clichy 92 Natation : école de natation, bébés nageurs, natation adultes, aquabike, handisport. Piscine Gérard Durant, Clichy.",
  alternates: { canonical: "/planning-tarifs" },
};

export default function PlanningPage() {
  return (
    <>
      <PageHero
        eyebrow="Planning & Tarifs"
        title={["Votre natation.", <span key="r">Votre rythme<span className="text-signal">.</span></span>]}
        intro={<p>Trouvez en quelques secondes un créneau adapté à votre âge et à votre niveau, puis inscrivez-vous en ligne.</p>}
        crumbs={[{ label: "Planning & Tarifs", href: "/planning-tarifs" }]}
        links={[
          { label: "Planning", href: "#planning" },
          { label: "Tarifs", href: "#tarifs" },
          { label: "Infos pratiques", href: "#pratique" },
        ]}
      >
        <nav aria-label="Accès rapide" className="flex flex-wrap gap-3">
          <Button href="#planning" variant="outline-dark" icon="right">
            Planning
          </Button>
          <Button href="#tarifs" variant="outline-dark" icon="right">
            Tarifs
          </Button>
          <Button href="#pratique" variant="outline-dark" icon="right">
            Infos pratiques
          </Button>
        </nav>
      </PageHero>

      <section id="planning" data-header="light" className="bg-paper py-20 md:py-28">
        <div className="container-x">
          <div className="grid gap-8 md:grid-cols-12">
            <div className="md:col-span-6">
              <Eyebrow>Planning hebdomadaire</Eyebrow>
              <h2 className="display-md mt-8">Les créneaux</h2>
            </div>
            <div className="md:col-span-5 md:col-start-8">
              <ValidationNote>
                Les créneaux de l&apos;école de natation proviennent d&apos;une saison précédente (années de naissance
                antérieures) et sont marqués « À actualiser ». Les créneaux handisport proviennent de la fiche du Comité
                Handisport 92. Le planning définitif 2026/2027 est confirmé lors de l&apos;inscription en ligne.
              </ValidationNote>
            </div>
          </div>
          <div className="mt-12">
            <ScheduleExplorer />
          </div>
          <ul className="mt-10 grid gap-px border border-ink/10 bg-ink/10 md:grid-cols-3">
            {scheduleGaps.map((g) => (
              <li key={g.label} className="bg-paper p-6">
                <p className="font-medium">{g.label}</p>
                <p className="mt-2 text-sm text-muted-strong">{g.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="tarifs" data-header="light" className="bg-white py-20 md:py-28">
        <div className="container-x">
          <Eyebrow>Tarifs annuels & à la séance</Eyebrow>
          <h2 className="display-md mt-8">Les tarifs</h2>
          <div className="mt-12 divide-y divide-ink/10 border-y border-ink/10">
            {activities.map((a) => {
              const list = prices.filter((p) => p.activity === a.slug);
              return (
                <Reveal key={a.slug} className="grid gap-6 py-8 md:grid-cols-12">
                  <div className="md:col-span-4">
                    <Link href={`/activites/${a.slug}`} className="font-display text-2xl font-semibold tracking-tight hover:underline">
                      {a.name}
                    </Link>
                    <p className="mt-1 text-sm text-muted-strong">{a.audience}</p>
                  </div>
                  <ul className="grid gap-3 md:col-span-8">
                    {list.map((p) => (
                      <li key={p.label} className="flex flex-col gap-3 border border-ink/10 bg-paper p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-medium">{p.label}</p>
                          <p className="mt-1 text-sm text-muted-strong">{p.detail}</p>
                          <StatusBadge status={p.status} className="mt-2" />
                        </div>
                        <p className="shrink-0 font-display text-3xl font-semibold tabular-nums">
                          {formatPrice(p.amount)}
                          {p.amount !== null && <span className="ml-1 text-sm font-normal text-muted-strong">/ {p.unit}</span>}
                        </p>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              );
            })}
          </div>
          <div className="mt-8">
            <ValidationNote>
              La page « Tarifs » du site d&apos;origine mentionne une « nouveauté 2020 » : les montants marqués « À
              actualiser » doivent être confirmés par le club pour la saison 2026/2027. Le tarif bébés nageurs provient
              d&apos;un guide tiers.
            </ValidationNote>
          </div>
        </div>
      </section>

      <section id="pratique" data-header="dark" className="bg-ink py-20 text-white md:py-28">
        <div className="container-x grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Eyebrow tone="light">Infos pratiques</Eyebrow>
            <h2 className="display-md mt-8">Bon à savoir</h2>
          </div>
          <ul className="space-y-6 md:col-span-6 md:col-start-7">
            {[
              ...pricingNotes,
              "Certificat médical : uniquement pour les activités adultes, téléchargé lors de l'inscription (valable 3 ans).",
              `Lieu : ${site.address.venue}, ${site.address.street}, ${site.address.postalCode} ${site.address.city}.`,
              "Bonnet de bain obligatoire.",
            ].map((t) => (
              <li key={t} className="flex gap-4 border-b border-white/10 pb-6 text-white/80">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 bg-signal" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <RegistrationBand />
    </>
  );
}
