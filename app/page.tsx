"use client";
// @ts-nocheck
import { useState, useMemo, useEffect } from "react";

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
  deepDiveAnswers: Record<string, { answers: string[]; importance: number }>;
  questionIds: string[];
}

/* ================================================================
   VALUES QUESTIONS — Phase 1 (6 questions)
   ================================================================ */
const VALUES_QUESTIONS: ValuesQ[] = [
  {
    id: "moneyMindset",
    sectionLabel: "Money Personality",
    sectionIntro: "Let's start with the basics — how you naturally think about money.",
    question: "When it comes to money, which feels most like you?",
    options: [
      { value: "guardian", label: "The Protector", desc: "I like knowing there's a safety net" },
      { value: "builder", label: "The Builder", desc: "I want money to grow and work for us" },
      { value: "enjoyer", label: "The Experiencer", desc: "Money is for creating the life we want" },
      { value: "balancer", label: "The Balancer", desc: "A little of everything, nothing extreme" },
    ],
  },
  {
    id: "togetherness",
    sectionLabel: "Financial Togetherness",
    sectionIntro: "Now let's talk about how you picture sharing finances as a couple.",
    question: "How do you picture handling finances together?",
    options: [
      { value: "fully-combined", label: "All In", desc: "One pot — what's mine is yours" },
      { value: "mostly-combined", label: "Mostly Together", desc: "Shared, but with some personal breathing room" },
      { value: "split-collaborative", label: "Split but Collaborative", desc: "Separate accounts, shared decisions" },
      { value: "largely-independent", label: "Independent", desc: "We each handle our own" },
    ],
  },
  {
    id: "futureVision",
    sectionLabel: "Looking Ahead",
    sectionIntro: "Let's zoom out — what does the future look like for you?",
    question: "When you picture the next 10 years, what excites you most?",
    options: [
      { value: "wealth", label: "Building Wealth", desc: "Growing our financial foundation together" },
      { value: "family", label: "Growing a Family", desc: "Kids, home, the whole picture" },
      { value: "career", label: "Career & Ambition", desc: "Professional growth and new opportunities" },
      { value: "lifestyle", label: "Experiences", desc: "Travel, adventures, and enjoying life" },
      { value: "security", label: "Stability", desc: "Knowing we're secure no matter what" },
    ],
  },
  {
    id: "riskComfort",
    sectionLabel: "Risk Tolerance",
    sectionIntro: "Here's a scenario to think about.",
    question: "A friend pitches you both on a real estate investment. Your gut reaction?",
    options: [
      { value: "very-conservative", label: "No Thanks", desc: "I'd rather keep what we have safe" },
      { value: "somewhat-cautious", label: "Show Me the Numbers", desc: "Maybe, if the math really works" },
      { value: "moderate-risk", label: "I'm Interested", desc: "Growth takes some risk" },
      { value: "aggressive", label: "I'm In", desc: "You have to bet big to win big" },
    ],
  },
  {
    id: "incomeApproach",
    sectionLabel: "The Income Question",
    sectionIntro: "This one comes up more than you'd think.",
    question: "If one partner earns significantly more, how should that affect things?",
    options: [
      { value: "equal", label: "Doesn't Matter", desc: "We split everything 50/50 regardless" },
      { value: "proportional", label: "Proportional", desc: "We each contribute relative to what we earn" },
      { value: "higher-more", label: "Higher Earner Steps Up", desc: "They naturally take on more" },
      { value: "situational", label: "It Depends", desc: "Context matters here" },
    ],
  },
  {
    id: "coreValue",
    sectionLabel: "What Matters Most",
    sectionIntro: "Last one in this section — and it's a big one.",
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
    question: "Should either of you be able to keep certain assets completely separate — like savings from before the relationship, a family heirloom, or a side business?",
    options: [
      { value: "yes", label: "Yes, absolutely", desc: "Some things should stay individual" },
      { value: "some", label: "For certain things", desc: "It depends on the asset" },
      { value: "probably-not", label: "Probably not", desc: "We're building this together" },
      { value: "unsure", label: "Haven't thought about it", desc: "I'd need to think on this" },
    ],
    scale: { yes: 0, some: 1, "probably-not": 3, unsure: 1 },
  },
  {
    id: "business_ownership", topic: "Business Ownership",
    question: "If one of you starts a business during the marriage, how should ownership work?",
    options: [
      { value: "shared", label: "It's a shared asset", desc: "We're invested in each other's success" },
      { value: "depends-funding", label: "Depends who funded it", desc: "The source of investment matters" },
      { value: "founder-keeps", label: "The founder keeps it", desc: "It's their creation" },
      { value: "figure-later", label: "Work it out later", desc: "Cross that bridge when we come to it" },
    ],
    scale: { shared: 0, "depends-funding": 1, "founder-keeps": 3, "figure-later": 2 },
  },
  {
    id: "home_ownership", topic: "Home & Property",
    question: "When it comes to buying a home together…",
    options: [
      { value: "equal", label: "Equal ownership", desc: "No matter who pays more at closing" },
      { value: "reflects-contribution", label: "Reflects contribution", desc: "Ownership should match financial input" },
      { value: "both-names", label: "Both names regardless", desc: "It's our home, period" },
      { value: "rent", label: "We'd rent", desc: "Not interested in buying right now" },
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
    question: "If one of you receives a large inheritance…",
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
    question: "How should debts from before the relationship — student loans, credit cards — be handled?",
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
    question: "If one partner's income dramatically changes — up or down — what happens?",
    options: [
      { value: "nothing-changes", label: "Arrangement stays the same", desc: "Stability matters" },
      { value: "renegotiate", label: "We renegotiate", desc: "The plan should reflect reality" },
      { value: "naturally-adjusts", label: "It naturally adjusts", desc: "We'd adapt without formal changes" },
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
    question: "If one partner gets an incredible job offer in another city…",
    options: [
      { value: "partner-follows", label: "The other follows", desc: "We're a team — we go together" },
      { value: "weigh-equally", label: "Weigh both careers", desc: "Neither career is more important" },
      { value: "financial-impact", label: "Follow the money", desc: "Financial impact decides" },
      { value: "serious-negotiation", label: "Needs serious discussion", desc: "This isn't a simple call" },
    ],
    scale: { "partner-follows": 0, "weigh-equally": 1, "financial-impact": 2, "serious-negotiation": 2 },
  },
  {
    id: "lifestyle_maintenance", topic: "If Things Don't Work Out",
    question: "If the relationship ended, should one partner help maintain the other's lifestyle?",
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
    question: "When it comes to kids and financial planning…",
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
      { value: "extreme-only", label: "Only in extreme situations", desc: "There's a line, but it's high" },
      { value: "no-punitive", label: "No, that feels punitive", desc: "Finances shouldn't be a weapon" },
      { value: "unsure", label: "I'm not sure", desc: "This is a hard one" },
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
  guardian: "a protector — you value safety and security with money",
  builder: "a builder — you want your money to grow and work for you",
  enjoyer: "an experiencer — money is a tool for living your best life",
  balancer: "a balancer — you take a measured, moderate approach",
};
const TOGETHER_LABELS: Record<string, string> = {
  "fully-combined": "going all in together financially",
  "mostly-combined": "mostly combining finances with some personal space",
  "split-collaborative": "keeping things separate but making big decisions together",
  "largely-independent": "maintaining financial independence within the partnership",
};
const RISK_LABELS: Record<string, string> = {
  "very-conservative": "conservative — you prefer keeping things safe",
  "somewhat-cautious": "cautious — open to opportunity but you want to see the math",
  "moderate-risk": "comfortable with calculated risk for growth",
  aggressive: "adventurous — willing to take big swings",
};
const VALUE_LABELS: Record<string, string> = {
  trust: "transparency and honesty", independence: "personal autonomy",
  equality: "fairness and balance", flexibility: "adaptability as life changes",
};

function generateInsight(v: Record<string, string>): string {
  return `You're ${MINDSET_LABELS[v.moneyMindset] || "thoughtful about money"}, and you picture ${TOGETHER_LABELS[v.togetherness] || "sharing finances in your own way"}. When it comes to risk, you're ${RISK_LABELS[v.riskComfort] || "balanced"}. Above all, you care about ${VALUE_LABELS[v.coreValue] || "doing things right"}.`;
}

interface ComparisonItem {
  topic: string; questionId: string;
  aAnswers: string[]; bAnswers: string[];
  aLabels: string[]; bLabels: string[];
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
    // Check if there's any overlap in answers
    const hasOverlap = aa.answers.some((ans) => ba.answers.includes(ans));
    let d = 0;
    if (!hasOverlap) {
      // Find min distance between any pair
      d = Math.min(...aa.answers.map((aAns) => Math.min(...ba.answers.map((bAns) => Math.abs((q.scale[aAns] ?? 1) - (q.scale[bAns] ?? 1))))));
    }
    const avgImportance = (aa.importance + ba.importance) / 2;
    return {
      topic: q.topic, questionId: qId,
      aAnswers: aa.answers, bAnswers: ba.answers,
      aLabels: aa.answers.map((ans) => q.options.find((o) => o.value === ans)?.label || ans),
      bLabels: ba.answers.map((ans) => q.options.find((o) => o.value === ans)?.label || ans),
      aImportance: aa.importance, bImportance: ba.importance,
      status: hasOverlap ? "aligned" : d <= 1 ? "conversation" : "attorney", distance: d,
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
  const demoDD: Record<string, { answers: string[]; importance: number }> = {};
  realData.questionIds.forEach((qId) => {
    const q = DEEP_DIVE_POOL.find((x) => x.id === qId)!;
    const realAnswers = realData.deepDiveAnswers[qId]?.answers || [];
    const realIdx = realAnswers.length > 0 ? q.options.findIndex((o) => o.value === realAnswers[0]) : 0;
    const demoIdx = realIdx <= 0 ? Math.min(1, q.options.length - 1) : realIdx - 1;
    demoDD[qId] = { answers: [q.options[demoIdx].value], importance: Math.max(1, Math.min(5, (realData.deepDiveAnswers[qId]?.importance || 3) + (Math.random() > 0.5 ? 1 : -1))) };
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
      className={`w-full text-left px-5 py-4 rounded-lg border-2 transition-all ${
        selected
          ? "border-teal-600 bg-teal-50"
          : "border-stone-200 bg-white hover:border-stone-300"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 ${
          selected ? "border-teal-600 bg-teal-600" : "border-stone-300 bg-white"
        }`} />
        <div className="flex-1">
          <div className="font-medium text-stone-900">{option.label}</div>
          <div className="text-sm text-stone-500 mt-0.5">{option.desc}</div>
        </div>
      </div>
    </button>
  );
}

function ImportanceRating({ value, onChange }: { value: number | null; onChange: (n: number) => void }) {
  return (
    <div className="w-full max-w-md mx-auto">
      <p className="text-sm font-medium text-stone-700 mb-4">How important is this to you?</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`flex-1 py-2 px-2 rounded border-2 font-medium text-sm transition-all ${
              value === n
                ? "border-teal-600 bg-teal-600 text-white"
                : "border-stone-200 text-stone-600 hover:border-stone-300"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function Landing({ onStart }: { onStart: () => void }) {
  const phrases = ["assume we agree", "walk into a lawyer's office", "let the state decide for us", "sign anything"];
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setPhraseIdx((p) => (p + 1) % phrases.length), 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white flex flex-col items-center justify-between px-4">
      <Nav />
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-serif text-stone-900 text-center leading-tight mb-3">
          before we<span className="text-teal-700">…</span>
        </h1>
        <div className="h-24 flex items-center justify-center">
          <p className="text-2xl md:text-3xl text-stone-600 text-center italic min-h-16 fade-in">
            <span key={phraseIdx} className="inline-block">
              {phrases[phraseIdx]}
            </span>
          </p>
        </div>
        <button
          onClick={onStart}
          className="mt-8 px-8 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
        >
          Let's get on the same page
        </button>
      </div>
      <footer className="text-center pb-8 text-stone-500 text-sm max-w-lg">
        A private alignment tool for couples. Just a structured way to figure out what you both actually want — and how to protect it.
      </footer>
    </div>
  );
}

function NameEntry({ onSubmit, partnerLabel }: { onSubmit: (name: string) => void; partnerLabel: string }) {
  const [name, setName] = useState("");
  const handleSubmit = () => {
    if (name.trim()) onSubmit(name.trim());
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white flex flex-col">
      <Nav />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-xl">
          <h2 className="text-3xl font-serif text-stone-900 mb-2">{partnerLabel}, what's your name?</h2>
          <p className="text-stone-600 mb-8">We'll use this to personalize your results.</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="First name is fine"
            className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg mb-4 focus:outline-none focus:border-teal-600"
            autoFocus
          />
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function ValuesPhase({
  questionIdx,
  onSelectOption,
  selectedOptions,
  onContinue,
}: {
  questionIdx: number;
  onSelectOption: (qId: string, value: string) => void;
  selectedOptions: Record<string, string[]>;
  onContinue: () => void;
}) {
  const q = VALUES_QUESTIONS[questionIdx];
  const selected = selectedOptions[q.id] || [];
  const hasSelection = selected.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white flex flex-col">
      <Nav />
      <div className="flex-1 flex flex-col px-4 py-8">
        <ProgressBar current={questionIdx} total={VALUES_QUESTIONS.length} sectionLabel={q.sectionLabel} />
        <div className="w-full max-w-xl mx-auto">
          <p className="text-sm font-medium text-teal-700 uppercase tracking-wide mb-2">{q.sectionLabel}</p>
          <p className="text-stone-600 text-sm mb-6">{q.sectionIntro}</p>
          <h2 className="text-2xl font-serif text-stone-900 mb-8">{q.question}</h2>
          <div className="space-y-3 mb-8">
            {q.options.map((opt) => (
              <OptionCard
                key={opt.value}
                option={opt}
                selected={selected.includes(opt.value)}
                onClick={() => {
                  const newSelected = selected.includes(opt.value)
                    ? selected.filter((v) => v !== opt.value)
                    : [...selected, opt.value];
                  onSelectOption(q.id, newSelected.join(","));
                }}
              />
            ))}
          </div>
          {hasSelection && (
            <button
              onClick={onContinue}
              className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ValuesSummary({ name, answers, onContinue }: { name: string; answers: Record<string, string>; onContinue: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white flex flex-col">
      <Nav />
      <div className="flex-1 flex flex-col px-4 py-8">
        <div className="w-full max-w-xl mx-auto">
          <h2 className="text-2xl font-serif text-stone-900 mb-4">{name}, here's what we learned:</h2>
          <p className="text-stone-600 mb-6">{generateInsight(answers)}</p>
          <button
            onClick={onContinue}
            className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            Let's dig deeper
          </button>
        </div>
      </div>
    </div>
  );
}

function DeepDiveIntro({ name, topics, onContinue }: { name: string; topics: string[]; onContinue: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white flex flex-col">
      <Nav />
      <div className="flex-1 flex flex-col px-4 py-8">
        <div className="w-full max-w-xl mx-auto">
          <h2 className="text-2xl font-serif text-stone-900 mb-4">{name}, based on your answers, we're focusing on 6 topics:</h2>
          <ul className="space-y-2 mb-8 text-stone-700">
            {topics.map((t) => (
              <li key={t} className="flex gap-3">
                <span className="text-teal-600">•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={onContinue}
            className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            Start the deep dive
          </button>
        </div>
      </div>
    </div>
  );
}

function DeepDivePhase({
  questionIdx,
  questions,
  onSelectOption,
  selectedOptions,
  onSetImportance,
  importance,
}: {
  questionIdx: number;
  questions: string[];
  onSelectOption: (qId: string, value: string) => void;
  selectedOptions: Record<string, string[]>;
  onSetImportance: (qId: string, value: number) => void;
  importance: Record<string, number>;
}) {
  const qId = questions[questionIdx];
  const q = DEEP_DIVE_POOL.find((x) => x.id === qId)!;
  const selected = selectedOptions[qId] || [];
  const hasSelection = selected.length > 0;
  const importanceSet = importance[qId] !== undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white flex flex-col">
      <Nav />
      <div className="flex-1 flex flex-col px-4 py-8">
        <ProgressBar current={questionIdx} total={questions.length} sectionLabel={q.topic} />
        <div className="w-full max-w-xl mx-auto">
          <h2 className="text-2xl font-serif text-stone-900 mb-8">{q.question}</h2>
          <div className="space-y-3 mb-8">
            {q.options.map((opt) => (
              <OptionCard
                key={opt.value}
                option={opt}
                selected={selected.includes(opt.value)}
                onClick={() => {
                  if (hasSelection && !importanceSet) return;
                  const newSelected = selected.includes(opt.value)
                    ? selected.filter((v) => v !== opt.value)
                    : [...selected, opt.value];
                  onSelectOption(qId, newSelected.join(","));
                }}
              />
            ))}
          </div>
          {hasSelection && !importanceSet && (
            <div className="mb-8">
              <ImportanceRating
                value={importance[qId] || null}
                onChange={(n) => onSetImportance(qId, n)}
              />
            </div>
          )}
          {hasSelection && importanceSet && (
            <button
              onClick={() => {
                if (questionIdx < questions.length - 1) {
                  // Reset for next question
                  onSelectOption(questions[questionIdx + 1], "");
                  onSetImportance(questions[questionIdx + 1], 0);
                }
              }}
              className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              {questionIdx < questions.length - 1 ? "Next" : "Continue"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileSummary({
  name,
  valuesAnswers,
  deepDiveAnswers,
  questionIds,
  onContinue,
}: {
  name: string;
  valuesAnswers: Record<string, string>;
  deepDiveAnswers: Record<string, { answers: string[]; importance: number }>;
  questionIds: string[];
  onContinue: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white flex flex-col">
      <Nav />
      <div className="flex-1 flex flex-col px-4 py-8">
        <div className="w-full max-w-xl mx-auto">
          <h2 className="text-2xl font-serif text-stone-900 mb-4">Your profile is complete, {name}.</h2>
          <p className="text-stone-600 mb-8">
            We've got your values, your priorities, and your thoughts on the big questions. Now we need to see what your partner thinks — and where you align.
          </p>
          <button
            onClick={onContinue}
            className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            Add my partner
          </button>
        </div>
      </div>
    </div>
  );
}

function PartnerGate({ name, onPartnerStart, onDemo }: { name: string; onPartnerStart: () => void; onDemo: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white flex flex-col">
      <Nav />
      <div className="flex-1 flex flex-col px-4 py-8">
        <div className="w-full max-w-xl mx-auto">
          <h2 className="text-2xl font-serif text-stone-900 mb-4">Next step: Compare with your partner</h2>
          <p className="text-stone-600 mb-8">
            {name}, you've answered all the questions. Now your partner needs to do the same. You can send them a link or enter their answers yourself. Or, try a demo to see how the comparison works.
          </p>
          <div className="space-y-3">
            <button
              onClick={onPartnerStart}
              className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              Get my partner's answers
            </button>
            <button
              onClick={onDemo}
              className="w-full px-6 py-3 bg-stone-200 text-stone-900 rounded-lg font-medium hover:bg-stone-300 transition-colors"
            >
              See a demo comparison
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    aligned: "bg-emerald-100 text-emerald-800",
    conversation: "bg-blue-100 text-blue-800",
    attorney: "bg-amber-100 text-amber-800",
  };
  const labels: Record<string, string> = {
    aligned: "You align",
    conversation: "Worth discussing",
    attorney: "Discuss with attorney",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status] || ""}`}>
      {labels[status] || status}
    </span>
  );
}

function Comparison({
  partnerA,
  partnerB,
  onContinue,
}: {
  partnerA: PartnerData;
  partnerB: PartnerData;
  onContinue: () => void;
}) {
  const comp = comparePartners(partnerA, partnerB);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white flex flex-col">
      <Nav />
      <div className="flex-1 flex flex-col px-4 py-8 overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto">
          <h2 className="text-3xl font-serif text-stone-900 mb-2">{partnerA.name} & {partnerB.name}</h2>
          <p className="text-stone-600 mb-8">Here's where you stand, together.</p>

          {/* Values Comparison */}
          <div className="mb-12">
            <h3 className="text-xl font-serif text-stone-900 mb-6">Values Alignment</h3>
            <div className="space-y-4">
              {comp.values.map((v) => (
                <div key={v.question} className="border border-stone-200 rounded-lg p-4">
                  <p className="font-medium text-stone-900 mb-3">{v.question}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded ${v.match ? "bg-emerald-50" : "bg-stone-50"}`}>
                      <p className="text-xs text-stone-500 mb-1">{partnerA.name}</p>
                      <p className="text-sm font-medium text-stone-900">{v.aLabel}</p>
                    </div>
                    <div className={`p-3 rounded ${v.match ? "bg-emerald-50" : "bg-stone-50"}`}>
                      <p className="text-xs text-stone-500 mb-1">{partnerB.name}</p>
                      <p className="text-sm font-medium text-stone-900">{v.bLabel}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aligned Items */}
          {comp.aligned.length > 0 && (
            <div className="mb-12">
              <h3 className="text-xl font-serif text-stone-900 mb-6 flex items-center gap-3">
                <StatusBadge status="aligned" />
                You align on these
              </h3>
              <div className="space-y-4">
                {comp.aligned.map((item) => (
                  <div key={item.questionId} className="border border-emerald-200 bg-emerald-50 rounded-lg p-4">
                    <p className="font-medium text-stone-900 mb-2">{item.topic}</p>
                    <p className="text-sm text-stone-600 mb-3">{item.aLabels.join(", ")} — Both</p>
                    <p className="text-xs text-stone-500">Importance: {partnerA.name} ({item.aImportance}), {partnerB.name} ({item.bImportance})</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conversation Items */}
          {comp.conversation.length > 0 && (
            <div className="mb-12">
              <h3 className="text-xl font-serif text-stone-900 mb-6 flex items-center gap-3">
                <StatusBadge status="conversation" />
                Worth discussing
              </h3>
              <div className="space-y-4">
                {comp.conversation.map((item) => (
                  <div key={item.questionId} className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                    <p className="font-medium text-stone-900 mb-3">{item.topic}</p>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <p className="text-xs text-stone-500 mb-1">{partnerA.name}</p>
                        <p className="text-sm font-medium text-stone-900">{item.aLabels.join(", ")}</p>
                      </div>
                      <div>
                        <p className="text-xs text-stone-500 mb-1">{partnerB.name}</p>
                        <p className="text-sm font-medium text-stone-900">{item.bLabels.join(", ")}</p>
                      </div>
                    </div>
                    <p className="text-xs text-stone-500">Distance: {item.distance}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attorney Items */}
          {comp.attorney.length > 0 && (
            <div className="mb-12">
              <h3 className="text-xl font-serif text-stone-900 mb-6 flex items-center gap-3">
                <StatusBadge status="attorney" />
                Discuss with an attorney
              </h3>
              <div className="space-y-4">
                {comp.attorney.map((item) => (
                  <div key={item.questionId} className="border border-amber-200 bg-amber-50 rounded-lg p-4">
                    <p className="font-medium text-stone-900 mb-3">{item.topic}</p>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <p className="text-xs text-stone-500 mb-1">{partnerA.name}</p>
                        <p className="text-sm font-medium text-stone-900">{item.aLabels.join(", ")}</p>
                      </div>
                      <div>
                        <p className="text-xs text-stone-500 mb-1">{partnerB.name}</p>
                        <p className="text-sm font-medium text-stone-900">{item.bLabels.join(", ")}</p>
                      </div>
                    </div>
                    <p className="text-xs text-stone-500">Distance: {item.distance}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Topics answered by only one person */}
          {(comp.aOnlyTopics.length > 0 || comp.bOnlyTopics.length > 0) && (
            <div className="mb-12">
              <h3 className="text-lg font-serif text-stone-900 mb-4">Topics answered by only one person</h3>
              {comp.aOnlyTopics.length > 0 && (
                <p className="text-sm text-stone-600 mb-4">
                  <span className="font-medium">{partnerA.name}</span> answered about: {comp.aOnlyTopics.join(", ")}
                </p>
              )}
              {comp.bOnlyTopics.length > 0 && (
                <p className="text-sm text-stone-600">
                  <span className="font-medium">{partnerB.name}</span> answered about: {comp.bOnlyTopics.join(", ")}
                </p>
              )}
            </div>
          )}

          <button
            onClick={onContinue}
            className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            Create your deal memo
          </button>
        </div>
      </div>
    </div>
  );
}

function DealMemo({
  partnerA,
  partnerB,
  onBack,
}: {
  partnerA: PartnerData;
  partnerB: PartnerData;
  onBack: () => void;
}) {
  const comp = comparePartners(partnerA, partnerB);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<null | "success" | "error">(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSend = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/send-memo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          partnerAName: partnerA.name,
          partnerBName: partnerB.name,
          comparisonData: {
            aligned: comp.aligned.map((item) => ({
              topic: item.topic,
              aAnswer: item.aLabels.join(", "),
              bAnswer: item.bLabels.join(", "),
            })),
            conversation: comp.conversation.map((item) => ({
              topic: item.topic,
              aAnswer: item.aLabels.join(", "),
              bAnswer: item.bLabels.join(", "),
            })),
            attorney: comp.attorney.map((item) => ({
              topic: item.topic,
              aAnswer: item.aLabels.join(", "),
              bAnswer: item.bLabels.join(", "),
            })),
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Failed to send");
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white flex flex-col">
      <Nav />
      <div className="flex-1 flex flex-col px-4 py-8 overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto">
          <h2 className="text-3xl font-serif text-stone-900 mb-8">Your Before We Alignment Summary</h2>

          {/* What You Agree On */}
          {comp.aligned.length > 0 && (
            <div className="mb-10">
              <h3 className="text-xl font-serif text-stone-900 mb-4">What You Agree On</h3>
              <ul className="space-y-3">
                {comp.aligned.map((item) => (
                  <li key={item.questionId} className="flex gap-3 text-stone-700">
                    <span className="text-teal-600 font-bold">✓</span>
                    <div>
                      <p className="font-medium">{item.topic}</p>
                      <p className="text-sm text-stone-500">{item.aLabels.join(", ")}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Discussion Points */}
          {comp.conversation.length > 0 && (
            <div className="mb-10">
              <h3 className="text-xl font-serif text-stone-900 mb-4">Discussion Points</h3>
              <ul className="space-y-3">
                {comp.conversation.map((item) => (
                  <li key={item.questionId} className="flex gap-3 text-stone-700">
                    <span className="text-blue-600 font-bold">•</span>
                    <div>
                      <p className="font-medium">{item.topic}</p>
                      <p className="text-sm text-stone-500">{partnerA.name}: {item.aLabels.join(", ")}</p>
                      <p className="text-sm text-stone-500">{partnerB.name}: {item.bLabels.join(", ")}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Questions for Attorney */}
          {comp.attorney.length > 0 && (
            <div className="mb-10">
              <h3 className="text-xl font-serif text-stone-900 mb-4">Questions for Your Attorney</h3>
              <ul className="space-y-3">
                {comp.attorney.map((item) => (
                  <li key={item.questionId} className="flex gap-3 text-stone-700">
                    <span className="text-amber-600 font-bold">⚠</span>
                    <div>
                      <p className="font-medium">{item.topic}</p>
                      <p className="text-sm text-stone-500">{partnerA.name}: {item.aLabels.join(", ")}</p>
                      <p className="text-sm text-stone-500">{partnerB.name}: {item.bLabels.join(", ")}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          <div className="mb-10 p-4 border border-stone-200 rounded-lg bg-white">
            <h3 className="text-lg font-serif text-stone-900 mb-3">Next Steps</h3>
            <ol className="space-y-2 text-sm text-stone-700">
              <li>1. Review this summary together</li>
              <li>2. Have the harder conversations</li>
              <li>3. Meet with an attorney to draft your agreement</li>
            </ol>
          </div>

          {/* Email Section */}
          <div className="border-t border-stone-200 pt-8 mb-8">
            <h3 className="text-lg font-serif text-stone-900 mb-4">Send this to your inbox</h3>
            {status === "success" && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg mb-4">
                <p className="text-sm text-emerald-800">Email sent successfully!</p>
              </div>
            )}
            {status === "error" && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <p className="text-sm text-red-800">{errorMsg}</p>
              </div>
            )}
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 border-2 border-stone-200 rounded-lg focus:outline-none focus:border-teal-600"
              />
              <button
                onClick={handleSend}
                disabled={!email.trim() || loading}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending…" : "Send my deal memo"}
              </button>
            </div>
          </div>

          <button
            onClick={onBack}
            className="w-full px-6 py-3 bg-stone-200 text-stone-900 rounded-lg font-medium hover:bg-stone-300 transition-colors"
          >
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
  const [partnerAName, setPartnerAName] = useState("");
  const [partnerBName, setPartnerBName] = useState("");
  const [valuesAnswers, setValuesAnswers] = useState<Record<string, string[]>>({});
  const [deepDiveQuestions, setDeepDiveQuestions] = useState<string[]>([]);
  const [deepDiveAnswers, setDeepDiveAnswers] = useState<Record<string, { answers: string[]; importance: number }>>({});
  const [deepDiveIdx, setDeepDiveIdx] = useState(0);
  const [deepDiveImportance, setDeepDiveImportance] = useState<Record<string, number>>({});
  const [partnerAData, setPartnerAData] = useState<PartnerData | null>(null);
  const [partnerBData, setPartnerBData] = useState<PartnerData | null>(null);

  // Phase: landing
  const handleStartLanding = () => {
    setValuesAnswers({});
    setDeepDiveAnswers({});
    setDeepDiveImportance({});
    setPhase("name-entry");
  };

  // Phase: name-entry for partner A
  const handleNameSubmitA = (name: string) => {
    setPartnerAName(name);
    setPhase("values");
  };

  // Phase: values
  const handleSelectValueOption = (qId: string, value: string) => {
    setValuesAnswers((prev) => ({
      ...prev,
      [qId]: value ? value.split(",") : [],
    }));
  };

  const handleValuesNext = () => {
    setPhase("values-summary");
  };

  // Phase: values-summary
  const handleValuesSummaryNext = () => {
    const selectedValues = Object.fromEntries(
      Object.entries(valuesAnswers).map(([k, v]) => [k, v[0] || ""])
    );
    setDeepDiveQuestions(selectDeepDiveQuestions(selectedValues));
    setPhase("deep-dive-intro");
  };

  // Phase: deep-dive-intro
  const handleDeepDiveIntroNext = () => {
    setDeepDiveIdx(0);
    setPhase("deep-dive");
  };

  // Phase: deep-dive
  const handleSelectDeepDiveOption = (qId: string, value: string) => {
    setDeepDiveAnswers((prev) => ({
      ...prev,
      [qId]: {
        answers: value ? value.split(",") : [],
        importance: deepDiveImportance[qId] || 0,
      },
    }));
  };

  const handleSetImportance = (qId: string, value: number) => {
    setDeepDiveImportance((prev) => ({ ...prev, [qId]: value }));
    const qIdx = deepDiveQuestions.indexOf(qId);
    if (qIdx < deepDiveQuestions.length - 1) {
      setDeepDiveIdx(qIdx + 1);
      // Reset for next question
      const nextQId = deepDiveQuestions[qIdx + 1];
      setDeepDiveAnswers((prev) => ({
        ...prev,
        [nextQId]: { answers: [], importance: 0 },
      }));
    } else {
      // All done, move to profile summary
      setPhase("profile-summary");
    }
  };

  // Phase: profile-summary
  const handleProfileSummaryNext = () => {
    const selectedValues = Object.fromEntries(
      Object.entries(valuesAnswers).map(([k, v]) => [k, v[0] || ""])
    );
    setPartnerAData({
      name: partnerAName,
      valuesAnswers: selectedValues,
      deepDiveAnswers,
      questionIds: deepDiveQuestions,
    });
    setPhase("partner-gate");
  };

  // Phase: partner-gate
  const handlePartnerStart = () => {
    setPartnerBName("");
    setValuesAnswers({});
    setDeepDiveAnswers({});
    setDeepDiveImportance({});
    setDeepDiveIdx(0);
    setPhase("name-entry");
  };

  const handleDemoPartner = () => {
    if (!partnerAData) return;
    setPartnerBData(makeDemoPartner(partnerAData));
    setPhase("comparison");
  };

  // Phase: name-entry for partner B (after reuse)
  const handleNameSubmitB = (name: string) => {
    setPartnerBName(name);
    setPhase("values");
  };

  // After partner B completes, we need to compare
  const handlePartnerBProfileSummary = () => {
    if (!partnerAData) return;
    const selectedValues = Object.fromEntries(
      Object.entries(valuesAnswers).map(([k, v]) => [k, v[0] || ""])
    );
    setPartnerBData({
      name: partnerBName,
      valuesAnswers: selectedValues,
      deepDiveAnswers,
      questionIds: deepDiveQuestions,
    });
    setPhase("comparison");
  };

  // Determine which partner we're working with based on phase flow
  const isPartnerB = phase === "name-entry" && partnerAData !== null;
  const currentPartnerName = isPartnerB ? partnerBName || "Partner" : partnerAName || "You";

  return (
    <>
      {phase === "landing" && <Landing onStart={handleStartLanding} />}
      {phase === "name-entry" && (
        <NameEntry
          onSubmit={isPartnerB ? handleNameSubmitB : handleNameSubmitA}
          partnerLabel={isPartnerB ? "Partner" : "You"}
        />
      )}
      {phase === "values" && (
        <ValuesPhase
          questionIdx={VALUES_QUESTIONS.findIndex((q) => !Object.keys(valuesAnswers).includes(q.id))}
          onSelectOption={handleSelectValueOption}
          selectedOptions={valuesAnswers}
          onContinue={handleValuesNext}
        />
      )}
      {phase === "values-summary" && (
        <ValuesSummary
          name={currentPartnerName}
          answers={Object.fromEntries(
            Object.entries(valuesAnswers).map(([k, v]) => [k, v[0] || ""])
          )}
          onContinue={handleValuesSummaryNext}
        />
      )}
      {phase === "deep-dive-intro" && (
        <DeepDiveIntro
          name={currentPartnerName}
          topics={deepDiveQuestions.map(
            (qId) => DEEP_DIVE_POOL.find((q) => q.id === qId)?.topic || qId
          )}
          onContinue={handleDeepDiveIntroNext}
        />
      )}
      {phase === "deep-dive" && (
        <DeepDivePhase
          questionIdx={deepDiveIdx}
          questions={deepDiveQuestions}
          onSelectOption={handleSelectDeepDiveOption}
          selectedOptions={deepDiveAnswers}
          onSetImportance={handleSetImportance}
          importance={deepDiveImportance}
        />
      )}
      {phase === "profile-summary" && (
        <ProfileSummary
          name={currentPartnerName}
          valuesAnswers={Object.fromEntries(
            Object.entries(valuesAnswers).map(([k, v]) => [k, v[0] || ""])
          )}
          deepDiveAnswers={deepDiveAnswers}
          questionIds={deepDiveQuestions}
          onContinue={isPartnerB ? handlePartnerBProfileSummary : handleProfileSummaryNext}
        />
      )}
      {phase === "partner-gate" && (
        <PartnerGate
          name={partnerAName}
          onPartnerStart={handlePartnerStart}
          onDemo={handleDemoPartner}
        />
      )}
      {phase === "comparison" && partnerAData && partnerBData && (
        <Comparison
          partnerA={partnerAData}
          partnerB={partnerBData}
          onContinue={() => setPhase("deal-memo")}
        />
      )}
      {phase === "deal-memo" && partnerAData && partnerBData && (
        <DealMemo
          partnerA={partnerAData}
          partnerB={partnerBData}
          onBack={() => setPhase("comparison")}
        />
      )}
    </>
  );
}
