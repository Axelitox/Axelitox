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
  /** "cover" remplit le cadre ; "contain" garde la photo entière (visuels de tuiles) */
  fit?: "cover" | "contain";
};

/**
 * Photo officielle du club, ou emplacement réservé tant qu'elle n'est pas importée.
 * On n'affiche jamais d'image générique ou générée à la place d'une vraie photo du club.
 */
export function Photo({ media, className, imgClassName, sizes = "100vw", priority, tone = "dark", fit = "cover" }: Props) {
  if (media.src) {
    return (
      <div className={cx("relative overflow-hidden", className)}>
        <Image
          src={media.src}
          alt={media.alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cx(fit === "cover" ? "object-cover" : "object-contain", imgClassName)}
        />
      </div>
    );
  }

  const dark = tone === "dark";
  return (
    <div
      role="img"
      aria-label={`Emplacement réservé : ${media.alt} (photo officielle à importer)`}
      className={cx("relative grid place-items-center overflow-hidden", dark ? "bg-white/[0.06] text-white" : "bg-black/[0.04] text-ink", className)}
    >
      <div className={cx("flex flex-col items-center gap-2 px-6 text-center transition-transform duration-700", imgClassName)}>
        <ImageOff aria-hidden className={cx("size-6", dark ? "text-white/35" : "text-ink/30")} strokeWidth={1.25} />
        <p className={cx("text-[12px] leading-snug", dark ? "text-white/45" : "text-ink/45")}>
          <span className="block font-semibold">Photo officielle à importer</span>
          <span className="block">{media.brief}</span>
        </p>
      </div>
    </div>
  );
}
