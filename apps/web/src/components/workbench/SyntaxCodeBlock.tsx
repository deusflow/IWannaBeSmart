import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface SyntaxCodeBlockProps {
  code: string;
  language: "csharp" | "go";
}

export const SyntaxCodeBlock: React.FC<SyntaxCodeBlockProps> = ({
  code,
  language,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Syntax Tokenizer for C# and Go
  const highlightLine = (line: string): React.ReactNode => {
    // Single line comment
    if (line.trim().startsWith("//")) {
      return <span className="text-[#6272A4] italic">{line}</span>;
    }

    // Tokenize strings, keywords, types, methods, numbers, identifiers
    // Regex matches strings | words | symbols
    const tokenRegex =
      /("(?:[^"\\]|\\.)*")|(\b(?:public|private|interface|class|struct|readonly|void|new|throw|if|return|package|import|type|func|nil|var)\b)|(\b(?:IRemoteCommand|TVReceiver|PowerToggleCommand|ChannelChangeCommand|HardwareFaultException|RemoteCommand|int|string|bool|error|Command)\b)|(\b(?:Execute|TogglePowerState|TuneChannel|New|Sprintf|Println)\b)|(\b\d+\b)|([{}();,=>:.*!+\-])|([a-zA-Z_]\w*)|(\s+)/g;

    const elements: React.ReactNode[] = [];
    let match: RegExpExecArray | null;
    let lastIndex = 0;
    let keyIdx = 0;

    while ((match = tokenRegex.exec(line)) !== null) {
      const [
        full,
        strToken,
        keywordToken,
        typeToken,
        methodToken,
        numberToken,
        operatorToken,
        identToken,
        spaceToken,
      ] = match;

      if (strToken) {
        // Strings in Emerald Green
        elements.push(
          <span key={keyIdx++} className="text-[#4ADE80]">
            {strToken}
          </span>
        );
      } else if (keywordToken) {
        // Keywords in Vibrant Pink / Rose
        elements.push(
          <span key={keyIdx++} className="text-[#FF79C6] font-semibold">
            {keywordToken}
          </span>
        );
      } else if (typeToken) {
        // Types / Interfaces in Bright Sky Blue / Cyan
        elements.push(
          <span key={keyIdx++} className="text-[#79C0FF] font-medium">
            {typeToken}
          </span>
        );
      } else if (methodToken) {
        // Methods in Warm Gold / Yellow
        elements.push(
          <span key={keyIdx++} className="text-[#FACC15]">
            {methodToken}
          </span>
        );
      } else if (numberToken) {
        // Numbers in Soft Purple / Violet
        elements.push(
          <span key={keyIdx++} className="text-[#BD93F9]">
            {numberToken}
          </span>
        );
      } else if (operatorToken) {
        // Operators / Braces in Light Slate
        elements.push(
          <span key={keyIdx++} className="text-[#94A3B8]">
            {operatorToken}
          </span>
        );
      } else if (identToken) {
        // Parameters / Variables / Fields in Peach / Orange
        const isFieldOrParam =
          ["receiver", "channel", "_targetChannel", "TargetChannel", "r", "c", "PowerState", "CurrentChannel", "IsPoweredOn"].includes(identToken);

        elements.push(
          <span
            key={keyIdx++}
            className={isFieldOrParam ? "text-[#FFB86C]" : "text-[#F8F8F2]"}
          >
            {identToken}
          </span>
        );
      } else if (spaceToken) {
        elements.push(<span key={keyIdx++}>{spaceToken}</span>);
      } else {
        elements.push(<span key={keyIdx++}>{full}</span>);
      }

      lastIndex = tokenRegex.lastIndex;
    }

    // Trailing unparsed text if any
    if (lastIndex < line.length) {
      elements.push(<span key={keyIdx++}>{line.slice(lastIndex)}</span>);
    }

    return elements;
  };

  const lines = code.split("\n");

  return (
    <div className="rounded-2xl border border-[#2B303A] bg-[#14171C] text-[#F8F8F2] overflow-hidden shadow-2xl font-mono text-xs select-text">
      {/* Editor Header */}
      <div className="px-4 py-2.5 bg-[#1B1F26] border-b border-[#2B303A] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Mac-style Window Controls */}
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27C93F]/80" />
          </div>
          <span className="text-[11px] text-[#858D94] font-sans font-medium ml-2">
            {language === "csharp" ? "IRemoteCommand.cs" : "television_command.go"}
          </span>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          title="Копіювати код"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#252A34] hover:bg-[#323846] text-[#C4CBD4] text-[11px] font-sans transition-all active:scale-95 cursor-pointer border border-[#3A4250]"
        >
          {copied ? (
            <>
              <Check size={12} className="text-[#4ADE80]" />
              <span className="text-[#4ADE80] font-semibold">Скопійовано</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Копіювати</span>
            </>
          )}
        </button>
      </div>

      {/* Code Editor Body with Clean Line Numbers and Color Highlighting */}
      <div className="p-4 overflow-x-auto leading-relaxed">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                <td className="pr-4 py-0.5 select-none text-right text-[11px] text-[#5A6372] font-mono w-7">
                  {idx + 1}
                </td>
                <td className="py-0.5 font-mono whitespace-pre text-[12px]">
                  {highlightLine(line)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
