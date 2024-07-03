import { NextRequest, NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase";
import { defaultMaxListeners } from "events";

export async function POST(req: NextRequest, res: NextResponse) {
  const token = req.nextUrl.searchParams.get("token")!;
  const supabase = await supabaseClient(token);

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file instanceof File ? file.name : "unnamed_file";

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from("papers")
      .upload(`${Date.now()}_${fileName}`, buffer, {
        contentType: file.type,
      });

    if (error) {
      console.error("Supabase storage error:", error);
      return NextResponse.json(
        { error: "Error uploading to Supabase" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "File uploaded successfully", data });
  } catch (error) {
    console.error("Error processing file:", error);
    return NextResponse.json(
      { error: "Error processing file" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest, res: NextResponse){
  
}