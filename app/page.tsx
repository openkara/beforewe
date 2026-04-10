"use client";
import { useState, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   BEFORE WE — The Conversation Before the Paperwork
   A calm, structured way to get on the same page
   before you sit down with attorneys.
   ═══════════════════════════════════════════════════════════════ */

// ─── Color tokens (Tailwind classes) ───
const T = {
  bg: "bg-stone-50",
  card: "bg-white",
  primary: "teal-700",
  primaryLight: "teal-50",
  accent: "amber-600",
  text: "stone-800",
  muted: "stone-500",
  border: "stone-200",
  success: "emerald-600",
  successLight: "emerald-50",
  caution: "amber-600",
  cautionLight: "amber-50",
  alert: "rose-500",
  alertLight: "rose-50",
  partial: "sky-600",
  partialLight: "sky-50",
};

// ─── Question Bank ───
const SECTIONS = [
  { id: "philosophy", title: "Relationship Philosophy", icon: "✦", description: "How you think about partnership, commitment, and shared life" },
  { id: "financial", title: "Financial Picture", icon: "◈", description: "Current income, savings, and financial habits" },
  { id: "assets", title: "Premarital Assets", icon: "◇", description: "What each person is bringing into the marriage" },
  { id: "business", title: "Business & Entrepreneurship", icon: "△", description: "Current or future business interests and equity" },
  { id: "realestate", title: "Real Estate", icon: "⬡", description: "Property ownership, mortgages, and housing plans" },
  { id: "inheritance", title: "Inheritance & Family Wealth", icon: "◎", description: "Family money, trusts, and expected inheritances" },
  { id: "children", title: "Children & Caregiving", icon: "○", description: "Plans for children and how caregiving affects finances" },
  { id: "lifestyle", title: "Lifestyle & Spending", icon: "◊", description: "Day-to-day spending philosophy and lifestyle expectations" },
  { id: "support", title: "Support & Fairness", icon: "≡", description: "What feels fair if circumstances change over time" },
  { id: "flexibility", title: "Non-Negotiables & Flexibility", icon: "◆", description: "Where you're firm and where you're open" },
];

const QUESTIONS = [
  // ── Relationship Philosophy ──
  { id: "q1", section: "philosophy", text: "How do you view the role of a prenup in a marriage?", options: ["A practical tool that protects both people", "Necessary but uncomfortable", "A sign of mutual respect and planning", "Something I'd rather not need but understand the value of"] },
  { id: "q2", section: "philosophy", text: "What does financial partnership mean to you?", options: ["Everything shared equally", "Shared expenses with individual autonomy", "Proportional contribution based on income", "Mostly separate with joint goals"] },
  { id: "q3", section: "philosophy", text: "How important is financial transparency between partners?", options: ["Complete transparency — no financial secrets", "Mostly open with some personal discretion", "Shared awareness of big picture, privacy on details", "Independent finances with periodic check-ins"] },

  // ── Financial Picture ──
  { id: "q4", section: "financial", text: "How would you describe your current income?", options: ["Steady salaried employment", "Variable consulting or freelance income", "Business owner income", "Mix of salary and variable income", "Currently between roles or transitioning"] },
  { id: "q5", section: "financial", text: "How should income earned during the marriage be treated?", options: ["Fully shared — all marital income goes to a joint pool", "Mostly shared with individual discretionary amounts", "Proportionally shared based on contribution", "Mostly separate with agreed joint contributions"] },
  { id: "q6", section: "financial", text: "How do you feel about taking on debt as a couple?", options: ["We should avoid debt entirely", "Only for major assets like a home", "Strategic debt is fine if both agree", "Each person manages their own debt separately"] },

  // ── Premarital Assets ──
  { id: "q7", section: "assets", text: "Should assets owned before the marriage remain separate property?", options: ["Yes — premarital assets should stay with the original owner", "Mostly, but some sharing is reasonable over time", "They should gradually become shared after certain milestones", "Once married, everything should be considered shared"] },
  { id: "q8", section: "assets", text: "How should premarital investment accounts be treated?", options: ["Remain entirely separate, including any growth", "The original balance stays separate, but growth during marriage is shared", "Shared proportionally based on years married", "Fully shared once married"] },
  { id: "q9", section: "assets", text: "If one person has significantly more premarital savings, how should that factor in?", options: ["It shouldn't — what's yours before marriage stays yours", "The wealthier partner should protect their assets but share income generously", "Over time, the disparity should matter less", "Marriage means equal partnership regardless of starting point"] },

  // ── Business & Entrepreneurship ──
  { id: "q10", section: "business", text: "If one partner starts a business during the marriage, how should equity be treated?", options: ["The business creator retains full ownership", "The non-founding partner deserves some equity for supporting the household", "It depends on how much marital resources went into the business", "Equity should be shared equally — marriage is a team effort"] },
  { id: "q11", section: "business", text: "How should appreciation on a separately-owned business be handled?", options: ["All appreciation remains with the original owner", "Appreciation due to marital effort should be partly shared", "It should be evaluated based on the specific contributions", "Growth during marriage should be shared regardless"] },
  { id: "q12", section: "business", text: "Should startup equity, carried interest, or stock options earned during marriage be shared?", options: ["No — these are tied to individual work and risk", "Partially — a percentage should be considered shared", "Yes, if they vest or pay out during the marriage", "Yes — income is income regardless of form"] },

  // ── Real Estate ──
  { id: "q13", section: "realestate", text: "If one person owns a home before marriage, how should mortgage payments made during marriage be treated?", options: ["The non-owner gets no equity claim — it's premarital property", "The non-owner earns a proportional equity stake from marital payments", "The non-owner gets reimbursed for contributions but not equity", "The home becomes jointly owned once both contribute"] },
  { id: "q14", section: "realestate", text: "If you buy a home together during the marriage, how should it be divided if the marriage ends?", options: ["50/50 split regardless of contribution", "Proportional to financial contribution", "Based on who contributed more to the household overall, including non-financial work", "Whoever needs it more, especially if children are involved"] },

  // ── Inheritance & Family Wealth ──
  { id: "q15", section: "inheritance", text: "Should inheritances received during the marriage remain separate?", options: ["Yes — always separate", "Yes, unless voluntarily commingled", "Partially — some should benefit the household", "Once received during marriage, it becomes shared"] },
  { id: "q16", section: "inheritance", text: "If one family provides significant financial support, should that change the financial dynamics?", options: ["No — gifts from family are separate", "It depends on the intent of the gift", "Family support should be acknowledged but not create obligations", "It should be considered a shared benefit"] },

  // ── Children & Caregiving ──
  { id: "q17", section: "children", text: "If one partner pauses their career to raise children, how should that affect financial support expectations?", options: ["The working partner should fully support the household", "The caregiving partner deserves enhanced financial protection", "Career pauses should be factored into any separation terms", "Both — full support during marriage and protection if it ends"] },
  { id: "q18", section: "children", text: "How should childcare responsibilities factor into prenup planning?", options: ["Caregiving has enormous economic value and should be reflected financially", "It's important but hard to quantify in a prenup", "Caregiving expectations should be discussed but not contractualized", "This is better handled outside a prenup"] },
  { id: "q19", section: "children", text: "Should a prenup include provisions that change based on having children?", options: ["Yes — having children should trigger more protective terms", "Yes — but only around support, not asset division", "Possibly — it should be discussed with an attorney", "No — the prenup should be consistent regardless"] },

  // ── Lifestyle & Spending ──
  { id: "q20", section: "lifestyle", text: "How do you think about major purchases during marriage?", options: ["All major purchases should be joint decisions", "Each person has autonomy up to a certain threshold", "Major purchases should come from a joint fund", "Independent decisions as long as shared obligations are met"] },
  { id: "q21", section: "lifestyle", text: "Should there be a lifestyle maintenance expectation if the marriage ends?", options: ["Yes — both partners should maintain a similar standard of living", "For a reasonable transition period, yes", "Only if there are significant income disparities", "No — each person is responsible for themselves"] },

  // ── Support & Fairness ──
  { id: "q22", section: "support", text: "What is your philosophy on spousal support (alimony)?", options: ["It should be waived entirely", "It should be time-limited and transitional", "It should depend on the length of the marriage and circumstances", "It should ensure the lower-earning partner is not disadvantaged"] },
  { id: "q23", section: "support", text: "Should a prenup become more generous to both parties over time?", options: ["Yes — a sunset clause that phases out the prenup after many years", "Yes — graduated terms that shift toward more sharing over time", "The terms should remain consistent regardless of duration", "It depends on the specific circumstances at that time"] },
  { id: "q24", section: "support", text: "What would feel fair after 15 years of marriage?", options: ["Equal sharing of everything accumulated during the marriage", "Protection of premarital assets but equal sharing of marital growth", "A negotiated split based on the specific financial picture at that time", "The same terms agreed to at the start"] },

  // ── Non-Negotiables & Flexibility ──
  { id: "q25", section: "flexibility", text: "What feels most non-negotiable to you?", options: ["Protecting premarital assets and separate property", "Ensuring fairness if one partner sacrifices career for family", "Maintaining individual financial autonomy", "Equal partnership regardless of who earns more"] },
  { id: "q26", section: "flexibility", text: "Where are you most willing to be flexible?", options: ["How income is shared day-to-day", "How assets are divided if the marriage ends", "Support expectations and timelines", "Nearly everything — I want us to find what works for both"] },
  { id: "q27", section: "flexibility", text: "How should disagreements about financial decisions be resolved during the marriage?", options: ["Joint discussion with a mediator or financial advisor", "The higher earner's preference carries more weight", "Equal say regardless of income", "Alternate decision-making authority or use agreed-upon rules"] },
];

// ─── Comparison Logic ───
function compareResponses(partnerA, partnerB) {
  const results = [];

  for (const q of QUESTIONS) {
    const a = partnerA[q.id];
    const b = partnerB[q.id];
    if (!a || !b) {
      results.push({ question: q, classification: "missing", detail: "One or both partners did not answer this question." });
      continue;
    }

    const sameAnswer = a.answer === b.answer;
    const confidenceDiff = Math.abs((a.confidence || 3) - (b.confidence || 3));
    const importanceDiff = Math.abs((a.importance || 3) - (b.importance || 3));
    const eitherNonNeg = a.nonNegotiable || b.nonNegotiable;
    const bothNonNeg = a.nonNegotiable && b.nonNegotiable;

    // Find option indices to measure distance
    const aIdx = q.options.indexOf(a.answer);
    const bIdx = q.options.indexOf(b.answer);
    const optionDistance = Math.abs(aIdx - bIdx);

    let classification;
    let detail;

    if (sameAnswer && !confidenceDiff && !importanceDiff) {
      classification = "strong_alignment";
      detail = "You're fully aligned on this — same answer, same confidence, same importance.";
    } else if (sameAnswer) {
      if (importanceDiff >= 2 || confidenceDiff >= 2) {
        classification = "partial_alignment";
        detail = "You chose the same answer, but it matters more to one of you. Worth a quick conversation.";
      } else {
        classification = "strong_alignment";
        detail = "You're closely aligned here.";
      }
    } else if (optionDistance <= 1) {
      if (bothNonNeg) {
        classification = "meaningful_difference";
        detail = "Your answers are close, but you've both marked this as non-negotiable. Small gaps on firm positions deserve attention.";
      } else {
        classification = "partial_alignment";
        detail = "Your views are close but not identical. A brief conversation could bring you together.";
      }
    } else if (optionDistance === 2) {
      if (eitherNonNeg) {
        classification = "major_mismatch";
        detail = "You see this differently, and at least one of you considers it non-negotiable. This is an important discussion topic.";
      } else {
        classification = "meaningful_difference";
        detail = "You have noticeably different perspectives here. This is a conversation worth having.";
      }
    } else {
      classification = "major_mismatch";
      detail = "Your views are quite far apart on this. This is a key area to explore together.";
    }

    // Detect emotional intensity mismatch
    const emotionalFlag = importanceDiff >= 2;
    const confidenceFlag = confidenceDiff >= 2;
    const nonNegCollision = a.nonNegotiable && b.nonNegotiable && !sameAnswer;

    results.push({
      question: q,
      a,
      b,
      classification,
      detail,
      flags: {
        emotionalMismatch: emotionalFlag,
        confidenceMismatch: confidenceFlag,
        nonNegotiableCollision: nonNegCollision,
      },
    });
  }

  return results;
}

function generateReport(results) {
  const strong = results.filter((r) => r.classification === "strong_alignment");
  const partial = results.filter((r) => r.classification === "partial_alignment");
  const meaningful = results.filter((r) => r.classification === "meaningful_difference");
  const major = results.filter((r) => r.classification === "major_mismatch");
  const missing = results.filter((r) => r.classification === "missing");
  const nonNegCollisions = results.filter((r) => r.flags?.nonNegotiableCollision);

  return { strong, partial, meaningful, major, missing, nonNegCollisions, all: results };
}

// ─── Reusable Components ───

function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-stone-400 mb-1.5">
        <span>Question {current} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div className="h-full bg-teal-600 rounded-full transition-all duration-500 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function SectionNav({ sections, currentSection, completedSections }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {sections.map((s) => {
        const isCurrent = s.id === currentSection;
        const isComplete = completedSections.includes(s.id);
        return (
          <span key={s.id} className={`text-xs px-3 py-1.5 rounded-full border transition-all ${isCurrent ? "bg-teal-700 text-white border-teal-700" : isComplete ? "bg-teal-50 text-teal-700 border-teal-200" : "bg-white text-stone-400 border-stone-200"}`}>
            {s.icon} {s.title}
          </span>
        );
      })}
    </div>
  );
}

