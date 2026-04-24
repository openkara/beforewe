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
  const { session_id, question_id, feedback, section_id } = body;

  if (!session_id || !question_id || !feedback) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.from("alpha_feedback").upsert(
    {
      session_id,
      question_id,
      feedback,
      section_id: section_id || null,
    },
    { onConflict: "session_id,question_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
