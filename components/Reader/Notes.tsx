"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "../ui/use-toast";
import axios from "axios";
//@ts-ignore
const RichTextEditor = dynamic(() => import("react-rte"), { ssr: false });
import "./reset.scss";

export default function Notes({ uuid }: { uuid: string }) {
  const [value, setValue] = useState("");
  const { getToken, userId } = useAuth();
  const { toast } = useToast();

  //   async function setEmptyValue() {

  //     const module = await import("react-rte");
  //     setValue(module.createEmptyValue());
  //   }

  async function getNotes() {
    //@ts-ignore
    const module = await import("react-rte");
    const defaultValue = `
    <h2>Welcome to Your Notes</h2>
    <p>This is a <strong>rich text editor</strong> where you can:</p>
    <ul>
      <li>Write your thoughts</li>
      <li>Create <em>formatted</em> content</li>
      <li>Organize your ideas</li>
    </ul>
    <p>Feel free to edit this content and start taking notes!</p>
  `;
    setValue(module.createValueFromString(defaultValue, "html"));
    const token = await getToken({ template: "supabase" });
    if (token) {
      axios
        .get(`/api/library/get-item-by-uuid?uuid=${uuid}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((resp) => {
          if (resp.data.success) {
            console.log(resp.data.library[0]);
            if (resp.data.library[0].notes) {
              setValue(
                module.createValueFromString(resp.data.library[0].notes, "html")
              );
            }
          } else {
            toast({ title: "Something went wrong", variant: "destructive" });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  useEffect(() => {
    getNotes();
  }, []);

  function handleChange(newValue: string) {
    setValue(newValue);
    console.log(newValue.toString("html"));
  }

  return (
    <RichTextEditor
      //@ts-ignore
      className="unreset text-black w-1/2 h-full overflow-auto"
      value={value}
      onChange={handleChange}
    />
  );
}
