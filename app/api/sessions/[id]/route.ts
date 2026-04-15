import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 500 }
    );
  }

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 500 }
    );
  }

  const body = await req.json();

  const { data, error } = await supabase
    .from("sessions")
    .update(body)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
