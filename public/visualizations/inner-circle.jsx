import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

const BRAND = {
  forest: "#071F14",
  mint: "#12B87A",
  white: "#FFFFFF",
  amber: "#E8A838",
  red: "#D94F4F",
  mintLight: "rgba(18, 184, 122, 0.15)",
  mintMid: "rgba(18, 184, 122, 0.35)",
  fontDisplay: "'Syne', sans-serif",
  fontBody: "'DM Sans', sans-serif",
};

const TOPICS = [
  "Money & Debt",
  "Property & Assets",
  "Inheritance",
  "Family & Career",
  "Separation",
  "Financial Values",
];

// Simulated friend group data — 6 anonymous friends, 6 topics, scores 1–5
const generateGroupData = () => {
  const friends = ["You", "Friend A", "Friend B", "Friend C", "Friend D", "Friend E"];
  return friends.map((name, i) => ({
    name,
    isYou: i === 0,
    answers: TOPICS.map(() => Math.floor(Math.random() * 5) + 1),
  }));
};

const getAlignmentColor = (std) => {
  if (std < 0.8) return BRAND.mint;
  if (std < 1.4) return BRAND.amber;
  return BRAND.red;
};

const getAlignmentLabel = (std) => {
  if (std < 0.8) return "Aligned";
  if (std < 1.4) return "Worth discussing";
  return "Wildly split";
};

// Petal shape for the flower visualization
const petalPath = (angle, radius, spread = 0.4) => {
  const a1 = angle - spread;
  const a2 = angle + spread;
  const cx = Math.cos(angle) * radius * 0.6;
  const cy = Math.sin(angle) * radius * 0.6;
  return `M 0 0 Q ${Math.cos(a1) * radius} ${Math.sin(a1) * radius} ${Math.cos(angle) * radius * 1.1} ${Math.sin(angle) * radius * 1.1} Q ${Math.cos(a2) * radius} ${Math.sin(a2) * radius} 0 0`;
};

function FlowerVisualization({ data, selectedTopic, onTopicSelect }) {
  const svgRef = useRef(null);
  const [hoveredPetal, setHoveredPetal] = useState(null);

  const stats = TOPICS.map((topic, i) => {
    const values = data.map((d) => d.answers[i]);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(values.reduce((a, v) => a + (v - mean) ** 2, 0) / values.length);
    return { topic, mean, std, values };
  });

  return (
    <div style={{ position: "relative", width: 400, height: 400, margin: "0 auto" }}>
      <svg viewBox="-200 -200 400 400" style={{ width: "100%", height: "100%" }}>
        {/* Background rings */}
        {[160, 120, 80, 40].map((r) => (
          <circle key={r} cx={0} cy={0} r={r} fill="none" stroke={BRAND.mintLight} strokeWidth={0.5} />
        ))}

        {/* Petals — one per topic */}
        {stats.map((s, i) => {
          const angle = (i * Math.PI * 2) / 6 - Math.PI / 2;
          const radius = 60 + s.mean * 20;
          const color = getAlignmentColor(s.std);
          const isSelected = selectedTopic === i;
          const isHovered = hoveredPetal === i;
          const opacity = isSelected ? 1 : isHovered ? 0.85 : 0.6;

          return (
            <g
              key={i}
              onClick={() => onTopicSelect(i)}
              onMouseEnter={() => setHoveredPetal(i)}
              onMouseLeave={() => setHoveredPetal(null)}
              style={{ cursor: "pointer", transition: "all 0.3s ease" }}
            >
              <path
                d={petalPath(angle, radius)}
                fill={color}
                opacity={opacity}
                stroke={isSelected ? BRAND.white : "none"}
                strokeWidth={isSelected ? 2 : 0}
              />
              {/* Topic label */}
              <text
                x={Math.cos(angle) * (radius + 20)}
                y={Math.sin(angle) * (radius + 20)}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={BRAND.white}
                fontSize={10}
                fontFamily={BRAND.fontBody}
                opacity={0.8}
              >
                {s.topic}
              </text>
            </g>
          );
        })}

        {/* Center dot cluster — the ellipsis mark */}
        <circle cx={-8} cy={0} r={3} fill={BRAND.mint} opacity={0.35} />
        <circle cx={0} cy={0} r={4} fill={BRAND.mint} opacity={0.65} />
        <circle cx={10} cy={0} r={5.5} fill={BRAND.mint} opacity={1} />
      </svg>

      {/* Hover tooltip */}
      {hoveredPetal !== null && (
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(7, 31, 20, 0.95)",
            border: `1px solid ${BRAND.mintMid}`,
            borderRadius: 8,
            padding: "8px 14px",
            fontFamily: BRAND.fontBody,
            fontSize: 12,
            color: BRAND.white,
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: getAlignmentColor(stats[hoveredPetal].std), fontWeight: 600 }}>
            {getAlignmentLabel(stats[hoveredPetal].std)}
          </span>
          {" — "}
          {stats[hoveredPetal].topic}
        </div>
      )}
    </div>
  );
}

