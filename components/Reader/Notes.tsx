import React from "react";
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
} from "lucide-react";
import "./reset.scss";
import "./notes.scss";

export default function Notes() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: false,
      }),
    ],
    content: "<p>Hello World! 🌎️</p>",
  });

  return (
    <div className="text-editor unreset h-full w-1/2 border-2 p-2 flex flex-col gap-2">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

interface MenuBarProps {
  editor: Editor | null;
}

const MenuBar: React.FC<MenuBarProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-row flex-wrap gap-3 border-b-2 pb-3">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={
          editor.isActive("bold")
            ? "active-menu-item menu-item"
            : "non-active-menu-item menu-item"
        }
        title="Bold"
      >
        <Bold size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={
          editor.isActive("italic")
            ? "active-menu-item menu-item"
            : "non-active-menu-item menu-item"
        }
        title="Italic"
      >
        <Italic size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={
          editor.isActive("strike")
            ? "active-menu-item menu-item"
            : "non-active-menu-item menu-item"
        }
        title="Strikethrough"
      >
        <Strikethrough size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={
          editor.isActive("heading", { level: 1 })
            ? "active-menu-item menu-item"
            : "non-active-menu-item menu-item"
        }
        title="Heading 1"
      >
        <Heading1 size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={
          editor.isActive("heading", { level: 2 })
            ? "active-menu-item menu-item"
            : "non-active-menu-item menu-item"
        }
        title="Heading 2"
      >
        <Heading2 size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={
          editor.isActive("heading", { level: 3 })
            ? "active-menu-item menu-item"
            : "non-active-menu-item menu-item"
        }
        title="Heading 3"
      >
        <Heading3 size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={
          editor.isActive("code")
            ? "active-menu-item menu-item"
            : "non-active-menu-item menu-item"
        }
        title="Inline Code"
      >
        <Code size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={
          editor.isActive("codeBlock")
            ? "active-menu-item menu-item"
            : "non-active-menu-item menu-item"
        }
        title="Code Block"
      >
        <CodeSquare size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={
          editor.isActive("paragraph")
            ? "active-menu-item menu-item"
            : "non-active-menu-item menu-item"
        }
        title="Paragraph"
      >
        <Pilcrow size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={
          editor.isActive("bulletList")
            ? "active-menu-item menu-item"
            : "non-active-menu-item menu-item"
        }
        title="Bullet List"
      >
        <List size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={
          editor.isActive("orderedList")
            ? "active-menu-item menu-item"
            : "non-active-menu-item menu-item"
        }
        title="Ordered List"
      >
        <ListOrdered size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={
          editor.isActive("blockquote")
            ? "active-menu-item menu-item"
            : "non-active-menu-item menu-item"
        }
        title="Blockquote"
      >
        <Quote size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
        className="menu-item"
      >
        <Minus size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().undo().run()}
        title="Undo"
        className="menu-item"
      >
        <Undo size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        title="Redo"
        className="menu-item"
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
        className="menu-item"
      >
        <ImageIcon size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
        title="Remove Formatting"
        className="menu-item"
      >
        <RemoveFormatting size={20} />
      </button>
      <button
        onClick={() => editor.chain().focus().clearNodes().run()}
        title="Clear Nodes"
        className="menu-item"
      >
        <X size={20} />
      </button>
    </div>
  );
};
