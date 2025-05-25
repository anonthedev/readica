// app/api/pdf-proxy/route.ts
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const fileUrl = req.nextUrl.searchParams.get("url");

  if (!fileUrl) {
    return new Response("Missing PDF URL", { status: 400 });
  }

  try {
    const response = await fetch(fileUrl, {
      // If your Backblaze link needs authorization headers, add here
      headers: {
        // Authorization: `Bearer ${yourAuthToken}`,
      },
    });

    if (!response.ok) {
      return new Response("Failed to fetch PDF", { status: 500 });
    }

    const arrayBuffer = await response.arrayBuffer();

    return new Response(arrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
