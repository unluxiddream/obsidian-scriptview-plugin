import { MarkdownView } from "obsidian";
import type ScriptViewPlugin from "../main";

/**
 * Turn Script View on or off for the active note.
 * Registered as a command so users can assign a hotkey
 * (Settings > Hotkeys > search "Script View").
 */
export function registerToggleLayout(plugin: ScriptViewPlugin): void {
  plugin.addCommand({
    id: "toggle-layout",
    name: "Toggle script layout",
    checkCallback: (checking: boolean) => {
      const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
      if (!view) return false;
      if (!checking) {
        plugin.viewManager.sync();
        void plugin.viewManager.toggle(view);
      }
      return true;
    },
  });
}
