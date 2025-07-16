//Scira's codebase helped a lot here - https://github.com/zaidmukaddam/scira 

import { streamText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import Exa from "exa-js";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Session } from "next-auth";

export async function POST(req: NextRequest) {
  const session: Session | null = await getServerSession(authOptions);

  if (!session || !session.user?.id || !session.supabaseAccessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // try {
  //   // Fetch user's current count and last timestamp
  //   const { data: userData, error: fetchError } = await supabase
  //     .from("users")
  //     .select("recommendation_count, last_recommendation_timestamp")
  //     .eq("id", userId)
  //     .single();

  //   if (fetchError || !userData) {
  //     console.error("Error fetching user rate limit data:", fetchError);
  //     return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  //   }

  //   let currentCount = userData.recommendation_count || 0;
  //   const lastTimestamp = userData.last_recommendation_timestamp ? new Date(userData.last_recommendation_timestamp) : null;
  //   const now = new Date();

  //   if (lastTimestamp && lastTimestamp.getUTCDate() !== now.getUTCDate()) {
  //     currentCount = 0;
  //   }

  //   // Check rate limit
  //   if (currentCount >= RATE_LIMIT) {
  //     return NextResponse.json({ error: "Rate limit exceeded. Please try again tomorrow." }, { status: 429 });
  //   }

  //   // Increment count and update timestamp
  //   const { error: updateError } = await supabase
  //     .from("users")
  //     .update({ recommendation_count: currentCount + 1, last_recommendation_timestamp: now.toISOString() })
  //     .eq("id", userId);

  //   if (updateError) {
  //     console.error("Error updating user rate limit data:", updateError);
  //     // Decide if you want to proceed even if the update fails, or return an error
  //     // For now, let's proceed but log the error
  //   }

  // } catch (dbError) {
  //   console.error("Database error during rate limiting check:", dbError);
  //   return NextResponse.json({ error: "Internal server error during rate limit check" }, { status: 500 });
  // }

  const { messages } = await req.json();
  const exa = new Exa(process.env.EXA_API_KEY as string);

  const researchTool = tool({
    description: "Search the web for research papers",
    parameters: z.object({
      query: z.string().min(1).max(100).describe("The search query"),
    }),
    execute: async ({ query }) => {
      const { results } = await exa.searchAndContents(query, {
        numResults: 20,
        category: "research paper",
        summary: {
          query: "Abstract of the paper",
        },
        livecrawl: "auto",
        excludeDomains: ["https://spiedigitallibrary.org"]
      });
      const processedResults = results.reduce<typeof results>((acc, paper) => {
        if (acc.some((p) => p.url === paper.url) || !paper.summary) return acc;
        const cleanSummary = paper.summary.replace(/^Summary:\s*/i, "");
        const cleanTitle = paper.title?.replace(/\s\[.*?\]$/, "");

        acc.push({
          ...paper,
          title: cleanTitle || "",
          summary: cleanSummary,
        });

        return acc;
      }, []);

      const limitedResults = processedResults.slice(0, 10);
      return {
        results: limitedResults,
      };
    },
  });

  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages,
    tools: {
      researchTool,
    },
    maxSteps: 2,
  });

  return result.toDataStreamResponse()
}
