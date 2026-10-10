import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { CopyButton } from "./CopyButton";

interface DiffBlockProps {
  /** Vulnerable code, shown red-tinted. */
  before: string;
  /** Remediated code, shown green-tinted. */
  after: string;
  /** Language hint shown in the block header. */
  language: string;
}

/**
 * Side-by-side before/after code comparison for remediation examples.
 * Stacks vertically on mobile.
 */
export function DiffBlock({ before, after, language }: DiffBlockProps) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="grid md:grid-cols-2">
        <div className="border-b md:border-b-0 md:border-r border-border">
          <div className="flex items-center justify-between gap-2 border-b border-border bg-red-500/5 px-3 py-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400">
              <AlertTriangle className="h-3.5 w-3.5" /> Vulnerable
            </span>
            <span className="text-[10px] font-mono text-muted-foreground uppercase">
              {language}
            </span>
          </div>
          <pre className="overflow-x-auto bg-red-500/5 p-3 font-mono text-xs leading-relaxed text-red-300 whitespace-pre-wrap break-words">
            {before}
          </pre>
        </div>
        <div>
          <div className="flex items-center justify-between gap-2 border-b border-border bg-emerald-500/5 px-3 py-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Fixed
            </span>
            <CopyButton value={after} />
          </div>
          <pre className="overflow-x-auto bg-emerald-500/5 p-3 font-mono text-xs leading-relaxed text-emerald-300 whitespace-pre-wrap break-words">
            {after}
          </pre>
        </div>
      </div>
    </div>
  );
}
