import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { LibraryItemType } from "@/types/PaperTypes";

// API functions
const getLib = async (token: string, userId: string) => {
  const resp = await axios.get(`/api/library?userId=${encodeURI(userId)}`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return resp.data;
};

interface FileUploadData {
  file: File;
  title: string;
  description?: string;
  authors: string[];
  paper_url: string;
  email: string;
}

interface UrlUploadData {
  title: string;
  description?: string;
  authors: string[];
  pdf_link: string;
  paper_url: string;
  email: string;
}

const extractMetadataFromFile = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append("file", file);
  const extractResp = await axios.post(
    `${process.env.NEXT_PUBLIC_UPLOAD_API_URL}/extract-metadata` ||
      "https://readica-backend-production.up.railway.app/extract-metadata",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return extractResp.data.metadata;
};

const uploadFileToBackend = async (
  file: File
): Promise<{ fileId: string; metadata: any }> => {
  const formData = new FormData();
  formData.append("file", file);
  const uploadResp = await axios.post(
    `${"https://api.readica.pro"}/upload`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return {
    fileId: uploadResp.data.fileId,
    metadata: uploadResp.data.metadata,
  };
};

const addFileToLib = async (data: FileUploadData, token: string) => {
  const { fileId, metadata } = await uploadFileToBackend(data.file);
  console.log(fileId, metadata);
  const paperDetails = {
    title: data.title,
    description: data.description,
    authors: data.authors,
    file_id: fileId,
    paper_url: data.paper_url,
    email: data.email,
    metadata: metadata,
  };

  const resp = await axios.post("/api/library", paperDetails, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  console.log(resp.data);
  return { ...resp.data, metadata };
};

const addUrlToLib = async (data: UrlUploadData, token: string) => {
  const paperDetails = {
    title: data.title,
    description: data.description,
    authors: data.authors,
    pdf_link: data.pdf_link,
    paper_url: data.paper_url,
    email: data.email,
  };

  const resp = await axios.post("/api/library", paperDetails, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  console.log(resp.data);
  return resp.data;
};

const updateInLib = async (data: Partial<LibraryItemType>, token: string) => {
  const resp = await axios.put("/api/library", data, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return resp.data;
};

const deleteFromLib = async (uuid: string, token: string) => {
  const resp = await axios.delete(`/api/library?uuid=${uuid}`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return resp.data;
};

// React Query Hooks
export const useLibrary = () => {
  const { data: session, status } = useSession();
  const enabled =
    status === "authenticated" &&
    !!session?.user?.id &&
    !!session?.supabaseAccessToken;

  const {
    data: library,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["library", session?.user?.id],
    queryFn: () =>
      getLib(
        session!.supabaseAccessToken as string,
        session!.user.id as string
      ),
    enabled,
  });

  return { library, isLoading, isError };
};

export const useAddToLibrary = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const fileUploadMutation = useMutation({
    mutationFn: (data: FileUploadData) =>
      addFileToLib(data, session!.supabaseAccessToken as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
    },
  });

  const urlUploadMutation = useMutation({
    mutationFn: (data: UrlUploadData) =>
      addUrlToLib(data, session!.supabaseAccessToken as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
    },
  });

  const metadataExtraction = useMutation({
    mutationFn: (file: File) => extractMetadataFromFile(file),
  });

  return {
    addFileToLibrary: fileUploadMutation.mutate,
    addUrlToLibrary: urlUploadMutation.mutate,
    extractFileMetadata: metadataExtraction.mutate,
    isFileUploading: fileUploadMutation.isPending,
    isUrlUploading: urlUploadMutation.isPending,
    isUploading: fileUploadMutation.isPending || urlUploadMutation.isPending,
    isExtractingMetadata: metadataExtraction.isPending,
  };
};

export const useUpdateLibraryItem = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<LibraryItemType>) =>
      updateInLib(data, session!.supabaseAccessToken as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
    },
  });
};

export const useDeleteFromLibrary = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) =>
      deleteFromLib(uuid, session!.supabaseAccessToken as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library"] });
    },
  });
};
