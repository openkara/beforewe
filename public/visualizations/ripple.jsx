import { useState, useEffect, useRef, useCallback } from "react";

const BRAND = {
  forest: "#071F14",
  mint: "#12B87A",
  white: "#FFFFFF",
  amber: "#E8A838",
  red: "#D94F4F",
  mintLight: "rgba(18, 184, 122, 0.08)",
  mintMid: "rgba(18, 184, 122, 0.35)",
  fontDisplay: "'Syne', sans-serif",
  fontBody: "'DM Sans', sans-serif",
};

const TOPICS = ["Money & Debt", "Property & Assets", "Inheritance", "Family & Career", "Separation", "Financial Values"];

// Generate concentric ring data — you at center, then 1st/2nd/3rd degree connections
const generateRippleData = () => {
  const rings = [
    { label: "You", degree: 0, count: 1 },
    { label: "1st degree", degree: 1, count: 5 },
    { label: "2nd degree", degree: 2, count: 14 },
    { label: "3rd degree", degree: 3, count: 38 },
    { label: "Everyone", degree: 4, count: 124 },
  ];

  // Simulate increasing divergence as social distance grows
  const yourAnswers = TOPICS.map(() => Math.random() * 4 + 1); // 1–5

  return rings.map((ring) => {
    const drift = ring.degree * 0.35; // More drift at higher degrees
    const topicStats = TOPICS.map((topic, i) => {
      const baseMean = yourAnswers[i] + (Math.random() - 0.5) * drift * 2;
      const mean = Math.max(1, Math.min(5, baseMean));
      const std = Math.min(2, 0.2 + ring.degree * 0.4 + Math.random() * 0.3);
      const agreement = Math.max(0, 100 - ring.degree * 18 - Math.random() * 15);
      return { topic, mean: +mean.toFixed(2), std: +std.toFixed(2), agreement: Math.round(agreement) };
    });

    return { ...ring, topics: topicStats };
  });
};

