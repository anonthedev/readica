import axios from "axios";
import { LibraryItemType, SearchedPaperDetails } from "./types";

export async function addToLib(
  paperDetails: SearchedPaperDetails | LibraryItemType,
  token: string,
  userId: string
) {
  try {
    const response = await axios.post(
      `/api/library?userId=${userId}`,
      {
        title: paperDetails.title,
        description: paperDetails.description,
        authors: paperDetails.authors,
        pdf_link: paperDetails.pdf_link,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data.message) {
      return { success: true, data: response.data };
    } else {
      if (response.data.code === "23505") {
        return {
          success: false,
          error: "Paper is already in your library",
          code: "23505",
        };
      } else {
        return {
          success: false,
          error: "Couldn't add paper to your library",
          message: response.data.message,
        };
      }
    }
  } catch (error) {
    return {
      success: false,
      error: "Something went wrong",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getLib(token: string | undefined, userId: string) {
  try {
    const resp = await axios.get(`/api/library?userId=${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return { success: true, data: resp.data };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        error: error.response.data.message || "An error occurred",
        statusCode: error.response.status,
      };
    }
    return {
      success: false,
      error: "Something went wrong",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function deleteFromLib(
  token: string,
  userId: string,
  uuid: string
) {
  try {
    const resp = await axios.delete(
      `/api/library?userId=${userId}&uuid=${uuid}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(resp.data);

    if (!resp.data.message) {
      return { success: true, data: resp.data };
    } else {
      return {
        success: false,
        error: "Something went wrong",
        message: resp.data.message,
      };
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        error: error.response.data.message || "An error occurred",
        statusCode: error.response.status,
      };
    }
    return {
      success: false,
      error: "Something went wrong",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function updateLib(
  token: string,
  userId: string,
  uuid: string,
  dataToUpdate: any
) {
  try {
    console.log(dataToUpdate ? dataToUpdate : "x");
    const resp = await axios.put(
      `/api/library?userId=${userId}&uuid=${uuid}`,
      dataToUpdate,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(resp.data);

    if (!resp.data.message) {
      return { success: true, data: resp.data };
    } else {
      return {
        success: false,
        error: "Something went wrong",
        message: resp.data.message,
      };
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        error: error.response.data.message || "An error occurred",
        statusCode: error.response.status,
      };
    }
    return {
      success: false,
      error: "Something went wrong",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}