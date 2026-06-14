import type { ChatSection } from "./chatProcessor";
import { totalTokens } from "./chatProcessor";

const DIVIDER = "=".repeat(36);

/** Today's date as YYYY-MM-DD, for the export header and filename. */
export function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Build the full structured `.txt` export string from processed sections. */
export function buildTxtExport(sections: ChatSection[]): string {
  const lines: string[] = [];

  lines.push("# Chat Mapper Export");
  lines.push("");
  lines.push(`Generated: ${todayStamp()}`);
  lines.push("");
  lines.push(`Total Sections: ${sections.length}`);
  lines.push(`Estimated Tokens: ${totalTokens(sections)}`);
  lines.push("");

  sections.forEach((section, index) => {
    lines.push(DIVIDER);
    lines.push(`Section ${index + 1}: ${section.category}`);
    lines.push(`Title: ${section.title}`);
    lines.push(`Estimated Tokens: ${section.estimatedTokens}`);
    lines.push(`Keywords: ${section.keywords.join(", ") || "—"}`);
    lines.push(DIVIDER);
    lines.push("");
    lines.push("Summary:");
    lines.push(section.summary);
    lines.push("");
    lines.push("Original Conversation:");
    lines.push(section.originalText);
    lines.push("");
  });

  return lines.join("\n").trimEnd() + "\n";
}

/** Suggested filename including the current date. */
export function exportFilename(): string {
  return `chat-map-${todayStamp()}.txt`;
}

/** Trigger a browser download of `content` as a text file. */
export function downloadTxt(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