function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-2xl shadow-sm border border-stone-100 p-6 md:p-8 ${className}`}>{children}</div>;
}

function Button({ children, onClick, variant = "primary", size = "md", disabled = false, className = "" }) {
  const base = "rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-teal-700 text-white hover:bg-teal-800 focus:ring-teal-500 shadow-sm",
    secondary: "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 focus:ring-stone-300",
    ghost: "text-teal-700 hover:bg-teal-50 focus:ring-teal-200",
  };
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  );
}

function Disclaimer() {
  return (
    <div className="bg-stone-100 rounded-xl px-5 py-4 text-sm text-stone-500 leading-relaxed">
      <span className="font-semibold text-stone-600">Please note:</span> Before We is an educational alignment tool, not a law firm or legal service. Nothing here constitutes legal advice. Both partners should retain independent legal counsel before finalizing any prenuptial agreement.
    </div>
  );
}

// ─── Landing Page ───
function LandingPage({ onStart }) {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Nav */}
      <nav className="px-6 md:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold text-stone-800 tracking-tight">before we</span>
          <span className="text-xl text-teal-600 tracking-tight">.</span>
        </div>
        <Button onClick={onStart} variant="ghost" size="sm">Get Started</Button>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 md:py-24">
        <div className="max-w-2xl text-center">
          {/* Before We motif */}
          <div className="mb-10 space-y-2">
            <p className="text-lg md:text-xl text-stone-400 italic">Before we assume we agree.</p>
            <p className="text-lg md:text-xl text-stone-400 italic">Before we walk into a lawyer's office.</p>
            <p className="text-lg md:text-xl text-stone-400 italic">Before we let the state decide for us.</p>
            <p className="text-lg md:text-xl text-stone-500 italic">Before we sign anything —</p>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-800 tracking-tight leading-[1.1] mb-6">
            Let's get on<br />
            <span className="text-teal-700">the same page.</span>
          </h1>
          <p className="text-lg md:text-xl text-stone-500 leading-relaxed mb-10 max-w-xl mx-auto">
            A private, structured way for couples to align on prenup-related questions — together. You don't need a lawyer to start talking. You need the right questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={onStart} size="lg">Get Aligned</Button>
            <Button onClick={onStart} variant="secondary" size="lg">See How It Works</Button>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="px-6 md:px-12 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-800 text-center mb-4">The conversation before the paperwork</h2>
          <p className="text-center text-stone-500 mb-12 max-w-2xl mx-auto">Three steps to go from assumptions to alignment.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Reflect Separately", desc: "Each partner privately answers guided questions about money, assets, fairness, children, and what matters most." },
              { num: "02", title: "See Where You Stand", desc: "Before We compares your answers and shows where you already agree, where you differ, and what needs a conversation." },
              { num: "03", title: "Walk In Aligned", desc: "Take a clear, structured summary to your attorneys. You'll spend less time explaining and more time deciding." },
            ].map((step) => (
              <div key={step.num} className="text-center md:text-left">
                <div className="text-teal-600 text-sm font-bold mb-3">{step.num}</div>
                <h3 className="text-lg font-semibold text-stone-800 mb-2">{step.title}</h3>
                <p className="text-stone-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reframe section */}
      <div className="px-6 md:px-12 py-16 bg-white border-t border-stone-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-4">A prenup isn't planning for failure</h2>
          <p className="text-xl text-teal-700 font-medium mb-6">It's planning for the conversation.</p>
          <p className="text-lg text-stone-500 leading-relaxed mb-4">
            The couples who feel closest after this process are the ones who approached it with curiosity instead of fear. When you start from understanding, the legal part gets simpler.
          </p>
          <p className="text-sm text-stone-400 mb-8">
            52% of prenups are now initiated by women. This isn't your parents' prenup.
          </p>
          <Disclaimer />
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 text-center text-sm text-stone-400">
        Before We is an educational alignment tool. It does not provide legal advice.
      </footer>
    </div>
  );
}

// ─── Intro / Framing Page ───
function IntroPage({ onContinue }) {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <Card className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
            <span className="text-teal-700 text-xl">✦</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-800 mb-3">Before You Begin</h1>
          <p className="text-stone-500 leading-relaxed">A few things to know about this process.</p>
        </div>

        <div className="space-y-5 mb-8">
          {[
            { title: "This is a discussion tool, not legal advice", body: "Before We helps you and your partner think through important questions. It doesn't draft legal documents or replace the guidance of an attorney." },
            { title: "Your answers are private until you're ready", body: "Each partner completes their questionnaire separately. Answers are only compared once both partners have finished." },
            { title: "There are no wrong answers", body: "Every couple is different. The goal is clarity and understanding, not judgment." },
            { title: "The output is a discussion brief", body: "You'll receive a structured summary showing alignment, differences, and conversation starters — designed to help you and your attorneys." },
          ].map((item, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-teal-700 text-xs font-bold">{i + 1}</span>
              </div>
              <div>
                <h3 className="font-semibold text-stone-700 mb-1">{item.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={onContinue} className="w-full" size="lg">I Understand — Let's Begin</Button>
      </Card>
    </div>
  );
}

// ─── Questionnaire Component ───
function Questionnaire({ partnerLabel, onComplete, existingResponses }) {
  const [responses, setResponses] = useState(existingResponses || {});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const q = QUESTIONS[currentIdx];
  const section = SECTIONS.find((s) => s.id === q.section);
  const currentResponse = responses[q.id] || { answer: null, confidence: 3, importance: 3, nonNegotiable: false, explanation: "" };

  const completedSections = SECTIONS.filter((s) => {
    const sectionQs = QUESTIONS.filter((qq) => qq.section === s.id);
    return sectionQs.every((qq) => responses[qq.id]?.answer);
  }).map((s) => s.id);

  const updateResponse = (field, value) => {
    setResponses((prev) => ({
      ...prev,
      [q.id]: { ...currentResponse, [field]: value },
    }));
  };

  const canAdvance = currentResponse.answer !== null;

  const handleNext = () => {
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setShowExplanation(false);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setShowExplanation(false);
    }
  };

  const handleFinish = () => {
    onComplete(responses);
  };

  const isLast = currentIdx === QUESTIONS.length - 1;
  const allAnswered = QUESTIONS.every((qq) => responses[qq.id]?.answer);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-stone-50/95 backdrop-blur-sm border-b border-stone-100">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-stone-800">before we</span>
              <span className="text-sm text-teal-600">.</span>
              <span className="text-stone-300 mx-1">·</span>
              <span className="text-sm text-teal-700 font-medium">{partnerLabel}</span>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-teal-50 text-teal-700 font-medium">
              {section.icon} {section.title}
            </span>
          </div>
          <ProgressBar current={currentIdx + 1} total={QUESTIONS.length} />
        </div>
      </div>

      {/* Question */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Card>
          <h2 className="text-xl md:text-2xl font-bold text-stone-800 leading-snug mb-6">{q.text}</h2>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {q.options.map((opt, i) => {
              const selected = currentResponse.answer === opt;
              return (
                <button
                  key={i}
                  onClick={() => updateResponse("answer", opt)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 ${
                    selected
                      ? "border-teal-600 bg-teal-50 text-teal-800"
                      : "border-stone-150 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected ? "border-teal-600 bg-teal-600" : "border-stone-300"}`}>
                      {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm md:text-base leading-relaxed">{opt}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Meta controls */}
          <div className="border-t border-stone-100 pt-6 space-y-5">
            {/* Confidence */}
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-2">How confident are you in this answer?</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    onClick={() => updateResponse("confidence", v)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${currentResponse.confidence === v ? "bg-teal-700 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"}`}
                  >
                    {v === 1 ? "Unsure" : v === 3 ? "Moderate" : v === 5 ? "Very" : v}
                  </button>
                ))}
              </div>
            </div>

            {/* Importance */}
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-2">How important is this topic to you?</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    onClick={() => updateResponse("importance", v)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${currentResponse.importance === v ? "bg-amber-600 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"}`}
                  >
                    {v === 1 ? "Low" : v === 3 ? "Medium" : v === 5 ? "Critical" : v}
                  </button>
                ))}
              </div>
            </div>

            {/* Non-negotiable */}
            <button
              onClick={() => updateResponse("nonNegotiable", !currentResponse.nonNegotiable)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${currentResponse.nonNegotiable ? "border-rose-300 bg-rose-50 text-rose-700" : "border-stone-200 bg-white text-stone-500 hover:border-stone-300"}`}
            >
              <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${currentResponse.nonNegotiable ? "border-rose-500 bg-rose-500" : "border-stone-300"}`}>
                {currentResponse.nonNegotiable && <span className="text-white text-xs">✓</span>}
              </div>
              <span className="text-sm font-medium">This is non-negotiable for me</span>
            </button>

            {/* Explanation toggle */}
            <div>
              <button onClick={() => setShowExplanation(!showExplanation)} className="text-sm text-teal-700 hover:text-teal-800 font-medium">
                {showExplanation ? "Hide" : "Add"} a note to explain your thinking...
              </button>
              {showExplanation && (
                <textarea
                  value={currentResponse.explanation || ""}
                  onChange={(e) => updateResponse("explanation", e.target.value)}
                  placeholder="Share any context or reasoning..."
                  className="mt-3 w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-none"
                  rows={3}
                />
              )}
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button onClick={handlePrev} variant="secondary" disabled={currentIdx === 0}>← Previous</Button>
          <div className="flex gap-3">
            {isLast && allAnswered ? (
              <Button onClick={handleFinish}>Complete Questionnaire →</Button>
            ) : (
              <Button onClick={handleNext} disabled={!canAdvance}>{isLast ? "Review Answers" : "Next →"}</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Partner Selection ───
function PartnerSelect({ onSelect, partnerADone, partnerBDone }) {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
            <span className="text-teal-700 text-xl">◈</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-800 mb-2">Who's answering?</h1>
          <p className="text-stone-500">Each partner completes the questionnaire separately.</p>
        </div>

        <div className="space-y-4">
          {["Partner A", "Partner B"].map((label, i) => {
            const done = i === 0 ? partnerADone : partnerBDone;
            return (
              <button
                key={label}
                onClick={() => onSelect(i === 0 ? "A" : "B")}
                className="w-full text-left"
              >
                <Card className={`hover:shadow-md transition-shadow cursor-pointer ${done ? "border-teal-200 bg-teal-50/30" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-stone-800 text-lg">{label}</h3>
                      <p className="text-sm text-stone-500 mt-1">
                        {done ? "Completed — tap to review or edit" : "Tap to begin the questionnaire"}
                      </p>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${done ? "bg-teal-100 text-teal-700" : "bg-stone-100 text-stone-400"}`}>
                      {done ? "✓" : "→"}
                    </div>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>

        {partnerADone && partnerBDone && (
          <div className="mt-8 text-center">
            <Button onClick={() => onSelect("compare")} size="lg" className="w-full">
              View Your Alignment Report →
            </Button>
          </div>
        )}

        {(partnerADone || partnerBDone) && !(partnerADone && partnerBDone) && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-center">
            <p className="text-sm text-amber-700">One partner has completed their questionnaire. Once both finish, you'll see your alignment report.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Classification Badge ───
function ClassBadge({ classification }) {
  const styles = {
    strong_alignment: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Strong Alignment" },
    partial_alignment: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", label: "Partial Alignment" },
    meaningful_difference: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Meaningful Difference" },
    major_mismatch: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200", label: "Needs Discussion" },
    missing: { bg: "bg-stone-50", text: "text-stone-500", border: "border-stone-200", label: "Missing Info" },
  };
  const s = styles[classification] || styles.missing;
  return (
    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
      {s.label}
    </span>
  );
}

// ─── Comparison Dashboard ───
function ComparisonDashboard({ partnerA, partnerB, onViewReport, onBack }) {
  const results = compareResponses(partnerA, partnerB);
  const report = generateReport(results);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? results : results.filter((r) => r.classification === filter);

  const counts = {
    strong_alignment: report.strong.length,
    partial_alignment: report.partial.length,
    meaningful_difference: report.meaningful.length,
    major_mismatch: report.major.length,
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-800">Your Alignment Map</h1>
            <p className="text-stone-500 mt-1">Here's where you stand, together.</p>
          </div>
          <Button onClick={() => onViewReport(report)} size="sm">View Full Report →</Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { key: "strong_alignment", label: "Aligned", color: "emerald", icon: "✦" },
            { key: "partial_alignment", label: "Close", color: "sky", icon: "◈" },
            { key: "meaningful_difference", label: "Different", color: "amber", icon: "◇" },
            { key: "major_mismatch", label: "To Discuss", color: "rose", icon: "○" },
          ].map((c) => (
            <button
              key={c.key}
              onClick={() => setFilter(filter === c.key ? "all" : c.key)}
              className={`rounded-2xl p-5 border-2 transition-all text-left ${filter === c.key ? `border-${c.color}-400 bg-${c.color}-50` : "border-stone-100 bg-white hover:border-stone-200"}`}
            >
              <div className={`text-3xl font-bold text-${c.color}-600 mb-1`}>{counts[c.key]}</div>
              <div className="text-sm text-stone-600 font-medium">{c.label}</div>
            </button>
          ))}
        </div>

        {/* Filter label */}
        {filter !== "all" && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-stone-500">Showing:</span>
            <ClassBadge classification={filter} />
            <button onClick={() => setFilter("all")} className="text-xs text-teal-700 hover:underline ml-2">Show all</button>
          </div>
        )}

        {/* Question cards */}
        <div className="space-y-4">
          {filtered.map((r, i) => (
            <Card key={i}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="font-semibold text-stone-800 leading-snug flex-1">{r.question.text}</h3>
                <ClassBadge classification={r.classification} />
              </div>

              {r.a && r.b && (
                <div className="grid md:grid-cols-2 gap-4 mb-3">
                  <div className="bg-stone-50 rounded-xl px-4 py-3">
                    <div className="text-xs text-stone-400 font-medium mb-1">Partner A</div>
                    <div className="text-sm text-stone-700">{r.a.answer}</div>
                    {r.a.explanation && <div className="text-xs text-stone-400 mt-2 italic">"{r.a.explanation}"</div>}
                  </div>
                  <div className="bg-stone-50 rounded-xl px-4 py-3">
                    <div className="text-xs text-stone-400 font-medium mb-1">Partner B</div>
                    <div className="text-sm text-stone-700">{r.b.answer}</div>
                    {r.b.explanation && <div className="text-xs text-stone-400 mt-2 italic">"{r.b.explanation}"</div>}
                  </div>
                </div>
              )}

              <p className="text-sm text-stone-500">{r.detail}</p>

              {/* Flags */}
              {r.flags && (r.flags.emotionalMismatch || r.flags.confidenceMismatch || r.flags.nonNegotiableCollision) && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {r.flags.emotionalMismatch && (
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">Importance gap</span>
                  )}
                  {r.flags.confidenceMismatch && (
                    <span className="text-xs px-2 py-1 rounded-full bg-sky-50 text-sky-600 border border-sky-200">Confidence gap</span>
                  )}
                  {r.flags.nonNegotiableCollision && (
                    <span className="text-xs px-2 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200">Non-negotiable conflict</span>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-between">
          <Button onClick={onBack} variant="secondary">← Back</Button>
          <Button onClick={() => onViewReport(report)}>View Full Report →</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Final Report ───
function FinalReport({ report, partnerA, partnerB, onBack }) {
  const prenupModels = [
    {
      title: "Clean Separation Model",
      description: "Each partner retains full ownership of premarital assets and any appreciation on them. Income earned during marriage is shared for household expenses, but savings and investments remain individually managed. In the event of separation, each person leaves with what they brought in, plus their individual accumulations.",
      bestFor: "Couples who both have significant premarital assets and value financial independence.",
    },
    {
      title: "Hybrid Protection Model",
      description: "Premarital assets are protected, but growth and income during the marriage are partially shared. Contributions to the household — including caregiving — are valued and reflected in how marital property is divided. Support provisions scale with the length of the marriage.",
      bestFor: "Couples where one partner may pause work, or where there are meaningful income differences.",
    },
    {
      title: "Time-Based Fairness Model",
      description: "The prenup starts with strong individual protections that gradually shift toward greater sharing over time. After a set number of years, the agreement may sunset entirely. This approach acknowledges that a 3-year marriage and a 20-year marriage are fundamentally different partnerships.",
      bestFor: "Couples who want to balance protection with a commitment that deepens over time.",
    },
  ];

  const counselQuestions = [
    "How does your state treat appreciation of separate property when marital effort contributes to growth?",
    "What are the enforceability standards for spousal support waivers or limitations in your jurisdiction?",
    "How should commingling risks be managed for premarital real estate if marital funds pay the mortgage?",
    "What disclosure requirements apply, and how should full financial disclosure be documented?",
    "Are there sunset clause provisions that courts in your state tend to respect?",
    "How should future business equity, stock options, or carried interest be addressed?",
  ];

  const discussionPrompts = [
    "What would feel fair if you've been married for 10 years and built a life together?",
    "If one person stops working to care for children, how should that shape financial expectations?",
    "If one partner's business grows substantially during the marriage, how should that success be shared?",
    "What does 'being taken care of' mean to each of you in the context of this relationship?",
    "Is there a point in the marriage where a prenup should no longer apply?",
    "What financial arrangement would make both of you feel respected and secure?",
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
            <span className="text-teal-700 text-xl">✦</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-stone-800 mb-2">Your Same Page Report</h1>
          <p className="text-stone-500">Here's where you stand — and where to go from here.</p>
        </div>

        <Disclaimer />

        {/* Section 1: Shared Principles */}
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <span className="text-emerald-600 text-sm font-bold">1</span>
            </div>
            <h2 className="text-xl font-bold text-stone-800">Shared Principles</h2>
          </div>
          <p className="text-sm text-stone-500 mb-4">These are areas where you're already aligned. This is your foundation.</p>
          {report.strong.length > 0 ? (
            <div className="space-y-3">
              {report.strong.map((r, i) => (
                <div key={i} className="bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-4">
                  <div className="text-sm font-medium text-emerald-800 mb-1">{r.question.text}</div>
                  <div className="text-sm text-emerald-600">Both agreed: {r.a?.answer}</div>
                </div>
              ))}
            </div>
          ) : (
            <Card><p className="text-sm text-stone-500">No questions showed complete alignment. That's not unusual — it means everything is worth a conversation.</p></Card>
          )}
        </div>

        {/* Section 2: Key Differences */}
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <span className="text-amber-600 text-sm font-bold">2</span>
            </div>
            <h2 className="text-xl font-bold text-stone-800">Key Differences</h2>
          </div>
          <p className="text-sm text-stone-500 mb-4">These are topics where you see things differently. They're not problems — they're starting points for important conversations.</p>
          {[...report.meaningful, ...report.major].length > 0 ? (
            <div className="space-y-3">
              {[...report.meaningful, ...report.major].map((r, i) => (
                <Card key={i}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="text-sm font-medium text-stone-800">{r.question.text}</div>
                    <ClassBadge classification={r.classification} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-stone-50 rounded-lg px-3 py-2">
                      <span className="text-xs text-stone-400">Partner A: </span>
                      <span className="text-stone-700">{r.a?.answer}</span>
                    </div>
                    <div className="bg-stone-50 rounded-lg px-3 py-2">
                      <span className="text-xs text-stone-400">Partner B: </span>
                      <span className="text-stone-700">{r.b?.answer}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card><p className="text-sm text-stone-500">No major differences detected. You're more aligned than most couples at this stage.</p></Card>
          )}
        </div>

        {/* Section 3: Possible Prenup Directions */}
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
              <span className="text-teal-700 text-sm font-bold">3</span>
            </div>
            <h2 className="text-xl font-bold text-stone-800">Possible Structural Directions</h2>
          </div>
          <p className="text-sm text-stone-500 mb-4">These are common frameworks couples consider. They're discussion starting points, not recommendations.</p>
          <div className="space-y-4">
            {prenupModels.map((model, i) => (
              <Card key={i}>
                <h3 className="font-semibold text-stone-800 mb-2">{model.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed mb-3">{model.description}</p>
                <div className="text-xs text-teal-700 bg-teal-50 rounded-lg px-3 py-2 inline-block">
                  Often considered by: {model.bestFor}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Section 4: Questions for Counsel */}
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
              <span className="text-sky-600 text-sm font-bold">4</span>
            </div>
            <h2 className="text-xl font-bold text-stone-800">Questions for Legal Counsel</h2>
          </div>
          <p className="text-sm text-stone-500 mb-4">Consider raising these topics with your respective attorneys.</p>
          <Card>
            <div className="space-y-3">
              {counselQuestions.map((cq, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="text-sky-500 font-bold mt-0.5">→</span>
                  <span className="text-stone-700 leading-relaxed">{cq}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Section 5: Discussion Prompts */}
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
              <span className="text-rose-500 text-sm font-bold">5</span>
            </div>
            <h2 className="text-xl font-bold text-stone-800">Conversation Starters</h2>
          </div>
          <p className="text-sm text-stone-500 mb-4">Sometimes the best next step is a conversation. Here are some prompts that might help.</p>
          <div className="grid md:grid-cols-2 gap-3">
            {discussionPrompts.map((dp, i) => (
              <div key={i} className="bg-white rounded-xl border border-stone-100 px-5 py-4">
                <p className="text-sm text-stone-700 leading-relaxed italic">"{dp}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Non-negotiable collisions callout */}
        {report.nonNegCollisions.length > 0 && (
          <div className="mt-10">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl px-6 py-5">
              <h3 className="font-semibold text-rose-700 mb-2">Areas Needing Special Attention</h3>
              <p className="text-sm text-rose-600 mb-4">Both partners marked these as non-negotiable but gave different answers. These deserve careful, compassionate conversation.</p>
              {report.nonNegCollisions.map((r, i) => (
                <div key={i} className="bg-white rounded-xl px-4 py-3 mb-2 last:mb-0">
                  <div className="text-sm font-medium text-stone-800">{r.question.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 mb-8">
          <Disclaimer />
          <div className="flex justify-between mt-6">
            <Button onClick={onBack} variant="secondary">← Back to Dashboard</Button>
            <Button onClick={() => window.print()}>Print Report</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Demo Data for Preview ───
function generateDemoData() {
  const partnerA = {};
  const partnerB = {};

  const demoAnswersA = {
    q1: 0, q2: 1, q3: 0, q4: 3, q5: 1, q6: 1, q7: 0, q8: 1, q9: 0,
    q10: 2, q11: 1, q12: 1, q13: 1, q14: 2, q15: 0, q16: 0, q17: 3,
    q18: 0, q19: 0, q20: 0, q21: 1, q22: 1, q23: 1, q24: 1, q25: 0,
    q26: 0, q27: 0,
  };
  const demoAnswersB = {
    q1: 2, q2: 1, q3: 0, q4: 0, q5: 2, q6: 1, q7: 1, q8: 2, q9: 2,
    q10: 1, q11: 2, q12: 2, q13: 2, q14: 0, q15: 1, q16: 2, q17: 3,
    q18: 0, q19: 2, q20: 0, q21: 0, q22: 2, q23: 1, q24: 0, q25: 1,
    q26: 3, q27: 2,
  };

  for (const q of QUESTIONS) {
    const aIdx = demoAnswersA[q.id] ?? 0;
    const bIdx = demoAnswersB[q.id] ?? 0;
    partnerA[q.id] = {
      answer: q.options[aIdx],
      confidence: 3 + Math.floor(Math.random() * 2),
      importance: 2 + Math.floor(Math.random() * 3),
      nonNegotiable: [0, 7, 17, 25].includes(QUESTIONS.indexOf(q)),
      explanation: "",
    };
    partnerB[q.id] = {
      answer: q.options[bIdx],
      confidence: 2 + Math.floor(Math.random() * 3),
      importance: 2 + Math.floor(Math.random() * 3),
      nonNegotiable: [7, 9, 22, 25].includes(QUESTIONS.indexOf(q)),
      explanation: "",
    };
  }

  return { partnerA, partnerB };
}

// ─── Main App ───
export default function App() {
  const [page, setPage] = useState("landing"); // landing, intro, select, questionnaireA, questionnaireB, comparison, report
  const [partnerAResponses, setPartnerAResponses] = useState(null);
  const [partnerBResponses, setPartnerBResponses] = useState(null);
  const [reportData, setReportData] = useState(null);

  // Load from memory on mount
  useEffect(() => {
    try {
      const saved = window.__alignData;
      if (saved) {
        if (saved.partnerA) setPartnerAResponses(saved.partnerA);
        if (saved.partnerB) setPartnerBResponses(saved.partnerB);
      }
    } catch (e) {
      // Silent fail
    }
  }, []);

  // Save to memory
  useEffect(() => {
    window.__alignData = { partnerA: partnerAResponses, partnerB: partnerBResponses };
  }, [partnerAResponses, partnerBResponses]);

  const handleStart = () => setPage("intro");
  const handleIntro = () => setPage("select");

  const handlePartnerSelect = (choice) => {
    if (choice === "A") setPage("questionnaireA");
    else if (choice === "B") setPage("questionnaireB");
    else if (choice === "compare") setPage("comparison");
  };

  const handleCompleteA = (responses) => {
    setPartnerAResponses(responses);
    setPage("select");
  };

  const handleCompleteB = (responses) => {
    setPartnerBResponses(responses);
    setPage("select");
  };

  const handleViewReport = (report) => {
    setReportData(report);
    setPage("report");
  };

  // Quick demo loader
  const loadDemo = () => {
    const demo = generateDemoData();
    setPartnerAResponses(demo.partnerA);
    setPartnerBResponses(demo.partnerB);
    setPage("comparison");
  };

  if (page === "landing") {
    return (
      <div>
        <LandingPage onStart={handleStart} />
        {/* Hidden demo trigger */}
        <button onClick={loadDemo} className="fixed bottom-4 right-4 text-xs text-stone-300 hover:text-stone-500 transition-colors bg-white/80 rounded-lg px-3 py-2 shadow-sm border border-stone-100">
          Preview with demo data
        </button>
      </div>
    );
  }

  if (page === "intro") return <IntroPage onContinue={handleIntro} />;

  if (page === "select") {
    return (
      <PartnerSelect
        onSelect={handlePartnerSelect}
        partnerADone={!!partnerAResponses}
        partnerBDone={!!partnerBResponses}
      />
    );
  }

  if (page === "questionnaireA") {
    return <Questionnaire partnerLabel="Partner A" onComplete={handleCompleteA} existingResponses={partnerAResponses} />;
  }

  if (page === "questionnaireB") {
    return <Questionnaire partnerLabel="Partner B" onComplete={handleCompleteB} existingResponses={partnerBResponses} />;
  }

  if (page === "comparison" && partnerAResponses && partnerBResponses) {
    return (
      <ComparisonDashboard
        partnerA={partnerAResponses}
        partnerB={partnerBResponses}
        onViewReport={handleViewReport}
        onBack={() => setPage("select")}
      />
    );
  }

  if (page === "report" && reportData) {
    return (
      <FinalReport
        report={reportData}
        partnerA={partnerAResponses}
        partnerB={partnerBResponses}
        onBack={() => setPage("comparison")}
      />
    );
  }

  // Fallback
  return <LandingPage onStart={handleStart} />;
}