import { supabaseClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 400 });
  }

  const suapbase = await supabaseClient(token);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  if (body.name === "") {
    return NextResponse.json({ error: "Please enter a name" }, { status: 400 });
  }

  const { data, error } = await suapbase
    .from("waitlist")
    .insert({ email: body.email, name: body.name })
    .select();

  if (data) {
    return NextResponse.json(
      { message: "You are successfully added to the waitlist" },
      { status: 200 }
    );
  } else {
    if (error.code === "23505") {
      return NextResponse.json(
        { message: "You are already in the waitlist" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Couldn't add you to the waitlist" },
        { status: 500 }
      );
    }
  }
}
