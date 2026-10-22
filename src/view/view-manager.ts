import { MarkdownView } from "obsidian";
import type ScriptViewPlugin from "../main";
import { CLS_ACTIVE, CLS_BOLD, CLS_BUTTON } from "../constants";
import type { ActiveState } from "../types";
import { renderScriptLayout } from "./script-renderer";

/**
 * Keeps track of every open Markdown view: adds the header button,
 * turns Script View on or off, and re-applies the layout when Obsidian
 * renders more content.
 */
export class ViewManager {
  /** Header buttons added by this plugin, one per Markdown view. */
  private buttons = new Map<MarkdownView, HTMLElement>();
  /** Views where Script View is currently turned on. */
  private active = new Map<MarkdownView, ActiveState>();

  constructor(private plugin: ScriptViewPlugin) {}

  /* ---------------------------- Public ---------------------------- */

  /** Add the button to every open Markdown view and clean up closed ones. */
  sync(): void {
    const current = new Set<MarkdownView>();
    this.plugin.app.workspace.iterateAllLeaves((leaf) => {
      if (leaf.view instanceof MarkdownView) current.add(leaf.view);
    });

    for (const view of current) {
      if (!this.buttons.has(view)) {
        const btn = view.addAction("scroll-text", "Toggle script layout", () => {
          void this.toggle(view);
        });
        btn.addClass(CLS_BUTTON);
        if (this.active.has(view)) btn.addClass("is-active");
        this.buttons.set(view, btn);
      }
    }

    for (const view of Array.from(this.buttons.keys())) {
      if (!current.has(view)) {
        this.deactivate(view, false);
        this.buttons.get(view)?.remove();
        this.buttons.delete(view);
      }
    }

    // If the user switched back to Source mode or Live Preview, turn Script View off.
    for (const view of Array.from(this.active.keys())) {
      if (view.getMode() !== "preview") this.deactivate(view, false);
    }
  }

  async toggle(view: MarkdownView): Promise<void> {
    if (this.active.has(view)) {
      this.deactivate(view, true);
    } else {
      await this.activate(view);
    }
  }

  /** Apply settings that only need CSS variables (instant). */
  applyStyles(): void {
    for (const view of this.active.keys()) {
      this.applyStylesTo(view);
    }
  }

  /** Apply settings that change the document structure (needs a re-render). */
  refreshActive(): void {
    this.applyStyles();
    for (const view of this.active.keys()) {
      if (view.getMode() === "preview") view.previewMode.rerender(true);
    }
  }

  /** Called when the plugin unloads: restore every view and remove the buttons. */
  destroy(): void {
    for (const view of Array.from(this.active.keys())) {
      this.deactivate(view, true);
    }
    for (const btn of this.buttons.values()) {
      btn.remove();
    }
    this.buttons.clear();
  }

  /* --------------------------- Internals -------------------------- */

  private applyStylesTo(view: MarkdownView): void {
    const s = this.plugin.settings;
    view.containerEl.setCssProps({
      "--script-view-name-width": `${s.nameWidth}%`,
      "--script-view-name-align": s.nameAlign,
      "--script-view-gap": `${s.columnGap}px`,
      "--script-view-row-spacing": `${s.rowSpacing}px`,
    });
    view.containerEl.toggleClass(CLS_BOLD, s.nameBold);
  }

  private async activate(view: MarkdownView): Promise<void> {
    // Script View works on top of Reading view, so switch to it first.
    if (view.getMode() !== "preview") {
      const state = view.leaf.getViewState();
      await view.leaf.setViewState({
        ...state,
        state: { ...(state.state as Record<string, unknown>), mode: "preview" },
      });
    }
    if (view.getMode() !== "preview") return;

    view.containerEl.addClass(CLS_ACTIVE);
    this.applyStylesTo(view);
    this.buttons.get(view)?.addClass("is-active");

    const observer = new MutationObserver(() => this.schedule(view));
    this.active.set(view, { observer, raf: 0 });

    renderScriptLayout(view, this.plugin.settings);
    // Obsidian renders long notes in chunks, so keep watching for new content.
    observer.observe(view.contentEl, { childList: true, subtree: true });
  }

  private deactivate(view: MarkdownView, rerender: boolean): void {
    const state = this.active.get(view);
    if (state) {
      state.observer.disconnect();
      if (state.raf) view.containerEl.win.cancelAnimationFrame(state.raf);
      this.active.delete(view);
    }
    view.containerEl.removeClass(CLS_ACTIVE);
    view.containerEl.removeClass(CLS_BOLD);
    this.buttons.get(view)?.removeClass("is-active");
    if (state && rerender && view.getMode() === "preview") {
      view.previewMode.rerender(true); // Restore the normal Reading view.
    }
  }

  private schedule(view: MarkdownView): void {
    const state = this.active.get(view);
    if (!state || state.raf) return;
    state.raf = view.containerEl.win.requestAnimationFrame(() => {
      state.raf = 0;
      if (!this.active.has(view)) return;
      if (view.getMode() !== "preview") {
        this.deactivate(view, false);
        return;
      }
      renderScriptLayout(view, this.plugin.settings);
    });
  }
}
