"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cx } from "./ui";

/** Rangée de cartes défilante (scroll-snap), avec boutons précédent / suivant. */
export function CardCarousel({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  };

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <ul
        ref={ref}
        onScroll={update}
        aria-label={label}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-5 px-5 pb-10 pt-2 [scrollbar-width:none] md:scroll-px-[max(2rem,calc((100vw-1056px)/2))] md:px-[max(2rem,calc((100vw-1056px)/2))] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
      <div className="container-x flex justify-end gap-3">
        {([-1, 1] as const).map((dir) => {
          const disabled = dir === -1 ? edges.start : edges.end;
          const Icon = dir === -1 ? ChevronLeft : ChevronRight;
          return (
            <button
              key={dir}
              type="button"
              onClick={() => scroll(dir)}
              disabled={disabled}
              aria-label={dir === -1 ? "Précédent" : "Suivant"}
              className={cx(
                "grid size-9 place-items-center rounded-full bg-mist text-ink transition-opacity",
                disabled ? "opacity-40" : "hover:bg-[#dcdce1]",
              )}
            >
              <Icon aria-hidden className="size-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CarouselCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <li
      className={cx(
        "w-[300px] shrink-0 snap-start overflow-hidden rounded-[18px] bg-white shadow-[2px_4px_12px_rgba(0,0,0,0.08)] transition-[box-shadow,transform] duration-300 hover:scale-[1.01] hover:shadow-[2px_4px_16px_rgba(0,0,0,0.16)] md:w-[400px]",
        className,
      )}
    >
      {children}
    </li>
  );
}
