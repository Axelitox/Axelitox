import type { Metadata } from "next";
import { site } from "@/lib/site";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/ContactForm";
import { Eyebrow, TextLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contacter le CS Clichy 92 Natation : email, adresse de la piscine Gérard Durant à Clichy, formulaire de contact.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={["Parlons", <span key="n">natation<span className="text-signal">.</span></span>]}
        intro={<p>Une question sur une activité, un créneau ou une inscription ? Écrivez-nous, le club vous répond par email.</p>}
        crumbs={[{ label: "Contact", href: "/contact" }]}
      />
      <section data-header="light" className="bg-paper py-20 md:py-28">
        <div className="container-x grid gap-16 md:grid-cols-12">
          <div className="space-y-10 md:col-span-4">
            <div>
              <Eyebrow>Email</Eyebrow>
              <a href={`mailto:${site.email}`} className="mt-4 block break-words font-display text-2xl font-bold hover:underline">
                {site.email}
              </a>
            </div>
            <div>
              <Eyebrow>Adresse</Eyebrow>
              <address className="mt-4 not-italic leading-relaxed">
                {site.address.venue}
                <br />
                {site.address.street}
                <br />
                {site.address.postalCode} {site.address.city}
              </address>
              <TextLink href={site.mapsUrl} className="mt-4">
                Itinéraire
              </TextLink>
            </div>
            <div>
              <Eyebrow>Réseaux</Eyebrow>
              <ul className="mt-4 space-y-2">
                {site.social.map((s) => (
                  <li key={s.href}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-muted-strong">
              Le club est une association animée par des bénévoles : le délai de réponse peut varier, notamment pendant les
              vacances scolaires.
            </p>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
