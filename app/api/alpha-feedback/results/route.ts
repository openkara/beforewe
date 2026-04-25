import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 500 }
    );
  }

  const body = await req.json();
  const { session_id, archetype, satisfaction, accuracy, would_share, what_different, general_notes } = body;

  if (!session_id) {
    return NextResponse.json(
      { error: "Missing session_id" },
      { status: 400 }
    );
  }

  // Delete any existing entry for this session, then insert fresh
  // This prevents duplicate rows from multiple submit clicks
  await supabase.from("alpha_results_feedback").delete().eq("session_id", session_id);

  const { data, error } = await supabase.from("alpha_results_feedback").insert({
    session_id,
    archetype: archetype || null,
    satisfaction: satisfaction || null,
    accuracy: accuracy || null,
    would_share: would_share || null,
    what_different: what_different || null,
    general_notes: general_notes || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
