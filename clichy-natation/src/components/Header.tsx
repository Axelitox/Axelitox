"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { mainNav, site } from "@/lib/site";
import { Logo } from "./Logo";
import { cx } from "./ui";

type Theme = "dark" | "light";
const ease = [0.16, 1, 0.3, 1] as const;

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

export function Header() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<Theme>("dark");
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const lastY = useRef(0);
  const headerRef = useRef<HTMLElement>(null);
  const dropdownRef = useRef<HTMLLIElement>(null);

  // Thème du header selon la section située sous lui (attribut data-header)
  const detect = useCallback(() => {
    const y = window.scrollY;
    setScrolled(y > 24);
    if (y < 480 || open) setHidden(false);
    else if (y > lastY.current + 4) setHidden(true);
    else if (y < lastY.current - 4) setHidden(false);
    lastY.current = y;

    const probeY = (headerRef.current?.offsetHeight ?? 72) / 2;
    const els = document.elementsFromPoint(window.innerWidth / 2, probeY);
    const section = els.find((el) => !headerRef.current?.contains(el))?.closest<HTMLElement>("[data-header]");
    setTheme((section?.dataset.header as Theme) ?? "light");
  }, [open]);

  useEffect(() => {
    detect();
    window.addEventListener("scroll", detect, { passive: true });
    window.addEventListener("resize", detect);
    return () => {
      window.removeEventListener("scroll", detect);
      window.removeEventListener("resize", detect);
    };
  }, [detect, pathname]);

  useEffect(() => {
    setOpen(false);
    setDropdown(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setDropdown(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!dropdown) return;
    const onClick = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setDropdown(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [dropdown]);

  const dark = theme === "dark" || open;
  const solid = scrolled && !open;

  return (
    <>
      <a
        href="#contenu"
        className="sr-only z-[60] bg-signal px-4 py-2 font-display text-sm text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Aller au contenu
      </a>
      <motion.header
        ref={headerRef}
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: hidden ? "-100%" : 0, opacity: 1 }}
        transition={{ duration: 0.6, ease }}
        className={cx(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,color] duration-500",
          solid && dark && "border-b border-white/10 bg-ink/90 backdrop-blur-md",
          solid && !dark && "border-b border-ink/10 bg-paper/90 backdrop-blur-md",
          !solid && "border-b border-transparent",
          dark ? "text-white" : "text-ink",
        )}
      >
        <div className="container-x flex h-[72px] items-center justify-between gap-6">
          <Logo tone={dark ? "light" : "dark"} />

          <nav aria-label="Navigation principale" className="hidden xl:block">
            <ul className="flex items-center gap-1">
              {mainNav.map((item) => {
                const active = isActive(pathname, item.href);
                if (item.children) {
                  return (
                    <li
                      key={item.href}
                      ref={dropdownRef}
                      className="relative"
                      onMouseEnter={() => setDropdown(true)}
                      onMouseLeave={() => setDropdown(false)}
                    >
                      <button
                        type="button"
                        aria-expanded={dropdown}
                        aria-controls="menu-activites"
                        onClick={() => setDropdown((v) => !v)}
                        className={cx(
                          "relative flex items-center gap-1 px-3 py-2 text-[0.82rem] font-medium transition-opacity",
                          active ? "opacity-100" : "opacity-70 hover:opacity-100",
                        )}
                      >
                        {item.label}
                        <ChevronDown aria-hidden className={cx("size-3.5 transition-transform duration-300", dropdown && "rotate-180")} />
                        {active && <ActiveDot />}
                      </button>
                      <AnimatePresence>
                        {dropdown && (
                          <motion.div
                            id="menu-activites"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.25, ease }}
                            className="absolute left-1/2 top-full w-[440px] -translate-x-1/2 pt-3"
                          >
                            <div className="border border-white/20 bg-ink-2 p-2 text-white shadow-2xl">
                              <Link
                                href={item.href}
                                className="flex items-center justify-between px-4 py-3 font-display text-xs uppercase tracking-[0.16em] text-white/60 hover:text-signal"
                              >
                                Toutes les activités <ArrowUpRight aria-hidden className="size-3.5" />
                              </Link>
                              <ul className="grid grid-cols-2 gap-px bg-white/10">
                                {item.children.map((c) => (
                                  <li key={c.href} className="bg-ink">
                                    <Link
                                      href={c.href}
                                      aria-current={pathname === c.href ? "page" : undefined}
                                      className="group block px-4 py-4 transition-colors hover:bg-ink-2"
                                    >
                                      <span className="flex items-center gap-2 text-sm font-medium">
                                        <span
                                          aria-hidden
                                          className="h-px w-0 bg-signal transition-all duration-300 group-hover:w-3"
                                        />
                                        {c.label}
                                      </span>
                                      {c.hint && <span className="mt-1 block text-xs text-white/50">{c.hint}</span>}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                }
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cx(
                        "relative block px-3 py-2 text-[0.82rem] font-medium transition-opacity",
                        active ? "opacity-100" : "opacity-70 hover:opacity-100",
                      )}
                    >
                      {item.label}
                      {active && <ActiveDot />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={site.links.memberArea}
              target="_blank"
              rel="noopener noreferrer"
              className={cx(
                "hidden h-10 items-center rounded-xs border px-4 text-[0.78rem] font-medium transition-colors md:inline-flex",
                dark ? "border-white/25 hover:border-white" : "border-ink/20 hover:border-ink",
              )}
            >
              Espace adhérent<span className="sr-only"> (nouvel onglet)</span>
            </a>
            <Link
              href="/inscriptions"
              className="group hidden h-10 items-center gap-1.5 rounded-xs bg-signal px-4 font-display text-[0.78rem] font-medium uppercase tracking-[0.08em] text-ink transition-colors hover:bg-white sm:inline-flex"
            >
              S&apos;inscrire
              <ArrowUpRight aria-hidden className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              className="-mr-2 grid size-11 place-items-center xl:hidden"
            >
              {open ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-mobile"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease }}
            className="fixed inset-0 z-40 overflow-y-auto bg-ink pt-[72px] text-white xl:hidden"
          >
            <nav aria-label="Navigation mobile" className="container-x flex min-h-full flex-col pb-10 pt-6">
              <ul className="flex flex-col">
                {mainNav.map((item, i) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.15 + i * 0.05, ease }}
                      className="border-b border-white/10"
                    >
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cx(
                          "flex items-center justify-between py-4 font-display text-[2.1rem] font-bold uppercase leading-none tracking-[-0.03em] sm:text-5xl",
                          active ? "text-signal" : "text-white",
                        )}
                      >
                        {item.label}
                        <span className="font-sans text-xs font-normal tracking-normal text-white/40">0{i + 1}</span>
                      </Link>
                      {item.children && (
                        <ul className="grid grid-cols-2 gap-x-4 gap-y-2 pb-5">
                          {item.children.map((c) => (
                            <li key={c.href}>
                              <Link
                                href={c.href}
                                className={cx("text-sm", pathname === c.href ? "text-signal" : "text-white/65")}
                              >
                                {c.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </motion.li>
                  );
                })}
              </ul>
              <div className="mt-auto flex flex-col gap-3 pt-10">
                <Link
                  href="/inscriptions"
                  className="flex h-14 items-center justify-between rounded-xs bg-signal px-5 font-display text-sm font-medium uppercase tracking-[0.1em] text-ink"
                >
                  S&apos;inscrire <ArrowUpRight aria-hidden className="size-5" />
                </Link>
                <a
                  href={site.links.memberArea}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-14 items-center justify-between rounded-xs border border-white/25 px-5 text-sm font-medium"
                >
                  Espace adhérent <ArrowUpRight aria-hidden className="size-5" />
                </a>
                <a href={`mailto:${site.email}`} className="pt-4 text-sm text-white/55">
                  {site.email}
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ActiveDot() {
  return <span aria-hidden className="absolute -bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-signal" />;
}
