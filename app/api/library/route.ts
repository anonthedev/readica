import { supabaseClient } from "@/lib/supabase";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  const userId = req.nextUrl.searchParams.get("userId");
  const body = await req.json();
  const authHeader = req.headers.get("Authorization");

  if (!userId || !authHeader) {
    return NextResponse.json(
      { message: "Missing userId or token" },
      { status: 400 }
    );
  }

  const token = authHeader.split(" ")[1];

  const supabase = await supabaseClient(token);
  const response = await clerkClient.users.getUser(userId!);

  const { data, error } = await supabase
    .from("library")
    .insert([
      {
        email: response.emailAddresses[0].emailAddress,
        user_id: response.id,
        title: body.title,
        description: body.description,
        authors: body.authors,
        pdf_link: body.pdf_link,
      },
    ])
    .select();

  if (data) {
    return NextResponse.json(data);
  } else {
    console.log(error);
    return NextResponse.json(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    const authHeader = req.headers.get("Authorization");

    if (!userId || !authHeader) {
      return NextResponse.json(
        { message: "Missing userId or token" },
        { status: 400 }
      );
    }

    const token = authHeader.split(" ")[1];
    const supabase = await supabaseClient(token);

    let { data: library, error } = await supabase
      .from("library")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    if (!library || !Array.isArray(library)) {
      return NextResponse.json(
        { message: "No library data found" },
        { status: 404 }
      );
    }

    return NextResponse.json(library);
  } catch (error) {
    console.error("Error in GET /api/library:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    const uuid = req.nextUrl.searchParams.get("uuid");
    const authHeader = req.headers.get("Authorization");

    if (!userId || !authHeader) {
      return NextResponse.json(
        { message: "Missing userId or token" },
        { status: 400 }
      );
    }

    const token = authHeader.split(" ")[1];
    const supabase = await supabaseClient(token);

    const { data, error } = await supabase
      .from("library")
      .delete()
      .eq("uuid", uuid)
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in DELETE /api/library:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const uuid = req.nextUrl.searchParams.get("uuid");
  const authHeader = req.headers.get("Authorization");
  // console.log(req)
  const body = await req.json();

  const dataToUpdate = body.data;
  console.log(dataToUpdate);

  if (!userId || !authHeader) {
    return NextResponse.json(
      { message: "Missing userId or token" },
      { status: 400 }
    );
  }
  const token = authHeader.split(" ")[1];
  // console.log(token)
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("library")
    .update(dataToUpdate)
    .eq("uuid", uuid)
    .select();

  if (data) {
    return NextResponse.json(data);
  } else {
    console.log(error);
    return NextResponse.json(error);
  }
}
