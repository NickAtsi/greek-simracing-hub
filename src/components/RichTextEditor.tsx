import { useState, useCallback } from "react";
import MDEditor from "@uiw/react-md-editor";

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const RichTextEditor = ({ value, onChange, placeholder = "Γράψε εδώ...", minHeight = 300 }: RichTextEditorProps) => {
  return (
    <div data-color-mode="dark" className="rich-text-editor">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || "")}
        preview="live"
        height={minHeight}
        textareaProps={{ placeholder }}
        visibleDragbar={false}
      />
    </div>
  );
};

export default RichTextEditor;
