import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CommentType, CreateCommentData, UpdateCommentData } from "@/types/PaperTypes";

// API functions
const getComments = async (token: string, library_id: string) => {
  const resp = await axios.get(`/api/comments?library_id=${encodeURIComponent(library_id)}`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return resp.data;
};



const createComment = async (
  data: CreateCommentData,
  token: string
): Promise<CommentType> => {
  const resp = await axios.post("/api/comments", data, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return resp.data;
};

const updateComment = async (
  commentId: string,
  data: UpdateCommentData,
  token: string
): Promise<CommentType> => {
  const resp = await axios.put(`/api/comments?id=${encodeURIComponent(commentId)}`, data, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return resp.data;
};

const deleteComment = async (commentId: string, token: string) => {
  const resp = await axios.delete(`/api/comments?id=${encodeURIComponent(commentId)}`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return resp.data;
};

// React Query Hooks
export const useComments = (library_id: string) => {
  const { data: session, status } = useSession();
  const enabled =
    status === "authenticated" &&
    !!session?.user?.id &&
    !!session?.supabaseAccessToken &&
    !!library_id;

  const {
    data: comments,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["comments", library_id],
    queryFn: () =>
      getComments(
        session!.supabaseAccessToken as string,
        library_id
      ),
    enabled,
  });

  return { comments, isLoading, isError, error };
};

export const useCreateComment = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentData) =>
      createComment(data, session!.supabaseAccessToken as string),
    onMutate: async (newCommentData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["comments", newCommentData.library_id] });

      // Snapshot the previous value
      const previousComments = queryClient.getQueryData(["comments", newCommentData.library_id]);

      // Optimistically update the cache
      queryClient.setQueryData(["comments", newCommentData.library_id], (old: any) => {
        if (!old) return old;

        const optimisticComment = {
          id: `temp-${Date.now()}`, // Temporary ID
          created_at: new Date().toISOString(),
          user_id: session?.user?.id,
          library_id: newCommentData.library_id,
          text: newCommentData.text,
          parent_id: newCommentData.parent_id,
          profile: {
            username: session?.user?.email?.split('@')[0] || 'user', // Fallback username
            display_name: session?.user?.name || null,
            image_url: session?.user?.image || null,
          },
          replies: [],
          totalReplies: 0,
        };

        if (newCommentData.parent_id) {
          // It's a reply - find the parent and add to its replies
          const updateCommentsTree = (comments: any[]): any[] => {
            return comments.map(comment => {
              if (comment.id === newCommentData.parent_id) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), optimisticComment],
                  totalReplies: (comment.totalReplies || 0) + 1,
                };
              }
              if (comment.replies?.length > 0) {
                return {
                  ...comment,
                  replies: updateCommentsTree(comment.replies),
                };
              }
              return comment;
            });
          };
          return updateCommentsTree(old);
        } else {
          // It's a top-level comment
          return [optimisticComment, ...old];
        }
      });

      return { previousComments };
    },
    onSuccess: (newComment) => {
      // Invalidate and refetch to get the real data with proper IDs
      queryClient.invalidateQueries({ 
        queryKey: ["comments", newComment.library_id] 
      });
    },
    onError: (err, newCommentData, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        ["comments", newCommentData.library_id],
        context?.previousComments
      );
    },
    onSettled: (newComment) => {
      // Always refetch after error or success to ensure consistency
      if (newComment) {
        queryClient.invalidateQueries({ 
          queryKey: ["comments", newComment.library_id] 
        });
      }
    },
  });
};

export const useUpdateComment = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: UpdateCommentData }) =>
      updateComment(commentId, data, session!.supabaseAccessToken as string),
    onMutate: async ({ commentId, data }) => {
      // Find the library_id from existing cache data
      const existingQueries = queryClient.getQueriesData({ queryKey: ["comments"] });
      let library_id = "";
      
      for (const [queryKey, queryData] of existingQueries) {
        if (queryData && Array.isArray(queryData)) {
          const findCommentInTree = (comments: any[]): string => {
            for (const comment of comments) {
              if (comment.id === commentId) {
                return comment.library_id;
              }
              if (comment.replies?.length > 0) {
                const found = findCommentInTree(comment.replies);
                if (found) return found;
              }
            }
            return "";
          };
          const found = findCommentInTree(queryData);
          if (found) {
            library_id = found;
            break;
          }
        }
      }

      if (!library_id) return;

      await queryClient.cancelQueries({ queryKey: ["comments", library_id] });
      const previousComments = queryClient.getQueryData(["comments", library_id]);

      queryClient.setQueryData(["comments", library_id], (old: any) => {
        if (!old) return old;

        const updateCommentsTree = (comments: any[]): any[] => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                text: data.text,
                updated_at: new Date().toISOString(),
              };
            }
            if (comment.replies?.length > 0) {
              return {
                ...comment,
                replies: updateCommentsTree(comment.replies),
              };
            }
            return comment;
          });
        };
        return updateCommentsTree(old);
      });

      return { previousComments, library_id };
    },
    onSuccess: (updatedComment) => {
      queryClient.invalidateQueries({ 
        queryKey: ["comments", updatedComment.library_id] 
      });
    },
    onError: (err, { commentId }, context) => {
      if (context?.library_id) {
        queryClient.setQueryData(
          ["comments", context.library_id],
          context.previousComments
        );
      }
    },
  });
};

export const useDeleteComment = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, library_id }: { commentId: string; library_id: string }) =>
      deleteComment(commentId, session!.supabaseAccessToken as string),
    onMutate: async ({ commentId, library_id }) => {
      await queryClient.cancelQueries({ queryKey: ["comments", library_id] });
      const previousComments = queryClient.getQueryData(["comments", library_id]);

      queryClient.setQueryData(["comments", library_id], (old: any) => {
        if (!old) return old;

        const removeCommentFromTree = (comments: any[]): any[] => {
          return comments.reduce((acc, comment) => {
            if (comment.id === commentId) {
              // Don't include this comment (delete it)
              return acc;
            }
            
            if (comment.replies?.length > 0) {
              const updatedReplies = removeCommentFromTree(comment.replies);
              return [...acc, {
                ...comment,
                replies: updatedReplies,
                totalReplies: Math.max(0, (comment.totalReplies || 0) - (comment.replies.length - updatedReplies.length)),
              }];
            }
            
            return [...acc, comment];
          }, []);
        };

        return removeCommentFromTree(old);
      });

      return { previousComments };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["comments", variables.library_id] 
      });
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ["comments", variables.library_id],
        context?.previousComments
      );
    },
  });
};

 