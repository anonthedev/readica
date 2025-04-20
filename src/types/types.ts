export interface User {
  id: string;
  name?: string;
  email: string;
  username?: string;
  image: string | null;
}
export interface PDFMetadata {
  title: string | null;
  authors: string[] | null;
  subject: string | null;
  keywords: string | null;
  upload_date?: Date | null
}