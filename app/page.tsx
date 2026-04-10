"use client";
// @ts-nocheck
import { useState, useMemo } from "react";

/* ================================================================
   TYPES
   ================================================================ */
type Phase =
  | "landing"
  | "name-entry"
  | "values"
  | "values-summary"
  | "deep-dive-intro"
  | "deep-dive"
  | "profile-summary"
  | "partner-gate"
  | "comparison"
  | "deal-memo";

interface Option { value: string; label: string; desc: string }
interface ValuesQ { id: string; sectionLabel: string; sectionIntro: string; question: string; options: Option[] }
interface DeepDiveQ { id: string; topic: string; question: string; options: Option[]; scale: Record<string, number> }
interface PartnerData {
  name: string;
  valuesAnswers: Record<string, string>;
  deepDiveAnswers: Record<string, { answer: string; importance: number }>;
  questionIds: string[];
}

/* ================================================================
   VALUES QUESTIONS — Phase 1 (6 questions)
   ================================================================ */
const VALUES_QUESTIONS: ValuesQ[] = [
  {
    id: "moneyMindset",
    sectionLabel: "Money Personality",
    sectionIntro: "Let\u2019s start with the basics \u2014 how you naturally think about money.",
    question: "When it comes to money, which feels most like you?",
    options: [
      { value: "guardian", label: "The Protector", desc: "I like knowing there\u2019s a safety net" },
      { value: "builder", label: "The Builder", desc: "I want money to grow and work for us" },
      { value: "enjoyer", label: "The Experiencer", desc: "Money is for creating the life we want" },
      { value: "balancer", label: "The Balancer", desc: "A little of everything, nothing extreme" },
    ],
  },
  {
    id: "togetherness",
    sectionLabel: "Financial Togetherness",
    sectionIntro: "Now let\u2019s talk about how you picture sharing finances as a couple.",
    question: "How do you picture handling finances together?",
    options: [
      { value: "fully-combined", label: "All In", desc: "One pot \u2014 what\u2019s mine is yours" },
      { value: "mostly-combined", label: "Mostly Together", desc: "Shared, but with some personal breathing room" },
      { value: "split-collaborative", label: "Split but Collaborative", desc: "Separate accounts, shared decisions" },
      { value: "largely-independent", label: "Independent", desc: "We each handle our own" },
    ],
  },
  {
    id: "futureVision",
    sectionLabel: "Looking Ahead",
    sectionIntro: "Let\u2019s zoom out \u2014 what does the future look like for you?",
    question: "When you picture the next 10 years, what excites you most?",
    options: [
      { value: "wealth", label: "Building Wealth", desc: "Growing our financial foundation together" },
      { value: "family", label: "Growing a Family", desc: "Kids, home, the whole picture" },
      { value: "career", label: "Career & Ambition", desc: "Professional growth and new opportunities" },
      { value: "lifestyle", label: "Experiences", desc: "Travel, adventures, and enjoying life" },
      { value: "security", label: "Stability", desc: "Knowing we\u2019re secure no matter what" },
    ],
  },
  {
    id: "riskComfort",
    sectionLabel: "Risk Tolerance",
    sectionIntro: "Here\u2019s a scenario to think about.",
    question: "A friend pitches you both on a real estate investment. Your gut reaction?",
    options: [
      { value: "very-conservative", label: "No Thanks", desc: "I\u2019d rather keep what we have safe" },
      { value: "somewhat-cautious", label: "Show Me the Numbers", desc: "Maybe, if the math really works" },
      { value: "moderate-risk", label: "I\u2019m Interested", desc: "Growth takes some risk" },
      { value: "aggressive", label: "I\u2019m In", desc: "You have to bet big to win big" },
    ],
  },
  {
    id: "incomeApproach",
    sectionLabel: "The Income Question",
    sectionIntro: "This one comes up more than you\u2019d think.",
    question: "If one partner earns significantly more, how should that affect things?",
    options: [
      { value: "equal", label: "Doesn\u2019t Matter", desc: "We split everything 50/50 regardless" },
      { value: "proportional", label: "Proportional", desc: "We each contribute relative to what we earn" },
      { value: "higher-more", label: "Higher Earner Steps Up", desc: "They naturally take on more" },
      { value: "situational", label: "It Depends", desc: "Context matters here" },
    ],
  },
  {
    id: "coreValue",
    sectionLabel: "What Matters Most",
    sectionIntro: "Last one in this section \u2014 and it\u2019s a big one.",
    question: "If you could only choose one, what matters most in how you handle money together?",
    options: [
      { value: "trust", label: "Transparency", desc: "Total honesty about everything financial" },
      { value: "independence", label: "Autonomy", desc: "Having space to make some choices on my own" },
      { value: "equality", label: "Fairness", desc: "Things feeling balanced and equitable" },
      { value: "flexibility", label: "Adaptability", desc: "Being able to evolve as life changes" },
    ],
  },
];

/* ================================================================
   DEEP DIVE QUESTIONS — Pool of 15 (system selects 6)
   ================================================================ */
