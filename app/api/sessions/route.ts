import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 500 }
    );
  }

  const { data, error } = await supabase
    .from("sessions")
    .insert({ status: "waiting_a" })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sessionId: data.id });
}
