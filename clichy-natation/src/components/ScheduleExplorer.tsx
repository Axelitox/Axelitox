"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Clock, MapPin, RotateCcw } from "lucide-react";
import { days, schedule, type Slot } from "@/data/schedule";
import { StatusBadge, cx } from "./ui";

type Filters = { activity: string; group: string; day: string; public: string };
const empty: Filters = { activity: "", group: "", day: "", public: "" };

const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));
const fmt = (t: string) => t.replace(":", "h");

export function ScheduleExplorer({ initialActivity = "", compact = false }: { initialActivity?: string; compact?: boolean }) {
  const [f, setF] = useState<Filters>({ ...empty, activity: initialActivity });

  const options = useMemo(() => {
    const byActivity = f.activity ? schedule.filter((s) => s.activity === f.activity) : schedule;
    return {
      activity: uniq(schedule.map((s) => `${s.activity}|${s.activityLabel}`)).map((v) => {
        const [value, label] = v.split("|");
        return { value, label };
      }),
      group: uniq(byActivity.map((s) => s.group)).map((g) => ({ value: g, label: g })),
      day: days.filter((d) => schedule.some((s) => s.day === d)).map((d) => ({ value: d, label: d })),
      public: uniq(schedule.map((s) => s.public)).map((p) => ({ value: p, label: p })),
    };
  }, [f.activity]);

  const results = useMemo(
    () =>
      schedule
        .filter(
          (s) =>
            (!f.activity || s.activity === f.activity) &&
            (!f.group || s.group === f.group) &&
            (!f.day || s.day === f.day) &&
            (!f.public || s.public === f.public),
        )
        .sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day) || a.start.localeCompare(b.start)),
    [f],
  );

  const grouped = useMemo(() => {
    const m = new Map<string, Slot[]>();
    results.forEach((s) => m.set(s.day, [...(m.get(s.day) ?? []), s]));
    return Array.from(m.entries());
  }, [results]);

  const set = (k: keyof Filters, v: string) =>
    setF((prev) => ({ ...prev, [k]: v, ...(k === "activity" ? { group: "" } : {}) }));
  const active = Object.values(f).some(Boolean);

  return (
    <div>
      <fieldset className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <legend className="sr-only">Filtrer les créneaux</legend>
        <Select label="Activité" value={f.activity} onChange={(v) => set("activity", v)} options={options.activity} />
        <Select label="Groupe" value={f.group} onChange={(v) => set("group", v)} options={options.group} />
        <Select label="Jour" value={f.day} onChange={(v) => set("day", v)} options={options.day} />
        <Select label="Public" value={f.public} onChange={(v) => set("public", v)} options={options.public} />
      </fieldset>

      {/* Raccourcis jour : accès en un geste sur mobile */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" role="group" aria-label="Jour rapide">
        {options.day.map((d) => (
          <button
            key={d.value}
            type="button"
            aria-pressed={f.day === d.value}
            onClick={() => set("day", f.day === d.value ? "" : d.value)}
            className={cx(
              "h-9 shrink-0 rounded-full px-4 text-[14px] transition-colors",
              f.day === d.value ? "bg-ink text-white" : "bg-paper hover:bg-mist",
            )}
          >
            {d.label.slice(0, 3)}.
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-b border-ink/10 pb-3 text-sm">
        <p aria-live="polite">
          <strong className="font-display text-lg">{results.length}</strong>{" "}
          <span className="text-muted-strong">créneau{results.length > 1 ? "x" : ""}</span>
        </p>
        {active && (
          <button type="button" onClick={() => setF(empty)} className="inline-flex items-center gap-1.5 text-muted-strong hover:text-ink">
            <RotateCcw aria-hidden className="size-3.5" /> Réinitialiser
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <p className="py-12 text-center text-muted-strong">Aucun créneau ne correspond à ces filtres.</p>
      ) : (
        <div className={cx("divide-y divide-ink/10", compact && "max-h-[640px] overflow-y-auto")}>
          <AnimatePresence initial={false} mode="popLayout">
            {grouped.map(([day, slots]) => (
              <motion.section
                key={day}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="grid gap-3 py-6 md:grid-cols-[160px_1fr] md:gap-8"
                aria-label={day}
              >
                <h3 className="text-[21px] font-semibold tracking-[-0.01em] md:pt-3">{day}</h3>
                <ul className="grid gap-2">
                  {slots.map((s) => (
                    <li
                      key={s.id}
                      className="group grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-2 rounded-[14px] bg-paper p-4 transition-colors hover:bg-mist md:grid-cols-[130px_1.2fr_1fr_1fr_auto]"
                    >
                      <p className="flex items-center gap-2 font-display text-base font-medium tabular-nums">
                        <Clock aria-hidden className="size-4 text-ink/40 group-hover:text-ink" />
                        {fmt(s.start)}–{fmt(s.end)}
                      </p>
                      <p className="font-medium">
                        {s.activityLabel}
                        <span className="text-muted-strong"> · {s.group}</span>
                      </p>
                      <p className="col-span-2 text-sm text-muted-strong md:col-span-1">{s.level}</p>
                      <p className="col-span-2 flex items-center gap-1.5 text-sm text-muted-strong md:col-span-1">
                        <MapPin aria-hidden className="size-3.5" /> {s.place}
                      </p>
                      <div className="col-span-2 md:col-span-1 md:justify-self-end">
                        <StatusBadge status={s.status} />
                      </div>
                      {s.note && <p className="col-span-2 text-xs text-muted-strong md:col-span-5">{s.note}</p>}
                    </li>
                  ))}
                </ul>
              </motion.section>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold text-muted-strong">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cx(
          "h-12 w-full appearance-none rounded-[12px] border bg-white bg-[length:12px] bg-[right_14px_center] bg-no-repeat pl-3 pr-9 text-sm transition-colors focus:border-ink",
          value ? "border-ink" : "border-[#d2d2d7]",
        )}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23080808' fill='none' stroke-width='1.5'/%3E%3C/svg%3E\")",
        }}
      >
        <option value="">Tous</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
