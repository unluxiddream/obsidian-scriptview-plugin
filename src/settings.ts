import { App, PluginSettingTab} from "obsidian";
import type ScriptViewPlugin from "./main";
import type { SettingDefinitionItem } from "obsidian";

/* ------------------------------------------------------------------ */
/* Settings interface and defaults                                     */
/* ------------------------------------------------------------------ */

export interface ScriptViewSettings {
  /** Width of the character name column, in percent of the line width. */
  nameWidth: number;
  nameAlign: "left" | "center" | "right";
  nameBold: boolean;
  /** Hide the ":" between the name and the dialogue. */
  hideColon: boolean;
  /** If the text before ":" is longer than this, the line is treated as normal text. */
  maxNameLength: number;
  /** Space between the name column and the dialogue column, in px. */
  columnGap: number;
  /** Space between lines, in px. */
  rowSpacing: number;
}

export const DEFAULT_SETTINGS: ScriptViewSettings = {
  nameWidth: 15,
  nameAlign: "left",
  nameBold: true,
  hideColon: true,
  maxNameLength: 20,
  columnGap: 16,
  rowSpacing: 3,
};

/* ------------------------------------------------------------------ */
/* Settings tab                                                        */
/* ------------------------------------------------------------------ */
export class ScriptViewSettingTab extends PluginSettingTab {
  plugin: ScriptViewPlugin;

  constructor(app: App, plugin: ScriptViewPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  getSettingDefinitions(): SettingDefinitionItem[] {
    return [
      {
        name: "Name column width (%)",
        desc: "How much of the line width the character name column uses. If a name is longer than this, it wraps inside the name column.",
        control: { type: "slider", key: "nameWidth", min: 5, max: 60, step: 1 },
      },
      {
        name: "Name alignment",
        desc: "Align the character names to the left, center, or right of the name column.",
        control: {
          type: "dropdown",
          key: "nameAlign",
          defaultValue: "left",
          options: { left: "Left", center: "Center", right: "Right" },
        },
      },
      {
        name: "Bold names",
        desc: "Show character names in bold. This also applies to linked names, such as [[name]].",
        control: { type: "toggle", key: "nameBold" },
      },
      {
        name: "Hide colon",
        desc: "Hide the colon between the name and the dialogue. Your note file is not changed.",
        control: { type: "toggle", key: "hideColon" },
      },
      {
        name: "Max name length",
        desc: "If the text before the colon is longer than this many characters, the line is shown as normal text instead of dialogue. This prevents ordinary sentences that contain a colon from being split.",
        control: { type: "slider", key: "maxNameLength", min: 3, max: 60, step: 1 },
      },
      {
        name: "Gap between columns (px)",
        desc: "Empty space between the name column and the dialogue column.",
        control: { type: "slider", key: "columnGap", min: 0, max: 64, step: 1 },
      },
      {
        name: "Line spacing (px)",
        desc: "Empty space above and below each line.",
        control: { type: "slider", key: "rowSpacing", min: 0, max: 24, step: 1 },
      },
    ];
  }

  // Apply the changed settings when the settings tab is closed.
  hide(): void {
    const views = this.plugin.viewManager;
    views.applyStyles();
    views.refreshActive();
  }
}