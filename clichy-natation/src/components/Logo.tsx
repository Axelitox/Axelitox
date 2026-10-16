import Image from "next/image";
import Link from "next/link";
import { media } from "@/data/media";
import { cx } from "./ui";

/**
 * Logo officiel du club. Tant que le fichier officiel n'est pas importé
 * (media.logo.src), on affiche le nom du club en texte — sans créer de faux logo.
 */
export function Logo({ tone = "dark", className }: { tone?: "light" | "dark"; className?: string }) {
  return (
    <Link href="/" aria-label="CS Clichy 92 Natation — accueil" className={cx("inline-flex shrink-0 items-center", className)}>
      {media.logo.src ? (
        <Image src={media.logo.src} alt={media.logo.alt} width={96} height={32} className="h-7 w-auto" priority />
      ) : (
        <span className={cx("text-[14px] font-semibold tracking-[-0.02em]", tone === "light" ? "text-white" : "text-ink")}>
          CS Clichy <span className="rounded-[4px] bg-signal px-1 text-ink">92</span>
        </span>
      )}
    </Link>
  );
}
