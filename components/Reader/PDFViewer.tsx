"use client";

import axios from "axios";
import React, { useState, useEffect, useCallback } from "react";

import {
  AreaHighlight,
  Highlight,
  PdfHighlighter,
  PdfLoader,
  Popup,
  Tip,
} from "react-pdf-highlighter";

import type {
  Content,
  IHighlight,
  NewHighlight,
  ScaledPosition,
} from "react-pdf-highlighter";

import { useAuth } from "@clerk/nextjs";
import { useToast } from "../ui/use-toast";
import { updateLib } from "@/utils/supabaseFunctions";
import { Button } from "../ui/button";

const getNextId = () => String(Math.random()).slice(2);

const parseIdFromHash = () =>
  document.location.hash.slice("#highlight-".length);

const resetHash = () => {
  document.location.hash = "";
};

const HighlightPopup = ({
  comment,
}: {
  comment: { text: string; emoji: string };
}) =>
  comment.text ? (
    <div className="Highlight__popup">
      {comment.emoji} {comment.text}
    </div>
  ) : null;

export default function PDFViewer({ uuid }: { uuid: string }) {
  const [highlights, setHighlights] = useState<Array<IHighlight>>([]);
  const [scrollViewerTo, setScrollViewerTo] = useState(() => () => {});
  const [url, setURL] = useState("");

  const { getToken, userId } = useAuth();
  const { toast } = useToast();

  const resetHighlights = () => {
    setHighlights([]);
  };

  async function getPDF() {
    const token = await getToken({ template: "supabase" });
    if (token) {
      axios
        .get(`/api/library/get-item-by-uuid?uuid=${uuid}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((resp) => {
          if (resp.data.success) {
            if (resp.data.library[0].highlighted_text) {
              setHighlights(() => [...resp.data.library[0].highlighted_text]);
            }
            setURL(resp.data.library[0].pdf_link);
          } else {
            toast({ title: "Something went wrong", variant: "destructive" });
          }
        }).catch((err)=>{
          console.log(err)
        })
    }
  }

  useEffect(() => {
    getPDF();
  }, []);

  const scrollToHighlightFromHash = useCallback(() => {
    const highlight = getHighlightById(parseIdFromHash());
    if (highlight) {
      scrollViewerTo();
    }
  }, [scrollViewerTo]);

  useEffect(() => {
    window.addEventListener("hashchange", scrollToHighlightFromHash, false);
    return () => {
      window.removeEventListener(
        "hashchange",
        scrollToHighlightFromHash,
        false
      );
    };
  }, [scrollToHighlightFromHash]);

  const getHighlightById = (id: string) => {
    return highlights.find((highlight) => highlight.id === id);
  };

  async function addHighlight(highlight: NewHighlight) {
    const token = await getToken({ template: "supabase" });
    const resp = await updateLib(token!, userId!, uuid, {
      highlighted_text: [...highlights, highlight],
    });

    console.log(resp)
    setHighlights((prevHighlights) => [
      { ...highlight, id: getNextId() },
      ...prevHighlights,
    ]);
  }

  const updateHighlight = (
    highlightId: string,
    position: Partial<ScaledPosition>,
    content: Partial<Content>
  ) => {
    console.log("Updating highlight", highlightId, position, content);
    setHighlights((prevHighlights) =>
      prevHighlights.map((h) => {
        const {
          id,
          position: originalPosition,
          content: originalContent,
          ...rest
        } = h;
        return id === highlightId
          ? {
              id,
              position: { ...originalPosition, ...position },
              content: { ...originalContent, ...content },
              ...rest,
            }
          : h;
      })
    );
  };
  if (!url) {
    <div>Loading...</div>;
  }
  return (
    <div className="flex flex-col h-screen w-1/2">
      <div className="h-screen w-full relative text-black">
        <PdfLoader url={url} beforeLoad={<div>Loading...</div>}>
          {(pdfDocument) => (
            <PdfHighlighter
              pdfDocument={pdfDocument}
              enableAreaSelection={(event) => event.altKey}
              onScrollChange={resetHash}
              scrollRef={(scrollTo) => {
                setScrollViewerTo(() => scrollTo);
                scrollToHighlightFromHash();
              }}
              onSelectionFinished={(
                position,
                content,
                hideTipAndSelection,
                transformSelection
              ) => (
                <Tip
                  onOpen={transformSelection}
                  onConfirm={(comment) => {
                    addHighlight({ content, position, comment });
                    hideTipAndSelection();
                  }}
                />
              )}
              highlightTransform={(
                highlight,
                index,
                setTip,
                hideTip,
                viewportToScaled,
                screenshot,
                isScrolledTo
              ) => {
                const isTextHighlight = !highlight.content?.image;

                const component = isTextHighlight ? (
                  <Highlight
                    isScrolledTo={isScrolledTo}
                    position={highlight.position}
                    comment={highlight.comment}
                  />
                ) : (
                  <AreaHighlight
                    isScrolledTo={isScrolledTo}
                    highlight={highlight}
                    onChange={(boundingRect) => {
                      updateHighlight(
                        highlight.id,
                        { boundingRect: viewportToScaled(boundingRect) },
                        { image: screenshot(boundingRect) }
                      );
                    }}
                  />
                );

                return (
                  <Popup
                    popupContent={<HighlightPopup {...highlight} />}
                    onMouseOver={(popupContent) =>
                      setTip(highlight, (highlight) => popupContent)
                    }
                    onMouseOut={hideTip}
                    key={index}
                  >
                    {component}
                  </Popup>
                );
              }}
              highlights={highlights}
            />
          )}
        </PdfLoader>
      </div>
    </div>
  );
}
