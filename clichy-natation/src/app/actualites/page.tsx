import type { Metadata } from "next";
import { news } from "@/data/news";
import { PageHero } from "@/components/PageHero";
import { NewsCard } from "@/components/Cards";
import { Reveal } from "@/components/Reveal";
import { Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Actualités",
  description: "Les actualités du CS Clichy 92 Natation : inscriptions, activités, compétitions.",
  alternates: { canonical: "/actualites" },
};

export default function NewsPage() {
  const current = news.filter((n) => !n.archive);
  const archives = news.filter((n) => n.archive);
  return (
    <>
      <PageHero
        eyebrow="Actualités"
        title={["La vie", <span key="c">du club<span className="text-signal">.</span></span>]}
        crumbs={[{ label: "Actualités", href: "/actualites" }]}
      />
      <section data-header="light" className="bg-white py-20 md:py-28">
        <div className="container-x">
          <Eyebrow>À la une</Eyebrow>
          <div className="mt-10 grid gap-12 md:grid-cols-3 md:gap-8">
            {current.map((n, i) => (
              <Reveal key={n.slug} delay={i * 0.08}>
                <NewsCard item={n} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      {archives.length > 0 && (
        <section data-header="light" className="border-t border-ink/10 bg-paper py-20 md:py-28">
          <div className="container-x">
            <Eyebrow>Archives</Eyebrow>
            <div className="mt-10 grid gap-12 md:grid-cols-3 md:gap-8">
              {archives.map((n) => (
                <NewsCard key={n.slug} item={n} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
