import { supabaseClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import axios from "axios";

export async function GET(req: NextRequest) {
  const session: Session | null = await getServerSession(authOptions);
  if (!session || !session.user || !session.supabaseAccessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const paper_uuid = req.nextUrl.searchParams.get("uuid");
    const userId = req.nextUrl.searchParams.get("userId");
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "Missing authorization token" },
        { status: 400 }
      );
    }

    const token = authHeader?.split(" ")[1];
    const supabase = supabaseClient(token);

    if (paper_uuid) {
      // For specific paper lookup, userId is still required
      if (!userId) {
        return NextResponse.json(
          { message: "Missing userId for specific paper lookup" },
          { status: 400 }
        );
      }

      const { data: library, error } = await supabase
        .from("library")
        .select("*")
        .eq("user_id", userId)
        .eq("uuid", paper_uuid);

      if (error) {
        return NextResponse.json(
          {
            message: "Couldn't fetch paper.",
          },
          { status: 500 }
        );
      }

      if (!library || !Array.isArray(library)) {
        return NextResponse.json(
          {
            message: "No library data found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(library, { status: 200 });
    }

    // For general library fetch
    let query = supabase
      .from("library")
      .select("*")
      .order("upload_date", { ascending: false });

    // If userId is provided, filter by user_id, otherwise return all papers
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: library, error } = await query;

    if (error) {
      return NextResponse.json(
        {
          message: "Internal server error",
        },
        { status: 500 }
      );
    }

    if (!library || !Array.isArray(library)) {
      return NextResponse.json(
        {
          message: "No library data found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(library, { status: 200 });
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

export async function POST(req: NextRequest) {
  const session: Session | null = await getServerSession(authOptions);
  if (!session || !session.user || !session.supabaseAccessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = session?.user?.id;
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

  const insertData: any = {
    email: body.email,
    user_id: userId,
    title: body.title,
    description: body.description,
    authors: body.authors,
    // tags: body.tags, // Uncomment if tags are to be supported here
  };

  if (body.file_id) {
    insertData.file_id = body.file_id;
    insertData.pdf_link = body.pdf_link || null;
  } else if (body.pdf_link) {
    insertData.pdf_link = body.pdf_link;
    insertData.file_id = null;
  } else {
    return NextResponse.json(
      { error: "Missing file_id or pdf_link" },
      { status: 400 }
    );
  }

  let fileIdToDelete: string | null = null;
  if (body.file_id) fileIdToDelete = body.file_id;

  try {
    const { data, error } = await supabase
      .from("library")
      .insert([insertData])
      .select();

    if (data) {
      // console.log(data)
      return NextResponse.json(data, { status: 200 });
    } else {
      // console.log(error)
      if (fileIdToDelete) {
        try {
          await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/backblaze?fileId=${fileIdToDelete}`);
        } catch (deleteErr) {
          console.error("Failed to delete file from Backblaze after DB insert error", deleteErr);
        }
      }
      if (error && error.code === "23505") {
        return NextResponse.json(
          {
            error: "Paper is already in your library",
            code: "23505",
          },
          { status: 409 }
        );
      } else {
        return NextResponse.json(
          {
            error: "Couldn't add paper to your library",
            message: error,
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    if (fileIdToDelete) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/backblaze?fileId=${fileIdToDelete}`);
      } catch (deleteErr) {
        console.error("Failed to delete file from Backblaze after exception", deleteErr);
      }
    }
    return NextResponse.json(
      {
        error: "Couldn't add paper to your library (exception)",
        message: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const session: Session | null = await getServerSession(authOptions);
  if (!session || !session.user || !session.supabaseAccessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = session?.user?.id;
  const uuid = req.nextUrl.searchParams.get("uuid");
  const authHeader = req.headers.get("Authorization");
  // console.log(uuid);
  const body = await req.json();

  // Enforce tag limit of 5 if tags are being updated
  if (body.tags && Array.isArray(body.tags) && body.tags.length > 5) {
    return NextResponse.json(
      { message: "You can only have up to 5 tags per item." },
      { status: 400 }
    );
  }

  const dataToUpdate = body;
  // console.log(dataToUpdate);

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
    .update(dataToUpdate)
    .eq("uuid", uuid)
    .select();

  if (data) {
    return NextResponse.json(data, { status: 200 });
  } else {
    // console.log(error);
    return NextResponse.json(error, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session: Session | null = await getServerSession(authOptions);
    if (!session || !session.user || !session.supabaseAccessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = session?.user?.id;
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

    const { data: existing, error: fetchError } = await supabase
      .from("library")
      .select("file_id")
      .eq("uuid", uuid)
      .single();
    if (fetchError) throw fetchError;
    const fileId = existing.file_id;
    if (fileId) {
      try {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/backblaze?fileId=${fileId}`
        );
      } catch (deleteErr) {
        console.error("Failed to delete file from Backblaze", deleteErr);
        return NextResponse.json(
          { message: "Failed to delete file from Backblaze" },
          { status: 500 }
        );
      }
    }

    const { data, error } = await supabase
      .from("library")
      .delete()
      .eq("uuid", uuid)
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json(data, { status: 200 });
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
