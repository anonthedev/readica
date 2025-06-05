"use client";

import {
  useState,
  MouseEventHandler,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useSession } from "next-auth/react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  RemoveFormatting,
  Pilcrow,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CodeSquare,
  Quote,
  Minus,
  Undo,
  Redo,
  Image as ImageIcon,
  X,
  Save,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import "./reset.scss";
import "./notes.scss";

export default function Notes({
  serverNotes,
  uuid,
}: {
  serverNotes: string;
  uuid: string;
}) {
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const { data: session } = useSession();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: false,
      }),
    ],
    content: serverNotes,
    onUpdate({ editor }) {
      setNotes(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl h-full w-full focus:outline-none flex-grow min-h-full",
        style: "min-height: 100%;",
      },
    },
  });

  const saveNotes = useCallback(async () => {
    if (saving) return;

    setSaving(true);

    try {
      await axios.put(
        `/api/library?uuid=${encodeURIComponent(uuid)}`,
        { notes: notes },
        {
          headers: {
            Authorization: "Bearer " + session?.supabaseAccessToken,
          },
        }
      );
      toast.success("Notes saved successfully");
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Couldn't save notes");
    } finally {
      setSaving(false);
    }
  }, [notes, uuid, session?.supabaseAccessToken, saving]);

  const notesContainerRef = useRef<HTMLDivElement>(null);
  const [isNotesFocused, setIsNotesFocused] = useState(false);

  // Track focus state of the notes section
  useEffect(() => {
    const checkFocus = () => {
      // Check if the editor or any of its children has focus
      if (!notesContainerRef.current) return;

      const editorHasFocus = editor?.isFocused;
      const containerHasFocus = notesContainerRef.current.contains(
        document.activeElement
      );

      setIsNotesFocused(editorHasFocus || containerHasFocus);
    };

    // Set up event listeners for focus tracking
    document.addEventListener("focusin", checkFocus);
    document.addEventListener("focusout", checkFocus);
    document.addEventListener("click", checkFocus);

    return () => {
      document.removeEventListener("focusin", checkFocus);
      document.removeEventListener("focusout", checkFocus);
      document.removeEventListener("click", checkFocus);
    };
  }, [editor]);

  // Add keyboard shortcut for Ctrl+S to save notes only when notes section is focused
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isNotesFocused && (e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault(); // Prevent browser's save dialog
        saveNotes();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [saveNotes, isNotesFocused]);

  return (
    <div
      ref={notesContainerRef}
      className="text-editor unreset h-screen w-full border-2 p-2 flex flex-col gap-2"
    >
      <MenuBar
        editor={editor}
        saveNotesFunc={saveNotes}
        saving={saving}
      />
      <div className="flex-grow flex flex-col overflow-hidden">
        <EditorContent
          editor={editor}
          className="overflow-y-auto flex-grow flex flex-col min-h-full"
          onClick={() => editor?.commands.focus()}
        />
      </div>
    </div>
  );
}

type MenuBarProps = {
  editor: Editor | null;
  saveNotesFunc: MouseEventHandler<HTMLButtonElement>;
  saving: boolean;
};

function MenuBar({ editor, saveNotesFunc, saving}: MenuBarProps) {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-row flex-wrap gap-3 border-b-2 pb-3">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={
          editor.isActive("bold")
            ? "active-menu-item menu-item cursor-pointer"
            : "non-active-menu-item menu-item cursor-pointer"
        }
        title="Bold"
      >
        <Bold size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={
          editor.isActive("italic")
            ? "active-menu-item menu-item cursor-pointer"
            : "non-active-menu-item menu-item cursor-pointer"
        }
        title="Italic"
      >
        <Italic size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={
          editor.isActive("strike")
            ? "active-menu-item menu-item cursor-pointer"
            : "non-active-menu-item menu-item cursor-pointer"
        }
        title="Strikethrough"
      >
        <Strikethrough size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={
          editor.isActive("heading", { level: 1 })
            ? "active-menu-item menu-item cursor-pointer"
            : "non-active-menu-item menu-item cursor-pointer"
        }
        title="Heading 1"
      >
        <Heading1 size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={
          editor.isActive("heading", { level: 2 })
            ? "active-menu-item menu-item cursor-pointer"
            : "non-active-menu-item menu-item cursor-pointer"
        }
        title="Heading 2"
      >
        <Heading2 size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={
          editor.isActive("heading", { level: 3 })
            ? "active-menu-item menu-item cursor-pointer"
            : "non-active-menu-item menu-item cursor-pointer"
        }
        title="Heading 3"
      >
        <Heading3 size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={
          editor.isActive("code")
            ? "active-menu-item menu-item cursor-pointer"
            : "non-active-menu-item menu-item cursor-pointer"
        }
        title="Inline Code"
      >
        <Code size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={
          editor.isActive("codeBlock")
            ? "active-menu-item menu-item cursor-pointer"
            : "non-active-menu-item menu-item cursor-pointer"
        }
        title="Code Block"
      >
        <CodeSquare size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={
          editor.isActive("paragraph")
            ? "active-menu-item menu-item cursor-pointer"
            : "non-active-menu-item menu-item cursor-pointer"
        }
        title="Paragraph"
      >
        <Pilcrow size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={
          editor.isActive("bulletList")
            ? "active-menu-item menu-item cursor-pointer"
            : "non-active-menu-item menu-item cursor-pointer"
        }
        title="Bullet List"
      >
        <List size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={
          editor.isActive("orderedList")
            ? "active-menu-item menu-item cursor-pointer"
            : "non-active-menu-item menu-item cursor-pointer"
        }
        title="Ordered List"
      >
        <ListOrdered size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={
          editor.isActive("blockquote")
            ? "active-menu-item menu-item cursor-pointer"
            : "non-active-menu-item menu-item cursor-pointer"
        }
        title="Blockquote"
      >
        <Quote size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
        className="menu-item cursor-pointer"
      >
        <Minus size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().undo().run()}
        title="Undo"
        className="menu-item cursor-pointer"
      >
        <Undo size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        title="Redo"
        className="menu-item cursor-pointer"
      >
        <Redo size={20} />
      </button>
      <button
        onClick={() => {
          const url = window.prompt("Enter the URL of the image:");
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }}
        title="Insert Image"
        className="menu-item cursor-pointer"
      >
        <ImageIcon size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
        title="Remove Formatting"
        className="menu-item cursor-pointer"
      >
        <RemoveFormatting size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().clearNodes().run()}
        title="Clear Nodes"
        className="menu-item cursor-pointer"
      >
        <X size={20} />
      </button>
      <button
        disabled={saving}
        onClick={saveNotesFunc}
        title="Save"
        className="menu-item cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save size={20} />
      </button>
    </div>
  );
}