const DEEP_DIVE_POOL: DeepDiveQ[] = [
  {
    id: "separate_property", topic: "Separate Property",
    question: "Should either of you be able to keep certain assets completely separate \u2014 like savings from before the relationship, a family heirloom, or a side business?",
    options: [
      { value: "yes", label: "Yes, absolutely", desc: "Some things should stay individual" },
      { value: "some", label: "For certain things", desc: "It depends on the asset" },
      { value: "probably-not", label: "Probably not", desc: "We\u2019re building this together" },
      { value: "unsure", label: "Haven\u2019t thought about it", desc: "I\u2019d need to think on this" },
    ],
    scale: { yes: 0, some: 1, "probably-not": 3, unsure: 1 },
  },
  {
    id: "business_ownership", topic: "Business Ownership",
    question: "If one of you starts a business during the marriage, how should ownership work?",
    options: [
      { value: "shared", label: "It\u2019s a shared asset", desc: "We\u2019re invested in each other\u2019s success" },
      { value: "depends-funding", label: "Depends who funded it", desc: "The source of investment matters" },
      { value: "founder-keeps", label: "The founder keeps it", desc: "It\u2019s their creation" },
      { value: "figure-later", label: "Work it out later", desc: "Cross that bridge when we come to it" },
    ],
    scale: { shared: 0, "depends-funding": 1, "founder-keeps": 3, "figure-later": 2 },
  },
  {
    id: "home_ownership", topic: "Home & Property",
    question: "When it comes to buying a home together\u2026",
    options: [
      { value: "equal", label: "Equal ownership", desc: "No matter who pays more at closing" },
      { value: "reflects-contribution", label: "Reflects contribution", desc: "Ownership should match financial input" },
      { value: "both-names", label: "Both names regardless", desc: "It\u2019s our home, period" },
      { value: "rent", label: "We\u2019d rent", desc: "Not interested in buying right now" },
    ],
    scale: { equal: 0, "reflects-contribution": 2, "both-names": 0, rent: 1 },
  },
  {
    id: "stay_at_home", topic: "Stay-at-Home Parenting",
    question: "If one partner stays home to raise kids, how should that affect finances?",
    options: [
      { value: "nothing-changes", label: "Full equal partnership", desc: "Raising kids is work too" },
      { value: "working-supports", label: "Working partner supports", desc: "One income, shared benefit" },
      { value: "adjust-proportionally", label: "Adjust proportionally", desc: "Contributions shift but stay balanced" },
      { value: "plan-upfront", label: "Plan this carefully upfront", desc: "We need clear agreements first" },
    ],
    scale: { "nothing-changes": 0, "working-supports": 1, "adjust-proportionally": 1, "plan-upfront": 2 },
  },
  {
    id: "inheritance", topic: "Inheritance",
    question: "If one of you receives a large inheritance\u2026",
    options: [
      { value: "shared", label: "It becomes shared", desc: "Everything is ours" },
      { value: "stays-personal", label: "It stays personal", desc: "It was meant for one person" },
      { value: "some-shared", label: "Split it", desc: "Some shared, some personal" },
      { value: "depends-amount", label: "Depends on the amount", desc: "Scale matters here" },
    ],
    scale: { shared: 0, "stays-personal": 3, "some-shared": 1, "depends-amount": 2 },
  },
  {
    id: "debt", topic: "Existing Debt",
    question: "How should debts from before the relationship \u2014 student loans, credit cards \u2014 be handled?",
    options: [
      { value: "take-on-together", label: "We tackle it together", desc: "Your debt is our debt" },
      { value: "each-handles-own", label: "Each handles their own", desc: "You brought it, you manage it" },
      { value: "help-but-separate", label: "Help but keep separate", desc: "Support without ownership" },
      { value: "depends-type", label: "Depends on the type", desc: "Student loans and credit cards are different" },
    ],
    scale: { "take-on-together": 0, "each-handles-own": 3, "help-but-separate": 2, "depends-type": 1 },
  },
  {
    id: "income_change", topic: "Income Changes",
    question: "If one partner\u2019s income dramatically changes \u2014 up or down \u2014 what happens?",
    options: [
      { value: "nothing-changes", label: "Arrangement stays the same", desc: "Stability matters" },
      { value: "renegotiate", label: "We renegotiate", desc: "The plan should reflect reality" },
      { value: "naturally-adjusts", label: "It naturally adjusts", desc: "We\u2019d adapt without formal changes" },
      { value: "need-rules", label: "We need rules for this", desc: "Better to plan ahead" },
    ],
    scale: { "nothing-changes": 0, renegotiate: 2, "naturally-adjusts": 1, "need-rules": 3 },
  },
  {
    id: "spending_limits", topic: "Spending Boundaries",
    question: "Should there be a number where you check in with each other before spending?",
    options: [
      { value: "yes-amount", label: "Yes, above a set amount", desc: "Say, anything over $500" },
      { value: "big-purchases", label: "Only for big purchases", desc: "Cars, vacations, that kind of thing" },
      { value: "no-trust", label: "No, we trust each other", desc: "Spend what you need to spend" },
      { value: "shared-budget", label: "Budget with personal allowances", desc: "Structure with freedom built in" },
    ],
    scale: { "yes-amount": 0, "big-purchases": 1, "no-trust": 3, "shared-budget": 1 },
  },
  {
    id: "career_sacrifice", topic: "Career Moves",
    question: "If one partner gets an incredible job offer in another city\u2026",
    options: [
      { value: "partner-follows", label: "The other follows", desc: "We\u2019re a team \u2014 we go together" },
      { value: "weigh-equally", label: "Weigh both careers", desc: "Neither career is more important" },
      { value: "financial-impact", label: "Follow the money", desc: "Financial impact decides" },
      { value: "serious-negotiation", label: "Needs serious discussion", desc: "This isn\u2019t a simple call" },
    ],
    scale: { "partner-follows": 0, "weigh-equally": 1, "financial-impact": 2, "serious-negotiation": 2 },
  },
  {
    id: "lifestyle_maintenance", topic: "If Things Don\u2019t Work Out",
    question: "If the relationship ended, should one partner help maintain the other\u2019s lifestyle?",
    options: [
      { value: "yes-reasonable", label: "Yes, for a transition period", desc: "A bridge makes sense" },
      { value: "if-sacrifice", label: "Only if one sacrificed career", desc: "If they gave up earning potential" },
      { value: "clean-break", label: "Clean break", desc: "Everyone supports themselves" },
      { value: "depends", label: "Depends on circumstances", desc: "Length of marriage, kids, etc." },
    ],
    scale: { "yes-reasonable": 0, "if-sacrifice": 1, "clean-break": 3, depends: 1 },
  },
  {
    id: "investment_approach", topic: "Investment Strategy",
    question: "How should you invest as a couple?",
    options: [
      { value: "conservative", label: "Conservative", desc: "Savings, bonds, low-risk" },
      { value: "balanced", label: "Balanced mix", desc: "Some safe, some growth" },
      { value: "growth", label: "Growth-focused", desc: "Stocks, real estate, ventures" },
      { value: "separate-investing", label: "Invest separately", desc: "Each manages their own" },
    ],
    scale: { conservative: 0, balanced: 1, growth: 2, "separate-investing": 3 },
  },
  {
    id: "sunset_clause", topic: "Evolving Agreements",
    question: "Should your financial agreements evolve over time?",
    options: [
      { value: "regular-review", label: "Review every few years", desc: "Life changes, so should our plan" },
      { value: "major-changes", label: "Only after big life changes", desc: "Kids, career shifts, big moves" },
      { value: "set-once", label: "Set it and stick to it", desc: "Consistency creates security" },
      { value: "built-in-flex", label: "Build in flexibility", desc: "Design it to adapt automatically" },
    ],
    scale: { "regular-review": 0, "major-changes": 1, "set-once": 3, "built-in-flex": 1 },
  },
  {
    id: "children_finances", topic: "Kids & Money",
    question: "When it comes to kids and financial planning\u2026",
    options: [
      { value: "education-fund", label: "Start saving from day one", desc: "Education fund, the works" },
      { value: "figure-out-later", label: "Figure it out as we go", desc: "No need to over-plan" },
      { value: "each-contributes", label: "Each contributes what they can", desc: "Based on individual situations" },
      { value: "shared-pot", label: "All from the shared pot", desc: "Kids are a shared responsibility" },
    ],
    scale: { "education-fund": 0, "figure-out-later": 2, "each-contributes": 1, "shared-pot": 0 },
  },
  {
    id: "infidelity_clause", topic: "Trust & Consequences",
    question: "Should there be financial consequences for breaking trust in the relationship?",
    options: [
      { value: "yes", label: "Yes, absolutely", desc: "Actions should have consequences" },
      { value: "extreme-only", label: "Only in extreme situations", desc: "There\u2019s a line, but it\u2019s high" },
      { value: "no-punitive", label: "No, that feels punitive", desc: "Finances shouldn\u2019t be a weapon" },
      { value: "unsure", label: "I\u2019m not sure", desc: "This is a hard one" },
    ],
    scale: { yes: 0, "extreme-only": 1, "no-punitive": 3, unsure: 1 },
  },
  {
    id: "retirement", topic: "Retirement",
    question: "How do you think about planning for retirement?",
    options: [
      { value: "plan-together", label: "Plan together from the start", desc: "Joint goals, shared savings" },
      { value: "each-handles-own", label: "Each handles their own", desc: "My retirement, my responsibility" },
      { value: "higher-earner-funds", label: "Higher earner funds both", desc: "They have more to work with" },
      { value: "figure-out-later", label: "Figure it out later", desc: "Retirement is far away" },
    ],
    scale: { "plan-together": 0, "each-handles-own": 3, "higher-earner-funds": 1, "figure-out-later": 2 },
  },
];

