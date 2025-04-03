import axios from 'axios';
import { parseStringPromise } from 'xml2js';

interface ArxivPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  pdfUrl: string;
  publishedDate: string;
}

export class ArxivAPI {
  private baseUrl = 'http://export.arxiv.org/api/query';

  async searchPapers(query: string): Promise<ArxivPaper[]> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          search_query: `all:${query}`,
          start: 0,
          max_results: 20,
          sortBy: 'relevance',
          sortOrder: 'descending',
        },
      });

      const result = await parseStringPromise(response.data);
      const entries = result.feed.entry || [];

      return entries.map((entry: any) => ({
        id: entry.id[0].split('/').pop(),
        title: entry.title[0].trim(),
        authors: entry.author.map((author: any) => author.name[0]),
        abstract: entry.summary[0].trim(),
        pdfUrl: entry.link.find((link: any) => link.$.title === 'pdf').$.href,
        publishedDate: new Date(entry.published[0]).toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching papers from arXiv:', error);
      throw error;
    }
  }
}
