import Image from "next/image";
import { ImageOff } from "lucide-react";
import type { MediaSlot } from "@/data/media";
import { cx } from "./ui";

type Props = {
  media: MediaSlot;
  className?: string;
  /** Classes appliquées à l'image (ex. effet de zoom au survol du parent .group) */
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
  tone?: "dark" | "light";
};

/**
 * Photo officielle du club, ou emplacement réservé tant qu'elle n'est pas importée.
 * On n'affiche jamais d'image générique ou générée à la place d'une vraie photo du club.
 */
export function Photo({ media, className, imgClassName, sizes = "100vw", priority, tone = "dark" }: Props) {
  if (media.src) {
    return (
      <div className={cx("relative overflow-hidden bg-graphite", className)}>
        <Image
          src={media.src}
          alt={media.alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cx("object-cover", imgClassName)}
        />
      </div>
    );
  }

  const dark = tone === "dark";
  return (
    <div
      role="img"
      aria-label={`Emplacement réservé : ${media.alt} (photo officielle à importer)`}
      className={cx("relative overflow-hidden", dark ? "bg-ink-2 text-white" : "bg-mist text-ink", className)}
    >
      {/* Lignes d'eau — motif graphique neutre, pas une fausse photo */}
      <div
        aria-hidden
        className={cx("absolute inset-0 transition-transform duration-700 ease-out", imgClassName)}
        style={{
          backgroundImage: `repeating-linear-gradient(180deg, transparent 0 46px, ${dark ? "rgba(255,255,255,0.05)" : "rgba(8,8,8,0.06)"} 46px 47px)`,
        }}
      />
      <div aria-hidden className="absolute inset-y-0 left-[12%] w-px bg-signal/30" />
      <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-4 md:p-5">
        <ImageOff aria-hidden className={cx("size-4 shrink-0", dark ? "text-white/40" : "text-ink/40")} strokeWidth={1.5} />
        <p className={cx("text-[0.7rem] leading-snug", dark ? "text-white/55" : "text-ink/55")}>
          <span className="block font-display uppercase tracking-[0.14em]">Photo officielle à importer</span>
          <span className="block">{media.brief}</span>
        </p>
      </div>
    </div>
  );
}
