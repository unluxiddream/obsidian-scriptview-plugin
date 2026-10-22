import type ScriptViewPlugin from "../main";
import { registerToggleLayout } from "./toggle-layout";

export function registerCommands(plugin: ScriptViewPlugin): void {
  registerToggleLayout(plugin);
}
