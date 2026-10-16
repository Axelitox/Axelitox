import type { Metadata } from "next";
import { activities } from "@/data/activities";
import { PageHero } from "@/components/PageHero";
import { ActivityCard } from "@/components/Cards";
import { Reveal } from "@/components/Reveal";
import { RegistrationBand } from "@/components/RegistrationBand";

export const metadata: Metadata = {
  title: "Activités",
  description:
    "École de natation, jardin aquatique (bébés nageurs), natation adultes, compétition, aquabike & aquaforme, handisport : toutes les activités du CS Clichy 92 Natation.",
  alternates: { canonical: "/activites" },
};

export default function ActivitiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Activités"
        title={["Trouvez votre", <span key="p">place dans l&apos;eau<span className="text-signal">.</span></span>]}
        intro={<p>Six pôles, de 4 mois à l&apos;âge adulte. Choisissez une activité pour voir son public, ses prérequis, ses horaires et ses tarifs.</p>}
        crumbs={[{ label: "Activités", href: "/activites" }]}
      />
      <section data-header="light" className="bg-white py-20 md:py-32">
        <div className="container-x">
          <ul className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((a, i) => (
              <Reveal as="li" key={a.slug} delay={(i % 3) * 0.08}>
                <ActivityCard activity={a} />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
      <RegistrationBand />
    </>
  );
}
