// components/mdx/CodeBlock.tsx
"use client";

import { useState, useRef } from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  children: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  children,
  language,
  filename,
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);

  const handleCopy = async () => {
    const code = codeRef.current?.textContent || children;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const lines = children.trim().split("\n");

  return (
    <div className="group relative my-6 overflow-hidden rounded-lg border border-white/10 bg-[#0d1117]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-2">
        <div className="flex items-center gap-3">
          {/* Language badge */}
          {language && (
            <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {language}
            </span>
          )}
          {/* Filename */}
          {filename && (
            <span className="text-sm text-muted-foreground">{filename}</span>
          )}
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground opacity-0 transition-all hover:bg-white/10 hover:text-foreground group-hover:opacity-100"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-500" />
              <span className="text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="overflow-x-auto">
        <pre
          ref={codeRef}
          className="p-4 text-sm leading-relaxed"
          style={{ margin: 0 }}
        >
          <code className={language ? `language-${language}` : ""}>
            {showLineNumbers
              ? lines.map((line, i) => (
                  <div key={i} className="table-row">
                    <span className="table-cell select-none pr-4 text-right text-muted-foreground/50">
                      {i + 1}
                    </span>
                    <span className="table-cell">{line || " "}</span>
                  </div>
                ))
              : children}
          </code>
        </pre>
      </div>
    </div>
  );
}

/**
 * Inline code component
 */
export function InlineCode({ children }: { children: string }) {
  return (
    <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-accent">
      {children}
    </code>
  );
}

export default CodeBlock;
