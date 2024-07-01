"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseXml } from "@/utils/xmlParser";
import { SearchedPaperDetails } from "@/utils/types";
import axios from "axios";
import { uploadFile } from "@/utils/supabaseFunctions";
import leftBg from "@/resources/images/left-bg.png";
import rightBg from "@/resources/images/right-bg.png";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@clerk/nextjs";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchedPaperDetails[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [paperTitle, setPaperTitle] = useState("");
  const [token, setToken] = useState();

  const { getToken, userId } = useAuth();
  const [mounted, setMounted] = useState(false);

  // async function fetchToken(){
  //   const tempToken = 
  //   return tempToken
  // }

  useEffect(() => {
    const temp = async ()=>{
      const tempToken = await getToken({template: "supabase"})
      console.log(tempToken)
      setToken(tempToken)
    }

    temp()
  }, []);

  async function getPapers() {
    setLoading(true);
    axios
      .get(`https://export.arxiv.org/api/query?search_query=all:${query}`)
      .then((resp) => {
        console.log(resp.data);
        setResults(parseXml(resp.data));
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }

  async function handleFileUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await fetch(`/api/uploadPDF?token=${token}`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          alert("File uploaded successfully");
        } else {
          alert("File upload failed");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("File upload failed");
      }
    }
  }

  return (
    <main className="w-screen min-h-dvh flex flex-row items-center justify-between">
      <img src={leftBg.src} alt="" className="h-full w-fit" />
      <section className="flex flex-col items-center justify-center gap-10 w-full">
        <div className="flex flex-col gap-4 max-w-prose text-center">
          <h1 className="text-3xl font-bold">
            Organise your research papers with Readica
          </h1>
          <p className="font-medium">
            Readica lets you access research papers, save them to your library
            and even take notes, all at your fingertips!
          </p>
        </div>
        <div
          onSubmit={(e) => {
            e.preventDefault();
            getPapers();
          }}
          className="w-full flex flex-row gap-2 items-center justify-center md:flex-col"
        >
          <Input
            className="w-1/2 md:w-2/3"
            placeholder="Search for research papers"
            onChange={(e) => setQuery(e.target.value)}
          />
          {/* <div className="grid w-full max-w-sm items-center gap-1.5">
            <Input
              id="pdf"
              type="file"
              onChange={(e) => {
                console.log(e);
                uploadFile(e.target.files![0], e.target.value);
              }}
            />
          </div> */}
          <Dialog>
            <DialogTrigger className="bg-gradient-to-b from-[#F8FAFC] to-[#949596] rounded-md px-4 py-2 text-black border-none">
              Open
            </DialogTrigger>
            <DialogContent className="flex flex-col items-center justify-center text-center gap-5">
              <DialogHeader>
                <DialogTitle>Upload the PDF research paper.</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                <form
                  onSubmit={handleFileUpload}
                  className="flex flex-col gap-3 items-center justify-center"
                >
                  <Input
                    id="pdf"
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      console.log(e);
                      setFile(e.target.files![0]);
                    }}
                  />
                  <Input
                    placeholder="Enter the title of the paper"
                    onChange={(e) => setPaperTitle(e.target.value)}
                  />
                  <Button type="submit" className="w-fit">
                    Upload PDF
                  </Button>
                </form>
              </DialogDescription>
            </DialogContent>
          </Dialog>

          {/* <Button
            variant="default"
            // type="submit"
            // disabled={loading}
            className="bg-gradient-to-b from-[#F8FAFC] to-[#949596]"
          >
            Upload PDF
          </Button> */}
        </div>
        <div className="max-w-prose flex flex-col gap-4 px-5">
          {results.length !== 0 &&
            results.map((entry, index) => (
              <div key={index}>
                <h2 className="font-bold">{entry.title}</h2>
                <p className="text-sm">
                  {entry.summary.length > 120
                    ? entry.summary.slice(0, 120) + "..."
                    : entry.summary}
                </p>
                <p>
                  <strong>Authors:</strong> {entry.authors.join(", ")}
                </p>
                <p>
                  <strong>Published:</strong> {entry.published}
                </p>
                <p>
                  <strong>Updated:</strong> {entry.updated}
                </p>
                {/* <p>
              <a
                className="text-blue-500 underline"
                href={entry.id}
                target="_blank"
                rel="noopener noreferrer"
              >
                Link
              </a>
            </p> */}
              </div>
            ))}
        </div>
      </section>
      <img src={rightBg.src} alt="" className="h-full w-fit" />
    </main>
  );
}
