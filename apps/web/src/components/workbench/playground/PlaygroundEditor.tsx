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
  phase?: "demo" | "practice";
  ghostCode?: string | null;
  showGhost?: boolean;
}

export const PlaygroundEditor: React.FC<PlaygroundEditorProps> = ({
  code,
  onChange,
  language,
  phase = "demo",
  ghostCode,
  showGhost = false,
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
          {phase === "practice" && (
            <span className="ml-2 px-1.5 py-0.2 rounded bg-emerald-950/60 border border-emerald-600/40 text-[9px] font-mono font-bold text-emerald-400 uppercase">
              Practice Mode
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono text-gray-500 font-medium">
          JetBrains Mono • UTF-8
        </span>
      </div>

      {/* CodeMirror Surface with Ghost Text Overlay */}
      <div className="relative font-mono text-xs selection:bg-purple-900/50">
        {/* Ghost Text Overlay: semi-transparent blueprint watermark displayed for 3s */}
        {showGhost && ghostCode && (
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden select-none animate-in fade-in duration-200">
            {/* Badge */}
            <div className="absolute top-2 right-4 z-30 px-2.5 py-0.5 rounded-full bg-[#1A1D20]/90 border border-amber-400/40 text-[10px] font-mono font-bold text-amber-300 shadow-md flex items-center gap-1.5">
              <span>👻</span>
              <span>Ghost Blueprint (3s)</span>
            </div>

            {/* Faint target code aligned over editor */}
            <div className="w-full h-[190px] pt-[6px] pl-[46px] pr-4 bg-[#18191C]/80 backdrop-blur-[0.5px] border border-dashed border-amber-500/30 font-mono text-xs leading-[1.4] text-amber-200/40 whitespace-pre overflow-hidden">
              {ghostCode}
            </div>
          </div>
        )}

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
            autocompletion: phase !== "practice",
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            foldKeymap: true,
            completionKeymap: phase !== "practice",
            lintKeymap: true,
          }}
        />
      </div>
    </div>
  );
};
