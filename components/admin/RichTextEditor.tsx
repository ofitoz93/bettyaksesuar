"use client";

import { useRef } from "react";

// Bağımlılık eklememek için basit contentEditable + document.execCommand tabanlı
// bir editör; kalınlaştırma/italik/liste gibi temel biçimlendirmeyi destekler.
// HTML içerik, formun gönderdiği gizli bir input üzerinden taşınır.
export default function RichTextEditor({
  name,
  defaultValue,
  placeholder,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const syncValue = () => {
    if (inputRef.current && editorRef.current) {
      inputRef.current.value = editorRef.current.innerHTML;
    }
  };

  const exec = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncValue();
  };

  return (
    <div className="border border-line bg-white">
      <div className="flex gap-1 border-b border-line p-1.5">
        <ToolbarButton label="Kalın" onClick={() => exec("bold")}>
          <strong>K</strong>
        </ToolbarButton>
        <ToolbarButton label="İtalik" onClick={() => exec("italic")}>
          <em>İ</em>
        </ToolbarButton>
        <ToolbarButton label="Altı Çizili" onClick={() => exec("underline")}>
          <span className="underline">A</span>
        </ToolbarButton>
        <ToolbarButton label="Madde İşaretli Liste" onClick={() => exec("insertUnorderedList")}>
          •—
        </ToolbarButton>
        <ToolbarButton label="Numaralı Liste" onClick={() => exec("insertOrderedList")}>
          1.
        </ToolbarButton>
        <ToolbarButton label="Biçimlendirmeyi Temizle" onClick={() => exec("removeFormat")}>
          ⌫
        </ToolbarButton>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={syncValue}
        onBlur={syncValue}
        data-placeholder={placeholder}
        className="min-h-32 px-4 py-3 text-sm outline-none empty:before:text-ink-faint empty:before:content-[attr(data-placeholder)]"
        dangerouslySetInnerHTML={{ __html: defaultValue ?? "" }}
      />
      <input ref={inputRef} type="hidden" name={name} defaultValue={defaultValue ?? ""} />
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex h-7 w-8 items-center justify-center text-xs text-ink-soft hover:bg-ivory-deep hover:text-ink"
    >
      {children}
    </button>
  );
}
