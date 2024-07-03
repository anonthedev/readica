import { arxivSearch } from "@/utils/paperSearchFuntions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
  const query = req.nextUrl.searchParams.get("q")!;
  const provider = req.nextUrl.searchParams.get("provider")!;

  const result = await arxivSearch(query);
  return NextResponse.json(result);
}
