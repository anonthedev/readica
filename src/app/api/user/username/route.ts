import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase";

export async function PUT(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const session = await getServerSession(authOptions);
  if (
    !session ||
    !session.user ||
    !session.user.id ||
    !session.supabaseAccessToken
  ) {
    return NextResponse.json(
      { error: "Unauthorized or missing token" },
      { status: 401 }
    );
  }

  if (!authHeader) {
    return NextResponse.json({ message: "Missing token" }, { status: 400 });
  }
  const token = authHeader.split(" ")[1];
  const supabase = await supabaseClient(token);

  let username: string;
  try {
    const body = await req.json();
    username = body.username;
    if (
      !username ||
      typeof username !== "string" ||
      username.trim().length < 3 ||
      username.trim().length > 25
    ) {
      return NextResponse.json(
        { error: "Invalid username. Must be between 3 and 25 characters." },
        { status: 400 }
      );
    }
    username = username.trim();

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username can only contain letters, numbers, and underscores (_).",
        },
        { status: 400 }
      );
    }

    const RESERVED_USERNAMES = new Set([
      "profile",
      "dashboard",
      "library",
      "discover",
      "reader",
      "notes",
      "login",
      "signin",
      "signup",
      "logout",
      "onboarding",
      "username",
      "settings",
      "admin",
      "root",
      "api",
      "auth",
      "user",
      "public",
      "static",
    ]);

    if (RESERVED_USERNAMES.has(username.toLowerCase())) {
      return NextResponse.json(
        { error: "This username cannot be used." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in username body", error);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const userId = session.user.id;

  try {
    const { data, error } = await supabase
      .from("users")
      .update({ username: username })
      .eq("id", userId)
      .select("username")
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Failed to update username" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "User not found or update failed" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, username: data.username },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating username:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
