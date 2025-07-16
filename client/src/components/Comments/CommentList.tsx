"use client";

import { useState } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useComments } from "@/hooks/use-comments";
import { CommentType } from "@/types/PaperTypes";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

interface CommentListProps {
  library_id: string;
  showTitle?: boolean;
}

export default function CommentList({ library_id, showTitle = true }: CommentListProps) {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const { comments, isLoading, isError, error } = useComments(library_id);

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 text-sm">
          Failed to load comments. Please try again later.
        </p>
      </div>
    );
  }

  const commentCount = comments?.length || 0;

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple" />
            <h3 className="text-lg font-semibold">
              Comments ({commentCount})
            </h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="border-purple/30 text-purple hover:bg-purple/5"
          >
            {showCommentForm ? "Cancel" : "Add Comment"}
          </Button>
        </div>
      )}

      {showCommentForm && (
        <div className="bg-muted/30 rounded-lg p-4">
          <CommentForm
            library_id={library_id}
            onCancel={() => setShowCommentForm(false)}
            onSuccess={() => setShowCommentForm(false)}
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-purple" />
        </div>
      ) : (
        <div className="space-y-6">
          {comments && comments.length > 0 ? (
            comments.map((comment: CommentType) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                library_id={library_id}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No comments yet. Be the first to share your thoughts!
              </p>
              {!showCommentForm && (
                <Button
                  onClick={() => setShowCommentForm(true)}
                  className="bg-purple hover:bg-dark-purple"
                >
                  Add First Comment
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 