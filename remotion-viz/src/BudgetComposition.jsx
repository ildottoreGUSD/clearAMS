import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { STAFFING_COLOR, SUPPLIES_COLOR, fmt$ } from "./data.js";

// ── Animated arc (SVG ring) ────────────────────────────────────────────────────
function Ring({ pct, size = 140, delay = 0 }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const r    = (size - 18) / 2;
  const circ = 2 * Math.PI * r;

  const progress = spring({
    fps,
    frame: Math.max(0, frame - delay),
    config: { damping: 20, stiffness: 60, mass: 1 },
    durationInFrames: 50,
  });

  const clampedPct  = Math.min(pct, 1);
  const dashOffset  = circ * (1 - progress * clampedPct);
  const overspent   = pct > 1;
  const color       = overspent ? "#DC2626" : pct > 0.92 ? "#B45309" : "#15803D";

  const opacity = interpolate(frame, [delay, delay + 10], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{ position: "relative", width: size, height: size, opacity }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E8EFF7" strokeWidth={14} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontSize: 18, fontWeight: 800, color, fontFamily: "monospace", lineHeight: 1 }}>
          {(Math.min(pct, 9.99) * 100).toFixed(1)}%
        </div>
        <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 3, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          used
        </div>
      </div>
    </div>
  );
}

// ── Animated horizontal bar ────────────────────────────────────────────────────
function Bar({ label, share, budget, expended, accent, delay = 0 }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pct = budget > 0 ? Math.min(expended / budget, 1) : 0;

  const progress = spring({
    fps,
    frame: Math.max(0, frame - delay),
    config: { damping: 22, stiffness: 55, mass: 0.9 },
    durationInFrames: 55,
  });

  const barWidth  = `${progress * pct * 100}%`;
  const remaining = budget - expended;
  const over      = expended > budget;

  const labelOpacity = interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateRight: "clamp" });
  const labelY       = interpolate(frame, [delay, delay + 12], [6, 0],  { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  return (
    <div style={{ marginBottom: 22, opacity: labelOpacity, transform: `translateY(${labelY}px)` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: accent, display: "inline-block" }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#1B2E4F" }}>
            {label}
          </span>
          <span style={{ fontSize: 10, color: "#94A3B8", background: "#EEF1F5", borderRadius: 4, padding: "1px 6px", fontWeight: 600 }}>
            {share}%
          </span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "monospace", color: "#0B1B33" }}>
          {fmt$(budget)}
        </span>
      </div>

      <div style={{ height: 12, background: "#EDF0F5", borderRadius: 999, overflow: "hidden", border: "1px solid #C8D3DF", position: "relative" }}>
        <div style={{
          position: "absolute", top: 0, bottom: 0, left: 0,
          width: barWidth,
          background: over ? "#DC2626" : accent,
          borderRadius: 999,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.4)",
        }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 600, color: over ? "#B91C1C" : "#0B1B33" }}>
          {fmt$(expended)} <span style={{ fontWeight: 400, color: "#94A3B8" }}>expended</span>
        </span>
        <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 600,
          color: remaining < 0 ? "#B91C1C" : remaining < budget * 0.08 ? "#B45309" : "#1B2E4F" }}>
          {remaining >= 0 ? "" : "−"}{fmt$(Math.abs(remaining))} <span style={{ fontWeight: 400, color: "#94A3B8" }}>{remaining >= 0 ? "left" : "over"}</span>
        </span>
      </div>
    </div>
  );
}

// ── Animated number counter ────────────────────────────────────────────────────
function CountUp({ value, delay = 0, style }) {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + 45], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.expo),
  });
  const displayed = Math.round(value * p);
  const opacity   = interpolate(frame, [delay, delay + 10], [0, 1], { extrapolateRight: "clamp" });
  return <span style={{ ...style, opacity }}>{fmt$(displayed)}</span>;
}

