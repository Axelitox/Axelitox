import Link from "next/link";
import { activities } from "@/data/activities";
import { media } from "@/data/media";
import { news } from "@/data/news";
import { prices } from "@/data/pricing";
import { site } from "@/lib/site";
import { Tile } from "@/components/Tile";
import { CardCarousel, CarouselCard } from "@/components/CardCarousel";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { ScheduleExplorer } from "@/components/ScheduleExplorer";
import { Partners } from "@/components/Partners";
import { TextLink, formatPrice } from "@/components/ui";

const lowestPrice = (slug: string) => {
  const list = prices.filter((p) => p.activity === slug && p.amount !== null && p.unit === "an");
  return list.length ? Math.min(...list.map((p) => p.amount!)) : null;
};

const gridTiles = [
  { slug: "jardin-aquatique", theme: "paper", title: "Jardin aquatique", sub: "Le premier bain. Dès 4 mois." },
  { slug: "natation-adultes", theme: "black", title: "Natation adultes", sub: "Une heure par semaine. Pour soi." },
  { slug: "aquabike-aquaforme", theme: "black", title: "Aquabike", sub: "La forme. Version eau." },
  { slug: "handisport", theme: "paper", title: "Handisport", sub: "Labellisé handisport 1 étoile." },
] as const;

