"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "../ui/use-toast";
//@ts-ignore
const RichTextEditor = dynamic(() => import("react-rte"), { ssr: false });
import "./reset.scss";
import { Button } from "../ui/button";
import { updateLib } from "@/utils/supabaseFunctions";

export default function Notes({
  uuid,
  serverNotes,
}: {
  uuid: string;
  serverNotes: string;
}) {
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const { getToken, userId } = useAuth();
  const { toast } = useToast();

  async function startNotesValue() {
    // @ts-ignore
    const reactRTEModule = await import("react-rte");
    const defaultValue = `<p>Loading...</p>`;
    setNotes(reactRTEModule.createValueFromString(defaultValue, "html"));

    if (serverNotes) {
      setNotes(reactRTEModule.createValueFromString(serverNotes, "html"));
    } else {
      setNotes(
        reactRTEModule.createValueFromString(
          `<h2>Take some notes, it'll help you understand better.</h2>
        <p><img src="https://pbs.twimg.com/media/GSlqqlQbIAE3wZ8?format=jpg&amp;name=small" width="474" height="408"/></p>
        <p>You can delete Itachi, he won't mind.</p>`,
          "html"
        )
      );
    }
  }

  useEffect(() => {
    startNotesValue();
  }, []);

  function handleChange(newValue: string) {
    setNotes(newValue);
  }

  const customControls = [
    () => (
      <Button
        className="border-[1px] border-[gray] px-4 rounded-sm"
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          const token = await getToken({ template: "supabase" });
          const resp = await updateLib(token!, userId!, uuid, {
            //@ts-ignore
            notes: notes.toString("html"),
          });
          if (resp.success) {
            toast({ title: "Notes saved successfully", variant: "success" });
            setSaving(false);
          } else {
            toast({ title: "Couldn't save notes", variant: "destructive" });
            setSaving(false);
          }
        }}
      >
        {saving ? "Saving..." : "Save"}
      </Button>
    ),
  ];

  return (
    <RichTextEditor
      {...{ customControls }}
      //@ts-ignore
      className="unreset text-black w-1/2 h-full overflow-auto"
      value={notes}
      onChange={handleChange}
    />
  );
}
