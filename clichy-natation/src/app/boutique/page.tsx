import type { Metadata } from "next";
import { site } from "@/lib/site";
import { PageHero, ValidationNote } from "@/components/PageHero";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Boutique",
  description: "La boutique officielle du CS Clichy 92 Natation, gérée par notre partenaire sports-village.com.",
  alternates: { canonical: "/boutique" },
};

export default function ShopPage() {
  return (
    <>
      <PageHero
        eyebrow="Boutique"
        title={["Portez les", <span key="c">couleurs<span className="text-signal">.</span></span>]}
        intro={
          <p>
            La boutique en ligne du club est entièrement gérée par notre partenaire sports-village.com. Les commandes sont
            soumises à ses conditions générales de vente.
          </p>
        }
        crumbs={[{ label: "Boutique", href: "/boutique" }]}
      >
        <Button href={site.links.shop} size="lg">
          Accéder à la boutique
        </Button>
      </PageHero>
      {!process.env.NEXT_PUBLIC_SHOP_URL && (
        <div data-header="light" className="bg-paper py-12">
          <div className="container-x">
            <ValidationNote>
              Le lien pointe vers la page d&apos;accueil de sports-village.com en attendant l&apos;URL exacte de la boutique
              du club (NEXT_PUBLIC_SHOP_URL).
            </ValidationNote>
          </div>
        </div>
      )}
    </>
  );
}
