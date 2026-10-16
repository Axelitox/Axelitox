import Image from "next/image";
import { partners } from "@/data/partners";
import { Eyebrow } from "./ui";

/**
 * Partenaires officiellement affichés sur le site d'origine.
 * Liste vide tant que les logos n'ont pas été relevés : on n'invente aucun partenaire.
 */
export function Partners() {
  return (
    <section data-header="light" className="border-t border-ink/10 bg-paper py-20 md:py-28">
      <div className="container-x">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <Eyebrow>Ils nous accompagnent</Eyebrow>
          <p className="max-w-md text-sm text-muted-strong">
            Merci aux partenaires qui soutiennent le club et ses nageurs.
          </p>
        </div>
        {partners.length > 0 ? (
          <ul className="mt-12 grid grid-cols-2 gap-px border border-ink/10 bg-ink/10 sm:grid-cols-3 lg:grid-cols-5">
            {partners.map((p) => (
              <li key={p.name} className="grid h-32 place-items-center bg-paper p-6">
                <a href={p.href} target="_blank" rel="noopener noreferrer" className="opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0">
                  <Image src={p.logo} alt={p.name} width={160} height={64} className="h-12 w-auto object-contain" />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-px border border-dashed border-ink/20 bg-ink/5 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="grid h-28 place-items-center bg-paper p-4 text-center text-[0.65rem] uppercase tracking-[0.14em] text-ink/40">
                Logo partenaire
                <br />
                à importer
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