export default function HomePage() {
  return (
    <>
      {/* Bandeau d'information */}
      <div className="bg-paper px-5 py-4 text-center text-[14px] text-ink/90">
        Les inscriptions 2026/2027 se font entièrement en ligne.{" "}
        <Link href="/inscriptions" className="whitespace-nowrap text-ink underline-offset-2 hover:underline">
          S&apos;inscrire ›
        </Link>
      </div>

      {/* Tuiles pleine largeur */}
      <div className="space-y-3 pb-3">
        <Tile
          theme="white"
          title={<span>CS Clichy 92 Natation</span>}
          sub="Apprendre. Progresser. Performer. Ensemble."
          primary={{ label: "Découvrir les activités", href: "/activites" }}
          secondary={{ label: "S'inscrire", href: "/inscriptions" }}
          media={media.hero}
          priority
        />
        <Tile
          theme="black"
          eyebrow="Compétition"
          title={
            <>
              L&apos;ambition <span className="text-signal">se cultive.</span>
            </>
          }
          sub="Du départemental au national. Dès 8 ans."
          primary={{ label: "En savoir plus", href: "/competition" }}
          secondary={{ label: "Voir les résultats", href: site.links.results }}
          media={media.competition}
        />
        <Tile
          theme="paper"
          title="École de natation"
          sub="Apprendre à nager. En confiance. Dès 4 ans."
          primary={{ label: "En savoir plus", href: "/activites/ecole-de-natation" }}
          secondary={{ label: "Voir les horaires", href: "/activites/ecole-de-natation#horaires" }}
          media={media.activities["ecole-de-natation"]}
        />
      </div>

      {/* Grille de tuiles */}
      <div className="grid gap-3 px-3 pb-3 md:grid-cols-2">
        {gridTiles.map((t) => (
          <Tile
            key={t.slug}
            size="half"
            theme={t.theme}
            title={t.title}
            sub={t.sub}
            primary={{ label: "En savoir plus", href: `/activites/${t.slug}` }}
            secondary={{ label: "S'inscrire", href: "/inscriptions" }}
            media={media.activities[t.slug]}
          />
        ))}
        <Tile
          size="half"
          theme="paper"
          title="Planning & tarifs"
          sub="Votre natation. Votre rythme."
          primary={{ label: "Trouver un créneau", href: "/planning-tarifs" }}
          secondary={{ label: "Tarifs", href: "/planning-tarifs#tarifs" }}
        >
          <div className="mt-10 grid w-full max-w-md grid-cols-2 gap-3 px-6 pb-10 text-left md:mt-14">
            {activities.slice(0, 4).map((a) => {
              const p = lowestPrice(a.slug);
              return (
                <Link key={a.slug} href={`/activites/${a.slug}`} className="rounded-[18px] bg-white p-4 transition hover:shadow-md">
                  <p className="text-[12px] text-muted-strong">{a.name}</p>
                  <p className="mt-1 text-[21px] font-semibold tracking-tight">{p ? `dès ${formatPrice(p)}` : "Sur demande"}</p>
                  <p className="text-[12px] text-muted-strong">{p ? "par an" : "selon le niveau"}</p>
                </Link>
              );
            })}
          </div>
        </Tile>
        <Tile
          size="half"
          theme="black"
          title="Piscine Gérard Durant"
          sub="Deux bassins. Au cœur de Clichy."
          primary={{ label: "En savoir plus", href: "/piscine" }}
          secondary={{ label: "Itinéraire", href: site.mapsUrl }}
          media={media.pool}
        />
      </div>

      {/* Carrousel actualités et activités */}
      <section className="overflow-hidden bg-paper pt-14 md:pt-20">
        <div className="container-x flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <h2 className="text-[28px] font-semibold leading-[1.14] tracking-[-0.01em] md:text-[40px] md:leading-[1.1]">
            À la une. <span className="text-muted-strong">Ce qui se passe au club.</span>
          </h2>
          <TextLink href="/actualites">Toutes les actualités</TextLink>
        </div>
        <div className="mt-8">
          <CardCarousel label="Actualités et activités du club">
            {news.map((n) => (
              <CarouselCard key={n.slug}>
                <Link href={`/actualites/${n.slug}`} className="flex h-full flex-col">
                  <div className="p-7 pb-0">
                    <p className="text-[12px] font-semibold text-muted-strong">
                      {n.category} · {n.date ? new Date(n.date).toLocaleDateString("fr-FR", { dateStyle: "long" }) : n.period}
                    </p>
                    <h3 className="mt-2 text-[24px] font-semibold leading-[1.16] tracking-[-0.01em]">{n.title}</h3>
                    <p className="mt-2 text-[14px] text-muted-strong">{n.excerpt}</p>
                  </div>
                  <Photo media={n.imageKey ? media[n.imageKey] : media.clubIntro} tone="light" className="mt-auto aspect-[4/3] w-full" sizes="400px" />
                </Link>
              </CarouselCard>
            ))}
            {activities.map((a) => (
              <CarouselCard key={a.slug}>
                <Link href={`/activites/${a.slug}`} className="flex h-full flex-col">
                  <div className="p-7 pb-0">
                    <p className="text-[12px] font-semibold text-muted-strong">{a.audience}</p>
                    <h3 className="mt-2 text-[24px] font-semibold leading-[1.16] tracking-[-0.01em]">{a.name}</h3>
                    <p className="mt-2 text-[14px] text-muted-strong">{a.short}</p>
                  </div>
                  <Photo media={media.activities[a.slug]} tone="light" className="mt-auto aspect-[4/3] w-full" sizes="400px" />
                </Link>
              </CarouselCard>
            ))}
          </CardCarousel>
        </div>
        <div className="h-14 md:h-20" />
      </section>

      {/* Planning */}
      <section className="bg-white py-16 md:py-24">
        <div className="container-x">
          <Reveal className="text-center">
            <h2 className="display-lg">Trouvez votre créneau.</h2>
            <p className="subhead mx-auto mt-3 max-w-2xl text-muted-strong">Filtrez par activité, groupe, jour ou public.</p>
          </Reveal>
          <Reveal delay={0.1} className="mt-12">
            <ScheduleExplorer compact />
          </Reveal>
          <div className="mt-8 text-center">
            <TextLink href="/planning-tarifs">Planning complet et tarifs</TextLink>
          </div>
        </div>
      </section>

      <Partners />
    </>
  );
}
