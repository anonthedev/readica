import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PDFDocument } from "pdf-lib";
import { PDFMetadata } from "@/types/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function turnacateString(string: string | undefined, length: number) {
  if (string === undefined) {
    return "";
  }
  return string.length > length ? string.slice(0, length) + "..." : string;
}

/**
 * Extract metadata from a PDF file.
 * @param file - The PDF file to extract metadata from.
 * @returns A promise that resolves to an object containing metadata (title, author, subject, and keywords).
 */
export async function extractPDFMetadata(file: File): Promise<PDFMetadata> {
  if (!file || file.type !== "application/pdf") {
    throw new Error("Invalid file. Please provide a valid PDF.");
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    const title = pdfDoc.getTitle();
    const author = pdfDoc.getAuthor();
    const subject = pdfDoc.getSubject();
    const keywords = pdfDoc.getKeywords();
    const upload_date = pdfDoc.getModificationDate();

    return {
      title: title || null,
      authors: author ? [author] : null,
      subject: subject || null,
      keywords: keywords || null,
      // upload_date: upload_date || null,
    };
  } catch (error) {
    console.error("Error extracting metadata:", error);
    throw new Error("Failed to extract metadata from the PDF.");
  }
}
