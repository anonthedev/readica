import axios from "axios";
import { parseXml } from "./xmlParser";

export async function arxivSearch(query: string) {
  try {
    const resp = await axios.get(
      `https://export.arxiv.org/api/query?search_query=all:${query}`
    );
    return {
      data: parseXml(resp.data),
      status: resp.status,
    };
  } catch (err: any) {
    console.log(err);
    return {
      data: err,
      status: err.response?.status || 500,
    };
  }
}
