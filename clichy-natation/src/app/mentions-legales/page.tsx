import type { Metadata } from "next";
import { site } from "@/lib/site";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Mentions légales", alternates: { canonical: "/mentions-legales" } };

export default function Page() {
  return (
    <LegalPage title="Mentions légales" href="/mentions-legales">
      <div>
        <h2>Éditeur du site</h2>
        <p>
          <strong>{site.legalName}</strong>, association déclarée (loi 1901) — SIREN {site.siren}.
          <br />
          Siège : {site.address.street}, {site.address.postalCode} {site.address.city}.
          <br />
          Contact : <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
      </div>
      <div>
        <h2>Directeur de la publication</h2>
        <p>Le président ou la présidente de l&apos;association en exercice. [Nom à compléter par le club]</p>
      </div>
      <div>
        <h2>Hébergement</h2>
        <p>[Hébergeur à compléter lors de la mise en ligne : raison sociale, adresse, téléphone.]</p>
      </div>
      <div>
        <h2>Propriété intellectuelle</h2>
        <p>
          Le logo, les photographies et les contenus de ce site sont la propriété du CS Clichy 92 Natation ou de leurs
          auteurs. Toute reproduction sans autorisation est interdite.
        </p>
      </div>
    </LegalPage>
  );
}
