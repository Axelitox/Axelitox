import type { Metadata } from "next";
import { media } from "@/data/media";
import { site } from "@/lib/site";
import { PageHero } from "@/components/PageHero";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { Partners } from "@/components/Partners";
import { RegistrationBand } from "@/components/RegistrationBand";
import { Eyebrow, TextLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "Le Club",
  description:
    "Le CS Clichy 92 Natation : un club associatif de natation à Clichy (92), de l'apprentissage à la compétition, à la piscine Gérard Durant.",
  alternates: { canonical: "/le-club" },
};

const values = [
  { k: "Apprendre", t: "Savoir nager, en sécurité et en confiance, dès le plus jeune âge, avec des éducateurs diplômés." },
  { k: "Progresser", t: "Des groupes par âge et par niveau pour avancer à son rythme, de l'initiation au perfectionnement." },
  { k: "Performer", t: "Une section compétition engagée du niveau départemental au niveau national." },
  { k: "Ensemble", t: "Un club ouvert à tous : familles, adultes, nageurs en situation de handicap, compétiteurs." },
];

export default function ClubPage() {
  return (
    <>
      <PageHero
        eyebrow="Le Club"
        title={["Un club.", <span key="p">Une passion <span className="text-signal">commune.</span></span>]}
        intro={
          <p>
            Le CS Clichy 92 Natation est un club associatif implanté à la piscine Gérard Durant. Il accompagne chaque
            nageur, de l&apos;apprentissage au bien-être et à la performance.
          </p>
        }
        crumbs={[{ label: "Le Club", href: "/le-club" }]}
      />

      <section data-header="light" className="bg-paper py-24 md:py-36">
        <div className="container-x grid gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-7">
            <Photo media={media.clubIntro} tone="light" className="aspect-[4/3] w-full" sizes="(min-width:768px) 58vw, 100vw" />
          </Reveal>
          <Reveal delay={0.1} className="flex flex-col justify-end md:col-span-4 md:col-start-9">
            <Eyebrow>Notre mission</Eyebrow>
            <div className="prose-club mt-6 text-lg leading-relaxed text-muted-strong">
              <p className="text-ink">
                Bébés nageurs, école de natation, natation adultes, aquabike et activités aquatiques, handisport et
                compétition : six pôles réunis dans un même club.
              </p>
              <p>
                Les cours sont encadrés par des éducateurs et maîtres-nageurs diplômés. Le club est labellisé « handisport 1
                étoile ».
              </p>
            </div>
            <TextLink href="/activites" className="mt-8">
              Voir les activités
            </TextLink>
          </Reveal>
        </div>
      </section>

      <section data-header="light" className="bg-white py-24 md:py-36">
        <div className="container-x">
          <Eyebrow>Nos valeurs</Eyebrow>
          <ul className="mt-12 grid gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal as="li" key={v.k} delay={i * 0.06} className="bg-white p-8 md:p-10">
                <span className="font-display text-xs text-muted-strong">0{i + 1}</span>
                <h2 className="mt-10 font-display text-3xl font-bold uppercase tracking-tight">
                  {v.k}
                  <span className="text-signal">.</span>
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-strong">{v.t}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section data-header="dark" className="bg-ink py-24 text-white md:py-36">
        <div className="container-x grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Eyebrow tone="light">Installations</Eyebrow>
            <h2 className="display-md mt-8">
              Piscine
              <br />
              Gérard Durant
            </h2>
            <p className="mt-8 max-w-md text-white/70">
              Le club s&apos;entraîne à la piscine municipale de Clichy, équipée de deux bassins. Les cours n&apos;ont pas
              lieu pendant les vacances scolaires de la zone C.
            </p>
            <TextLink href="/piscine" tone="light" className="mt-8">
              Découvrir la piscine
            </TextLink>
          </div>
          <Reveal className="md:col-span-6 md:col-start-7">
            <Photo media={media.pool} className="aspect-[4/3] w-full" sizes="(min-width:768px) 50vw, 100vw" />
          </Reveal>
        </div>
      </section>

      <section data-header="light" className="bg-paper py-24 md:py-32">
        <div className="container-x grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Eyebrow>Vie associative</Eyebrow>
            <h2 className="display-md mt-8">L&apos;association</h2>
          </div>
          <dl className="grid gap-px border border-ink/10 bg-ink/10 text-sm sm:grid-cols-2 md:col-span-7">
            {[
              ["Dénomination", site.legalName],
              ["Forme", "Association déclarée (loi 1901)"],
              ["SIREN", site.siren],
              ["Siège", `${site.address.street}, ${site.address.postalCode} ${site.address.city}`],
              ["Fédération", "Fédération Française de Natation"],
              ["Contact", site.email],
            ].map(([k, v]) => (
              <div key={k} className="bg-paper p-6">
                <dt className="eyebrow text-[0.65rem] text-muted-strong">{k}</dt>
                <dd className="mt-2 break-words font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Partners />
      <RegistrationBand />
    </>
  );
}
