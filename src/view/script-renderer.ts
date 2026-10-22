import type { MarkdownView } from "obsidian";
import { CLS_PROCESSED } from "../constants";
import type { ScriptViewSettings } from "../settings";
import { parseDialogue, splitLines } from "../utils/dialogue-parser";

/** Convert every not-yet-processed paragraph in a Reading view. */
export function renderScriptLayout(view: MarkdownView, settings: ScriptViewSettings): void {
  const paragraphs = view.contentEl.querySelectorAll<HTMLElement>(
    `.markdown-preview-view p:not(.${CLS_PROCESSED})`
  );
  paragraphs.forEach((p) => {
    if (p.closest("td, th, .frontmatter-container")) return;
    transformParagraph(p, settings);
  });
}

/** Turn the "Name : Dialogue" lines of one paragraph into a two-column layout. */
export function transformParagraph(p: HTMLElement, settings: ScriptViewSettings): void {
  p.addClass(CLS_PROCESSED);

  const lines = splitLines(p);
  if (lines.length === 0) return;

  const parsed = lines.map((line) => parseDialogue(line, settings));
  if (!parsed.some((x) => x !== null)) return; // No dialogue here: leave it untouched.

  const blocks: HTMLElement[] = [];
  lines.forEach((line, i) => {
    const dialogue = parsed[i];
    if (dialogue) {
      const row = createDiv({ cls: "script-view-row" });
      const nameEl = row.createDiv({ cls: "script-view-name" });
      const textEl = row.createDiv({ cls: "script-view-dialogue" });
      // The existing nodes are moved, not re-created, so [[links]], ![[embeds]]
      // and [text](links) keep working.
      dialogue.name.forEach((n) => nameEl.appendChild(n));
      dialogue.text.forEach((n) => textEl.appendChild(n));
      blocks.push(row);
    } else {
      const action = createDiv({ cls: "script-view-action-line" });
      line.forEach((n) => action.appendChild(n));
      blocks.push(action);
    }
  });

  p.replaceChildren(...blocks);
}
