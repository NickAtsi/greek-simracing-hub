import { useRef, useState } from "react";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { ImagePlus, Youtube, Smile } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const EMOJI_LIST = [
  "😀","😂","🤣","😍","🤩","😎","🤔","😢","😡","🥳",
  "👍","👎","👏","🙌","🔥","❤️","💯","🏎️","🏁","🏆",
  "⚡","💪","🎮","🎯","✅","❌","⚠️","💡","🎉","🚀",
];

const RichTextEditor = ({ value, onChange, placeholder = "Γράψε εδώ...", minHeight = 300 }: RichTextEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);

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

  const youtubeCommand: commands.ICommand = {
    name: "youtube",
    keyCommand: "youtube",
    buttonProps: { "aria-label": "YouTube video", title: "YouTube βίντεο" },
    icon: <Youtube className="h-3 w-3" />,
    execute: () => {
      const url = prompt("Επικόλλησε YouTube URL:");
      if (!url) return;
      // Extract video ID
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
      if (match) {
        const videoId = match[1];
        const embed = `\n[![YouTube](https://img.youtube.com/vi/${videoId}/maxresdefault.jpg)](https://www.youtube.com/watch?v=${videoId})\n`;
        onChange(value + embed);
      } else {
        onChange(value + `\n[🎬 YouTube Video](${url})\n`);
      }
    },
  };

  const emojiCommand: commands.ICommand = {
    name: "emoji",
    keyCommand: "emoji",
    buttonProps: { "aria-label": "Emoji", title: "Emoji" },
    icon: <Smile className="h-3 w-3" />,
    execute: () => {
      setShowEmoji(!showEmoji);
    },
  };

  const insertEmoji = (emoji: string) => {
    onChange(value + emoji);
    setShowEmoji(false);
  };

  return (
    <div data-color-mode="dark" className="rich-text-editor relative">
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

      {/* Emoji Picker */}
      {showEmoji && (
        <div className="absolute top-12 right-4 z-50 rounded-xl border border-border bg-card p-3 shadow-xl">
          <div className="grid grid-cols-10 gap-1">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                onClick={() => insertEmoji(emoji)}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted/50 text-base transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

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
          commands.table,
          commands.divider,
          imageCommand,
          youtubeCommand,
          emojiCommand,
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

/** Read-only markdown renderer — auto-converts YouTube links to embeds */
export const MarkdownContent = ({ content }: { content: string }) => {
  // Transform YouTube thumbnail links to iframe embeds for display
  const processedContent = content?.replace(
    /\[!\[YouTube\]\(https:\/\/img\.youtube\.com\/vi\/([\w-]+)\/maxresdefault\.jpg\)\]\(https:\/\/www\.youtube\.com\/watch\?v=[\w-]+\)/g,
    '<div class="yt-embed"><iframe src="https://www.youtube.com/embed/$1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>'
  );

  return (
    <div data-color-mode="dark" className="markdown-body">
      <MDEditor.Markdown
        source={processedContent}
        style={{ backgroundColor: 'transparent' }}
        rehypeRewrite={(node: any) => {
          // Allow iframes for YouTube embeds
          if (node.tagName === 'iframe' && node.properties?.src?.includes('youtube.com/embed')) {
            return;
          }
        }}
      />
    </div>
  );
};

export default RichTextEditor;
