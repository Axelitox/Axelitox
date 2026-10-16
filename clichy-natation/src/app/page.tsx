import { ArrowDown } from "lucide-react";
import { activities } from "@/data/activities";
import { media } from "@/data/media";
import { news } from "@/data/news";
import { site } from "@/lib/site";
import { Photo } from "@/components/Photo";
import { Reveal, RevealLines } from "@/components/Reveal";
import { ActivityCard, NewsCard } from "@/components/Cards";
import { ScheduleExplorer } from "@/components/ScheduleExplorer";
import { Partners } from "@/components/Partners";
import { RegistrationBand } from "@/components/RegistrationBand";
import { Button, Eyebrow, TextLink } from "@/components/ui";

export default function HomePage() {
  return (
    <>
      {/* 1 — HERO */}
      <section data-header="dark" className="relative isolate flex min-h-[100svh] flex-col bg-ink text-white">
        <Photo media={media.hero} priority className="absolute inset-0 -z-10" sizes="100vw" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/30 to-ink/40" />

        <div className="container-x flex flex-1 flex-col justify-end pb-28 pt-32 md:pb-32">
          <Eyebrow tone="light">Saison 2026/2027 · Clichy, Hauts-de-Seine</Eyebrow>
          <h1 className="display-xl mt-6">
            <RevealLines
              lines={[
                "Clichy 92.",
                "L'esprit",
                <span key="n" className="text-signal">
                  natation.
                </span>,
              ]}
            />
          </h1>
          <Reveal delay={0.35} className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <p className="max-w-md font-display text-lg text-white/85 md:text-xl">
              Apprendre. Progresser. Performer. Ensemble.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button href="/activites" size="lg" icon="right">
                Découvrir nos activités
              </Button>
              <Button href="/inscriptions" variant="outline-light" size="lg">
                Rejoindre le club
              </Button>
            </div>
          </Reveal>
        </div>

        <div className="container-x absolute inset-x-0 bottom-0 flex items-end justify-between pb-6 text-[0.65rem] uppercase tracking-[0.2em] text-white/55">
          <a href="#identite" className="flex items-center gap-3 hover:text-white">
            <span className="relative block h-10 w-px overflow-hidden bg-white/15">
              <span className="absolute inset-0 animate-scroll-line bg-signal" />
            </span>
            Scroll to explore
            <ArrowDown aria-hidden className="size-3 md:hidden" />
          </a>
          <span className="hidden sm:block">CS Clichy 92 — Natation</span>
        </div>
      </section>

      {/* 2 — IDENTITÉ */}
      <section id="identite" data-header="light" className="bg-paper py-24 md:py-40">
        <div className="container-x grid gap-14 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-7">
            <Eyebrow>01 / Notre identité</Eyebrow>
            <h2 className="display-lg mt-8">
              <RevealLines lines={["Un club.", "Une passion", <span key="c">commune<span className="text-signal">.</span></span>]} />
            </h2>
            <Reveal delay={0.1} className="mt-14 hidden md:block">
              <Photo media={media.clubIntro} tone="light" className="aspect-[16/10] w-full" sizes="60vw" />
            </Reveal>
          </div>
          <Reveal delay={0.15} className="flex flex-col justify-end md:col-span-4 md:col-start-9">
            <Photo media={media.clubIntro} tone="light" className="mb-10 aspect-[4/3] w-full md:hidden" sizes="100vw" />
            <div className="prose-club text-base leading-relaxed text-muted-strong md:text-lg">
              <p className="text-ink">
                Le CS Clichy 92 Natation accueille nageurs et nageuses de tous âges à la piscine Gérard Durant, au cœur de
                Clichy.
              </p>
              <p>
                Des bébés nageurs à l&apos;école de natation, des cours adultes aux activités aquatiques, jusqu&apos;à la
                compétition : le club accompagne chacun de l&apos;apprentissage au bien-être et à la performance.
              </p>
            </div>
            <dl className="mt-10 grid grid-cols-2 gap-px border border-ink/10 bg-ink/10">
              {[
                ["6", "pôles d'activités"],
                ["4 mois", "âge du premier bain"],
                ["1★", "label handisport"],
                ["8 ans", "accès à la compétition"],
              ].map(([v, l]) => (
                <div key={l} className="bg-paper p-5">
                  <dt className="sr-only">{l}</dt>
                  <dd className="font-display text-3xl font-bold tracking-tight">{v}</dd>
                  <dd className="mt-1 text-xs text-muted-strong">{l}</dd>
                </div>
              ))}
            </dl>
            <TextLink href="/le-club" className="mt-10">
              En savoir plus
            </TextLink>
          </Reveal>
        </div>
      </section>

      {/* 3 — ACTIVITÉS */}
      <section data-header="light" className="bg-white py-24 md:py-40">
        <div className="container-x">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow>02 / Nos activités</Eyebrow>
              <h2 className="display-lg mt-8 max-w-4xl">
                <RevealLines lines={["Trouvez votre", <span key="p">place dans l&apos;eau<span className="text-signal">.</span></span>]} />
              </h2>
            </div>
            <TextLink href="/activites">Toutes les activités</TextLink>
          </div>
          <ul className="mt-16 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 md:mt-24">
            {activities.map((a, i) => (
              <Reveal as="li" key={a.slug} delay={(i % 3) * 0.08} className={i % 3 === 1 ? "lg:translate-y-16" : ""}>
                <ActivityCard activity={a} />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* 4 — COMPÉTITION */}
      <section data-header="dark" className="relative isolate overflow-hidden bg-ink py-24 text-white md:py-40">
        <div className="container-x">
          <Eyebrow tone="light">03 / Esprit compétition</Eyebrow>
          <h2 className="display-xl mt-8">
            <RevealLines lines={["L'ambition", <span key="s" className="text-signal">se cultive.</span>]} />
          </h2>
        </div>
        <div className="container-x mt-14 grid gap-14 lg:grid-cols-12 md:mt-20">
          <Reveal delay={0.1} className="lg:col-span-7">
            <Photo media={media.competition} className="aspect-[16/10] w-full" sizes="(min-width:1024px) 58vw, 100vw" />
          </Reveal>
          <div className="flex flex-col justify-end lg:col-span-4 lg:col-start-9">
            <Reveal delay={0.15} className="space-y-4 text-white/70 md:text-lg">
              <p>
                Des bases techniques des quatre nages jusqu&apos;à la compétition de haut niveau : la section compétition
                forme des nageurs exigeants, engagés pour leur club et leurs coéquipiers.
              </p>
              <p>Dès 8 ans, les nageurs peuvent s&apos;engager en compétitions départementales, régionales et nationales.</p>
            </Reveal>
            <Reveal delay={0.2} className="mt-10">
              <TextLink href="/competition" tone="light">
                Découvrir la compétition
              </TextLink>
            </Reveal>
          </div>
        </div>

        <div className="container-x mt-20 grid gap-px bg-white/10 md:mt-28 md:grid-cols-2">
          <Reveal className="bg-ink p-6 md:p-10">
            <p className="eyebrow text-signal">Saisons récentes</p>
            <ul className="mt-6 space-y-3 text-white/85">
              <li>Championnats de France</li>
              <li>Interclubs Avenirs</li>
              <li>Coupe de France des départements</li>
              <li>Meetings régionaux et départementaux</li>
            </ul>
            <p className="mt-6 text-xs text-white/50">Compétitions disputées en 2024–2025 — résultats détaillés sur abcnatation.</p>
            <TextLink href={site.links.results} tone="light" className="mt-6">
              Voir les résultats
            </TextLink>
          </Reveal>
          <Reveal delay={0.08} className="bg-ink p-6 md:p-10">
            <p className="eyebrow text-white/50">Archives</p>
            <ul className="mt-6 space-y-3 text-white/60">
              <li>Résultats 2010–2012 (ancien site du club)</li>
              <li>Interclubs — page « Interclubs 18 »</li>
            </ul>
            <p className="mt-6 text-xs text-white/40">Contenus historiques, présentés comme tels.</p>
            <TextLink href="/competition#archives" tone="light" className="mt-6">
              Parcourir les archives
            </TextLink>
          </Reveal>
        </div>
      </section>

      {/* 5 — PLANNING */}
      <section data-header="light" className="bg-paper py-24 md:py-40">
        <div className="container-x">
          <div className="grid gap-8 md:grid-cols-12">
            <div className="md:col-span-7">
              <Eyebrow>04 / Planning</Eyebrow>
              <h2 className="display-lg mt-8">
                <RevealLines lines={["Votre natation.", <span key="r">Votre rythme<span className="text-signal">.</span></span>]} />
              </h2>
            </div>
            <Reveal delay={0.1} className="flex flex-col justify-end gap-6 md:col-span-4 md:col-start-9">
              <p className="text-muted-strong">
                Filtrez par activité, groupe, jour ou public. Les créneaux marqués « À actualiser » proviennent d&apos;une
                saison précédente et seront confirmés par le club.
              </p>
              <TextLink href="/planning-tarifs">Planning complet & tarifs</TextLink>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="mt-14">
            <ScheduleExplorer compact />
          </Reveal>
        </div>
      </section>

      {/* 6 — ACTUALITÉS */}
      <section data-header="light" className="bg-white py-24 md:py-40">
        <div className="container-x">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow>05 / Actualités</Eyebrow>
              <h2 className="display-lg mt-8">
                <RevealLines lines={["La vie", <span key="c">du club<span className="text-signal">.</span></span>]} />
              </h2>
            </div>
            <Button href="/actualites" variant="outline-dark" icon="right">
              Toutes les actualités
            </Button>
          </div>
          <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
            {news.slice(0, 3).map((n, i) => (
              <Reveal key={n.slug} delay={i * 0.08}>
                <NewsCard item={n} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 7 — INSCRIPTIONS */}
      <RegistrationBand />

      {/* 8 — PARTENAIRES */}
      <Partners />
    </>
  );
}