// ── Year card ──────────────────────────────────────────────────────────────────
function YearCard({ yearData, label, status, cardDelay, cardWidth }) {
  const frame = useCurrentFrame();
  const { allocation, staffingBudget, suppliesBudget, totalExp } = yearData;
  const staffExp  = Math.round(totalExp * 0.80);
  const suppExp   = totalExp - staffExp;
  const remaining = allocation - totalExp;
  const usagePct  = allocation > 0 ? totalExp / allocation : 0;
  const isCurrent = status === "current";

  const cardY = interpolate(frame, [cardDelay, cardDelay + 20], [40, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const cardOpacity = interpolate(frame, [cardDelay, cardDelay + 20], [0, 1], { extrapolateRight: "clamp" });

  const badgeColor = isCurrent ? "#1D4ED8" : "#15803D";
  const badgeBg    = isCurrent ? "#EEF2FF" : "#ECFDF5";

  return (
    <div style={{
      width: cardWidth, opacity: cardOpacity, transform: `translateY(${cardY}px)`,
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0B1B33", letterSpacing: "-0.015em" }}>{label}</div>
          <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 5, fontFamily: "monospace" }}>Prop 28 Allocation</div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          background: badgeBg, color: badgeColor, borderRadius: 999,
          padding: "5px 12px", fontSize: 10, fontWeight: 700,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: badgeColor, display: "inline-block" }} />
          {isCurrent ? "Live" : "Final"}
        </div>
      </div>

      {/* Allocation + Ring */}
      <div style={{
        background: "white", borderRadius: 14, border: "1px solid #C8D3DF",
        padding: "18px 20px", display: "flex", alignItems: "center", gap: 16,
      }}>
        <Ring pct={usagePct} size={110} delay={cardDelay + 10} />
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94A3B8", marginBottom: 6 }}>
            Starting Allocation
          </div>
          <CountUp value={allocation} delay={cardDelay + 8} style={{ fontSize: 26, fontWeight: 800, fontFamily: "serif", color: "#0B1B33", letterSpacing: "-0.02em" }} />
          <div style={{ fontSize: 11, marginTop: 6, color: "#94A3B8" }}>
            <span style={{ fontWeight: 700, color: usagePct > 1 ? "#B91C1C" : usagePct > 0.92 ? "#B45309" : "#1B2E4F" }}>
              {(Math.min(usagePct, 9.99) * 100).toFixed(1)}%
            </span> utilized
          </div>
        </div>
      </div>

      {/* Budget bars */}
      <div style={{ background: "white", borderRadius: 14, border: "1px solid #C8D3DF", padding: "18px 20px" }}>
        <Bar label="Staffing" share={80} budget={staffingBudget} expended={staffExp}
          accent={STAFFING_COLOR} delay={cardDelay + 18} />
        <Bar label="Supplies" share={20} budget={suppliesBudget} expended={suppExp}
          accent={SUPPLIES_COLOR} delay={cardDelay + 28} />
      </div>

      {/* Totals */}
      <div style={{ background: "white", borderRadius: 14, border: "1px solid #C8D3DF", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ padding: "14px 18px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94A3B8", marginBottom: 5 }}>Total Expended</div>
            <CountUp value={totalExp} delay={cardDelay + 22} style={{ fontSize: 16, fontWeight: 800, fontFamily: "monospace", color: "#0B1B33" }} />
          </div>
          <div style={{ padding: "14px 18px", borderLeft: "1px solid #C8D3DF" }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94A3B8", marginBottom: 5 }}>Remaining</div>
            <CountUp value={Math.abs(remaining)} delay={cardDelay + 26}
              style={{ fontSize: 16, fontWeight: 800, fontFamily: "monospace",
                color: remaining < 0 ? "#B91C1C" : remaining < allocation * 0.05 ? "#B45309" : "#15803D" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main composition ───────────────────────────────────────────────────────────
export function BudgetComposition({ school }) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const titleY = interpolate(frame, [0, 18], [-30, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  const pad      = 60;
  const cardGap  = 28;
  const cardW    = Math.floor((width - pad * 2 - cardGap * 2) / 3);
  const YEARS_LIST = [
    { key: "fy2526", label: "FY 2025–26", status: "current" },
    { key: "fy2425", label: "FY 2024–25", status: "final"   },
    { key: "fy2324", label: "FY 2023–24", status: "final"   },
  ];

  return (
    <div style={{
      width, height,
      background: "linear-gradient(160deg, #F8FAFF 0%, #FFFFFF 60%)",
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      padding: pad,
      display: "flex", flexDirection: "column", gap: 32,
    }}>
      {/* Title */}
      <div style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)` }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94A3B8", marginBottom: 6 }}>
          Glendale Unified School District · Prop 28 Arts &amp; Music
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, color: "#0B1B33", letterSpacing: "-0.025em", lineHeight: 1 }}>
          {school.name}
        </div>
        <div style={{ fontSize: 13, color: "#64748B", marginTop: 8 }}>
          Three-year Prop 28 allocation overview · 80% staffing · 20% supplies
        </div>
      </div>

      {/* Year cards */}
      <div style={{ display: "flex", gap: cardGap, flex: 1, alignItems: "flex-start" }}>
        {YEARS_LIST.map((yr, i) => (
          <YearCard
            key={yr.key}
            yearData={school[yr.key]}
            label={yr.label}
            status={yr.status}
            cardDelay={6 + i * 8}
            cardWidth={cardW}
          />
        ))}
      </div>

      {/* Footer */}
      <div style={{
        fontSize: 10, color: "#CBD5E1", display: "flex", justifyContent: "space-between",
        opacity: interpolate(frame, [20, 30], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        <span>ClearAMS · clearams.gusddev.app</span>
        <span>Data sourced from official Prop 28 allocation spreadsheets</span>
      </div>
    </div>
  );
}
