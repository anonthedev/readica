"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Calendar, FileText } from "lucide-react";
import { CommentList } from "@/components/Comments";
import { LibraryItemType } from "@/types/PaperTypes";
import Link from "next/link";

// Fetch public papers (this would need to be implemented in the API)
const fetchPublicPapers = async (token: string) => {
  const response = await axios.get("/api/library", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export default function CommunityPage() {
  const { data: session } = useSession();
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>(
    {}
  );

  const {
    data: papers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["community-papers"],
    queryFn: () => fetchPublicPapers(session!.supabaseAccessToken as string),
    enabled: !!session?.supabaseAccessToken,
  });

  const toggleComments = (paperId: string) => {
    setShowComments((prev) => ({
      ...prev,
      [paperId]: !prev[paperId],
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading community papers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load community papers</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Community</h1>
        <p className="text-muted-foreground">
          Discover and discuss research papers with the community
        </p>
      </div>

      <div className="space-y-6">
        {papers && papers.length > 0 ? (
          papers.map((paper: LibraryItemType) => (
            <Card
              key={paper.uuid}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2 line-clamp-2">
                      <Link
                        href={`/reader/${paper.uuid}`}
                        className="hover:text-purple transition-colors"
                        target="_blank"
                      >
                        {paper.title}
                      </Link>
                    </CardTitle>
                    {paper.description && (
                      <CardDescription className="line-clamp-3">
                        {paper.description}
                      </CardDescription>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleComments(paper.uuid)}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {showComments[paper.uuid] ? "Hide" : "Show"} Comments
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>
                      {paper.authors?.length > 2
                        ? `${paper.authors.slice(0, 2).join(", ")} + ${
                            paper.authors.length - 2
                          } more`
                        : paper.authors?.join(", ") || "Unknown authors"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(paper.upload_date)}</span>
                  </div>
                </div>

                {paper.tags && paper.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {paper.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {paper.status && (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="capitalize border-purple text-purple"
                    >
                      {paper.status}
                    </Badge>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <Link
                    href={`/reader/${paper.uuid}`}
                    target="_blank"
                    className="flex items-center gap-2 text-purple hover:text-dark-purple transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Open Paper
                  </Link>
                </div>

                {showComments[paper.uuid] && (
                  <div className="mt-6 pt-4 border-t border-border">
                    <CommentList library_id={paper.uuid} showTitle={false} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No papers found</h3>
            <p className="text-muted-foreground">
              No papers are available in the community yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
