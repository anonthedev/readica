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

export interface UploadItem {
  // uuid: string;
  // user_id: string;
  // upload_date: string;
  // email: string;
  title: string;
  description?: string;
  authors: string[];
  status?: string;
  pdf_link?: string;
  file_id?: string;
  tags?: string[];
}

export interface PDFMetadata {
  title: string | null;
  authors: string[] | null;
  subject: string | null;
  keywords: string | null;
  upload_date?: Date | null
}