function ConcentricRings({ data, activeDegree, onDegreeSelect, selectedTopic }) {
  const width = 420;
  const height = 420;
  const cx = width / 2;
  const cy = height / 2;
  const maxR = 190;

  const ringRadii = [0, 45, 90, 135, 170, maxR];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", maxWidth: 420, margin: "0 auto", display: "block" }}>
      {/* Concentric rings */}
      {data.map((ring, i) => {
        if (i === 0) return null; // center dot handled separately
        const innerR = ringRadii[i];
        const outerR = ringRadii[i + 1];
        const midR = (innerR + outerR) / 2;
        const isActive = activeDegree === i || activeDegree === null;

        // Color based on selected topic's agreement at this ring
        const topicIdx = selectedTopic !== null ? selectedTopic : 2; // default to Inheritance
        const agreement = ring.topics[topicIdx].agreement;
        let fillColor;
        if (agreement > 70) fillColor = BRAND.mint;
        else if (agreement > 45) fillColor = BRAND.amber;
        else fillColor = BRAND.red;

        const opacity = isActive ? 0.25 : 0.08;

        return (
          <g key={i} onClick={() => onDegreeSelect(i)} style={{ cursor: "pointer" }}>
            {/* Ring band */}
            <circle cx={cx} cy={cy} r={outerR} fill={fillColor} opacity={opacity} />
            <circle cx={cx} cy={cy} r={innerR} fill={BRAND.forest} />

            {/* Ring border */}
            <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={fillColor} strokeWidth={0.5} opacity={0.4} />

            {/* Ring label */}
            <text
              x={cx}
              y={cy - midR}
              textAnchor="middle"
              fill={BRAND.white}
              fontSize={9}
              fontFamily={BRAND.fontBody}
              opacity={isActive ? 0.7 : 0.3}
            >
              {ring.label}
            </text>
            <text
              x={cx}
              y={cy - midR + 12}
              textAnchor="middle"
              fill={BRAND.white}
              fontSize={8}
              fontFamily={BRAND.fontBody}
              opacity={isActive ? 0.4 : 0.2}
            >
              {ring.count} people
            </text>
          </g>
        );
      })}

      {/* Center — You */}
      <circle cx={cx} cy={cy} r={20} fill={BRAND.mint} opacity={0.3} />
      <circle cx={cx} cy={cy} r={8} fill={BRAND.mint} />
      <text x={cx} y={cy + 30} textAnchor="middle" fill={BRAND.mint} fontSize={10} fontFamily={BRAND.fontBody} fontWeight={600}>
        You
      </text>

      {/* Ripple animation rings */}
      {[1, 2, 3].map((pulse) => (
        <circle
          key={pulse}
          cx={cx}
          cy={cy}
          r={20}
          fill="none"
          stroke={BRAND.mint}
          strokeWidth={0.5}
          opacity={0}
        >
          <animate attributeName="r" from="20" to={maxR} dur="4s" begin={`${pulse * 1.2}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.3" to="0" dur="4s" begin={`${pulse * 1.2}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

function DegreeComparison({ data, selectedTopic }) {
  const topicIdx = selectedTopic !== null ? selectedTopic : 2;
  const topic = TOPICS[topicIdx];

  return (
    <div style={{ marginTop: 20, maxWidth: 380, margin: "20px auto" }}>
      <h3 style={{ fontFamily: BRAND.fontDisplay, color: BRAND.mint, fontSize: 14, fontWeight: 300, textAlign: "center", marginBottom: 16 }}>
        {topic} — by social distance
      </h3>

      {data.map((ring, i) => {
        const stat = ring.topics[topicIdx];
        const barWidth = stat.agreement;
        let color;
        if (stat.agreement > 70) color = BRAND.mint;
        else if (stat.agreement > 45) color = BRAND.amber;
        else color = BRAND.red;

        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontFamily: BRAND.fontBody, fontSize: 10, color: "rgba(255,255,255,0.5)", width: 70, textAlign: "right" }}>
              {ring.label}
            </span>
            <div style={{ flex: 1, height: 20, background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden", position: "relative" }}>
              <div
                style={{
                  width: `${barWidth}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${color}88, ${color})`,
                  borderRadius: 10,
                  transition: "width 0.8s ease",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 9,
                  fontFamily: BRAND.fontBody,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                {stat.agreement}% agree with you
              </span>
            </div>
          </div>
        );
      })}

      <p style={{ textAlign: "center", fontFamily: BRAND.fontBody, fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 12 }}>
        Watch how alignment shifts as social distance grows
      </p>
    </div>
  );
}

function HelixVisualization({ data, selectedTopic }) {
  const topicIdx = selectedTopic !== null ? selectedTopic : 2;
  const width = 380;
  const height = 280;
  const padding = 40;

  // Two strands: financial attitude (mean) and emotional attitude (agreement)
  const points = data.map((ring, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const stat = ring.topics[topicIdx];
    const financialY = height / 2 + ((stat.mean - 3) / 2) * 80;
    const emotionalY = height / 2 - ((stat.agreement - 60) / 40) * 80;
    return { x, financialY, emotionalY, ring, stat };
  });

  const financialPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.financialY}`).join(" ");
  const emotionalPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.emotionalY}`).join(" ");

  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ fontFamily: BRAND.fontDisplay, color: BRAND.mint, fontSize: 14, fontWeight: 300, textAlign: "center", marginBottom: 8 }}>
        Double Helix — Financial vs. Emotional Stance
      </h3>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", maxWidth: width, display: "block", margin: "0 auto" }}>
        {/* Grid lines */}
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />

        {/* Connection lines between strands */}
        {points.map((p, i) => (
          <line key={i} x1={p.x} y1={p.financialY} x2={p.x} y2={p.emotionalY} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
        ))}

        {/* Financial strand */}
        <path d={financialPath} fill="none" stroke={BRAND.mint} strokeWidth={2} opacity={0.8} />
        {points.map((p, i) => (
          <circle key={`f${i}`} cx={p.x} cy={p.financialY} r={4} fill={BRAND.mint} />
        ))}

        {/* Emotional strand */}
        <path d={emotionalPath} fill="none" stroke={BRAND.amber} strokeWidth={2} opacity={0.8} />
        {points.map((p, i) => (
          <circle key={`e${i}`} cx={p.x} cy={p.emotionalY} r={4} fill={BRAND.amber} />
        ))}

        {/* X-axis labels */}
        {points.map((p, i) => (
          <text key={i} x={p.x} y={height - 8} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={8} fontFamily={BRAND.fontBody}>
            {p.ring.label}
          </text>
        ))}

        {/* Legend */}
        <circle cx={padding} cy={16} r={4} fill={BRAND.mint} />
        <text x={padding + 10} y={20} fill={BRAND.mint} fontSize={9} fontFamily={BRAND.fontBody}>Financial stance</text>
        <circle cx={padding + 120} cy={16} r={4} fill={BRAND.amber} />
        <text x={padding + 130} y={20} fill={BRAND.amber} fontSize={9} fontFamily={BRAND.fontBody}>Emotional reaction</text>
      </svg>
    </div>
  );
}

export default function RipplePrototype() {
  const [data, setData] = useState(null);
  const [activeDegree, setActiveDegree] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(2); // Default to Inheritance
  const [view, setView] = useState("rings"); // rings | helix

  useEffect(() => {
    setData(generateRippleData());
  }, []);

  if (!data) return null;

  return (
    <div style={{ background: BRAND.forest, minHeight: "100vh", padding: "40px 20px", fontFamily: BRAND.fontBody, color: BRAND.white }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <p style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
          before we...
        </p>
        <h1 style={{ fontFamily: BRAND.fontDisplay, fontWeight: 300, fontSize: 28, marginBottom: 6 }}>The Ripple</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", maxWidth: 400, margin: "0 auto" }}>
          How your views on prenups shift across degrees of social connection — from your closest friends to everyone.
        </p>
      </div>

      {/* Topic selector */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6, marginBottom: 20 }}>
        {TOPICS.map((t, i) => (
          <button
            key={i}
            onClick={() => setSelectedTopic(i)}
            style={{
              padding: "4px 12px",
              borderRadius: 16,
              border: `1px solid ${selectedTopic === i ? BRAND.mint : "rgba(255,255,255,0.12)"}`,
              background: selectedTopic === i ? "rgba(18,184,122,0.12)" : "transparent",
              color: selectedTopic === i ? BRAND.mint : "rgba(255,255,255,0.4)",
              fontFamily: BRAND.fontBody,
              fontSize: 10,
              cursor: "pointer",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* View toggle */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
        {[
          { key: "rings", label: "Concentric Rings" },
          { key: "helix", label: "Double Helix" },
        ].map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            style={{
              padding: "5px 14px",
              borderRadius: 20,
              border: `1px solid ${view === v.key ? BRAND.mint : "rgba(255,255,255,0.15)"}`,
              background: view === v.key ? "rgba(18,184,122,0.15)" : "transparent",
              color: view === v.key ? BRAND.mint : "rgba(255,255,255,0.5)",
              fontFamily: BRAND.fontBody,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === "rings" && (
        <>
          <ConcentricRings data={data} activeDegree={activeDegree} onDegreeSelect={setActiveDegree} selectedTopic={selectedTopic} />
          <DegreeComparison data={data} selectedTopic={selectedTopic} />
        </>
      )}

      {view === "helix" && <HelixVisualization data={data} selectedTopic={selectedTopic} />}

      {/* Insight callout */}
      <div
        style={{
          maxWidth: 360,
          margin: "24px auto 0",
          padding: "16px 20px",
          border: `1px solid ${BRAND.mintMid}`,
          borderRadius: 12,
          background: "rgba(18,184,122,0.05)",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 12, color: BRAND.white, lineHeight: 1.6, margin: 0 }}>
          <span style={{ color: BRAND.mint, fontWeight: 600 }}>
            {data[1].topics[selectedTopic !== null ? selectedTopic : 2].agreement}% of your close friends
          </span>{" "}
          agree with you on {TOPICS[selectedTopic !== null ? selectedTopic : 2].toLowerCase()}, but only{" "}
          <span style={{ color: BRAND.red, fontWeight: 600 }}>
            {data[4].topics[selectedTopic !== null ? selectedTopic : 2].agreement}% of everyone
          </span>{" "}
          does.
        </p>
      </div>

      {/* Regenerate */}
      <div style={{ textAlign: "center", marginTop: 24 }}>
        <button
          onClick={() => setData(generateRippleData())}
          style={{
            padding: "8px 20px",
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "transparent",
            color: "rgba(255,255,255,0.5)",
            fontFamily: BRAND.fontBody,
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          ↻ Simulate new ripple data
        </button>
      </div>
    </div>
  );
}