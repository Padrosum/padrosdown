import { useEffect, useRef, useState } from "react";

interface QuickCaptureProps {
  onClose: () => void;
  onSave: (content: string, openAfter: boolean) => Promise<void>;
}

export function QuickCapture({ onClose, onSave }: QuickCaptureProps) {
  const [content, setContent] = useState("");
  const [openAfter, setOpenAfter] = useState(true);
  const [saving, setSaving] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null);
  useEffect(() => input.current?.focus(), []);
  const submit = async () => {
    if (!content.trim() || saving) return;
    setSaving(true);
    try {
      await onSave(content, openAfter);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="modal quick-capture"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-title"
      >
        <h2 id="quick-title">Hızlı not</h2>
        <textarea
          ref={input}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={(event) => {
            if (event.ctrlKey && event.key === "Enter") {
              event.preventDefault();
              void submit();
            }
          }}
          placeholder="Aklınızdakini yazın…"
        />
        <label>
          <input
            type="checkbox"
            checked={openAfter}
            onChange={(event) => setOpenAfter(event.target.checked)}
          />{" "}
          Kaydettikten sonra dosyayı aç
        </label>
        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            İptal
          </button>
          <button
            className="primary"
            type="button"
            disabled={!content.trim() || saving}
            onClick={() => void submit()}
          >
            {saving ? "Kaydediliyor…" : "Kaydet (Ctrl+Enter)"}
          </button>
        </div>
      </section>
    </div>
  );
}
