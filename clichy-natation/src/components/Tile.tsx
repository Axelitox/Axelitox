import type { ReactNode } from "react";
import type { MediaSlot } from "@/data/media";
import { Photo } from "./Photo";
import { Reveal } from "./Reveal";
import { Button, cx } from "./ui";

type Theme = "white" | "paper" | "black";
type Cta = { label: string; href: string };

const themes: Record<Theme, string> = {
  white: "bg-white text-ink",
  paper: "bg-paper text-ink",
  black: "bg-black text-white",
};

/**
 * Tuile éditoriale : titre et sous-titre centrés, deux pilules, visuel en dessous.
 * `size="hero"` occupe toute la largeur, `size="half"` une colonne de la grille.
 */
export function Tile({
  theme = "white",
  size = "hero",
  eyebrow,
  title,
  sub,
  primary,
  secondary,
  media,
  priority,
  children,
}: {
  theme?: Theme;
  size?: "hero" | "half";
  eyebrow?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  primary?: Cta;
  secondary?: Cta;
  media?: MediaSlot;
  priority?: boolean;
  children?: ReactNode;
}) {
  const dark = theme === "black";
  const hero = size === "hero";
  return (
    <section
      className={cx(
        "relative flex flex-col items-center overflow-hidden text-center",
        themes[theme],
        hero ? "min-h-[580px] pt-12 md:min-h-[692px] md:pt-14" : "min-h-[500px] pt-10 md:min-h-[580px] md:pt-12",
      )}
    >
      <Reveal y={12} className="relative z-10 px-6">
        {eyebrow && <p className={cx("mb-1 text-[17px] font-semibold", dark ? "text-signal" : "text-ink")}>{eyebrow}</p>}
        <h2 className={cx("font-semibold tracking-[-0.015em]", hero ? "text-[40px] leading-[1.1] md:text-[56px] md:leading-[1.07]" : "text-[32px] leading-[1.125] md:text-[40px] md:leading-[1.1]")}>
          {title}
        </h2>
        {sub && (
          <p className={cx("mt-1.5", hero ? "text-[21px] leading-[1.19] md:text-[28px] md:leading-[1.14]" : "text-[19px] leading-[1.21] md:text-[21px]")}>
            {sub}
          </p>
        )}
        {(primary || secondary) && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3.5">
            {primary && (
              <Button href={primary.href} variant="signal">
                {primary.label}
              </Button>
            )}
            {secondary && (
              <Button href={secondary.href} variant={dark ? "outline-light" : "outline-dark"}>
                {secondary.label}
              </Button>
            )}
          </div>
        )}
      </Reveal>
      {children}
      {media && (
        <Reveal y={24} delay={0.1} className="mt-8 w-full flex-1 px-0 md:mt-10">
          <Photo
            media={media}
            tone={dark ? "dark" : "light"}
            priority={priority}
            className={cx("mx-auto h-full w-full", hero ? "min-h-[300px] max-w-[1100px] md:min-h-[400px]" : "min-h-[260px] max-w-[560px] md:min-h-[300px]")}
            sizes={hero ? "100vw" : "(min-width:734px) 50vw, 100vw"}
          />
        </Reveal>
      )}
    </section>
  );
}
