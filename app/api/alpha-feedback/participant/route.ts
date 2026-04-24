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
  const { email } = body;

  if (!email || !email.trim()) {
    return NextResponse.json(
      { error: "Missing email" },
      { status: 400 }
    );
  }

  // NOTE: No session_id is stored here — deliberately disconnected
  // from survey responses to maintain anonymity
  const { data, error } = await supabase.from("alpha_participants").insert({
    email: email.trim().toLowerCase(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
