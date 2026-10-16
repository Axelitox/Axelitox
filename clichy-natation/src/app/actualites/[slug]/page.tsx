import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNews, news } from "@/data/news";
import { media } from "@/data/media";
import { PageHero } from "@/components/PageHero";
import { Photo } from "@/components/Photo";
import { TextLink } from "@/components/ui";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return news.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const n = getNews((await params).slug);
  if (!n) return {};
  return { title: n.title, description: n.excerpt, alternates: { canonical: `/actualites/${n.slug}` } };
}

export default async function NewsArticle({ params }: Params) {
  const n = getNews((await params).slug);
  if (!n) notFound();
  const img = n.imageKey ? media[n.imageKey] : media.clubIntro;
  return (
    <>
      <PageHero
        eyebrow={`${n.category} · ${n.date ? new Date(n.date).toLocaleDateString("fr-FR", { dateStyle: "long" }) : n.period}`}
        title={[n.title]}
        crumbs={[
          { label: "Actualités", href: "/actualites" },
          { label: n.category, href: `/actualites/${n.slug}` },
        ]}
      />
      <article data-header="light" className="bg-paper py-16 md:py-24">
        <div className="container-x grid gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <Photo media={img} tone="light" className="aspect-[16/10] w-full" sizes="(min-width:768px) 58vw, 100vw" />
          </div>
          <div className="md:col-span-4 md:col-start-9">
            {n.archive && (
              <p className="mb-6 border-l-2 border-signal bg-white p-4 text-sm text-muted-strong">
                Article d&apos;archive : les informations ci-dessous ne sont pas d&apos;actualité.
              </p>
            )}
            <div className="prose-club text-lg leading-relaxed text-muted-strong">
              {n.body.map((p, i) => (
                <p key={i} className={i === 0 ? "text-ink" : undefined}>
                  {p}
                </p>
              ))}
            </div>
            <div className="mt-10 flex flex-col gap-4">
              {n.slug === "inscriptions-2026-2027" && <TextLink href="/inscriptions">Voir le parcours d&apos;inscription</TextLink>}
              <TextLink href="/actualites">Toutes les actualités</TextLink>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
