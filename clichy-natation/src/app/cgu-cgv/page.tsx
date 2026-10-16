import type { Metadata } from "next";
import { site } from "@/lib/site";
import { sources } from "@/data/sources";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "CGU/CGV", alternates: { canonical: "/cgu-cgv" } };

export default function Page() {
  return (
    <LegalPage title="CGU/CGV" href="/cgu-cgv">
      <div>
        <h2>Objet</h2>
        <p>
          Les présentes conditions encadrent l&apos;utilisation du site du {site.legalName}, éditeur du site, joignable à{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </div>
      <div>
        <h2>Inscriptions et paiements</h2>
        <p>
          Les inscriptions aux activités se font en ligne depuis l&apos;espace personnel de l&apos;adhérent. Le paiement
          s&apos;effectue par carte bancaire (paiement en 3 fois sans frais possible) ou par virement. Les tarifs
          s&apos;entendent pour un cours hebdomadaire sur les périodes scolaires, hors vacances de la zone C.
        </p>
      </div>
      <div>
        <h2>Boutique en ligne</h2>
        <p>
          L&apos;utilisateur a accès à une boutique en ligne entièrement gérée par notre partenaire sports-village.com. Les
          achats y sont soumis aux conditions générales de vente de ce partenaire.
        </p>
      </div>
      <div>
        <p className="text-sm">
          Texte intégral d&apos;origine : <a href={sources.cgu}>{sources.cgu}</a> — à réimporter intégralement après
          validation par le club.
        </p>
      </div>
    </LegalPage>
  );
}