/* ================================================================
   LOGIC — Question selection, insights, comparison
   ================================================================ */

function selectDeepDiveQuestions(v: Record<string, string>): string[] {
  const s: Record<string, number> = {};
  DEEP_DIVE_POOL.forEach((q) => { s[q.id] = 0; });

  // Debt is always relevant
  s["debt"] += 10;

  // Money Mindset
  if (v.moneyMindset === "guardian") { s["separate_property"] += 3; s["inheritance"] += 3; s["lifestyle_maintenance"] += 2; s["retirement"] += 2; }
  if (v.moneyMindset === "builder") { s["business_ownership"] += 3; s["investment_approach"] += 3; s["income_change"] += 2; }
  if (v.moneyMindset === "enjoyer") { s["spending_limits"] += 2; s["lifestyle_maintenance"] += 3; s["career_sacrifice"] += 1; }
  if (v.moneyMindset === "balancer") { s["sunset_clause"] += 2; s["spending_limits"] += 1; }

  // Togetherness
  if (v.togetherness === "fully-combined" || v.togetherness === "mostly-combined") { s["home_ownership"] += 2; s["children_finances"] += 2; s["retirement"] += 2; }
  if (v.togetherness === "largely-independent" || v.togetherness === "split-collaborative") { s["separate_property"] += 3; s["spending_limits"] += 3; s["investment_approach"] += 2; }

  // Future Vision
  if (v.futureVision === "family") { s["stay_at_home"] += 3; s["children_finances"] += 3; s["career_sacrifice"] += 2; }
  if (v.futureVision === "career") { s["career_sacrifice"] += 3; s["business_ownership"] += 2; s["income_change"] += 2; }
  if (v.futureVision === "wealth") { s["investment_approach"] += 3; s["business_ownership"] += 2; s["retirement"] += 2; }
  if (v.futureVision === "security") { s["separate_property"] += 2; s["inheritance"] += 2; s["lifestyle_maintenance"] += 2; }
  if (v.futureVision === "lifestyle") { s["spending_limits"] += 2; s["lifestyle_maintenance"] += 2; s["career_sacrifice"] += 1; }

  // Risk
  if (v.riskComfort === "very-conservative" || v.riskComfort === "somewhat-cautious") { s["inheritance"] += 2; s["separate_property"] += 2; }
  if (v.riskComfort === "aggressive" || v.riskComfort === "moderate-risk") { s["business_ownership"] += 2; s["investment_approach"] += 2; }

  // Income
  if (v.incomeApproach === "equal") { s["income_change"] += 2; s["stay_at_home"] += 2; }
  if (v.incomeApproach === "higher-more") { s["lifestyle_maintenance"] += 2; s["income_change"] += 2; }

  // Core Value
  if (v.coreValue === "trust") { s["spending_limits"] += 1; s["infidelity_clause"] += 2; }
  if (v.coreValue === "independence") { s["separate_property"] += 2; s["spending_limits"] += 2; }
  if (v.coreValue === "flexibility") { s["sunset_clause"] += 3; s["income_change"] += 2; }
  if (v.coreValue === "equality") { s["stay_at_home"] += 2; s["home_ownership"] += 1; }

  return Object.entries(s).sort(([, a], [, b]) => b - a).slice(0, 6).map(([id]) => id);
}

const MINDSET_LABELS: Record<string, string> = {
  guardian: "a protector \u2014 you value safety and security with money",
  builder: "a builder \u2014 you want your money to grow and work for you",
  enjoyer: "an experiencer \u2014 money is a tool for living your best life",
  balancer: "a balancer \u2014 you take a measured, moderate approach",
};
const TOGETHER_LABELS: Record<string, string> = {
  "fully-combined": "going all in together financially",
  "mostly-combined": "mostly combining finances with some personal space",
  "split-collaborative": "keeping things separate but making big decisions together",
  "largely-independent": "maintaining financial independence within the partnership",
};
const RISK_LABELS: Record<string, string> = {
  "very-conservative": "conservative \u2014 you prefer keeping things safe",
  "somewhat-cautious": "cautious \u2014 open to opportunity but you want to see the math",
  "moderate-risk": "comfortable with calculated risk for growth",
  aggressive: "adventurous \u2014 willing to take big swings",
};
const VALUE_LABELS: Record<string, string> = {
  trust: "transparency and honesty", independence: "personal autonomy",
  equality: "fairness and balance", flexibility: "adaptability as life changes",
};

function generateInsight(v: Record<string, string>): string {
  return `You\u2019re ${MINDSET_LABELS[v.moneyMindset] || "thoughtful about money"}, and you picture ${TOGETHER_LABELS[v.togetherness] || "sharing finances in your own way"}. When it comes to risk, you\u2019re ${RISK_LABELS[v.riskComfort] || "balanced"}. Above all, you care about ${VALUE_LABELS[v.coreValue] || "doing things right"}.`;
}

