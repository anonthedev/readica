"use client";

import { turnacateString } from "@/lib/utils";
import Link from "next/link";
import {
  memo,
  useMemo,
  useCallback,
  FormEvent,
  useState,
  useEffect,
} from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import ReactMarkdown from "react-markdown";
import { useChat } from "@ai-sdk/react";
import { EllipsisVertical, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import MultiInput from "@/components/ui/multi-input";
import { X } from "lucide-react";

interface Paper {
  url: string;
  title?: string;
  author?: string;
  summary?: string;
  favicon?: string;
}

interface ToolInvocation {
  state: string;
  result?: {
    results: Paper[];
  };
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  parts?: {
    type: string;
    toolInvocation?: ToolInvocation;
  }[];
}

interface MessageItemProps {
  message: Message;
  isLoading: boolean;
  status: "streaming" | "ready" | "submitted" | "error";
}

const PaperCard = memo(
  ({
    paper,
    status,
  }: {
    paper: Paper;
    status: "streaming" | "ready" | "submitted" | "error";
  }) => {
    const { data: session } = useSession();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [authors, setAuthors] = useState<Set<string>>(new Set());
    const [currentAuthor, setCurrentAuthor] = useState("");
    const [pdfLink, setPdfLink] = useState("");
    const [uploadPaperBtnDisabled, setUploadPaperBtnDisabled] = useState(false);

    useEffect(() => {
      if (status === "ready" || status === "error") {
        console.log(status);
        setTitle(paper.title || "");
        setDescription(paper.summary || "");
        setPdfLink(paper.url);
        if (paper.author?.includes(";")) {
          setAuthors(new Set(paper.author.split(";")));
        } else {
          setAuthors(new Set(paper.author?.split(",")));
        }
      }
    }, [status]);

    async function addToLibrary() {
      setUploadPaperBtnDisabled(true);
      try {
        await axios.post(
          `/api/library`,
          {
            title: title,
            url: paper.url,
            authors: Array.from(authors),
            description: description,
            pdf_link: pdfLink,
            email: session?.user.email,
          },
          {
            headers: {
              Authorization: "Bearer " + session?.supabaseAccessToken,
            },
          }
        );
        toast.success("Added to library");
      } catch (e) {
        if (axios.isAxiosError(e)) {
          if (e.response?.status === 409) {
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
    }

    return (
      <div className="flex-shrink-0 w-[300px] bg-[#111111] text-white rounded-lg p-4 border border-gray-800">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3 w-full">
            {paper.favicon && (
              <img
                src={paper.favicon}
                alt=""
                className="w-6 h-6 rounded-full flex-shrink-0"
                loading="lazy"
              />
            )}
            <div className="w-full">
              <div className="flex flex-row items-center justify-between w-full">
                <Link
                  href={paper.url}
                  target="_blank"
                  className="hover:opacity-80 transition-opacity"
                >
                  <h2
                    className="font-medium text-sm mb-1"
                    title={paper.title || paper.url}
                  >
                    {turnacateString(paper.title || paper.url, 65)}
                  </h2>
                </Link>
                {(status === "ready" || status === "error") && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-gray-800"
                      >
                        <EllipsisVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                          >
                            Add to Library
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Paper to Library</DialogTitle>
                            <div className="my-2 flex flex-col gap-2">
                              <div className="flex flex-col gap-3">
                                <h2 className="font-semibold text-md">
                                  Paper Details:
                                </h2>
                                <div className="flex flex-row gap-2 w-full">
                                  <div className="w-1/2">
                                    <label htmlFor="input">Title</label>
                                    <Input
                                      placeholder="Title"
                                      value={title}
                                      onChange={(e) => setTitle(e.target.value)}
                                    />
                                  </div>
                                  <div className="w-1/2">
                                    <label htmlFor="input">
                                      PDF Link of the Paper
                                    </label>
                                    <Input
                                      placeholder="PDF Link"
                                      value={pdfLink}
                                      onChange={(e) =>
                                        setPdfLink(e.target.value)
                                      }
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
                                                const newauthors = new Set(
                                                  prevauthors
                                                );
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
                                    placeholder="Description"
                                    value={description}
                                    onChange={(e) =>
                                      setDescription(e.target.value)
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              onClick={addToLibrary}
                              disabled={uploadPaperBtnDisabled}
                            >
                              Add Paper
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <p className="text-gray-400 text-xs">
                {turnacateString(paper.author || "", 50)}
              </p>
            </div>
          </div>
          {paper.summary && (
            <p className="text-gray-300 text-xs line-clamp-3">
              {paper.summary}
            </p>
          )}
        </div>
      </div>
    );
  }
);

PaperCard.displayName = "PaperCard";

const MessageItem = memo(({ message, isLoading, status }: MessageItemProps) => {
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
        className={`rounded-lg py-2 px-4 max-w-[80%] ${
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
              <PaperCard key={paper.url} paper={paper} status={status} />
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
        status={status}
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
      {/* <div className="w-full flex justify-end mb-2">
        <Button
          variant="outline"
          // onClick={handleNewChat}
        >
          New Chat
        </Button>
      </div> */}
      <div className="flex-1 overflow-y-auto w-full space-y-3 sm:space-y-4 px-2 sm:px-4">
        {messages.length === 0 ? (
          <div className="w-full flex items-center justify-center h-full text-muted-foreground text-center py-16">
            Find research papers on any topic or summarise research on any topic
          </div>
        ) : (
          memoizedMessages
        )}
      </div>
      <form
        onSubmit={onSubmit}
        className="border-t pt-2 sm:pt-4 flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sticky bottom-0 bg-background"
      >
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Suggest me research papers on..."
          className="flex-1"
          disabled={status === "streaming"}
        />
        <Button
          type="submit"
          disabled={status === "streaming" || status === "submitted"}
        >
          {status === "streaming" || status === "submitted" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Send"
          )}
        </Button>
      </form>
      <div className="text-sm text-muted-foreground text-center w-full">
        Chats aren't saved
      </div>
    </div>
  );
}
