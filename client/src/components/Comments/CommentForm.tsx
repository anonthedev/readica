"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { useCreateComment, useUpdateComment } from "@/hooks/use-comments";
import { toast } from "sonner";

interface CommentFormProps {
  library_id: string;
  parent_id?: string;
  initialText?: string;
  commentId?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
  placeholder?: string;
  mode?: "create" | "edit";
}

export default function CommentForm({
  library_id,
  parent_id,
  initialText = "",
  commentId,
  onCancel,
  onSuccess,
  placeholder = "Write a comment...",
  mode = "create",
}: CommentFormProps) {
  const [text, setText] = useState(initialText);
  const createComment = useCreateComment();
  const updateComment = useUpdateComment();

  const isEditing = mode === "edit";
  const isLoading = createComment.isPending || updateComment.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      if (isEditing && commentId) {
        await updateComment.mutateAsync({
          commentId,
          data: { text: text.trim() },
        });
        toast.success("Comment updated successfully");
      } else {
        await createComment.mutateAsync({
          text: text.trim(),
          library_id,
          parent_id,
        });
        toast.success("Comment posted successfully");
        setText("");
      }
      
      onSuccess?.();
    } catch (error) {
      toast.error(
        isEditing ? "Failed to update comment" : "Failed to post comment"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="min-h-[80px] resize-none border-border/50 focus-visible:ring-purple/30"
        disabled={isLoading}
      />
      <div className="flex gap-2 justify-end">
        {(onCancel || isEditing) && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="bg-purple hover:bg-dark-purple"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isEditing ? "Updating..." : "Posting..."}
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {isEditing ? "Update" : "Post"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
} 