"use client";

import { turnacateString } from "@/lib/utils";
import Link from "next/link";
import { memo, useMemo, useCallback, FormEvent, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import ReactMarkdown from "react-markdown";
import { useChat } from "@ai-sdk/react";
import { EllipsisVertical, Loader2, Plus, X } from "lucide-react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "../ui/textarea";
import MultiInput from "../ui/multi-input";

interface Paper {
  url: string;
  title?: string;
  author?: string;
  summary?: string;
  favicon?: string;
}

interface ToolInvocationResult {
  results: Paper[];
}

interface ToolInvocation {
  state: string;
  result?: ToolInvocationResult;
}

interface MessagePart {
  type: string;
  toolInvocation?: ToolInvocation;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  parts?: MessagePart[];
}

interface MessageItemProps {
  message: Message;
  isLoading: boolean;
}

// Memoize the paper card component
const PaperCard = memo(({ paper }: { paper: Paper }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [title, setTitle] = useState(paper.title || "");
  const [description, setDescription] = useState(paper.summary || "");
  const [authors, setAuthors] = useState<Set<string>>(() => new Set(paper.author?.split(",").filter(Boolean)));
  const [currentAuthor, setCurrentAuthor] = useState("");
  const [pdfLink, setPdfLink] = useState(paper.url || "");
  const [uploadPaperBtnDisabled, setUploadPaperBtnDisabled] = useState(false);
  const { data: session } = useSession();

  const handleAddToLibrary = useCallback(async () => {
    if (!session) {
      toast.error("Please sign in to add papers to your library");
      return;
    }

    setUploadPaperBtnDisabled(true);
    try {
      await axios.post(
        `/api/library?userId=${encodeURI(session?.user.id as string)}`,
        {
          title: title,
          email: session?.user.email,
          authors: Array.from(authors),
          description: description,
          pdf_link: pdfLink,
          url: paper.url,
        },
        {
          headers: {
            Authorization: "Bearer " + session?.supabaseAccessToken,
          },
        }
      );
      toast.success("Paper Added Successfully");
      setShowDialog(false);
    } catch (error: unknown) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          toast.error("Paper already present in your library");
        } else {
          toast.error("Something went wrong");
        }
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setUploadPaperBtnDisabled(false);
    }
  }, [authors, description, paper.url, pdfLink, session, title]);

  const handleOpenChange = useCallback((open: boolean) => {
    setShowDialog(open);
  }, []);

  return (
    <div className="flex-shrink-0 w-[300px] md:w-[250px] sm:w-full bg-[#111111] text-white rounded-lg p-4 border border-gray-800">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          {paper.favicon && (
            <img
              src={paper.favicon}
              alt=""
              className="w-6 h-6 rounded-full flex-shrink-0"
              loading="lazy"
            />
          )}
          <div>
            <h2
              className="font-medium text-sm mb-1 md:text-xs"
              title={paper.title || paper.url}
            >
              {turnacateString(paper.title || paper.url, 65)}
            </h2>
            <p className="text-gray-400 text-xs md:text-[10px]">
              {turnacateString(paper.author || "", 50)}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="h-6 w-6 p-0.5 hover:bg-accent rounded-md transition-colors">
            <EllipsisVertical className="h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add to Library
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Link
        href={paper.url}
        target="_blank"
        className="hover:opacity-80 transition-opacity"
      >
        {paper.summary && (
          <p className="text-gray-300 text-xs md:text-[10px] line-clamp-3">
            {paper.summary}
          </p>
        )}
      </Link>
      <Dialog open={showDialog} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Paper</DialogTitle>
            <div className="my-2 flex flex-col gap-2">
              <div className="flex flex-col gap-3">
                <h2 className="font-semibold text-md">Paper Details:</h2>
                <div className="flex flex-col gap-2 w-full md:flex-row">
                  <div className="w-full md:w-1/2">
                    <label htmlFor="input">Title</label>
                    <Input
                      placeholder="Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <label htmlFor="input" className="text-sm">
                      PDF Link of the Paper
                    </label>
                    <Input
                      placeholder="PDF Link"
                      value={pdfLink}
                      onChange={(e) => setPdfLink(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="Input">Authors</label>
                  <MultiInput
                    setInputs={setAuthors}
                    inputs={authors}
                    currentInput={currentAuthor}
                    setCurrentInput={setCurrentAuthor}
                    placeholder="Press Enter after typing an Author's Name"
                  />
                  <div className="flex flex-row gap-2 flex-wrap my-2 max-h-[100px] overflow-y-auto">
                    {authors &&
                      authors.size > 0 &&
                      Array.from(authors).map((author) => (
                        <span
                          key={author}
                          className="flex flex-row gap-1 items-center justify-center w-fit bg-gray-800 text-xs rounded-md p-2 text-white text-center"
                        >
                          <p>{author}</p>
                          <X
                            size={12}
                            className="cursor-pointer"
                            onClick={() => {
                              setAuthors((prevauthors) => {
                                const newauthors = new Set(prevauthors);
                                newauthors.delete(author);
                                return newauthors;
                              });
                            }}
                          />
                        </span>
                      ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="textarea">Description</label>
                  <Textarea
                    className="max-h-[100px]"
                    placeholder="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={handleAddToLibrary}
              disabled={uploadPaperBtnDisabled || !title || !pdfLink}
            >
              {uploadPaperBtnDisabled ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Add Paper"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

PaperCard.displayName = "PaperCard";

const MessageItem = memo(({ message, isLoading }: MessageItemProps) => {
  const papers = useMemo((): Paper[] => {
    if (!message.parts) return [];

    const extractedPapers: Paper[] = [];
    for (const part of message.parts) {
      if (
        part.type === "tool-invocation" &&
        part.toolInvocation?.state === "result" &&
        part.toolInvocation.result
      ) {
        extractedPapers.push(...part.toolInvocation.result.results);
      }
    }
    return extractedPapers;
  }, [message.parts]);

  return (
    <div
      className={`flex flex-col ${
        message.role === "user" ? "items-end" : "items-start"
      } w-full`}
    >
      <div
        className={`rounded-lg py-2 px-3 sm:px-4 w-fit sm:max-w-[90%] md:max-w-[80%] ${
          message.role === "user" ? "bg-purple text-white" : "bg-transparent"
        }`}
      >
        {message.role === "assistant" &&
          (!message.parts || message.parts.length === 0) &&
          isLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Searching for papers...</span>
            </div>
          )}

        {papers.length > 0 && (
          <div className="flex flex-row overflow-x-auto gap-3 sm:gap-4 pb-4 max-w-[300px] md:max-w-full">
            {papers.map((paper: Paper) => (
              <PaperCard key={paper.url} paper={paper} />
            ))}
          </div>
        )}

        <ReactMarkdown
          components={{
            a: ({ href, children }) => (
              <a
                href={href || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline font-medium hover:text-purple"
              >
                {children}
              </a>
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
});

MessageItem.displayName = "MessageItem";

export default function Discover() {
  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: "/api/recommendation",
  });

  const memoizedMessages = useMemo(() => {
    return messages.map((message) => (
      <MessageItem
        key={message.id}
        message={message as Message}
        isLoading={status === "streaming"}
      />
    ));
  }, [messages, status]);

  const onSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      handleSubmit(event);
    },
    [handleSubmit]
  );

  return (
    <div className="flex flex-col gap-3 sm:gap-4 h-full w-full items-center p-2 sm:p-4 max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto w-full space-y-3 sm:space-y-4 px-2 sm:px-4">
        {memoizedMessages}
      </div>
      <form
        onSubmit={onSubmit}
        className="border-t pt-2 sm:pt-4 flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sticky bottom-0 bg-background"
      >
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask research related question..."
          className="flex-1 text-sm sm:text-base"
          disabled={status === "streaming"}
        />
        <Button
          type="submit"
          className="w-full sm:w-auto"
          disabled={status === "streaming" || status === "submitted"}
        >
          {status === "streaming" || status === "submitted" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Send"
          )}
        </Button>
      </form>
    </div>
  );
}
