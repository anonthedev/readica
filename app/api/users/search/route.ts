import { createClerkClient } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query");
  const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });
  try {
    const users = await clerkClient.users.getUserList();
    const userDetails = users.data.map((user) => {
      return {
        username: user.username,
        name: `${user.firstName} ${user.lastName ? user.lastName : ""}`,
      };
    });
    console.log
    return NextResponse.json({ userDetails, success: true });
  } catch (error) {
    console.error("Error fetching usernames:", error);
    return NextResponse.json({
      error: "Failed to fetch usernames",
      success: false,
    });
  }
}
