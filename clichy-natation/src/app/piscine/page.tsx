import type { Metadata } from "next";
import { MapPin, Mail } from "lucide-react";
import { media } from "@/data/media";
import { site } from "@/lib/site";
import { PageHero } from "@/components/PageHero";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { Button, Eyebrow, TextLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "La piscine Gérard Durant",
  description: "La piscine Gérard Durant, 34 rue Valiton à Clichy : bassins, accès et informations pratiques pour les adhérents du club.",
  alternates: { canonical: "/piscine" },
};

export default function PiscinePage() {
  return (
    <>
      <PageHero
        eyebrow="La piscine"
        title={["Piscine", <span key="g">Gérard Durant<span className="text-signal">.</span></span>]}
        intro={<p>Le bassin du club, au cœur de Clichy. Deux bassins accueillent les cours et les entraînements.</p>}
        crumbs={[{ label: "La piscine", href: "/piscine" }]}
      >
        <Button href={site.mapsUrl} size="lg">
          Itinéraire
        </Button>
      </PageHero>

      <section data-header="light" className="bg-paper py-20 md:py-28">
        <div className="container-x">
          <Eyebrow>Galerie</Eyebrow>
          <div className="mt-10 grid gap-4 md:grid-cols-12">
            <Reveal className="md:col-span-8">
              <Photo media={media.pool} tone="light" className="aspect-[16/10] w-full" sizes="(min-width:768px) 66vw, 100vw" />
            </Reveal>
            <div className="grid gap-4 md:col-span-4">
              {media.gallery.slice(0, 2).map((g, i) => (
                <Reveal key={i} delay={0.08 * (i + 1)}>
                  <Photo media={g} tone="light" className="aspect-[16/10] w-full" sizes="(min-width:768px) 33vw, 100vw" />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section data-header="light" className="bg-white py-20 md:py-28">
        <div className="container-x grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Eyebrow>Accès</Eyebrow>
            <h2 className="display-md mt-8">Nous trouver</h2>
          </div>
          <div className="space-y-8 md:col-span-6 md:col-start-7">
            <div className="flex gap-4">
              <MapPin aria-hidden className="mt-1 size-5 shrink-0" />
              <address className="not-italic">
                <p className="font-medium">{site.address.venue}</p>
                <p className="text-muted-strong">
                  {site.address.street}, {site.address.postalCode} {site.address.city}
                </p>
              </address>
            </div>
            <div className="flex gap-4">
              <Mail aria-hidden className="mt-1 size-5 shrink-0" />
              <a href={`mailto:${site.email}`} className="font-medium hover:underline">
                {site.email}
              </a>
            </div>
            <ul className="space-y-3 border-t border-ink/10 pt-8 text-sm text-muted-strong">
              <li>Bonnet de bain obligatoire.</li>
              <li>Pas de cours du club pendant les vacances scolaires de la zone C.</li>
              <li>Horaires d&apos;ouverture au public : se référer au site de la Ville de Clichy.</li>
            </ul>
            <div className="flex flex-wrap gap-6">
              <TextLink href={site.mapsUrl}>Ouvrir dans Maps</TextLink>
              <TextLink href={site.links.cityPool}>Infos Ville de Clichy</TextLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