interface ComparisonItem {
  topic: string; questionId: string;
  aAnswer: string; bAnswer: string;
  aLabel: string; bLabel: string;
  aImportance: number; bImportance: number;
  status: "aligned" | "conversation" | "attorney"; distance: number;
}

function comparePartners(a: PartnerData, b: PartnerData) {
  const valComp = VALUES_QUESTIONS.map((q) => {
    const aOpt = q.options.find((o) => o.value === a.valuesAnswers[q.id]);
    const bOpt = q.options.find((o) => o.value === b.valuesAnswers[q.id]);
    return { question: q.sectionLabel, aLabel: aOpt?.label || "—", bLabel: bOpt?.label || "—", match: a.valuesAnswers[q.id] === b.valuesAnswers[q.id] };
  });

  const shared = a.questionIds.filter((id) => b.questionIds.includes(id));
  const aOnly = a.questionIds.filter((id) => !b.questionIds.includes(id));
  const bOnly = b.questionIds.filter((id) => !a.questionIds.includes(id));

  const items: ComparisonItem[] = shared.map((qId) => {
    const q = DEEP_DIVE_POOL.find((x) => x.id === qId)!;
    const aa = a.deepDiveAnswers[qId]; const ba = b.deepDiveAnswers[qId];
    const d = Math.abs((q.scale[aa.answer] ?? 1) - (q.scale[ba.answer] ?? 1));
    return {
      topic: q.topic, questionId: qId,
      aAnswer: aa.answer, bAnswer: ba.answer,
      aLabel: q.options.find((o) => o.value === aa.answer)?.label || aa.answer,
      bLabel: q.options.find((o) => o.value === ba.answer)?.label || ba.answer,
      aImportance: aa.importance, bImportance: ba.importance,
      status: d <= 1 ? "aligned" : d === 2 ? "conversation" : "attorney", distance: d,
    };
  });

  return {
    values: valComp, items,
    aligned: items.filter((i) => i.status === "aligned"),
    conversation: items.filter((i) => i.status === "conversation"),
    attorney: items.filter((i) => i.status === "attorney"),
    aOnlyTopics: aOnly.map((id) => DEEP_DIVE_POOL.find((q) => q.id === id)?.topic || id),
    bOnlyTopics: bOnly.map((id) => DEEP_DIVE_POOL.find((q) => q.id === id)?.topic || id),
  };
}

function makeDemoPartner(realData: PartnerData): PartnerData {
  const demoVal: Record<string, string> = {
    moneyMindset: realData.valuesAnswers.moneyMindset === "guardian" ? "builder" : realData.valuesAnswers.moneyMindset === "builder" ? "balancer" : "guardian",
    togetherness: realData.valuesAnswers.togetherness === "fully-combined" ? "mostly-combined" : "mostly-combined",
    futureVision: realData.valuesAnswers.futureVision === "family" ? "career" : "family",
    riskComfort: "somewhat-cautious",
    incomeApproach: realData.valuesAnswers.incomeApproach === "equal" ? "proportional" : "proportional",
    coreValue: realData.valuesAnswers.coreValue === "trust" ? "flexibility" : "trust",
  };
  // For demo, answer same questions with slightly different answers
  const demoDD: Record<string, { answer: string; importance: number }> = {};
  realData.questionIds.forEach((qId) => {
    const q = DEEP_DIVE_POOL.find((x) => x.id === qId)!;
    const realAnswer = realData.deepDiveAnswers[qId]?.answer;
    const realIdx = q.options.findIndex((o) => o.value === realAnswer);
    // Pick an adjacent answer for variety
    const demoIdx = realIdx <= 0 ? Math.min(1, q.options.length - 1) : realIdx - 1;
    demoDD[qId] = { answer: q.options[demoIdx].value, importance: Math.max(1, Math.min(5, (realData.deepDiveAnswers[qId]?.importance || 3) + (Math.random() > 0.5 ? 1 : -1))) };
  });
  return { name: "Alex", valuesAnswers: demoVal, deepDiveAnswers: demoDD, questionIds: [...realData.questionIds] };
}

/* ================================================================
   UI COMPONENTS
   ================================================================ */

function Nav() {
  return (
    <nav className="w-full px-6 py-4 flex items-center justify-between border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="text-xl font-serif font-semibold tracking-tight text-stone-800">
        before we<span className="text-teal-700">.</span>
      </div>
      <div className="text-xs text-stone-400 tracking-wide uppercase">The conversation before the paperwork</div>
    </nav>
  );
}

function ProgressBar({ current, total, sectionLabel }: { current: number; total: number; sectionLabel: string }) {
  const pct = Math.round(((current + 1) / total) * 100);
  return (
    <div className="w-full max-w-xl mx-auto mb-8 px-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-teal-700 uppercase tracking-wide">{sectionLabel}</span>
        <span className="text-xs text-stone-400">{current + 1} of {total}</span>
      </div>
      <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
        <div className="h-full bg-teal-600 rounded-full transition-all duration-500 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function OptionCard({ option, selected, onClick }: { option: Option; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
        selected ? "border-teal-600 bg-teal-50 shadow-sm" : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm"
      }`}
    >
      <div className={`font-semibold text-base ${selected ? "text-teal-800" : "text-stone-800"}`}>{option.label}</div>
      <div className={`text-sm mt-1 ${selected ? "text-teal-600" : "text-stone-500"}`}>{option.desc}</div>
    </button>
  );
}

function ImportanceRating({ value, onChange }: { value: number | null; onChange: (n: number) => void }) {
  const labels = ["", "Not very", "Slightly", "Moderately", "Very", "Extremely"];
  return (
    <div className="mt-6 pt-6 border-t border-stone-100 animate-fadeIn">
      <p className="text-sm font-medium text-stone-600 mb-3">How important is this topic to you?</p>
      <div className="flex items-center gap-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`w-10 h-10 rounded-full text-sm font-semibold transition-all duration-200 ${
              value === n ? "bg-teal-600 text-white scale-110 shadow-md" : "bg-stone-100 text-stone-500 hover:bg-stone-200"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-1 px-1">
        <span className="text-xs text-stone-400">Not very</span>
        <span className="text-xs text-stone-400">Extremely</span>
      </div>
    </div>
  );
}

/* ================================================================
   PHASE COMPONENTS
   ================================================================ */

