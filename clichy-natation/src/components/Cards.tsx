import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Activity } from "@/data/activities";
import { media } from "@/data/media";
import type { NewsItem } from "@/data/news";
import { Photo } from "./Photo";

export function ActivityCard({ activity, className }: { activity: Activity; className?: string }) {
  return (
    <Link
      href={`/activites/${activity.slug}`}
      className={`group flex h-full flex-col overflow-hidden rounded-[18px] bg-paper transition-shadow duration-300 hover:shadow-[2px_4px_16px_rgba(0,0,0,0.12)] ${className ?? ""}`}
    >
      <div className="p-7 pb-0">
        <p className="text-[12px] font-semibold text-muted-strong">{activity.audience}</p>
        <h3 className="mt-1.5 text-[24px] font-semibold leading-[1.16] tracking-[-0.01em]">{activity.name}</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-muted-strong">{activity.short}</p>
        <span className="mt-3 inline-flex items-center gap-0.5 text-[14px] text-ink group-hover:underline">
          En savoir plus <ChevronRight aria-hidden className="size-3.5" />
        </span>
      </div>
      <Photo
        media={media.activities[activity.slug]}
        tone="light"
        className="mt-6 aspect-[4/3] w-full"
        imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
      />
    </Link>
  );
}

export function NewsCard({ item }: { item: NewsItem }) {
  const img = item.imageKey ? media[item.imageKey] : media.clubIntro;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[18px] bg-white shadow-[2px_4px_12px_rgba(0,0,0,0.08)] transition-shadow duration-300 hover:shadow-[2px_4px_16px_rgba(0,0,0,0.16)]">
      <div className="p-7 pb-0">
        <p className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-muted-strong">
          <span>{item.category}</span>
          <span aria-hidden>·</span>
          {item.date ? (
            <time dateTime={item.date}>{new Date(item.date).toLocaleDateString("fr-FR", { dateStyle: "long" })}</time>
          ) : (
            <span>{item.period}</span>
          )}
          {item.archive && <span className="rounded-full bg-paper px-2 py-0.5 text-[11px]">Archive</span>}
        </p>
        <h3 className="mt-2 text-[24px] font-semibold leading-[1.16] tracking-[-0.01em]">
          <Link href={`/actualites/${item.slug}`} className="after:absolute after:inset-0">
            {item.title}
          </Link>
        </h3>
        <p className="mt-2 text-[14px] leading-relaxed text-muted-strong">{item.excerpt}</p>
      </div>
      <Photo media={img} tone="light" className="mt-auto aspect-[4/3] w-full pt-6" sizes="(min-width: 1024px) 33vw, 100vw" />
    </article>
  );
}
