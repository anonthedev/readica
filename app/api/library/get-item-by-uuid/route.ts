import { supabaseClient } from "@/lib/supabase";
// import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const uuid = req.nextUrl.searchParams.get("uuid");
    const authHeader = req.headers.get("Authorization");

    if (!uuid || !authHeader) {
      return NextResponse.json({
        success: false,
        message: "Invalid PDF or token",
      });
    }

    const token = authHeader.split(" ")[1];
    const supabase = await supabaseClient(token);

    let { data: library, error } = await supabase
      .from("library")
      .select("*")
      .eq("uuid", uuid);

    if (error) {
      return NextResponse.json({
        success: false,
        message: error,
      });
    }

    if (!library || !Array.isArray(library)) {
      return NextResponse.json({
        success: false,
        message: "No library data found",
      });
    }

    return NextResponse.json({ success: true, library });
  } catch (error) {
    console.error("Error in GET /api/library:", error);
    return NextResponse.json({
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
      success: false,
    });
  }
}
