import type { ScriptViewSettings } from "../settings";
import type { ParsedDialogue } from "../types";

/** The only settings the parser needs. */
export type ParserOptions = Pick<ScriptViewSettings, "hideColon" | "maxNameLength">;

/** Split a paragraph into lines (at <br> or newline). Does not modify the DOM. */
export function splitLines(p: HTMLElement): Node[][] {
  const lines: Node[][] = [[]];
  for (const node of Array.from(p.childNodes)) {
    if (node.nodeName === "BR") {
      lines.push([]);
      continue;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      const parts = (node.textContent ?? "").split("\n");
      parts.forEach((part, i) => {
        if (i > 0) lines.push([]);
        if (part === "") return;
        const target = lines[lines.length - 1];
        target.push(parts.length === 1 ? node : p.ownerDocument.createTextNode(part));
      });
      continue;
    }
    lines[lines.length - 1].push(node);
  }
  return lines.filter((l) => l.length > 0);
}

/**
 * Read one line as "Name : Dialogue".
 * Only the first ":" in the line's top-level text counts. Colons inside
 * links or other elements are ignored.
 */
export function parseDialogue(line: Node[], options: ParserOptions): ParsedDialogue | null {
  const doc = line[0].ownerDocument ?? document;

  for (let i = 0; i < line.length; i++) {
    const node = line[i];
    if (node.nodeType !== Node.TEXT_NODE) continue;

    const text = node.textContent ?? "";
    const match = /[:：]/.exec(text);
    if (!match) continue;

    const before = text.slice(0, match.index);
    const after = text.slice(match.index + 1);

    // URLs such as http://example.com are not dialogue.
    if (after.startsWith("//")) return null;

    // Times such as 10:30 are not dialogue.
    if (/\d$/.test(before) && /^\d/.test(after)) return null;

    const name: Node[] = line.slice(0, i);
    if (before !== "") name.push(doc.createTextNode(before));

    const nameText = name.map((n) => n.textContent ?? "").join("").trim();
    if (nameText === "") return null;
    if (nameText.length > options.maxNameLength) return null;
    if (/^[\d\s.,-]+$/.test(nameText)) return null; // Only digits or punctuation.

    if (!options.hideColon) name.push(doc.createTextNode(":"));

    const trimmedAfter = after.replace(/^\s+/, "");
    const textNodes: Node[] = [];
    if (trimmedAfter !== "") textNodes.push(doc.createTextNode(trimmedAfter));
    textNodes.push(...line.slice(i + 1));

    return { name, text: textNodes };
  }
  return null;
}
