import { useRef } from "react";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const RichTextEditor = ({ value, onChange, placeholder = "Γράψε εδώ...", minHeight = 300 }: RichTextEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const ext = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("article-images")
      .upload(fileName, file, { contentType: file.type });

    if (error) {
      console.error("Upload error:", error);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("article-images")
      .getPublicUrl(fileName);

    const imageMarkdown = `![${file.name}](${publicUrl})`;
    onChange(value + "\n" + imageMarkdown + "\n");
  };

  const imageCommand: commands.ICommand = {
    name: "image-upload",
    keyCommand: "image-upload",
    buttonProps: { "aria-label": "Upload image", title: "Ανέβασε εικόνα" },
    icon: <ImagePlus className="h-3 w-3" />,
    execute: () => {
      fileInputRef.current?.click();
    },
  };

  return (
    <div data-color-mode="dark" className="rich-text-editor">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file);
          e.target.value = "";
        }}
      />
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || "")}
        preview="live"
        height={minHeight}
        textareaProps={{ placeholder }}
        visibleDragbar={false}
        commands={[
          commands.bold, commands.italic, commands.strikethrough, commands.hr,
          commands.title, commands.divider,
          commands.link, commands.quote, commands.code, commands.codeBlock,
          commands.divider,
          commands.unorderedListCommand, commands.orderedListCommand, commands.checkedListCommand,
          commands.divider,
          imageCommand,
        ]}
        onDrop={async (e) => {
          const files = e.dataTransfer?.files;
          if (files?.length) {
            e.preventDefault();
            for (const file of Array.from(files)) {
              if (file.type.startsWith("image/")) {
                await handleImageUpload(file);
              }
            }
          }
        }}
        onPaste={async (e) => {
          const items = e.clipboardData?.items;
          if (items) {
            for (const item of Array.from(items)) {
              if (item.type.startsWith("image/")) {
                e.preventDefault();
                const file = item.getAsFile();
                if (file) await handleImageUpload(file);
              }
            }
          }
        }}
      />
    </div>
  );
};

export default RichTextEditor;
