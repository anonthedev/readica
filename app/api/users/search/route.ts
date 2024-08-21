import { createClerkClient } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });
  const query = req.nextUrl.searchParams.get("query");
  if (!query) {
    return NextResponse.json({message: "No query", success: false});
  }
  try {
    const users = await clerkClient.users.getUserList({
      query: query,
    });
    console.log(users.data);
    if (users.data.length > 0) {
      return NextResponse.json({ users: users.data, success: true });
    } else {
      return NextResponse.json({ message: "User not found", success: false });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({
      message: "Error fetching user",
      error: error,
      success: false,
    });
  }
}
