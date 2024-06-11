import { Entry } from "@/utils/types";

export const parseXml = (xmlString: string): Entry[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");

  const entries = xmlDoc.getElementsByTagName("entry");
  const result: Entry[] = [];

  function formatDate(stringDate: string) {
    const date = new Date(stringDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  Array.from(entries).forEach((entry) => {
    const id = entry.getElementsByTagName("id")[0]?.textContent || "No ID";
    const updated = formatDate(
      entry.getElementsByTagName("updated")[0]?.textContent || ""
    );
    const published = formatDate(
      entry.getElementsByTagName("published")[0]?.textContent || ""
    );
    const title =
      entry.getElementsByTagName("title")[0]?.textContent || "No title";
    const summary =
      entry.getElementsByTagName("summary")[0]?.textContent || "No description";
    const authorElements = entry.getElementsByTagName("author");
    const authors = Array.from(authorElements).map(
      (author) =>
        author.getElementsByTagName("name")[0]?.textContent || "No author"
    );
    const pdfLink =
      entry.querySelector('link[title="pdf"]')?.getAttribute("href") ||
      "No PDF link";
    const primaryCategory =
      entry
        .getElementsByTagName("arxiv:primary_category")[0]
        ?.getAttribute("term") || "No primary category";
    const categories = Array.from(entry.getElementsByTagName("category")).map(
      (category) => category.getAttribute("term") || "No category"
    );

    result.push({
      id,
      updated,
      published,
      title,
      summary,
      authors,
      pdfLink,
      primaryCategory,
      categories,
    });
  });

  return result;
};
