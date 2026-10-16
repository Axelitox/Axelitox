import Image from "next/image";
import { partners } from "@/data/partners";

/**
 * Partenaires officiellement affichés sur le site d'origine.
 * Liste vide tant que les logos n'ont pas été relevés : on n'invente aucun partenaire.
 */
export function Partners() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="container-x text-center">
        <h2 className="text-[21px] font-semibold tracking-[-0.01em]">Ils accompagnent le club.</h2>
        {partners.length > 0 ? (
          <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
            {partners.map((p) => (
              <li key={p.name}>
                <a href={p.href} target="_blank" rel="noopener noreferrer" className="block opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0">
                  <Image src={p.logo} alt={p.name} width={160} height={64} className="h-10 w-auto object-contain" />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="grid h-24 place-items-center rounded-[18px] bg-paper px-4 text-[12px] text-ink/40">
                Logo partenaire à importer
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
