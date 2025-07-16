export interface SearchedPaperDetails {
  id: string;
  updated: string;
  published: string;
  title: string;
  description: string;
  authors: string[];
  pdf_link: string;
  file_id?: string;
  primaryCategory: string;
  categories: string[];
}

export interface LibraryItemType {
  uuid: string;
  user_id: string;
  upload_date: string;
  email: string;
  title: string;
  description?: string;
  authors: string[];
  status?: string;
  pdf_link?: string;
  file_id?: string;
  tags?: string[];
}

// Profile type for public user information
export interface ProfileType {
  id: string;
  username: string | null;
  display_name: string | null;
  image_url: string | null;
  bio: string | null;
}

// Comment-related types
export interface CommentType {
  id: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
  library_id: string;
  text: string;
  parent_id?: string;
  // Related profile data (public information)
  profile?: {
    username: string | null;
    display_name: string | null;
    image_url: string | null;
  };
  replies?: CommentType[];
  totalReplies?: number;
}

export interface CreateCommentData {
  text: string;
  library_id: string;
  parent_id?: string;
}

export interface UpdateCommentData {
  text: string;
}

export interface CommentWithReplies extends CommentType {
  replies: CommentType[];
}