function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-stone-50">
      <div className="max-w-lg text-center">
        <h1 className="text-5xl font-serif font-bold text-stone-800 mb-2">before we<span className="text-teal-700">.</span></h1>
        <div className="mt-10 space-y-3 text-lg text-stone-500 font-light leading-relaxed">
          <p>Before we assume we agree.</p>
          <p>Before we walk into a lawyer\u2019s office.</p>
          <p>Before we let the state decide for us.</p>
          <p>Before we sign anything \u2014</p>
        </div>
        <p className="mt-8 text-2xl font-serif text-stone-800">Let\u2019s get on the same page.</p>
        <button
          onClick={onStart}
          className="mt-10 px-8 py-3.5 bg-teal-700 text-white rounded-full font-medium text-base hover:bg-teal-800 transition-colors shadow-lg shadow-teal-700/20"
        >
          Get started
        </button>
        <p className="mt-8 text-xs text-stone-400 max-w-sm mx-auto">A private alignment tool for couples. Not legal advice. Not a score. Just a structured way to figure out what you both actually want.</p>
      </div>
    </div>
  );
}

function NameEntry({ onSubmit, partnerLabel }: { onSubmit: (name: string) => void; partnerLabel: string }) {
  const [name, setName] = useState("");
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <p className="text-sm uppercase tracking-wide text-teal-700 font-medium mb-3">{partnerLabel}</p>
        <h2 className="text-3xl font-serif text-stone-800 mb-2">First, what\u2019s your name?</h2>
        <p className="text-stone-500 mb-8">Just a first name is fine. This keeps things personal.</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && name.trim() && onSubmit(name.trim())}
          placeholder="Your first name"
          className="w-full max-w-xs mx-auto block text-center text-xl py-3 border-b-2 border-stone-300 bg-transparent focus:border-teal-600 focus:outline-none text-stone-800 placeholder-stone-300"
          autoFocus
        />
        <button
          onClick={() => name.trim() && onSubmit(name.trim())}
          disabled={!name.trim()}
          className="mt-8 px-8 py-3 bg-teal-700 text-white rounded-full font-medium hover:bg-teal-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function ValuesPhase({
  name, answers, currentIndex, onAnswer, onBack,
}: {
  name: string; answers: Record<string, string>; currentIndex: number; onAnswer: (qId: string, value: string) => void; onBack: () => void;
}) {
  const q = VALUES_QUESTIONS[currentIndex];
  if (!q) return null;
  return (
    <div className="min-h-[70vh] flex flex-col items-center pt-8 px-6">
      <ProgressBar current={currentIndex} total={VALUES_QUESTIONS.length} sectionLabel={q.sectionLabel} />
      <div className="max-w-xl w-full">
        <p className="text-sm text-teal-600 mb-4 font-medium">{q.sectionIntro}</p>
        <h2 className="text-2xl font-serif text-stone-800 mb-8 leading-snug">{q.question}</h2>
        <div className="space-y-3">
          {q.options.map((opt) => (
            <OptionCard key={opt.value} option={opt} selected={answers[q.id] === opt.value} onClick={() => onAnswer(q.id, opt.value)} />
          ))}
        </div>
        {currentIndex > 0 && (
          <button onClick={onBack} className="mt-6 text-sm text-stone-400 hover:text-stone-600 transition-colors">&larr; Back</button>
        )}
      </div>
    </div>
  );
}

function ValuesSummary({ name, answers, onContinue }: { name: string; answers: Record<string, string>; onContinue: () => void }) {
  const insight = generateInsight(answers);
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">&#10003;</span>
        </div>
        <h2 className="text-2xl font-serif text-stone-800 mb-2">Great start, {name}.</h2>
        <p className="text-stone-500 mb-8">Here\u2019s what we\u2019re picking up so far:</p>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 text-left">
          <p className="text-stone-700 leading-relaxed text-base">{insight}</p>
        </div>
        <p className="mt-8 text-stone-500 text-sm">Now we\u2019ll dig into the specific topics that matter most based on what you\u2019ve shared. Just 6 more questions.</p>
        <button onClick={onContinue} className="mt-6 px-8 py-3 bg-teal-700 text-white rounded-full font-medium hover:bg-teal-800 transition-colors">
          Let\u2019s go deeper
        </button>
      </div>
    </div>
  );
}

function DeepDiveIntro({ name, topics, onContinue }: { name: string; topics: string[]; onContinue: () => void }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <h2 className="text-2xl font-serif text-stone-800 mb-2">Tailored for you, {name}.</h2>
        <p className="text-stone-500 mb-8">Based on your answers, these are the topics we think matter most for your situation:</p>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {topics.map((t) => (
            <span key={t} className="px-4 py-1.5 bg-teal-50 text-teal-700 rounded-full text-sm font-medium border border-teal-100">{t}</span>
          ))}
        </div>
        <p className="text-stone-500 text-sm mb-6">For each one, pick the option that feels right and tell us how important it is to you.</p>
        <button onClick={onContinue} className="px-8 py-3 bg-teal-700 text-white rounded-full font-medium hover:bg-teal-800 transition-colors">
          Ready
        </button>
      </div>
    </div>
  );
}

function DeepDivePhase({
  questionIds, answers, currentIndex, tempAnswer, tempImportance,
  onSelectAnswer, onSelectImportance, onBack,
}: {
  questionIds: string[]; answers: Record<string, { answer: string; importance: number }>; currentIndex: number;
  tempAnswer: string | null; tempImportance: number | null;
  onSelectAnswer: (value: string) => void; onSelectImportance: (n: number) => void; onBack: () => void;
}) {
  const qId = questionIds[currentIndex];
  const q = DEEP_DIVE_POOL.find((x) => x.id === qId);
  if (!q) return null;
  return (
    <div className="min-h-[70vh] flex flex-col items-center pt-8 px-6">
      <ProgressBar current={currentIndex} total={questionIds.length} sectionLabel={q.topic} />
      <div className="max-w-xl w-full">
        <h2 className="text-2xl font-serif text-stone-800 mb-8 leading-snug">{q.question}</h2>
        <div className="space-y-3">
          {q.options.map((opt) => (
            <OptionCard key={opt.value} option={opt} selected={tempAnswer === opt.value} onClick={() => onSelectAnswer(opt.value)} />
          ))}
        </div>
        {tempAnswer && (
          <ImportanceRating value={tempImportance} onChange={onSelectImportance} />
        )}
        {currentIndex > 0 && !tempAnswer && (
          <button onClick={onBack} className="mt-6 text-sm text-stone-400 hover:text-stone-600 transition-colors">&larr; Back</button>
        )}
      </div>
    </div>
  );
}

