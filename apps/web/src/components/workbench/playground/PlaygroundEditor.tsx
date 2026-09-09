/**
 * @file apps/web/src/components/workbench/playground/PlaygroundEditor.tsx
 * @description JetBrains-style CodeMirror editor with One Dark theme and C#/Go language support
 */

import React, { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { cpp } from "@codemirror/lang-cpp";
import { go } from "@codemirror/lang-go";

interface PlaygroundEditorProps {
  code: string;
  onChange: (val: string) => void;
  language: "csharp" | "go";
}

export const PlaygroundEditor: React.FC<PlaygroundEditorProps> = ({
  code,
  onChange,
  language,
}) => {
  const extensions = useMemo(() => {
    return language === "go" ? [go()] : [cpp()];
  }, [language]);

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-[#2B2D33] shadow-lg bg-[#1E1E22]">
      {/* Editor Header Bar */}
      <div className="px-3.5 py-1.5 bg-[#18191C] border-b border-[#2B2D33] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
          <span className="ml-2 font-mono text-[11px] text-gray-400 font-bold">
            {language === "csharp" ? "Program.cs" : "main.go"}
          </span>
        </div>
        <span className="text-[10px] font-mono text-gray-500 font-medium">
          JetBrains Mono • UTF-8
        </span>
      </div>

      {/* CodeMirror Surface */}
      <div className="font-mono text-xs selection:bg-purple-900/50">
        <CodeMirror
          value={code}
          height="190px"
          theme={oneDark}
          extensions={extensions}
          onChange={onChange}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            foldGutter: false,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
        />
      </div>
    </div>
  );
};
