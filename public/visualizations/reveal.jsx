import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const BRAND = {
  forest: "#071F14",
  mint: "#12B87A",
  white: "#FFFFFF",
  amber: "#E8A838",
  red: "#D94F4F",
  mintLight: "rgba(18, 184, 122, 0.1)",
  mintMid: "rgba(18, 184, 122, 0.35)",
  fontDisplay: "'Syne', sans-serif",
  fontBody: "'DM Sans', sans-serif",
};

// Generate macro dataset findings — the "OkCupid blog" style data
const generateRevealData = () => ({
  // Insight 1: "Romantics" vs "Pragmatists" on prenup support
  romanticVsPragmatic: [
    { label: "Strongly romantic", prenupSupport: 72, n: 340 },
    { label: "Somewhat romantic", prenupSupport: 61, n: 520 },
    { label: "Balanced", prenupSupport: 54, n: 680 },
    { label: "Somewhat pragmatic", prenupSupport: 48, n: 410 },
    { label: "Strongly pragmatic", prenupSupport: 39, n: 190 },
  ],

  // Insight 2: Asset protection priority by gender
  assetPriority: {
    women: [
      { asset: "Retirement", pct: 34 },
      { asset: "Business", pct: 23 },
      { asset: "Property", pct: 22 },
      { asset: "Inheritance", pct: 15 },
      { asset: "Savings", pct: 6 },
    ],
    men: [
      { asset: "Business", pct: 31 },
      { asset: "Retirement", pct: 28 },
      { asset: "Property", pct: 20 },
      { asset: "Inheritance", pct: 12 },
      { asset: "Savings", pct: 9 },
    ],
  },

  // Insight 3: The "Question 14" effect — alignment drops on inheritance
  alignmentByQuestion: Array.from({ length: 20 }, (_, i) => ({
    question: i + 1,
    alignment: i === 13 ? 34 : 60 + Math.random() * 25 - (i > 13 ? 8 : 0),
    isInheritance: i === 13,
  })),

  // Insight 4: Age cohort differences
  ageCohorts: [
    { age: "22–26", support: 68, openness: 82 },
    { age: "27–30", support: 62, openness: 74 },
    { age: "31–35", support: 51, openness: 63 },
    { age: "36–40", support: 42, openness: 55 },
    { age: "41+", support: 31, openness: 44 },
  ],

  // Stats for headline cards
  totalResponses: 2847,
  avgAlignmentScore: 67,
  mostSplitTopic: "Inheritance",
  surpriseStat: "People who call themselves 'romantic' are 1.8× more likely to want a prenup.",
});

function InsightCard({ number, headline, subtext, children }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
        <span style={{ fontFamily: BRAND.fontDisplay, fontSize: 11, color: BRAND.mint, opacity: 0.5 }}>
          {String(number).padStart(2, "0")}
        </span>
        <h3 style={{ fontFamily: BRAND.fontDisplay, fontSize: 18, fontWeight: 300, color: BRAND.white, margin: 0 }}>
          {headline}
        </h3>
      </div>
      <p style={{ fontFamily: BRAND.fontBody, fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 20, lineHeight: 1.6 }}>
        {subtext}
      </p>
      {children}
    </div>
  );
}

function RomanticChart({ data }) {
  return (
    <div>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontFamily: BRAND.fontBody, fontSize: 10, color: "rgba(255,255,255,0.5)", width: 110, textAlign: "right" }}>
            {d.label}
          </span>
          <div style={{ flex: 1, height: 24, background: "rgba(255,255,255,0.04)", borderRadius: 12, overflow: "hidden", position: "relative" }}>
            <div
              style={{
                width: `${d.prenupSupport}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${BRAND.mint}44, ${BRAND.mint})`,
                borderRadius: 12,
                transition: "width 1s ease",
              }}
            />
            <span
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 10,
                fontFamily: BRAND.fontBody,
                color: "rgba(255,255,255,0.6)",
                fontWeight: 600,
              }}
            >
              {d.prenupSupport}%
            </span>
          </div>
        </div>
      ))}
      <p style={{ textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>
        % who support getting a prenup · n = 2,140
      </p>
    </div>
  );
}

