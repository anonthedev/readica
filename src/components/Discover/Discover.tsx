"use client";

import { turnacateString } from "@/lib/utils";
import Link from "next/link";
import { memo, useMemo, useCallback, FormEvent } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import ReactMarkdown from "react-markdown";
import { useChat } from "@ai-sdk/react";
import { Loader2 } from "lucide-react";

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
const PaperCard = memo(({ paper }: {paper: Paper}) => (
  <div className="flex-shrink-0 w-[300px] bg-[#111111] text-white rounded-lg p-4 border border-gray-800">
    <Link href={paper.url} target="_blank" className="hover:opacity-80 transition-opacity">
      <div className="flex flex-col gap-3">
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
            <h2 className="font-medium text-sm mb-1" title={paper.title || paper.url}>
              {turnacateString(paper.title || paper.url, 65)}
            </h2>
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
    </Link>
  </div>
));

PaperCard.displayName = 'PaperCard';

// Memoized message component
const MessageItem = memo(({ message, isLoading }: MessageItemProps) => {
  // Extract papers from tool invocations
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
      }`}
    >
      <div
        className={`rounded-lg py-2 px-4 max-w-[80%] ${
          message.role === "user"
            ? "bg-purple text-white"
            : "bg-transparent"
        }`}
      >
        {message.role === "assistant" && (!message.parts || message.parts.length === 0) && isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Searching for papers...</span>
          </div>
        )}
        
        {papers.length > 0 && (
          <div className="flex flex-row overflow-x-auto gap-4 pb-4 max-w-full">
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

MessageItem.displayName = 'MessageItem';

export default function Discover() {
  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    isLoading 
  } = useChat({
    api: "/api/recommendation",
  });

  // Memoize the messages list
  const memoizedMessages = useMemo(() => {
    return messages.map(message => (
      <MessageItem 
        key={message.id} 
        message={message as Message} 
        isLoading={isLoading} 
      />
    ));
  }, [messages, isLoading]);

  // Optimize form submission
  const onSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    handleSubmit(event);
  }, [handleSubmit]);

  return (
    <div className="flex flex-col gap-4 h-full w-full items-center p-4 max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto w-full space-y-4 px-4">
        {memoizedMessages}
      </div>
      <form
        onSubmit={onSubmit}
        className="border-t pt-4 flex flex-row gap-4 w-full sticky bottom-0 bg-background"
      >
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask research related question..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Send'
          )}
        </Button>
      </form>
    </div>
  );
}