function TopicDetail({ data, topicIndex }) {
  const topic = TOPICS[topicIndex];
  const values = data.map((d) => ({ name: d.name, value: d.answers[topicIndex], isYou: d.isYou }));
  const sorted = [...values].sort((a, b) => a.value - b.value);

  return (
    <div style={{ marginTop: 20 }}>
      <h3
        style={{
          fontFamily: BRAND.fontDisplay,
          color: BRAND.mint,
          fontSize: 16,
          fontWeight: 300,
          marginBottom: 12,
          textAlign: "center",
        }}
      >
        {topic}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {sorted.map((v, i) => {
          const barWidth = (v.value / 5) * 100;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontFamily: BRAND.fontBody,
                  fontSize: 11,
                  color: v.isYou ? BRAND.mint : "rgba(255,255,255,0.5)",
                  width: 60,
                  textAlign: "right",
                  fontWeight: v.isYou ? 600 : 300,
                }}
              >
                {v.name}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 16,
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 8,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: `${barWidth}%`,
                    height: "100%",
                    background: v.isYou
                      ? `linear-gradient(90deg, ${BRAND.mint}, ${BRAND.mint}88)`
                      : "rgba(255,255,255,0.15)",
                    borderRadius: 8,
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p
        style={{
          fontFamily: BRAND.fontBody,
          fontSize: 11,
          color: "rgba(255,255,255,0.4)",
          textAlign: "center",
          marginTop: 10,
        }}
      >
        1 = strongly disagree · 5 = strongly agree · all responses anonymized
      </p>
    </div>
  );
}

function ShareCard({ data }) {
  const stats = TOPICS.map((topic, i) => {
    const values = data.map((d) => d.answers[i]);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(values.reduce((a, v) => a + (v - mean) ** 2, 0) / values.length);
    return { topic, std };
  });

  const aligned = stats.filter((s) => s.std < 0.8).length;
  const split = stats.filter((s) => s.std >= 1.4).length;

  return (
    <div
      style={{
        background: BRAND.forest,
        border: `1px solid ${BRAND.mintMid}`,
        borderRadius: 16,
        padding: 24,
        maxWidth: 320,
        margin: "20px auto",
        textAlign: "center",
      }}
    >
      <p style={{ fontFamily: BRAND.fontBody, fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
        before we...
      </p>
      <h3 style={{ fontFamily: BRAND.fontDisplay, color: BRAND.white, fontSize: 18, fontWeight: 300, marginBottom: 16 }}>
        Our Friend Group's Prenup DNA
      </h3>

      <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: BRAND.fontDisplay, fontSize: 32, color: BRAND.mint, fontWeight: 300 }}>{aligned}</div>
          <div style={{ fontFamily: BRAND.fontBody, fontSize: 10, color: "rgba(255,255,255,0.5)" }}>topics aligned</div>
        </div>
        <div style={{ width: 1, background: BRAND.mintMid }} />
        <div>
          <div style={{ fontFamily: BRAND.fontDisplay, fontSize: 32, color: BRAND.red, fontWeight: 300 }}>{split}</div>
          <div style={{ fontFamily: BRAND.fontBody, fontSize: 10, color: "rgba(255,255,255,0.5)" }}>wildly split</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 16 }}>
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: getAlignmentColor(s.std),
              opacity: 0.7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 7, color: BRAND.forest, fontFamily: BRAND.fontBody, fontWeight: 600 }}>
              {s.topic.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>

      <p style={{ fontFamily: BRAND.fontBody, fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
        {data.length} friends completed · all anonymized
      </p>
      <div
        style={{
          marginTop: 12,
          padding: "8px 16px",
          background: BRAND.mint,
          borderRadius: 20,
          display: "inline-block",
          fontFamily: BRAND.fontBody,
          fontSize: 11,
          color: BRAND.forest,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Take the survey → beforewe.com
      </div>
    </div>
  );
}

export default function InnerCirclePrototype() {
  const [data, setData] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [view, setView] = useState("flower"); // flower | card

  useEffect(() => {
    setData(generateGroupData());
  }, []);

  if (!data) return null;

  return (
    <div
      style={{
        background: BRAND.forest,
        minHeight: "100vh",
        padding: "40px 20px",
        fontFamily: BRAND.fontBody,
        color: BRAND.white,
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <p style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
          before we...
        </p>
        <h1 style={{ fontFamily: BRAND.fontDisplay, fontWeight: 300, fontSize: 28, marginBottom: 6 }}>
          The Inner Circle
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", maxWidth: 360, margin: "0 auto" }}>
          See how your views on prenups compare with your friend group — all anonymized.
        </p>
      </div>

      {/* View toggle */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
        {[
          { key: "flower", label: "Alignment Map" },
          { key: "card", label: "Share Card" },
        ].map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            style={{
              padding: "6px 16px",
              borderRadius: 20,
              border: `1px solid ${view === v.key ? BRAND.mint : "rgba(255,255,255,0.15)"}`,
              background: view === v.key ? "rgba(18,184,122,0.15)" : "transparent",
              color: view === v.key ? BRAND.mint : "rgba(255,255,255,0.5)",
              fontFamily: BRAND.fontBody,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === "flower" && (
        <>
          <FlowerVisualization data={data} selectedTopic={selectedTopic} onTopicSelect={setSelectedTopic} />
          {selectedTopic !== null && <TopicDetail data={data} topicIndex={selectedTopic} />}

          {/* Legend */}
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 24 }}>
            {[
              { color: BRAND.mint, label: "Aligned" },
              { color: BRAND.amber, label: "Worth discussing" },
              { color: BRAND.red, label: "Wildly split" },
            ].map((l) => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {view === "card" && <ShareCard data={data} />}

      {/* Regenerate button */}
      <div style={{ textAlign: "center", marginTop: 32 }}>
        <button
          onClick={() => {
            setData(generateGroupData());
            setSelectedTopic(null);
          }}
          style={{
            padding: "8px 20px",
            borderRadius: 20,
            border: `1px solid rgba(255,255,255,0.15)`,
            background: "transparent",
            color: "rgba(255,255,255,0.5)",
            fontFamily: BRAND.fontBody,
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          ↻ Simulate new group data
        </button>
      </div>
    </div>
  );
}