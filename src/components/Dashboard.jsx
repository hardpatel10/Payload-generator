import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Terminal, Layers, Tag, ShieldAlert, TrendingUp, ShieldCheck, Flame } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Sector } from "recharts";
import { CATEGORY_META } from "./categoryMeta.js";
import { computeStats, riskCoverage, owaspCoverage, largestCategory } from "../utils/stats.js";
import useCountUp from "../hooks/useCountUp.js";

const TOOLTIP = {
  contentStyle: { background: "#1c1c28", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, fontSize: 12, color: "#f1f1f4" },
  itemStyle: { color: "#f1f1f4" },
  labelStyle: { color: "#9ca3af" },
};

const categoryColors = Object.fromEntries(Object.entries(CATEGORY_META).map(([k, v]) => [k, v.hex]));

/** Static class strings per accent so Tailwind can see them. */
const TONES = {
  indigo: { grad: "to-accent-indigo/[0.08]", top: "border-t-accent-indigo", text: "text-accent-indigo", chip: "bg-accent-indigo/25 text-accent-indigo" },
  violet: { grad: "to-accent-violet/[0.08]", top: "border-t-accent-violet", text: "text-accent-violet", chip: "bg-accent-violet/25 text-accent-violet" },
  cyan: { grad: "to-accent-cyan/[0.08]", top: "border-t-accent-cyan", text: "text-accent-cyan", chip: "bg-accent-cyan/25 text-accent-cyan" },
  amber: { grad: "to-accent-amber/[0.08]", top: "border-t-accent-amber", text: "text-accent-amber", chip: "bg-accent-amber/25 text-accent-amber" },
};

/** Staggered entrance: delay in ms. */
const rise = (i) => ({ animationDelay: `${i * 50}ms` });

function StatCard({ icon: Icon, value, label, tone, index }) {
  const t = TONES[tone];
  const shown = useCountUp(value);
  return (
    <div
      style={rise(index)}
      className={`relative animate-riseIn overflow-hidden rounded-xl border border-t-2 border-line bg-gradient-to-br from-surface/80 ${t.grad} ${t.top} p-2.5 backdrop-blur-sm`}
    >
      <Icon size={60} strokeWidth={1.5} aria-hidden className={`pointer-events-none absolute -bottom-2 -right-1.5 opacity-[0.09] ${t.text}`} />
      <div className="relative flex items-center gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${t.chip}`}>
          <Icon size={16} />
        </span>
        <div>
          <div className="text-2xl font-semibold leading-none tracking-tight text-content" aria-label={String(value)}>{shown}</div>
          <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.06em] text-content-dim">{label}</div>
        </div>
      </div>
    </div>
  );
}

/** Shared panel chrome: border, glass background, padding, uppercase label (+ optional subtitle and accent bar). */
function Panel({ title, subtitle, children, className = "", accent, index = 0 }) {
  return (
    <section style={rise(index)} className={`relative flex animate-riseIn flex-col overflow-hidden rounded-xl border border-line bg-surface/80 p-3 backdrop-blur-sm ${className}`}>
      {accent && (
        <>
          <span className="absolute inset-x-0 top-0 h-0.5" style={{ background: accent }} />
          <span className="pointer-events-none absolute inset-0" style={{ backgroundImage: `linear-gradient(to bottom, ${accent}1a, transparent 45%)` }} />
        </>
      )}
      <h3 className="relative text-[11px] font-medium uppercase tracking-[0.06em] text-content-dim">{title}</h3>
      {subtitle && <p className="relative mt-0.5 text-xs text-content-secondary">{subtitle}</p>}
      <div className="relative mt-2 flex-1">{children}</div>
    </section>
  );
}

/** True one frame after mount, so width transitions can grow in from 0. */
function useGrown() {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return grown;
}

