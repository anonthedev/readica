import { supabaseClient } from "@/lib/supabase";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  const userId = req.nextUrl.searchParams.get("userId")!;
  const body = await req.json();

  const supabase = await supabaseClient(body.token);
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
    console.log(data);
  } else {
    console.log(error);
  }
  return NextResponse.json(data);
}

export async function GET(req: NextRequest, res: NextResponse) {
  const userId = req.nextUrl.searchParams.get("userId")!;
  const token = req.nextUrl.searchParams.get("token")!;

  const supabase = await supabaseClient(token);

  let { data: library, error } = await supabase
    .from("library")
    .select("*")
    .eq("user_id", userId);

  console.log(library);
  console.log(error);
  
  if (library) {
    return NextResponse.json(library);
  } else {
    NextResponse.json(error);
  }
}
