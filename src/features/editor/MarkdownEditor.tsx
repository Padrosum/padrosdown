import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";
import { searchKeymap } from "@codemirror/search";
import { oneDark } from "@codemirror/theme-one-dark";
import type { EditorSelection } from "../../types/editor";

interface MarkdownEditorProps {
  value: string;
  theme: "light" | "dark";
  onChange: (value: string) => void;
  onSelectionChange: (selection: EditorSelection) => void;
  fontSize: number;
  fontFamily: string;
  lineWrapping: boolean;
  initialLine?: number;
}

export function MarkdownEditor({
  value,
  theme,
  onChange,
  onSelectionChange,
  fontSize,
  fontFamily,
  lineWrapping,
  initialLine,
}: MarkdownEditorProps) {
  const host = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);
  const changeRef = useRef(onChange);
  const selectionRef = useRef(onSelectionChange);
  changeRef.current = onChange;
  selectionRef.current = onSelectionChange;

  useEffect(() => {
    if (!host.current) return;
    const view = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: valueRef.current,
        extensions: [
          lineNumbers(),
          history(),
          markdown(),
          ...(lineWrapping ? [EditorView.lineWrapping] : []),
          keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap, ...searchKeymap]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) changeRef.current(update.state.doc.toString());
            if (update.selectionSet || update.docChanged) {
              const range = update.state.selection.main;
              selectionRef.current({
                from: range.from,
                to: range.to,
                text: update.state.sliceDoc(range.from, range.to),
              });
            }
          }),
          ...(theme === "dark" ? [oneDark] : []),
        ],
      }),
    });
    if (initialLine) {
      const line = view.state.doc.line(Math.min(Math.max(initialLine, 1), view.state.doc.lines));
      view.dispatch({ selection: { anchor: line.from }, scrollIntoView: true });
      view.focus();
    }
    return () => view.destroy();
  }, [initialLine, lineWrapping, theme]);

  return <div className="markdown-editor" ref={host} style={{ fontFamily, fontSize }} />;
}
