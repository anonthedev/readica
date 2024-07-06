export interface SearchedPaperDetails {
    id: string;
    updated: string;
    published: string;
    title: string;
    summary: string;
    authors: string[];
    pdfLink: string;
    primaryCategory: string;
    categories: string[];
}

export interface LibraryItem{
  uuid: string;
  user_id: string;
  email: string;
  title: string;
  description?: string;
  authors: string[];
  status?: string;
  pdf_link: string;
  tags?: string[];
}