function ProfileSummary({
  name, valuesAnswers, deepDiveAnswers, questionIds, onContinue,
}: {
  name: string; valuesAnswers: Record<string, string>; deepDiveAnswers: Record<string, { answer: string; importance: number }>; questionIds: string[]; onContinue: () => void;
}) {
  const insight = generateInsight(valuesAnswers);
  return (
    <div className="min-h-[70vh] flex flex-col items-center pt-12 px-6 pb-16">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-emerald-600">&#10003;</span>
          </div>
          <h2 className="text-2xl font-serif text-stone-800">All done, {name}!</h2>
          <p className="text-stone-500 mt-2">Here\u2019s your Before We profile.</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 mb-6">
          <h3 className="font-semibold text-stone-700 mb-3">Your Money DNA</h3>
          <p className="text-stone-600 text-sm leading-relaxed">{insight}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <h3 className="font-semibold text-stone-700 mb-4">Your Key Positions</h3>
          <div className="space-y-3">
            {questionIds.map((qId) => {
              const q = DEEP_DIVE_POOL.find((x) => x.id === qId)!;
              const a = deepDiveAnswers[qId];
              if (!a) return null;
              const opt = q.options.find((o) => o.value === a.answer);
              return (
                <div key={qId} className="flex items-start justify-between gap-3 py-2 border-b border-stone-50 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-stone-700">{q.topic}</div>
                    <div className="text-sm text-stone-500">{opt?.label} &mdash; {opt?.desc}</div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div key={n} className={`w-2 h-2 rounded-full ${n <= a.importance ? "bg-teal-500" : "bg-stone-200"}`} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="text-center mt-8">
          <button onClick={onContinue} className="px-8 py-3 bg-teal-700 text-white rounded-full font-medium hover:bg-teal-800 transition-colors">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function PartnerGate({ name, onPartnerStart, onDemo }: { name: string; onPartnerStart: () => void; onDemo: () => void }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <h2 className="text-2xl font-serif text-stone-800 mb-2">Nice work, {name}.</h2>
        <p className="text-stone-500 mb-8">Now it\u2019s your partner\u2019s turn. When they\u2019re done, we\u2019ll show you both where you stand.</p>
        <div className="space-y-3 max-w-sm mx-auto">
          <button onClick={onPartnerStart} className="w-full py-3.5 bg-teal-700 text-white rounded-full font-medium hover:bg-teal-800 transition-colors">
            Hand it to my partner
          </button>
          <button onClick={onDemo} className="w-full py-3.5 bg-white text-stone-600 rounded-full font-medium border border-stone-200 hover:border-stone-300 transition-colors">
            Show me a demo comparison
          </button>
        </div>
        <p className="mt-6 text-xs text-stone-400">The demo uses sample data so you can preview the comparison experience.</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    aligned: "bg-emerald-50 text-emerald-700 border-emerald-200",
    conversation: "bg-amber-50 text-amber-700 border-amber-200",
    attorney: "bg-rose-50 text-rose-700 border-rose-200",
  };
  const labels = { aligned: "On the same page", conversation: "Worth a conversation", attorney: "Bring to your attorney" };
  return <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || ""}`}>{labels[status as keyof typeof labels]}</span>;
}

function Comparison({
  partnerA, partnerB, onDealMemo,
}: {
  partnerA: PartnerData; partnerB: PartnerData; onDealMemo: () => void;
}) {
  const result = comparePartners(partnerA, partnerB);

  return (
    <div className="min-h-screen flex flex-col items-center pt-12 px-6 pb-16">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif text-stone-800">{partnerA.name} & {partnerB.name}</h2>
          <p className="text-stone-500 mt-2">Here\u2019s where you two stand.</p>
        </div>

        {/* Values Overview */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 mb-6">
          <h3 className="font-semibold text-stone-700 mb-4">Your Values at a Glance</h3>
          <div className="space-y-3">
            {result.values.map((v, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
                <span className="text-sm text-stone-500 w-36 shrink-0">{v.question}</span>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`font-medium ${v.match ? "text-emerald-600" : "text-stone-700"}`}>{v.aLabel}</span>
                  {v.match ? (
                    <span className="text-emerald-500 text-xs">= match</span>
                  ) : (
                    <>
                      <span className="text-stone-300">vs</span>
                      <span className="font-medium text-stone-700">{v.bLabel}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Already Aligned */}
        {result.aligned.length > 0 && (
          <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100 mb-6">
            <h3 className="font-semibold text-emerald-800 mb-1">Already on the Same Page</h3>
            <p className="text-sm text-emerald-600 mb-4">Good news \u2014 you two are aligned here.</p>
            <div className="space-y-3">
              {result.aligned.map((item) => (
                <div key={item.questionId} className="bg-white rounded-xl p-4 border border-emerald-100">
                  <div className="font-medium text-stone-700 text-sm">{item.topic}</div>
                  <div className="text-sm text-stone-500 mt-1">
                    {item.aLabel === item.bLabel
                      ? <>You both said: <span className="text-emerald-700 font-medium">{item.aLabel}</span></>
                      : <>{partnerA.name}: {item.aLabel} &bull; {partnerB.name}: {item.bLabel} &mdash; <span className="text-emerald-600">closely aligned</span></>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Worth a Conversation */}
        {result.conversation.length > 0 && (
          <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-100 mb-6">
            <h3 className="font-semibold text-amber-800 mb-1">Worth a Conversation</h3>
            <p className="text-sm text-amber-600 mb-4">You\u2019re in the same neighborhood \u2014 a little conversation can close the gap.</p>
            <div className="space-y-3">
              {result.conversation.map((item) => (
                <div key={item.questionId} className="bg-white rounded-xl p-4 border border-amber-100">
                  <div className="font-medium text-stone-700 text-sm">{item.topic}</div>
                  <div className="text-sm text-stone-500 mt-1">
                    {partnerA.name}: <span className="font-medium">{item.aLabel}</span> &bull; {partnerB.name}: <span className="font-medium">{item.bLabel}</span>
                  </div>
                  {(item.aImportance >= 4 || item.bImportance >= 4) && (
                    <div className="text-xs text-amber-600 mt-2">
                      {item.aImportance >= 4 && item.bImportance >= 4 ? "This is important to both of you." : item.aImportance >= 4 ? `This is especially important to ${partnerA.name}.` : `This is especially important to ${partnerB.name}.`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bring to Your Attorney */}
        {result.attorney.length > 0 && (
          <div className="bg-rose-50/50 rounded-2xl p-6 border border-rose-100 mb-6">
            <h3 className="font-semibold text-rose-800 mb-1">Bring to Your Attorney</h3>
            <p className="text-sm text-rose-600 mb-4">You see these differently \u2014 and that\u2019s okay. These are great topics to explore with a professional.</p>
            <div className="space-y-3">
              {result.attorney.map((item) => (
                <div key={item.questionId} className="bg-white rounded-xl p-4 border border-rose-100">
                  <div className="font-medium text-stone-700 text-sm">{item.topic}</div>
                  <div className="text-sm text-stone-500 mt-1">
                    {partnerA.name}: <span className="font-medium">{item.aLabel}</span> &bull; {partnerB.name}: <span className="font-medium">{item.bLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unique Priorities */}
        {(result.aOnlyTopics.length > 0 || result.bOnlyTopics.length > 0) && (
          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 mb-6">
            <h3 className="font-semibold text-stone-700 mb-3">Individual Priorities</h3>
            <p className="text-sm text-stone-500 mb-4">Based on your profiles, the tool flagged different topics for each of you. These reflect what matters to each person individually.</p>
            {result.aOnlyTopics.length > 0 && (
              <div className="mb-3">
                <span className="text-sm font-medium text-stone-600">{partnerA.name}:</span>{" "}
                <span className="text-sm text-stone-500">{result.aOnlyTopics.join(", ")}</span>
              </div>
            )}
            {result.bOnlyTopics.length > 0 && (
              <div>
                <span className="text-sm font-medium text-stone-600">{partnerB.name}:</span>{" "}
                <span className="text-sm text-stone-500">{result.bOnlyTopics.join(", ")}</span>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-8">
          <button onClick={onDealMemo} className="px-8 py-3 bg-teal-700 text-white rounded-full font-medium hover:bg-teal-800 transition-colors">
            Generate your deal memo
          </button>
        </div>
      </div>
    </div>
  );
}

function DealMemo({ partnerA, partnerB, onBack }: { partnerA: PartnerData; partnerB: PartnerData; onBack: () => void }) {
  const result = comparePartners(partnerA, partnerB);
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen flex flex-col items-center pt-12 px-6 pb-16">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-4">
          <button onClick={onBack} className="text-sm text-stone-400 hover:text-stone-600 transition-colors">&larr; Back to comparison</button>
        </div>

        {/* Printable Memo */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 print:shadow-none print:border-none" id="deal-memo">
          <div className="text-center border-b border-stone-200 pb-6 mb-6">
            <div className="text-xl font-serif font-semibold text-stone-800">before we<span className="text-teal-700">.</span></div>
            <h2 className="text-2xl font-serif text-stone-800 mt-3">Alignment Summary</h2>
            <p className="text-stone-500 text-sm mt-1">Prepared for {partnerA.name} & {partnerB.name} &bull; {today}</p>
          </div>

          {/* Section 1: What you agree on */}
          {result.aligned.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-serif font-semibold text-stone-800 mb-3">What You Agree On</h3>
              {result.aligned.map((item) => (
                <div key={item.questionId} className="py-2 border-b border-stone-50">
                  <span className="font-medium text-stone-700">{item.topic}:</span>{" "}
                  <span className="text-stone-600">
                    {item.aLabel === item.bLabel ? `Both chose "${item.aLabel}"` : `${partnerA.name} chose "${item.aLabel}", ${partnerB.name} chose "${item.bLabel}" \u2014 closely aligned`}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Section 2: Discussion points */}
          {result.conversation.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-serif font-semibold text-stone-800 mb-3">Discussion Points</h3>
              <p className="text-sm text-stone-500 mb-3">These topics are close but could benefit from a conversation.</p>
              {result.conversation.map((item) => (
                <div key={item.questionId} className="py-3 border-b border-stone-50">
                  <div><span className="font-medium text-stone-700">{item.topic}</span></div>
                  <div className="text-sm text-stone-600 mt-1">
                    {partnerA.name}: &ldquo;{item.aLabel}&rdquo; &bull; {partnerB.name}: &ldquo;{item.bLabel}&rdquo;
                  </div>
                  {(item.aImportance >= 4 || item.bImportance >= 4) && (
                    <div className="text-xs text-amber-600 mt-1 italic">
                      {item.aImportance >= 4 && item.bImportance >= 4 ? "High importance to both partners." : item.aImportance >= 4 ? `High importance to ${partnerA.name}.` : `High importance to ${partnerB.name}.`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Section 3: For your attorney */}
          {result.attorney.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-serif font-semibold text-stone-800 mb-3">Questions for Your Attorney</h3>
              <p className="text-sm text-stone-500 mb-3">These are areas where you see things differently. A family law attorney can help you navigate these.</p>
              {result.attorney.map((item) => (
                <div key={item.questionId} className="py-3 border-b border-stone-50">
                  <div><span className="font-medium text-stone-700">{item.topic}</span></div>
                  <div className="text-sm text-stone-600 mt-1">
                    {partnerA.name}: &ldquo;{item.aLabel}&rdquo; &bull; {partnerB.name}: &ldquo;{item.bLabel}&rdquo;
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Section 4: Next steps */}
          <div className="border-t border-stone-200 pt-6">
            <h3 className="text-lg font-serif font-semibold text-stone-800 mb-3">Recommended Next Steps</h3>
            <div className="space-y-2 text-sm text-stone-600">
              <p><span className="font-semibold text-stone-700">1.</span> Review this summary together. Talk through the discussion points at your own pace.</p>
              <p><span className="font-semibold text-stone-700">2.</span> Take this document to a family law attorney. It gives them a clear starting point for your prenup conversation.</p>
              <p><span className="font-semibold text-stone-700">3.</span> Remember: this is a living conversation. Come back and retake it as your life evolves.</p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 pt-4 border-t border-stone-100">
            <p className="text-xs text-stone-400 text-center">
              This summary was generated by Before We, a couple alignment tool. It is not legal advice and does not constitute a legal agreement. Consult a licensed family law attorney in your jurisdiction for legal guidance.
            </p>
          </div>
        </div>

        {/* Print button */}
        <div className="text-center mt-6 flex gap-3 justify-center">
          <button onClick={() => window.print()} className="px-8 py-3 bg-teal-700 text-white rounded-full font-medium hover:bg-teal-800 transition-colors">
            Print / Save as PDF
          </button>
          <button onClick={onBack} className="px-8 py-3 bg-white text-stone-600 rounded-full font-medium border border-stone-200 hover:border-stone-300 transition-colors">
            Back to comparison
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   MAIN APP
   ================================================================ */
export default function App() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [activePartner, setActivePartner] = useState<"A" | "B">("A");

  // Partner data (saved)
  const [partnerAData, setPartnerAData] = useState<PartnerData | null>(null);
  const [partnerBData, setPartnerBData] = useState<PartnerData | null>(null);

  // Working state for current user
  const [name, setName] = useState("");
  const [valuesAnswers, setValuesAnswers] = useState<Record<string, string>>({});
  const [valuesIndex, setValuesIndex] = useState(0);
  const [deepDiveAnswers, setDeepDiveAnswers] = useState<Record<string, { answer: string; importance: number }>>({});
  const [deepDiveIndex, setDeepDiveIndex] = useState(0);
  const [selectedQIds, setSelectedQIds] = useState<string[]>([]);
  const [tempAnswer, setTempAnswer] = useState<string | null>(null);
  const [tempImportance, setTempImportance] = useState<number | null>(null);

  const saveCurrentPartner = (): PartnerData => ({
    name, valuesAnswers: { ...valuesAnswers },
    deepDiveAnswers: { ...deepDiveAnswers },
    questionIds: [...selectedQIds],
  });

  const resetWorkingState = () => {
    setName(""); setValuesAnswers({}); setValuesIndex(0);
    setDeepDiveAnswers({}); setDeepDiveIndex(0); setSelectedQIds([]);
    setTempAnswer(null); setTempImportance(null);
  };

  // Phase handlers
  const handleStart = () => setPhase("name-entry");

  const handleNameSubmit = (n: string) => {
    setName(n);
    setPhase("values");
  };

  const handleValuesAnswer = (qId: string, value: string) => {
    const updated = { ...valuesAnswers, [qId]: value };
    setValuesAnswers(updated);
    // Auto-advance after a short delay
    setTimeout(() => {
      if (valuesIndex < VALUES_QUESTIONS.length - 1) {
        setValuesIndex(valuesIndex + 1);
      } else {
        setPhase("values-summary");
      }
    }, 300);
  };

  const handleValuesBack = () => {
    if (valuesIndex > 0) setValuesIndex(valuesIndex - 1);
  };

  const handleValuesContinue = () => {
    const qIds = selectDeepDiveQuestions(valuesAnswers);
    setSelectedQIds(qIds);
    setPhase("deep-dive-intro");
  };

  const handleDeepDiveStart = () => setPhase("deep-dive");

  const handleDDSelectAnswer = (value: string) => {
    setTempAnswer(value);
    setTempImportance(null);
  };

  const handleDDSelectImportance = (n: number) => {
    const qId = selectedQIds[deepDiveIndex];
    setTempImportance(n);
    const updated = { ...deepDiveAnswers, [qId]: { answer: tempAnswer!, importance: n } };
    setDeepDiveAnswers(updated);
    // Auto-advance
    setTimeout(() => {
      setTempAnswer(null);
      setTempImportance(null);
      if (deepDiveIndex < selectedQIds.length - 1) {
        setDeepDiveIndex(deepDiveIndex + 1);
      } else {
        setPhase("profile-summary");
      }
    }, 300);
  };

  const handleDDBack = () => {
    if (deepDiveIndex > 0) setDeepDiveIndex(deepDiveIndex - 1);
  };

  const handleProfileContinue = () => {
    if (activePartner === "A") {
      setPartnerAData(saveCurrentPartner());
      setPhase("partner-gate");
    } else {
      setPartnerBData(saveCurrentPartner());
      setPhase("comparison");
    }
  };

  const handlePartnerStart = () => {
    resetWorkingState();
    setActivePartner("B");
    setPhase("name-entry");
  };

  const handleDemo = () => {
    const aData = saveCurrentPartner();
    setPartnerAData(aData);
    setPartnerBData(makeDemoPartner(aData));
    setPhase("comparison");
  };

  const handleDealMemo = () => setPhase("deal-memo");
  const handleBackToComparison = () => setPhase("comparison");

  const deepDiveTopics = selectedQIds.map((id) => DEEP_DIVE_POOL.find((q) => q.id === id)?.topic || id);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      {phase !== "landing" && <Nav />}
      <main className="pb-16">
        {phase === "landing" && <Landing onStart={handleStart} />}
        {phase === "name-entry" && <NameEntry onSubmit={handleNameSubmit} partnerLabel={activePartner === "A" ? "Partner One" : "Partner Two"} />}
        {phase === "values" && (
          <ValuesPhase name={name} answers={valuesAnswers} currentIndex={valuesIndex} onAnswer={handleValuesAnswer} onBack={handleValuesBack} />
        )}
        {phase === "values-summary" && <ValuesSummary name={name} answers={valuesAnswers} onContinue={handleValuesContinue} />}
        {phase === "deep-dive-intro" && <DeepDiveIntro name={name} topics={deepDiveTopics} onContinue={handleDeepDiveStart} />}
        {phase === "deep-dive" && (
          <DeepDivePhase
            questionIds={selectedQIds} answers={deepDiveAnswers} currentIndex={deepDiveIndex}
            tempAnswer={tempAnswer} tempImportance={tempImportance}
            onSelectAnswer={handleDDSelectAnswer} onSelectImportance={handleDDSelectImportance} onBack={handleDDBack}
          />
        )}
        {phase === "profile-summary" && (
          <ProfileSummary name={name} valuesAnswers={valuesAnswers} deepDiveAnswers={deepDiveAnswers} questionIds={selectedQIds} onContinue={handleProfileContinue} />
        )}
        {phase === "partner-gate" && <PartnerGate name={partnerAData?.name || name} onPartnerStart={handlePartnerStart} onDemo={handleDemo} />}
        {phase === "comparison" && partnerAData && partnerBData && <Comparison partnerA={partnerAData} partnerB={partnerBData} onDealMemo={handleDealMemo} />}
        {phase === "deal-memo" && partnerAData && partnerBData && <DealMemo partnerA={partnerAData} partnerB={partnerBData} onBack={handleBackToComparison} />}
      </main>

      {/* Print styles */}
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        @media print {
          nav, button, .no-print { display: none !important; }
          body { background: white !important; }
          #deal-memo { box-shadow: none !important; border: none !important; }
        }
      `}</style>
    </div>
  );
}
