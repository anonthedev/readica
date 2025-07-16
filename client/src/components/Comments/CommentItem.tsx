"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  Reply,
  User,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { CommentType } from "@/types/PaperTypes";
import { useDeleteComment } from "@/hooks/use-comments";
import { toast } from "sonner";
import CommentForm from "./CommentForm";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";

interface CommentItemProps {
  comment: CommentType;
  library_id: string;
  level?: number;
}

export default function CommentItem({
  comment,
  library_id,
  level = 0,
}: CommentItemProps) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [loadedReplies, setLoadedReplies] = useState<CommentType[]>(
    comment.replies || []
  );
  const [showingMore, setShowingMore] = useState(false);
  const deleteComment = useDeleteComment();
  const queryClient = useQueryClient();

  // Keep loadedReplies in sync with comment.replies from cache
  useEffect(() => {
    setLoadedReplies(comment.replies || []);
  }, [comment.replies]);

  const isOwner = session?.user?.id === comment.user_id;
  const hasMoreReplies = (comment.totalReplies || 0) > 3;
  const remainingReplies = (comment.totalReplies || 0) - loadedReplies.length;

  const [isLoadingMoreReplies, setIsLoadingMoreReplies] = useState(false);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await deleteComment.mutateAsync({
          commentId: comment.id,
          library_id,
        });
        toast.success("Comment deleted successfully");
      } catch (error) {
        toast.error("Failed to delete comment");
      }
    }
  };

  const handleShowMore = async () => {
    if (showingMore) return;

    setIsLoadingMoreReplies(true);
    try {
      if (!session?.supabaseAccessToken) return;

      const response = await axios.get(
        `/api/comments?library_id=${encodeURIComponent(
          library_id
        )}&parent_id=${encodeURIComponent(comment.id)}&offset=3`,
        {
          headers: {
            Authorization: `Bearer ${session.supabaseAccessToken}`,
          },
        }
      );

      const additionalReplies = response.data;
      const newLoadedReplies = [...loadedReplies, ...additionalReplies];

      setLoadedReplies(newLoadedReplies);
      setShowingMore(true);

      // Update the cache to reflect the newly loaded replies
      queryClient.setQueryData(["comments", library_id], (old: any) => {
        if (!old) return old;

        const updateCommentsTree = (comments: any[]): any[] => {
          return comments.map((c) => {
            if (c.id === comment.id) {
              return {
                ...c,
                replies: newLoadedReplies,
              };
            }
            if (c.replies?.length > 0) {
              return {
                ...c,
                replies: updateCommentsTree(c.replies),
              };
            }
            return c;
          });
        };

        return updateCommentsTree(old);
      });
    } catch (error) {
      toast.error("Failed to load more replies");
    } finally {
      setIsLoadingMoreReplies(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  };

  const getAuthorInitials = (
    displayName?: string | null,
    username?: string | null
  ) => {
    if (displayName) {
      return displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    if (username) {
      return username.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const getAuthorDisplayName = (profile: CommentType["profile"]) => {
    if (profile?.display_name) return profile.display_name;
    if (profile?.username) return profile.username;
    return "Anonymous User";
  };

  return (
    <div
      className={`space-y-3 ${
        level > 0 ? "ml-8 pl-4 border-l-2 border-purple/30" : ""
      }`}
    >
      <div className="flex gap-3">
        <div className="h-8 w-8 rounded-full bg-purple/10 flex items-center justify-center">
          {comment.profile?.image_url ? (
            <img
              src={comment.profile.image_url}
              alt={getAuthorDisplayName(comment.profile)}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <span className="text-purple text-xs font-medium">
              {getAuthorInitials(
                comment.profile?.display_name,
                comment.profile?.username
              )}
            </span>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              {getAuthorDisplayName(comment.profile)}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(comment.created_at)}
            </span>
            {comment.updated_at &&
              comment.updated_at !== comment.created_at && (
                <span className="text-xs text-muted-foreground">(edited)</span>
              )}
          </div>

          {isEditing ? (
            <CommentForm
              library_id={library_id}
              initialText={comment.text}
              commentId={comment.id}
              mode="edit"
              onCancel={() => setIsEditing(false)}
              onSuccess={() => setIsEditing(false)}
              placeholder="Edit your comment..."
            />
          ) : (
            <div className="text-sm text-foreground whitespace-pre-wrap">
              {comment.text}
            </div>
          )}

          <div className="flex items-center gap-2">
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(!isReplying)}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <Reply className="w-3 h-3 mr-1" />
                Reply
              </Button>
            )}

            {isOwner && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-3 h-3 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-3 h-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {isReplying && (
        <div className="ml-11">
          <CommentForm
            library_id={library_id}
            parent_id={comment.id}
            onCancel={() => setIsReplying(false)}
            onSuccess={() => setIsReplying(false)}
            placeholder="Write a reply..."
          />
        </div>
      )}

      {loadedReplies && loadedReplies.length > 0 && (
        <div className="space-y-3">
          {loadedReplies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              library_id={library_id}
              level={level + 1}
            />
          ))}

          {hasMoreReplies && !showingMore && (
            <div className="ml-11">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShowMore}
                disabled={isLoadingMoreReplies}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                {isLoadingMoreReplies ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3 mr-1" />
                    Show {remainingReplies} more{" "}
                    {remainingReplies === 1 ? "reply" : "replies"}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
