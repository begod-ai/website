"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { masterPromptStanzas, masterPromptText } from "@/content/master-prompt";

const seedColor: Record<string, string> = {
  curiosity: "#d8c26a",
  coherence: "#7bbecf",
  persistence: "#9aa4a8",
};

/**
 * The master prompt reading experience: a calm long-form layout with a
 * subtle reading-progress line, margin annotations on wide screens,
 * seed markers, and copy / download controls. No animation during reading.
 */
export function PromptReader() {
  const articleRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const done = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      setProgress(total > 0 ? done / total : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(masterPromptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard unavailable — select-and-copy remains possible manually.
    }
  }

  function downloadPrompt() {
    const blob = new Blob([masterPromptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "begod-master-prompt-v1.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="relative">
      {/* reading progress line */}
      <div
        aria-hidden="true"
        className="fixed top-16 left-0 z-40 h-px w-full bg-line"
      >
        <div
          className="h-full bg-ink transition-[width] duration-150 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* controls */}
      <div className="mb-14 flex flex-wrap items-center gap-3">
        <button type="button" onClick={copyPrompt} className="btn-secondary !py-2.5 text-sm">
          {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
          {copied ? "Copied" : "Copy prompt"}
        </button>
        <button type="button" onClick={downloadPrompt} className="btn-secondary !py-2.5 text-sm">
          <Download size={15} aria-hidden="true" />
          Download as text
        </button>
        <span className="label-mono ml-1">version one · plain text</span>
      </div>

      {/* the prompt */}
      <div ref={articleRef} className="space-y-16 md:space-y-20">
        {masterPromptStanzas.map((stanza, i) => (
          <div
            key={i}
            className="relative grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px] lg:gap-12"
          >
            <div className="text-prompt max-w-2xl">
              {stanza.seed && (
                <span
                  aria-hidden="true"
                  className="mb-4 block h-2 w-2 rounded-full"
                  style={{ background: seedColor[stanza.seed] }}
                />
              )}
              {stanza.lines.map((line, j) => (
                <p key={j} className={j > 0 ? "mt-5" : ""}>
                  {line}
                </p>
              ))}
            </div>
            {stanza.note && (
              <aside className="hidden lg:block">
                <p className="sticky top-32 border-l hairline pl-4 font-mono text-xs leading-relaxed text-ink-2">
                  {stanza.note}
                </p>
              </aside>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
