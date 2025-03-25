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