function RiskRow({ r, pct, highest }) {
  const grown = useGrown();
  const w = grown ? pct : 0;
  return (
    <li>
      <div className="mb-0.5 flex items-center justify-between gap-2 text-xs">
        <span className="flex min-w-0 items-center gap-2 text-content-secondary">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: r.color }} />
          <span className="truncate">{r.name}</span>
          {highest && (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-accent-amber/15 px-1.5 py-px text-[10px] font-medium uppercase tracking-[0.06em] text-accent-amber">
              <Flame size={10} /> Highest
            </span>
          )}
        </span>
        <span className="shrink-0 text-content-dim">
          <span className="font-medium text-content">{r.flagged}</span> of {r.total} flagged
          <span className="ml-1.5 font-medium" style={{ color: r.color }}>{Math.round(pct)}%</span>
        </span>
      </div>
      <div className="flex h-1.5" role="img" aria-label={`${r.name}: ${r.flagged} of ${r.total} commands flagged`}>
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${w}%`, background: r.color, marginRight: pct > 0 && pct < 100 ? 3 : 0 }}
        />
        <div className="h-full min-w-0 flex-1 rounded-full" style={{ background: `${r.color}40` }} />
      </div>
    </li>
  );
}

/** A single OWASP Top 10 row: id + short name, bar length = command count, single cyan accent. */
function OwaspRow({ o, max }) {
  const grown = useGrown();
  return (
    <li>
      <div className="mb-0.5 flex items-baseline justify-between gap-2 text-xs">
        <span className="min-w-0 truncate text-content-secondary">
          <span className="font-medium text-content">{o.id}</span> – {o.name}
        </span>
        <span className="shrink-0 font-medium text-accent-cyan">{o.count}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-accent-cyan transition-[width] duration-500 ease-out"
          style={{ width: grown ? `${(o.count / max) * 100}%` : "0%" }}
        />
      </div>
    </li>
  );
}

/** Donut + legend with linked hover highlighting. */
function CategoryDonut({ stats }) {
  const [hover, setHover] = useState(null);
  const colors = stats.byCategory.map((d) => d.color);
  const glow = `conic-gradient(${[...colors, colors[0]].join(", ")})`;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
      <div className="relative h-36 w-36 shrink-0">
        {/* soft blended glow so the donut floats */}
        <div aria-hidden className="pointer-events-none absolute inset-4 rounded-full opacity-30 blur-2xl" style={{ background: glow }} />
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={stats.byCategory}
              dataKey="value"
              nameKey="name"
              innerRadius={44}
              outerRadius={65}
              paddingAngle={3}
              stroke="none"
              isAnimationActive={false}
              activeIndex={hover ?? undefined}
              activeShape={(p) => <Sector {...p} outerRadius={p.outerRadius + 4} />}
              onMouseEnter={(_, i) => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {stats.byCategory.map((d, i) => (
                <Cell key={d.name} fill={d.color} fillOpacity={hover !== null && hover !== i ? 0.35 : 1} style={{ transition: "fill-opacity 150ms" }} />
              ))}
            </Pie>
            <Tooltip {...TOOLTIP} />
          </PieChart>
        </ResponsiveContainer>
        {/* halo ring at the inner edge + centre label */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[84px] w-[84px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/[0.02] shadow-[inset_0_0_14px_rgba(255,255,255,0.05)]" />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold leading-none">{stats.total}</span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.06em] text-content-secondary">commands</span>
        </div>
      </div>

      <ul className="w-full max-w-[260px] space-y-0.5 text-sm">
        {stats.byCategory.map((d, i) => (
          <li
            key={d.name}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className={`flex items-center gap-2.5 rounded-md px-2 py-1 transition-opacity duration-150 ${hover !== null && hover !== i ? "opacity-40" : ""} ${hover === i ? "bg-white/[0.04]" : ""}`}
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
            <span className="flex-1 truncate text-content-secondary">{d.name}</span>
            <span className="font-medium text-content">{d.value}</span>
            <span className="w-10 text-right text-xs text-content-dim">{Math.round((d.value / stats.total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Collapsible overview: stat cards, then a 2-column area — category donut (main, full height) and a
 * narrow right column with two stacked compact panels (Risk Coverage, OWASP Coverage). Everything here
 * is derived straight from commands.js, so it's always fully populated for every user, independent of
 * any report-builder activity. Stacks to one column on narrow screens.
 * Collapses with a smooth height transition; entrance animations replay each time it opens.
 */
export default function Dashboard({ commands, open, onToggle }) {
  const stats = useMemo(() => computeStats(commands, categoryColors, 10), [commands]);
  const risk = useMemo(() => riskCoverage(commands, categoryColors), [commands]);
  const owasp = useMemo(() => owaspCoverage(commands), [commands]);
  const insight = useMemo(() => largestCategory(stats.byCategory, stats.total), [stats]);

  const maxPct = Math.max(...risk.map((r) => (r.total ? r.flagged / r.total : 0)));
  const highestName = maxPct > 0 ? risk.find((r) => r.flagged / r.total === maxPct)?.name : null;
  const maxOwasp = owasp[0]?.count ?? 1;

  // Bump a key each time the section opens so the staggered entrance animations replay.
  const gen = useRef(0);
  const wasOpen = useRef(false);
  if (open && !wasOpen.current) gen.current += 1;
  wasOpen.current = open;

  return (
    <div className="mx-auto max-w-[1600px] px-4 pt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.06em] text-content-dim">Overview</h2>
        <button
          onClick={onToggle}
          aria-expanded={open}
          aria-controls="dashboard-body"
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-content-secondary transition-colors duration-150 hover:bg-white/5 hover:text-content"
        >
          {open ? "Hide dashboard" : "Show dashboard"}
          <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* grid-rows 0fr -> 1fr gives a smooth height transition without measuring */}
      <div
        id="dashboard-body"
        aria-hidden={!open}
        inert={open ? undefined : ""}
        className={`grid transition-[grid-template-rows,opacity,visibility] duration-300 ease-out ${
          open ? "visible grid-rows-[1fr] opacity-100" : "invisible grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div key={gen.current} className="mt-3 space-y-3 p-px pb-1">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard index={0} icon={Terminal} value={stats.total} label="Total commands" tone="indigo" />
              <StatCard index={1} icon={Layers} value={stats.categoryCount} label="Categories" tone="violet" />
              <StatCard index={2} icon={Tag} value={stats.tagCount} label="Tags" tone="cyan" />
              <StatCard index={3} icon={ShieldAlert} value={stats.riskCount} label="With risk notes" tone="amber" />
            </div>

            {/* items-start: each column takes its own natural height instead of CSS Grid's default
                stretch, which was forcing the shorter side to inflate with empty internal padding. */}
            <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-0">
              <div className="lg:pr-3">
                <Panel index={4} title="Commands by category" subtitle="Share of the library in each category">
                  <div className="flex h-full flex-col">
                    <div className="flex-1">
                      <CategoryDonut stats={stats} />
                    </div>
                    {insight && (
                      <div className="mt-2 flex items-center gap-2 border-t border-line pt-2 text-xs text-content-secondary">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent-indigo/20 text-accent-indigo">
                          <TrendingUp size={13} />
                        </span>
                        <span>
                          <span className="font-medium text-content">{insight.name}</span> is the largest category —{" "}
                          {insight.count} commands ({insight.pct}% of the library)
                        </span>
                      </div>
                    )}
                  </div>
                </Panel>
              </div>

              {/* Right "standing" column, separated from the distribution panel by a thin divider */}
              <div className="flex flex-col gap-3 lg:border-l lg:border-white/[0.06] lg:pl-3">
                <Panel index={5} title="Risk coverage" subtitle="Commands with caution/risk notes, by category">
                  <ul className="space-y-2">
                    {risk.map((r) => (
                      <RiskRow key={r.name} r={r} pct={r.total ? (r.flagged / r.total) * 100 : 0} highest={r.name === highestName} />
                    ))}
                  </ul>
                  <div className="mt-2 flex items-center gap-4 text-[11px] text-content-dim">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-content-secondary" /> Has risk note</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-content-secondary/25" /> No risk note</span>
                  </div>
                </Panel>

                <Panel
                  index={6}
                  title="OWASP coverage"
                  subtitle="Library coverage mapped to OWASP Top 10 categories"
                >
                  {owasp.length === 0 ? (
                    <div className="flex flex-col items-center py-2 text-center">
                      <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-line-hover bg-white/[0.02]">
                        <ShieldCheck size={26} className="text-content-dim opacity-60" />
                      </span>
                      <p className="max-w-[240px] text-xs text-content-dim">
                        No OWASP-mapped commands yet — add #owasp-xx tags to commands to populate this chart.
                      </p>
                    </div>
                  ) : (
                    <>
                      <ol className="max-h-[180px] space-y-1.5 overflow-y-auto pr-1">
                        {owasp.slice(0, 7).map((o) => (
                          <OwaspRow key={o.id} o={o} max={maxOwasp} />
                        ))}
                      </ol>
                      <p className="mt-1.5 text-[11px] text-content-dim">Based on tags in the command library.</p>
                    </>
                  )}
                </Panel>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