function AssetChart({ data }) {
  const maxPct = 40;
  return (
    <div style={{ display: "flex", gap: 24 }}>
      {[
        { key: "women", label: "Women", color: BRAND.mint },
        { key: "men", label: "Men", color: BRAND.amber },
      ].map(({ key, label, color }) => (
        <div key={key} style={{ flex: 1 }}>
          <p style={{ fontFamily: BRAND.fontBody, fontSize: 11, color, fontWeight: 600, textAlign: "center", marginBottom: 8 }}>
            {label}
          </p>
          {data[key].map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ fontFamily: BRAND.fontBody, fontSize: 9, color: "rgba(255,255,255,0.45)", width: 70, textAlign: "right" }}>
                {d.asset}
              </span>
              <div style={{ flex: 1, height: 14, background: "rgba(255,255,255,0.04)", borderRadius: 7, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${(d.pct / maxPct) * 100}%`,
                    height: "100%",
                    background: color,
                    opacity: 0.7,
                    borderRadius: 7,
                  }}
                />
              </div>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", width: 24 }}>{d.pct}%</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function Question14Chart({ data }) {
  return (
    <div style={{ height: 200, marginTop: 8 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id="alignGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND.mint} stopOpacity={0.3} />
              <stop offset="100%" stopColor={BRAND.mint} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="question"
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: BRAND.fontBody }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={false}
            label={{ value: "Question #", position: "insideBottomRight", offset: -5, fill: "rgba(255,255,255,0.3)", fontSize: 9 }}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
            label={{ value: "% aligned", angle: -90, position: "insideLeft", fill: "rgba(255,255,255,0.3)", fontSize: 9 }}
          />
          <Tooltip
            contentStyle={{
              background: BRAND.forest,
              border: `1px solid ${BRAND.mintMid}`,
              borderRadius: 8,
              fontFamily: BRAND.fontBody,
              fontSize: 11,
            }}
            labelFormatter={(v) => `Question ${v}`}
            formatter={(v, name) => [`${Math.round(v)}%`, "Alignment"]}
          />
          <Area
            type="monotone"
            dataKey="alignment"
            stroke={BRAND.mint}
            fill="url(#alignGradient)"
            strokeWidth={2}
            dot={(props) => {
              const { cx, cy, payload } = props;
              if (payload.isInheritance) {
                return (
                  <g>
                    <circle cx={cx} cy={cy} r={6} fill={BRAND.red} stroke={BRAND.white} strokeWidth={1.5} />
                    <text x={cx} y={cy - 14} textAnchor="middle" fill={BRAND.red} fontSize={8} fontWeight={600}>
                      Q14: Inheritance
                    </text>
                  </g>
                );
              }
              return <circle cx={cx} cy={cy} r={2} fill={BRAND.mint} />;
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function AgeCohortChart({ data }) {
  return (
    <div style={{ height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="age"
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: BRAND.fontBody }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              background: BRAND.forest,
              border: `1px solid ${BRAND.mintMid}`,
              borderRadius: 8,
              fontFamily: BRAND.fontBody,
              fontSize: 11,
            }}
          />
          <Line type="monotone" dataKey="support" stroke={BRAND.mint} strokeWidth={2} dot={{ fill: BRAND.mint, r: 4 }} name="Support prenups" />
          <Line type="monotone" dataKey="openness" stroke={BRAND.amber} strokeWidth={2} dot={{ fill: BRAND.amber, r: 4 }} name="Open to discussing" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ShareableInsight({ stat, data }) {
  return (
    <div
      style={{
        background: BRAND.forest,
        border: `1px solid ${BRAND.mintMid}`,
        borderRadius: 16,
        padding: 28,
        maxWidth: 340,
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <p style={{ fontFamily: BRAND.fontBody, fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
        before we... · the data
      </p>

      <h2 style={{ fontFamily: BRAND.fontDisplay, fontSize: 22, fontWeight: 300, color: BRAND.white, lineHeight: 1.4, marginBottom: 20 }}>
        {stat}
      </h2>

      <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: BRAND.fontDisplay, fontSize: 28, color: BRAND.mint }}>{data.totalResponses.toLocaleString()}</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>responses</div>
        </div>
        <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
        <div>
          <div style={{ fontFamily: BRAND.fontDisplay, fontSize: 28, color: BRAND.amber }}>{data.mostSplitTopic}</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>most split topic</div>
        </div>
      </div>

      <div
        style={{
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
        See where you stand → beforewe.com
      </div>
    </div>
  );
}

export default function RevealPrototype() {
  const [data, setData] = useState(null);
  const [activeInsight, setActiveInsight] = useState(0);

  useEffect(() => {
    setData(generateRevealData());
  }, []);

  if (!data) return null;

  const insights = [
    {
      number: 1,
      headline: "Romantics want prenups more.",
      subtext: "People who describe themselves as 'strongly romantic' are 1.8× more likely to support prenups than self-described 'pragmatists.' The data inverts the assumption.",
      chart: <RomanticChart data={data.romanticVsPragmatic} />,
    },
    {
      number: 2,
      headline: "The #1 asset people protect isn't their house.",
      subtext: "Women prioritize retirement accounts. Men prioritize their business. Property comes third for both. The generational shift away from real estate as primary asset is visible in the data.",
      chart: <AssetChart data={data.assetPriority} />,
    },
    {
      number: 3,
      headline: "Question 14 breaks the pattern.",
      subtext: "Couples sail through 13 questions aligned. Then: 'If one of you inherited a significant sum during the marriage, should it stay separate or become shared?' Alignment craters. Every time.",
      chart: <Question14Chart data={data.alignmentByQuestion} />,
    },
    {
      number: 4,
      headline: "The generational divide is real — and accelerating.",
      subtext: "22–26 year olds are twice as likely to support prenups as those over 41. But openness to even discussing it follows the same curve. The gap isn't just opinion — it's willingness to have the conversation at all.",
      chart: <AgeCohortChart data={data.ageCohorts} />,
    },
  ];

  return (
    <div style={{ background: BRAND.forest, minHeight: "100vh", padding: "40px 20px", fontFamily: BRAND.fontBody, color: BRAND.white }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <p style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
          before we... · the data
        </p>
        <h1 style={{ fontFamily: BRAND.fontDisplay, fontWeight: 300, fontSize: 28, marginBottom: 6 }}>The Reveal</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", maxWidth: 400, margin: "0 auto" }}>
          What {data.totalResponses.toLocaleString()} people told us about prenups, money, and the conversations they never had.
        </p>
      </div>

      {/* Insight selector */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
        {insights.map((ins, i) => (
          <button
            key={i}
            onClick={() => setActiveInsight(i)}
            style={{
              padding: "5px 14px",
              borderRadius: 16,
              border: `1px solid ${activeInsight === i ? BRAND.mint : "rgba(255,255,255,0.1)"}`,
              background: activeInsight === i ? "rgba(18,184,122,0.12)" : "transparent",
              color: activeInsight === i ? BRAND.mint : "rgba(255,255,255,0.4)",
              fontFamily: BRAND.fontBody,
              fontSize: 10,
              cursor: "pointer",
            }}
          >
            Insight {i + 1}
          </button>
        ))}
      </div>

      {/* Active insight */}
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <InsightCard {...insights[activeInsight]}>{insights[activeInsight].chart}</InsightCard>
      </div>

      {/* Shareable card */}
      <div style={{ marginTop: 16 }}>
        <p style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 12, letterSpacing: 1 }}>
          SHAREABLE CARD
        </p>
        <ShareableInsight stat={data.surpriseStat} data={data} />
      </div>

      {/* Regenerate */}
      <div style={{ textAlign: "center", marginTop: 28 }}>
        <button
          onClick={() => setData(generateRevealData())}
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
          ↻ Simulate new dataset
        </button>
      </div>
    </div>
  );
}