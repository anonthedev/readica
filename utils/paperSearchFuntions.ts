import axios from "axios";
import { parseXml } from "./xmlParser";

export async function arxivSearch(query: string, signal?: AbortSignal) {
  try {
    if (query.includes("arxiv.org")) {
      const id = query.slice(query.indexOf("abs") + 4);
      const resp = await axios.get(
        `https://export.arxiv.org/api/query?id_list=${id}`,
        {
          signal,
        }
      );
      return {
        data: parseXml(resp.data),
        status: resp.status,
      };
    } else {
      const resp = await axios.get(
        `https://export.arxiv.org/api/query?search_query=all:${query}`,
        {
          signal,
        }
      );
      return {
        data: parseXml(resp.data),
        status: resp.status,
      };
    }
  } catch (err: any) {
    console.log(err);
    return {
      data: err,
      status: err.response?.status || 500,
    };
  }
}
