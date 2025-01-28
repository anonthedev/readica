"use client";

import Notes from "@/components/Reader/Notes";
import PDFViewer from "@/components/Reader/PDFViewer";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { IHighlight } from "react-pdf-highlighter";
import PDFViewer2 from "@/components/Reader/PDFViewer2";

export default function Page({ params }: { params: { uuid: string } }) {
  const { getToken, userId } = useAuth();

  const [highlights, setHighlights] = useState<Array<IHighlight>>([]);
  const [pdfURL, setPdfURL] = useState("");
  const [notes, setNotes] = useState("");
  const [gettingData, setGettingData] = useState(true);
  const { toast } = useToast();

  async function getPaperData() {
    const token = await getToken({ template: "supabase" });
    if (token) {
      axios
        .get(`/api/library/get-item-by-uuid?uuid=${params.uuid}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((resp) => {
          if (resp.data.success) {
            if (resp.data.library[0].highlighted_text) {
              setHighlights(() => [...resp.data.library[0].highlighted_text]);
            }
            let updatedURL = resp.data.library[0].pdf_link.replace(
              /^http:/,
              "https:"
            );
            setPdfURL(updatedURL);

            if (resp.data.library[0].notes) {
              setNotes(
                resp.data.library[0].notes
              );
            } else {
              setNotes(
                `<h2>Take some notes, it'll help you understand better.</h2>
  <p><img src="https://pbs.twimg.com/media/GSlqqlQbIAE3wZ8?format=jpg&amp;name=small" width="474" height="408"/></p>
  <p>You can delete Itachi, he won't mind.</p>`
              );
            }
          } else {
            toast({
              title: "Something went wrong, please try again",
              variant: "destructive",
            });
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setGettingData(false);
        });
    }
  }

  useEffect(() => {
    getPaperData();
  }, []);

  return (
  <main className="w-[calc(100vw-100px)] flex flex-row justify-center h-[calc(100vh-80px)]">
      {!gettingData ? (
        <>
          <PDFViewer2
            // serverHighlights={highlights}
            url={pdfURL}
            // uuid={params.uuid}
          />
          <Notes serverNotes={notes} uuid={params.uuid} />
        </>
      ) : (
        <div className="self-center">Fetching data...</div>
      )}
    </main>
  );
}
