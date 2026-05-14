import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { fmt$ } from "./data.js";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  navy:   "#0B2545",
  ink:    "#0B1B33",
  blue:   "#1D4ED8",
  alloc:  "#94A3B8",
  spent:  "#2563EB",
  over:   "#DC2626",
  amber:  "#D97706",
  green:  "#15803D",
  muted:  "#64748B",
  line:   "#E2E8F0",
  white:  "#FFFFFF",
};

const YEARS = [
  { key: "fy2324", label: "FY 2023–24", tag: "Launch Year",     tagFg: "#475569", tagBg: "#F1F5F9" },
  { key: "fy2425", label: "FY 2024–25", tag: "Growth Year",     tagFg: "#92400E", tagBg: "#FEF3C7" },
  { key: "fy2526", label: "FY 2025–26", tag: "Live · Current",  tagFg: "#FFFFFF", tagBg: C.blue },
];

// ── Animated vertical bar ──────────────────────────────────────────────────────
function AnimBar({ value, maxValue, chartH, color, barW, delay }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const prog = spring({
    fps,
    frame: Math.max(0, frame - delay),
    config: { damping: 24, stiffness: 40, mass: 1.1 },
    durationInFrames: 65,
  });

  const h = maxValue > 0 ? (value / maxValue) * chartH * prog : 0;
  const safeH = Math.max(h, value > 0 ? 4 : 0);

  const labelOpacity = interpolate(frame, [delay + 50, delay + 65], [0, 1], { extrapolateRight: "clamp" });
  const labelY = interpolate(frame, [delay + 50, delay + 65], [6, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div style={{ width: barW, height: chartH, position: "relative", display: "flex", alignItems: "flex-end" }}>
      {/* Dollar label floats just above bar top */}
      <div style={{
        position: "absolute",
        bottom: safeH + 8, left: -16, right: -16,
        textAlign: "center",
        fontSize: 11, fontWeight: 700, fontFamily: "monospace",
        color: C.ink,
        opacity: labelOpacity,
        transform: `translateY(${labelY}px)`,
        whiteSpace: "nowrap",
      }}>
        {fmt$(value)}
      </div>
      {/* Bar body */}
      <div style={{
        width: "100%",
        height: safeH,
        background: color,
        borderRadius: "5px 5px 0 0",
      }} />
    </div>
  );
}

// ── Explanatory callout card ───────────────────────────────────────────────────
function CalloutCard({ label, tag, tagFg, tagBg, headline, body, accent, delay }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(frame, [delay, delay + 20], [16, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div style={{
      flex: 1,
      opacity,
      transform: `translateY(${y}px)`,
      background: C.white,
      border: `2px solid ${accent}`,
      borderRadius: 16,
      padding: "18px 20px",
      boxShadow: "0 6px 28px rgba(11,27,51,0.11)",
      display: "flex",
      flexDirection: "column",
      gap: 0,
    }}>
      {/* Accent bar */}
      <div style={{ width: 28, height: 4, background: accent, borderRadius: 2, marginBottom: 10 }} />
      {/* Year + tag row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: C.ink, letterSpacing: "-0.01em" }}>{label}</span>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
          color: tagFg, background: tagBg, padding: "3px 9px", borderRadius: 99,
        }}>{tag}</span>
      </div>
      {/* Headline stat */}
      {headline && (
        <div style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "0.02em", marginBottom: 6 }}>
          {headline}
        </div>
      )}
      {/* Body text */}
      <div style={{ fontSize: 12, color: "#334155", lineHeight: 1.62 }}>
        {body}
      </div>
    </div>
  );
}

// ── Horizontal grid line ───────────────────────────────────────────────────────
function GridLine({ y, label, delay }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [delay, delay + 14], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, opacity }}>
      <div style={{ position: "absolute", left: 0, right: 0, borderTop: `1px dashed ${C.line}` }} />
      <div style={{ position: "absolute", right: "100%", paddingRight: 10, top: -9,
        fontSize: 10, color: C.muted, fontFamily: "monospace", whiteSpace: "nowrap" }}>
        {label}
      </div>
    </div>
  );
}

