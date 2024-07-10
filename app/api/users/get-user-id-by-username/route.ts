import { createClerkClient } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");
  if (!username) {
    return NextResponse.json({ message: "Missing username" });
  }
  const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });
  try {
    const users = await clerkClient.users.getUserList({
      username: [username],
    });
    if (users.data.length > 0) {
      return NextResponse.json({ user: users.data[0], success: true });
    } else {
      return NextResponse.json({ message: "User not found", success: false });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({
      message: "Error fetching user",
      success: false,
    });
  }
}
