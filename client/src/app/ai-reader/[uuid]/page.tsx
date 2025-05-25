"use client"

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import axios from "axios";
import PDFViewer from "@/components/Reader/PDFViewer";
import ChatInterface from "@/components/Reader/ChatInterface";
import React from "react";

export default function Page({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = React.use(params)
  const { data: session } = useSession();
  const token = session?.supabaseAccessToken;

  const [pdfURL, setPdfURL] = useState("");
  const [gettingData, setGettingData] = useState(true);

  async function getPaperData() {
    if (token && session?.user?.id) {
      try {
        const response = await axios.get(
          `/api/library?uuid=${uuid}&userId=${session?.user?.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const paperData = response.data[0];
          
          if (paperData.pdf_link) {
            const updatedURL = paperData.pdf_link.replace(/^http:/, "https:");
            setPdfURL(updatedURL);
          } else if (paperData.file_id) {
            // Fetch authorized URL from backblaze
            try {
              const backblazeResp = await axios.get(`/api/backblaze?file_id=${paperData.file_id}`);
              if (backblazeResp.status === 200 && backblazeResp.data.downloadUrl) {
                setPdfURL(backblazeResp.data.downloadUrl);
              } else {
                toast.error('Could not fetch PDF URL from Backblaze.');
              }
            } catch (e) {
              toast.error('Error fetching PDF URL from Backblaze.');
            }
          } else {
            toast.error('No PDF available for this item.');
          }
        } else {
          toast.error("No paper data found");
        }
      } catch (error) {
        console.error("Error fetching paper data:", error);
        toast.error("Something went wrong");
      } finally {
        setGettingData(false);
      }
    }
  }

  useEffect(() => {
    getPaperData();
  }, [token, session?.user?.id]);

  return (
    <main className="w-full flex flex-row justify-center h-[calc(100vh-80px)]">
      {!gettingData ? (
        <>
          <PDFViewer
            url={`/api/pdf-proxy?url=${encodeURIComponent(pdfURL)}`}
          />
          <ChatInterface pdfUrl={pdfURL} />
        </>
      ) : (
        <div className="self-center">Fetching data...</div>
      )}
    </main>
  );
}
