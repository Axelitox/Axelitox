import type { Metadata } from "next";
import { site } from "@/lib/site";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Confidentialité", alternates: { canonical: "/confidentialite" } };

export default function Page() {
  return (
    <LegalPage title="Confidentialité" href="/confidentialite">
      <div>
        <h2>Responsable du traitement</h2>
        <p>
          {site.legalName}, {site.address.street}, {site.address.postalCode} {site.address.city} —{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </div>
      <div>
        <h2>Données collectées par ce site</h2>
        <p>
          Le formulaire de contact collecte votre nom, votre email et votre message, uniquement pour répondre à votre
          demande. Ces données sont transmises par email au club et ne sont pas stockées par le site. Elles ne sont ni
          vendues ni cédées.
        </p>
        <p>
          Les inscriptions, paiements et données des adhérents sont gérés sur la plateforme d&apos;inscription du club
          (Swim Community), selon sa propre politique de confidentialité.
        </p>
      </div>
      <div>
        <h2>Cookies et mesure d&apos;audience</h2>
        <p>Ce site ne dépose aucun cookie publicitaire ni traceur de mesure d&apos;audience.</p>
      </div>
      <div>
        <h2>Droit à l&apos;image et mineurs</h2>
        <p>
          Les photographies de nageurs mineurs ne sont publiées qu&apos;avec l&apos;autorisation de leurs représentants
          légaux. Pour demander le retrait d&apos;une photo, écrivez à <a href={`mailto:${site.email}`}>{site.email}</a> :
          elle sera retirée dans les meilleurs délais.
        </p>
      </div>
      <div>
        <h2>Vos droits</h2>
        <p>
          Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement,
          d&apos;opposition et de limitation sur vos données. Pour les exercer : <a href={`mailto:${site.email}`}>{site.email}</a>.
          Vous pouvez également introduire une réclamation auprès de la CNIL (cnil.fr).
        </p>
      </div>
    </LegalPage>
  );
}
