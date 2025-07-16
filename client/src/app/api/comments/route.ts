import { supabaseClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session: Session | null = await getServerSession(authOptions);
  if (!session || !session.user || !session.supabaseAccessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const library_id = req.nextUrl.searchParams.get("library_id");
    const parent_id = req.nextUrl.searchParams.get("parent_id");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");
    const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0");
    const authHeader = req.headers.get("Authorization");

    if (!library_id || !authHeader) {
      return NextResponse.json(
        { message: "Missing library_id or token" },
        { status: 400 }
      );
    }

    const token = authHeader.split(" ")[1];
    const supabase = supabaseClient(token);

    // If parent_id is provided, fetch only replies to that comment
    if (parent_id) {
      const { data: replies, error } = await supabase
        .from("comments")
        .select(`
          *,
          profile:profiles(username, display_name, image_url)
        `)
        .eq("library_id", library_id)
        .eq("parent_id", parent_id)
        .order("created_at", { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error fetching replies:", error);
        return NextResponse.json(
          { message: "Failed to fetch replies" },
          { status: 500 }
        );
      }

      return NextResponse.json(replies, { status: 200 });
    }

    // Fetch all comments with profile information
    const { data: comments, error } = await supabase
      .from("comments")
      .select(`
        *,
        profile:profiles(username, display_name, image_url)
      `)
      .eq("library_id", library_id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      return NextResponse.json(
        { message: "Failed to fetch comments" },
        { status: 500 }
      );
    }

    // Organize comments into nested structure but limit initial replies
    const commentMap = new Map<string, any>();
    const rootComments: any[] = [];

    // First pass: create map of all comments
    comments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [], totalReplies: 0 });
    });

    // Second pass: organize into parent-child relationships
    comments.forEach((comment) => {
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.totalReplies++;
          // Only include first 3 replies in initial load
          if (parent.replies.length < 3) {
            parent.replies.push(commentMap.get(comment.id));
          }
        }
      } else {
        rootComments.push(commentMap.get(comment.id));
      }
    });

    return NextResponse.json(rootComments, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/comments:", error);
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

  try {
    const userId = session.user.id;
    const body = await req.json();
    const authHeader = req.headers.get("Authorization");

    if (!userId || !authHeader) {
      return NextResponse.json(
        { message: "Missing userId or token" },
        { status: 400 }
      );
    }

    const { text, library_id, parent_id } = body;

    if (!text || !library_id) {
      return NextResponse.json(
        { message: "Missing required fields: text, library_id" },
        { status: 400 }
      );
    }

    if (text.trim().length === 0) {
      return NextResponse.json(
        { message: "Comment text cannot be empty" },
        { status: 400 }
      );
    }

    const token = authHeader.split(" ")[1];
    const supabase = supabaseClient(token);

    const insertData = {
      user_id: userId,
      library_id,
      text: text.trim(),
      parent_id: parent_id || null,
    };

    const { data, error } = await supabase
      .from("comments")
      .insert([insertData])
      .select(`
        *,
        profile:profiles(username, display_name, image_url)
      `)
      .single();

    if (error) {
      console.error("Error creating comment:", error);
      return NextResponse.json(
        { message: "Failed to create comment" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/comments:", error);
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
  const session: Session | null = await getServerSession(authOptions);
  if (!session || !session.user || !session.supabaseAccessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const commentId = req.nextUrl.searchParams.get("id");
    const authHeader = req.headers.get("Authorization");
    const body = await req.json();

    if (!userId || !authHeader || !commentId) {
      return NextResponse.json(
        { message: "Missing required parameters" },
        { status: 400 }
      );
    }

    const { text } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { message: "Comment text cannot be empty" },
        { status: 400 }
      );
    }

    const token = authHeader.split(" ")[1];
    const supabase = supabaseClient(token);

    // Check if the comment exists and belongs to the user
    const { data: existingComment, error: checkError } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", commentId)
      .single();

    if (checkError || !existingComment) {
      return NextResponse.json(
        { message: "Comment not found" },
        { status: 404 }
      );
    }

    if (existingComment.user_id !== userId) {
      return NextResponse.json(
        { message: "Unauthorized to edit this comment" },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from("comments")
      .update({
        text: text.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", commentId)
      .select(`
        *,
        profile:profiles(username, display_name, image_url)
      `)
      .single();

    if (error) {
      console.error("Error updating comment:", error);
      return NextResponse.json(
        { message: "Failed to update comment" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in PUT /api/comments:", error);
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
  const session: Session | null = await getServerSession(authOptions);
  if (!session || !session.user || !session.supabaseAccessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const commentId = req.nextUrl.searchParams.get("id");
    const authHeader = req.headers.get("Authorization");

    if (!userId || !authHeader || !commentId) {
      return NextResponse.json(
        { message: "Missing required parameters" },
        { status: 400 }
      );
    }

    const token = authHeader.split(" ")[1];
    const supabase = supabaseClient(token);

    // Check if the comment exists and belongs to the user
    const { data: existingComment, error: checkError } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", commentId)
      .single();

    if (checkError || !existingComment) {
      return NextResponse.json(
        { message: "Comment not found" },
        { status: 404 }
      );
    }

    if (existingComment.user_id !== userId) {
      return NextResponse.json(
        { message: "Unauthorized to delete this comment" },
        { status: 403 }
      );
    }

    const { error } = await supabase.from("comments").delete().eq("id", commentId);

    if (error) {
      console.error("Error deleting comment:", error);
      return NextResponse.json(
        { message: "Failed to delete comment" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Comment deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE /api/comments:", error);
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