// ── Main composition ───────────────────────────────────────────────────────────
export function BudgetComposition({ school }) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Layout constants
  const pad      = 80;
  const titleH   = 92;
  const chartH   = 280;
  const axisY    = titleH + chartH + 14;
  const labelH   = 70;
  const cardTop  = axisY + labelH + 18;
  const cardH    = height - cardTop - 28;
  const chartW   = width - pad * 2;
  const groupW   = chartW / 3;
  const barW     = 54;
  const barGap   = 12;

  // Y-axis scale
  const allAmounts = YEARS.flatMap(yr => [
    school[yr.key].allocation,
    school[yr.key].totalExp,
  ]).filter(v => v > 0);
  const rawMax = Math.max(...allAmounts, 1);
  const maxVal = rawMax * 1.20;

  // Grid lines at 25/50/75/100% of raw max
  const gridFracs = [0.25, 0.5, 0.75, 1.0];
  const gridLines = gridFracs.map(f => ({
    value: rawMax * f,
    yPx: chartH - (rawMax * f / maxVal) * chartH,
  }));

  // Per-year derived data
  const yearItems = YEARS.map((yr, i) => {
    const d = school[yr.key];
    const isOver  = d.totalExp > d.allocation && d.totalExp > 0;
    const isAmber = !isOver && d.totalExp > d.allocation * 0.88 && d.totalExp > 0;
    const pct     = d.allocation > 0 && d.totalExp > 0
      ? (d.totalExp / d.allocation * 100).toFixed(1) : "0.0";
    return { ...yr, d, isOver, isAmber, pct, i };
  });

  // Callout content generator
  function calloutContent(item) {
    const { key, d, isOver, pct } = item;
    const pctN = parseFloat(pct);

    if (key === "fy2324") {
      if (d.totalExp === 0 || pctN < 0.1) {
        return {
          headline: "No expenditure recorded",
          body: `FY 2023–24 was Prop 28's launch year. Programs were newly established and funds were carried forward, establishing the baseline allocation of ${fmt$(d.allocation)}.`,
          accent: C.muted,
        };
      }
      return {
        headline: `${pct}% utilized · ${fmt$(d.totalExp)} expended`,
        body: `${fmt$(d.allocation)} was allocated for the launch year. Initial expenditures covered early staffing contracts and first-year supply purchases.`,
        accent: pctN > 88 ? C.amber : C.muted,
      };
    }

    if (key === "fy2425") {
      if (isOver) {
        return {
          headline: `Over budget by ${fmt$(d.totalExp - d.allocation)}`,
          body: `Expenditure of ${fmt$(d.totalExp)} exceeded the ${fmt$(d.allocation)} annual allocation. The school drew on prior-year reserves or supplemental sources to cover the overage.`,
          accent: C.over,
        };
      }
      return {
        headline: `${pct}% utilized · ${fmt$(d.totalExp)} expended`,
        body: `Spending grew significantly from the prior year as arts programs reached full operation — staffing contracts expanded and supply procurement accelerated. ${fmt$(d.allocation - d.totalExp)} remained unspent.`,
        accent: pctN > 88 ? C.amber : C.blue,
      };
    }

    // fy2526
    if (isOver) {
      return {
        headline: `Over budget by ${fmt$(d.totalExp - d.allocation)}`,
        body: `Current-year spending of ${fmt$(d.totalExp)} has already exceeded the ${fmt$(d.allocation)} allocation, reflecting strong program activity through May 2026.`,
        accent: C.over,
      };
    }
    if (pctN < 10) {
      return {
        headline: `${pct}% utilized so far`,
        body: `Only ${fmt$(d.totalExp)} of the ${fmt$(d.allocation)} allocation has been expended through May 2026. Significant funds remain available for staffing and supplies in the second half of the fiscal year.`,
        accent: C.blue,
      };
    }
    return {
      headline: `${pct}% utilized · ${fmt$(d.totalExp)} expended`,
      body: `${fmt$(d.allocation - d.totalExp)} remains available through June 2026. ${pctN > 80 ? "The budget is nearing full utilization — strong arts program activity this year." : "Funds continue to be deployed for staffing and instructional supplies."}`,
      accent: C.blue,
    };
  }

  // Global animation values
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const titleY       = interpolate(frame, [0, 18], [-22, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const legendOpacity= interpolate(frame, [10, 26], [0, 1], { extrapolateRight: "clamp" });
  const axisOpacity  = interpolate(frame, [14, 28], [0, 1], { extrapolateRight: "clamp" });
  const footerOpacity= interpolate(frame, [55, 72], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{
      width, height,
      background: "linear-gradient(148deg, #EEF2FF 0%, #F5F8FF 45%, #FAFBFF 100%)",
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      overflow: "hidden",
      position: "relative",
    }}>

      {/* ── Title ── */}
      <div style={{
        position: "absolute", top: 24, left: pad + 40, right: pad,
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        opacity: titleOpacity, transform: `translateY(${titleY}px)`,
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 5 }}>
            Glendale Unified · Prop 28 Arts &amp; Music in Schools
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, color: C.navy, letterSpacing: "-0.025em", lineHeight: 1 }}>
            {school.name}
          </div>
        </div>
        <div style={{ fontSize: 12, color: C.muted, textAlign: "right", lineHeight: 1.6 }}>
          Allocation vs. Expenditure<br />
          <span style={{ fontSize: 10.5 }}>Three-Year Overview · FY 2023–2026</span>
        </div>
      </div>

      {/* ── Legend ── */}
      <div style={{
        position: "absolute", top: 80, right: pad,
        display: "flex", gap: 18, alignItems: "center",
        opacity: legendOpacity,
      }}>
        {[
          { color: C.alloc, label: "Allocated" },
          { color: C.spent, label: "Expended" },
          { color: C.over,  label: "Over Budget" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
            <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Baseline axis ── */}
      <div style={{
        position: "absolute", left: pad + 40, right: pad, top: axisY,
        height: 2, background: C.line, opacity: axisOpacity,
      }} />

      {/* ── Y-axis grid lines ── */}
      <div style={{ position: "absolute", left: pad + 40, right: pad, top: titleH + 14 }}>
        {gridLines.map(({ value, yPx }, idx) => (
          <GridLine key={idx} y={yPx} label={fmt$(value)} delay={16 + idx * 5} />
        ))}
      </div>

      {/* ── Bar groups ── */}
      {yearItems.map((item) => {
        const { d, isOver, isAmber, i } = item;
        const barDelay   = 18 + i * 22;
        const spentColor = isOver ? C.over : isAmber ? C.amber : C.spent;
        const gX         = pad + 40 + i * groupW;
        const barsX      = gX + (groupW - barW * 2 - barGap) / 2;
        const lblFade    = interpolate(frame, [barDelay + 38, barDelay + 54], [0, 1], { extrapolateRight: "clamp" });

        return (
          <div key={item.key}>
            {/* Allocation bar */}
            <div style={{ position: "absolute", left: barsX, top: titleH + 14 }}>
              <AnimBar value={d.allocation} maxValue={maxVal} chartH={chartH}
                color={C.alloc} barW={barW} delay={barDelay} />
            </div>
            {/* Expended bar */}
            <div style={{ position: "absolute", left: barsX + barW + barGap, top: titleH + 14 }}>
              <AnimBar value={d.totalExp} maxValue={maxVal} chartH={chartH}
                color={spentColor} barW={barW} delay={barDelay + 14} />
            </div>
            {/* Year label + tag below axis */}
            <div style={{
              position: "absolute",
              left: gX, width: groupW,
              top: axisY + 10,
              textAlign: "center",
              opacity: lblFade,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 6 }}>
                {item.label}
              </div>
              <div style={{
                display: "inline-block",
                fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                color: item.tagFg, background: item.tagBg, padding: "3px 10px", borderRadius: 99,
              }}>
                {item.tag}
              </div>
            </div>
          </div>
        );
      })}

      {/* ── Callout cards ── */}
      <div style={{
        position: "absolute", left: pad, right: pad, top: cardTop, height: cardH,
        display: "flex", gap: 16,
      }}>
        {yearItems.map((item) => {
          const content = calloutContent(item);
          return (
            <CalloutCard
              key={item.key}
              label={item.label}
              tag={item.tag}
              tagFg={item.tagFg}
              tagBg={item.tagBg}
              headline={content.headline}
              body={content.body}
              accent={content.accent}
              delay={82 + item.i * 22}
            />
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div style={{
        position: "absolute", bottom: 14, left: pad, right: pad,
        display: "flex", justifyContent: "space-between",
        fontSize: 10, color: "#CBD5E1", opacity: footerOpacity,
      }}>
        <span>ClearAMS · clearams.gusddev.app</span>
        <span>Figures accurate as of May 1, 2026 · Official Prop 28 Allocation Spreadsheet · GUSD VAPA</span>
      </div>
    </div>
  );
}
