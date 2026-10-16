import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Activity } from "@/data/activities";
import { media } from "@/data/media";
import type { NewsItem } from "@/data/news";
import { Photo } from "./Photo";

export function ActivityCard({ activity, className }: { activity: Activity; className?: string }) {
  return (
    <Link href={`/activites/${activity.slug}`} className={`group block ${className ?? ""}`}>
      <div className="relative">
        <Photo
          media={media.activities[activity.slug]}
          className="aspect-[4/5] w-full"
          imgClassName="transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        <span className="absolute left-4 top-4 font-display text-xs text-white/70">{activity.index}</span>
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-signal transition-transform duration-500 ease-out group-hover:scale-x-100"
        />
      </div>
      <div className="flex items-start justify-between gap-4 pt-5">
        <div>
          <p className="eyebrow text-[0.65rem] text-muted-strong">{activity.audience}</p>
          <h3 className="mt-2 font-display text-2xl font-bold uppercase leading-none tracking-[-0.02em]">{activity.name}</h3>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-strong transition-colors duration-300 group-hover:text-ink">
            {activity.short}
          </p>
        </div>
        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-ink/15 transition-colors duration-300 group-hover:border-signal group-hover:bg-signal">
          <ArrowUpRight aria-hidden className="size-4" />
        </span>
      </div>
    </Link>
  );
}

export function NewsCard({ item }: { item: NewsItem }) {
  const img = item.imageKey ? media[item.imageKey] : media.clubIntro;
  return (
    <article className="group relative">
      <Photo
        media={img}
        tone="light"
        className="aspect-[3/2] w-full"
        imgClassName="transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
        sizes="(min-width: 1024px) 33vw, 100vw"
      />
      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span className="eyebrow text-[0.65rem] text-ink">{item.category}</span>
        <span aria-hidden className="h-3 w-px bg-ink/20" />
        {item.date ? (
          <time dateTime={item.date} className="text-muted-strong">
            {new Date(item.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </time>
        ) : (
          <span className="text-muted-strong">{item.period}</span>
        )}
        {item.archive && (
          <span className="rounded-xs border border-ink/20 px-1.5 py-0.5 text-[0.6rem] uppercase tracking-wider text-ink/70">
            Archive
          </span>
        )}
      </div>
      <h3 className="mt-3 font-display text-xl font-bold leading-tight tracking-[-0.01em]">
        <Link href={`/actualites/${item.slug}`} className="after:absolute after:inset-0">
          {item.title}
        </Link>
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-strong">{item.excerpt}</p>
    </article>
  );
}
