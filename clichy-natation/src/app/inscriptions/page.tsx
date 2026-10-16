import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { sources } from "@/data/sources";
import { PageHero, ValidationNote } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { Button, Eyebrow, TextLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "Inscriptions 2026/2027",
  description:
    "Inscriptions 2026/2027 au CS Clichy 92 Natation : tout se fait en ligne depuis votre espace personnel. Ouverture des nouvelles inscriptions le 15 juillet à 9 h.",
  alternates: { canonical: "/inscriptions" },
};

const steps = [
  {
    title: "Créez votre espace personnel",
    text: "Sur la plateforme d'inscription, créez votre compte (bouton « + » à droite du logo). La personne créée devient l'administratrice du compte familial.",
    tip: "Cochez la case autorisant Swim Community à vous contacter : sans elle, vous ne recevrez pas les informations importantes, comme les liens de réinscription.",
  },
  {
    title: "Choisissez le membre de la famille",
    text: "Sélectionnez la personne à inscrire : vous-même, votre enfant ou un autre membre du foyer.",
  },
  {
    title: "Choisissez le cours et le créneau",
    text: "Sélectionnez l'activité puis le créneau qui vous convient. Consultez le planning à l'avance pour gagner du temps.",
    link: { href: "/planning-tarifs", label: "Voir le planning" },
  },
  {
    title: "Certificat médical (adultes)",
    text: "Seules les activités adultes nécessitent de télécharger un certificat médical, valable 3 ans. Il n'est plus demandé pour les mineurs.",
  },
  {
    title: "Réglez votre inscription",
    text: "Paiement par carte bancaire — possibilité de régler en 3 fois sans frais — ou par virement.",
  },
];

export default function InscriptionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Inscriptions 2026/2027"
        title={["Prêt à", <span key="p" className="text-signal">plonger ?</span>]}
        intro={
          <p>
            Les inscriptions se font entièrement en ligne. Les nouvelles inscriptions ouvrent le{" "}
            <strong className="text-white">15 juillet à 9 h</strong>.
          </p>
        }
        crumbs={[{ label: "Inscriptions", href: "/inscriptions" }]}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href={site.links.registration} size="lg">
            Accéder à l&apos;inscription en ligne
          </Button>
          <Button href={site.links.memberArea} variant="outline-dark" size="lg">
            Espace adhérent
          </Button>
        </div>
      </PageHero>

      <section data-header="light" className="bg-paper py-20 md:py-32">
        <div className="container-x grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="md:sticky md:top-28">
              <Eyebrow>En 5 étapes</Eyebrow>
              <h2 className="display-md mt-8">Comment s&apos;inscrire</h2>
              <p className="mt-6 text-muted-strong">
                Comptez une dizaine de minutes. Préparez le certificat médical si vous inscrivez un adulte.
              </p>
            </div>
          </div>
          <ol className="md:col-span-7 md:col-start-6">
            {steps.map((s, i) => (
              <Reveal as="li" key={s.title} className="relative grid grid-cols-[56px_1fr] gap-5 border-t border-ink/10 py-8 md:grid-cols-[80px_1fr]">
                <span className="font-display text-4xl font-semibold leading-none tracking-tight md:text-5xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted-strong">{s.text}</p>
                  {s.tip && (
                    <p className="mt-4 border-l-2 border-signal bg-white px-4 py-3 text-sm">
                      <strong>Important —</strong> {s.tip}
                    </p>
                  )}
                  {s.link && (
                    <TextLink href={s.link.href} className="mt-4">
                      {s.link.label}
                    </TextLink>
                  )}
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section data-header="dark" className="bg-ink py-20 text-white md:py-28">
        <div className="container-x grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Eyebrow tone="light">Prêt ?</Eyebrow>
            <h2 className="display-md mt-8">
              Rejoignez le CS Clichy 92<span className="text-signal">.</span>
            </h2>
          </div>
          <div className="flex flex-col gap-3 md:col-span-5">
            <Button href={site.links.registration} size="lg">
              S&apos;inscrire en ligne
            </Button>
            <p className="text-sm text-white/60">
              Une question avant de vous inscrire ?{" "}
              <Link href="/contact" className="text-white underline">
                Contactez le club
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {!site.linksConfigured && (
        <div data-header="light" className="bg-paper py-10">
          <div className="container-x">
            <ValidationNote>
              Le bouton d&apos;inscription renvoie vers la page officielle actuelle (
              <a href={sources.inscriptions} className="underline">
                {sources.inscriptions}
              </a>
              ) en attendant que l&apos;URL exacte de la plateforme Swim Community soit renseignée
              (NEXT_PUBLIC_REGISTRATION_URL).
            </ValidationNote>
          </div>
        </div>
      )}
    </>
  );
}
