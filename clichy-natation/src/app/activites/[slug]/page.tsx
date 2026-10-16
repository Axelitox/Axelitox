import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { activities, getActivity } from "@/data/activities";
import { media } from "@/data/media";
import { prices } from "@/data/pricing";
import { schedule, scheduleGaps } from "@/data/schedule";
import { PageHero, ValidationNote } from "@/components/PageHero";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { ScheduleExplorer } from "@/components/ScheduleExplorer";
import { ActivityCard } from "@/components/Cards";
import { Button, Eyebrow, StatusBadge, TextLink, formatPrice } from "@/components/ui";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return activities.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const a = getActivity((await params).slug);
  if (!a) return {};
  return {
    title: `${a.name} à Clichy`,
    description: `${a.short} ${a.audience} — piscine Gérard Durant, Clichy (92).`,
    alternates: { canonical: `/activites/${a.slug}` },
  };
}

export default async function ActivityPage({ params }: Params) {
  const a = getActivity((await params).slug);
  if (!a) notFound();

  const activityPrices = prices.filter((p) => p.activity === a.slug);
  const hasSlots = schedule.some((s) => s.activity === a.slug);
  const gap = scheduleGaps.find((g) => g.activity === a.slug);
  const others = activities.filter((x) => x.slug !== a.slug).slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow={`Activité ${a.index} · ${a.audience}`}
        title={[<span key="t">{a.name}<span className="text-signal">.</span></span>]}
        intro={<p>{a.short}</p>}
        crumbs={[
          { label: "Activités", href: "/activites" },
          { label: a.name, href: `/activites/${a.slug}` },
        ]}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/inscriptions" size="lg">
            S&apos;inscrire
          </Button>
          <Button href="#horaires" variant="outline-light" size="lg" icon="right">
            Voir les horaires
          </Button>
        </div>
      </PageHero>

      <section data-header="light" className="bg-paper py-20 md:py-32">
        <div className="container-x grid gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-6">
            <Photo
              media={media.activities[a.slug]}
              tone="light"
              className="aspect-[4/5] w-full md:sticky md:top-24"
              sizes="(min-width:768px) 50vw, 100vw"
            />
          </Reveal>
          <div className="md:col-span-5 md:col-start-8">
            <Eyebrow>Description</Eyebrow>
            <div className="prose-club mt-6 text-lg leading-relaxed text-muted-strong">
              {a.description.map((p, i) => (
                <p key={i} className={i === 0 ? "text-ink" : undefined}>
                  {p}
                </p>
              ))}
            </div>

            <dl className="mt-12 divide-y divide-ink/10 border-y border-ink/10">
              <div className="grid grid-cols-[120px_1fr] gap-4 py-5">
                <dt className="eyebrow text-[0.65rem] text-muted-strong">Public</dt>
                <dd className="font-medium">{a.audience}</dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4 py-5">
                <dt className="eyebrow text-[0.65rem] text-muted-strong">Prérequis</dt>
                <dd>
                  <ul className="space-y-2">
                    {a.prerequisites.map((p) => (
                      <li key={p} className="flex gap-2">
                        <Check aria-hidden className="mt-1 size-4 shrink-0 text-ink" /> {p}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4 py-5">
                <dt className="eyebrow text-[0.65rem] text-muted-strong">En bref</dt>
                <dd className="flex flex-wrap gap-2">
                  {a.highlights.map((h) => (
                    <span key={h} className="rounded-xs border border-ink/15 bg-white px-2.5 py-1 text-sm">
                      {h}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>

            <div className="mt-12">
              <Eyebrow>Tarifs</Eyebrow>
              <ul className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
                {activityPrices.map((p) => (
                  <li key={p.label} className="flex items-start justify-between gap-6 py-5">
                    <div>
                      <p className="font-medium">{p.label}</p>
                      <p className="mt-1 text-sm text-muted-strong">{p.detail}</p>
                      <StatusBadge status={p.status} className="mt-2" />
                    </div>
                    <p className="shrink-0 font-display text-2xl font-bold tabular-nums">
                      {formatPrice(p.amount)}
                      {p.amount !== null && <span className="ml-1 text-sm font-normal text-muted-strong">/ {p.unit}</span>}
                    </p>
                  </li>
                ))}
              </ul>
              <TextLink href="/planning-tarifs" className="mt-6">
                Tous les tarifs
              </TextLink>
            </div>
          </div>
        </div>
      </section>

      <section id="horaires" data-header="light" className="bg-white py-20 md:py-32">
        <div className="container-x">
          <Eyebrow>Horaires</Eyebrow>
          <h2 className="display-md mt-8">Créneaux</h2>
          <div className="mt-10">
            {hasSlots ? (
              <ScheduleExplorer initialActivity={a.slug} />
            ) : (
              <ValidationNote>
                {gap?.text ?? "Horaires à confirmer par le club."} Écrivez-nous via la page{" "}
                <a href="/contact" className="underline">
                  Contact
                </a>
                .
              </ValidationNote>
            )}
          </div>
          <p className="mt-8 text-xs text-muted-strong">
            Source :{" "}
            <a href={a.source} className="underline" target="_blank" rel="noopener noreferrer">
              page officielle d&apos;origine
            </a>
          </p>
        </div>
      </section>

      <section data-header="light" className="border-t border-ink/10 bg-paper py-20 md:py-28">
        <div className="container-x">
          <Eyebrow>Autres activités</Eyebrow>
          <ul className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => (
              <li key={o.slug}>
                <ActivityCard activity={o} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
