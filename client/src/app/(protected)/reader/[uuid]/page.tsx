"use client";

import Head from "next/head";
import Notes from "@/components/Reader/Notes";
import axios from "axios";
import { useState, use } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import PDFViewer from "@/components/Reader/PDFViewer";
import { Panel, PanelGroup } from "react-resizable-panels";
import ResizeHandle from "@/components/Reader/ResizeHandle";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLibrary } from "@/hooks/use-library";
import { LibraryItemType } from "@/types/PaperTypes";
import { CommentList } from "@/components/Comments";
import { Button } from "@/components/ui/button";
import { MessageCircle, ChevronUp, ChevronDown } from "lucide-react";

export default function Page({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = use(params);
  const { data: session } = useSession();
  const token = session?.supabaseAccessToken;

  const [pdfURL, setPdfURL] = useState("");
  const [notes, setNotes] = useState("");
  const [showComments, setShowComments] = useState(false);
  const queryClient = useQueryClient();
  
  // Use the existing library data from the cache
  const { library, isLoading: isLibraryLoading } = useLibrary();
  
  // Find the specific item with matching UUID
  const paperData = library?.find((item: LibraryItemType) => item.uuid === uuid);
  
  // Fallback query if the item is not in the cache
  const {
    data: fallbackData,
    isLoading: isFallbackLoading,
    error,
  } = useQuery({
    queryKey: ["library-item", uuid],
    queryFn: async () => {
      if (!token || !session?.user?.id) return null;

      const response = await axios.get(
        `/api/library?uuid=${uuid}&userId=${session?.user?.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data[0];
    },
    enabled: !!token && !!session?.user?.id && !paperData,
  });

  // Get the actual paper data (either from cache or fallback)
  const actualPaperData = paperData || fallbackData;
  
  // Handle Backblaze file fetching
  const { data: backblazeData, isLoading: isLoadingBackblaze } = useQuery({
    queryKey: ["backblaze", actualPaperData?.file_id],
    queryFn: async () => {
      if (!actualPaperData?.file_id) return null;

      const backblazeResp = await axios.get(
        `/api/backblaze?file_id=${actualPaperData.file_id}`
      );
      return backblazeResp.data;
    },
    enabled: !!actualPaperData?.file_id && !actualPaperData?.pdf_link,
  });

  // Process data when available
  if (actualPaperData) {
    // Handle PDF URL
    if (actualPaperData.pdf_link && !pdfURL) {
      const updatedURL = actualPaperData.pdf_link.replace(/^http:/, "https:");
      setPdfURL(updatedURL);
    }

    // Handle notes
    if (actualPaperData.notes && !notes) {
      setNotes(actualPaperData.notes);
    } else if (!notes) {
      setNotes(
        `<h2>Take some notes, it'll help you understand better.</h2>
<p><img src="https://pbs.twimg.com/media/GSlqqlQbIAE3wZ8?format=jpg&amp;name=small" width="474" height="408"/></p>
<p>You can delete Itachi, he won't mind.</p>`
      );
    }
  }

  // Set PDF URL from Backblaze when available
  if (backblazeData?.downloadUrl && !pdfURL) {
    setPdfURL(backblazeData.downloadUrl);
  }

  // Handle errors
  if (error) {
    toast.error("Error fetching paper data");
    console.error("Error fetching paper data:", error);
  }

  if (!actualPaperData && !isLibraryLoading && !isFallbackLoading) {
    toast.error("No paper data found");
  }

  return (
    <>
      <Head>
        <title>Reader | Readica</title>
        <meta
          name="description"
          content="Read and annotate academic papers in PDF format with Readica's online reader."
        />
        <meta
          name="keywords"
          content="Readica, reader, PDF, annotate, academic papers, notes"
        />
        <meta name="author" content="anonthedev" />
        <meta property="og:title" content="Reader | Readica" />
        <meta
          property="og:description"
          content="Read and annotate academic papers in PDF format with Readica's online reader."
        />
        <meta property="og:type" content="website" />
      </Head>
      <div className="w-full flex flex-col h-screen">
        <main className="flex-1 flex flex-row justify-center overflow-hidden">
          {!isLibraryLoading && !isFallbackLoading && !isLoadingBackblaze ? (
            <PanelGroup direction="horizontal" className="w-full">
              <Panel defaultSize={50} minSize={50}>
                <PDFViewer
                  url={`/api/pdf-proxy?url=${encodeURIComponent(pdfURL)}`}
                />
              </Panel>
              <ResizeHandle />
              <Panel defaultSize={50} minSize={25}>
                <Notes serverNotes={notes} uuid={uuid} />
              </Panel>
            </PanelGroup>
          ) : (
            <div className="self-center">Fetching data...</div>
          )}
        </main>
        
        {/* Comments Section */}
        <div className="border-t border-border bg-background">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-purple" />
                <h3 className="font-semibold">Comments</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2"
              >
                {showComments ? (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Hide Comments
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show Comments
                  </>
                )}
              </Button>
            </div>
            
            {showComments && (
              <div className="pb-6 max-h-96 overflow-y-auto">
                <CommentList library_id={uuid} showTitle={false} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
