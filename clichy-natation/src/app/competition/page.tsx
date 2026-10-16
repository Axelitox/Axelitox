import type { Metadata } from "next";
import { media } from "@/data/media";
import { site } from "@/lib/site";
import { PageHero } from "@/components/PageHero";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { RegistrationBand } from "@/components/RegistrationBand";
import { Button, Eyebrow, TextLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "Compétition & résultats",
  description:
    "La section compétition du CS Clichy 92 Natation : groupes, niveaux de compétition, résultats et archives.",
  alternates: { canonical: "/competition" },
};

const levels = [
  { k: "Départemental", t: "Premières compétitions, dès 8 ans." },
  { k: "Régional", t: "Meetings et championnats régionaux." },
  { k: "National", t: "Championnats de France, Interclubs, Coupe de France des départements." },
];

export default function CompetitionPage() {
  return (
    <>
      <PageHero
        eyebrow="Compétition & résultats"
        title={["L'ambition", <span key="s" className="text-signal">se cultive.</span>]}
        intro={
          <p>
            Des bases techniques des quatre nages jusqu&apos;à la participation à des compétitions de haut niveau, les
            nageurs du club sont répartis en groupes, du groupe jeunes au groupe élite.
          </p>
        }
        crumbs={[{ label: "Compétition", href: "/competition" }]}
      >
        <Button href={site.links.results} size="lg">
          Résultats sur abcnatation
        </Button>
      </PageHero>

      <section data-header="light" className="bg-paper py-20 md:py-32">
        <div className="container-x grid gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-7">
            <Photo media={media.competition} tone="light" className="aspect-[16/10] w-full" sizes="(min-width:768px) 58vw, 100vw" />
          </Reveal>
          <div className="md:col-span-4 md:col-start-9">
            <Eyebrow>Les niveaux</Eyebrow>
            <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
              {levels.map((l, i) => (
                <li key={l.k} className="py-6">
                  <p className="font-display text-xs text-muted-strong">0{i + 1}</p>
                  <p className="mt-2 font-display text-2xl font-bold uppercase tracking-tight">{l.k}</p>
                  <p className="mt-1 text-sm text-muted-strong">{l.t}</p>
                </li>
              ))}
            </ul>
            <TextLink href="/activites/natation-competition" className="mt-8">
              Rejoindre la compétition
            </TextLink>
          </div>
        </div>
      </section>

      <section data-header="dark" className="bg-ink py-20 text-white md:py-32">
        <div className="container-x">
          <Eyebrow tone="light">Résultats récents</Eyebrow>
          <h2 className="display-md mt-8">Saison 2024–2025</h2>
          <div className="mt-12 grid gap-px bg-white/10 md:grid-cols-2">
            <div className="bg-ink p-6 md:p-10">
              <p className="text-white/70">
                Le club a notamment été engagé sur les Championnats de France, les Interclubs Avenirs, la Coupe de France
                des départements et de nombreux meetings régionaux et départementaux.
              </p>
              <TextLink href={site.links.results} tone="light" className="mt-8">
                Tous les résultats détaillés
              </TextLink>
            </div>
            <div className="bg-ink p-6 md:p-10">
              <p className="text-white/70">
                Les résultats officiels sont publiés par la Fédération Française de Natation et consultables sur la fiche
                du club.
              </p>
              <TextLink href={site.links.ffn} tone="light" className="mt-8">
                Fiche du club — FFN
              </TextLink>
            </div>
          </div>
        </div>
      </section>

      <section id="archives" data-header="light" className="bg-white py-20 md:py-32">
        <div className="container-x grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Eyebrow>Archives</Eyebrow>
            <h2 className="display-md mt-8">Histoire sportive</h2>
            <p className="mt-6 text-muted-strong">Contenus historiques, conservés et présentés comme tels.</p>
          </div>
          <ul className="divide-y divide-ink/10 border-y border-ink/10 md:col-span-7 md:col-start-6">
            <li className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">Résultats 2010–2012</p>
                <p className="text-sm text-muted-strong">Ancien site du club (csclichy92.free.fr)</p>
              </div>
              <TextLink href={site.links.archives}>Consulter</TextLink>
            </li>
            <li className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">Interclubs</p>
                <p className="text-sm text-muted-strong">Page « Interclubs 18 » de l&apos;ancien site</p>
              </div>
              <TextLink href="/actualites/interclubs-18">Lire</TextLink>
            </li>
          </ul>
        </div>
      </section>

      <RegistrationBand />
    </>
  );
}
