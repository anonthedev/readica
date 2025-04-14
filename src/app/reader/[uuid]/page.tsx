"use client";

import Notes from "@/components/Reader/Notes";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import PDFViewer from "@/components/Reader/PDFViewer";
import React from "react";


export default function Page({ params }: { params: Promise<{ uuid: string }> }) {
  const {uuid} = React.use(params)
  const { data: session } = useSession();
  const token = session?.supabaseAccessToken;

  // const [highlights, setHighlights] = useState<Array<IHighlight>>([]);
  const [pdfURL, setPdfURL] = useState("");
  const [notes, setNotes] = useState("");
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
        
        // API returns the library array directly
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const paperData = response.data[0];
          
          // Handle highlights if they exist
          if (paperData.highlighted_text) {
            // setHighlights(() => [...paperData.highlighted_text]);
          }
          
          // Update PDF URL to use HTTPS
          if (paperData.pdf_link) {
            let updatedURL = paperData.pdf_link.replace(/^http:/, "https:");
            setPdfURL(updatedURL);
          }

          // Set notes from response or default
          if (paperData.notes) {
            setNotes(paperData.notes);
          } else {
            setNotes(
              `<h2>Take some notes, it'll help you understand better.</h2>
  <p><img src="https://pbs.twimg.com/media/GSlqqlQbIAE3wZ8?format=jpg&amp;name=small" width="474" height="408"/></p>
  <p>You can delete Itachi, he won't mind.</p>`
            );
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
            url={pdfURL}
          />
          <Notes serverNotes={notes} uuid={uuid} />
        </>
      ) : (
        <div className="self-center">Fetching data...</div>
      )}
    </main>
  );
}