import { Plugin } from "obsidian";
import { registerCommands } from "./commands";
import { DEFAULT_SETTINGS, ScriptViewSettings, ScriptViewSettingTab } from "./settings";
import { ViewManager } from "./view/view-manager";

/** Plugin entry point. Only lifecycle code lives here. */
export default class ScriptViewPlugin extends Plugin {
  settings: ScriptViewSettings = { ...DEFAULT_SETTINGS };
  viewManager!: ViewManager;

  async onload() {
    await this.loadSettings();

    this.viewManager = new ViewManager(this);

    this.addSettingTab(new ScriptViewSettingTab(this.app, this));
    registerCommands(this);

    this.app.workspace.onLayoutReady(() => this.viewManager.sync());
    this.registerEvent(this.app.workspace.on("layout-change", () => this.viewManager.sync()));
    this.registerEvent(this.app.workspace.on("active-leaf-change", () => this.viewManager.sync()));
    this.registerEvent(this.app.workspace.on("file-open", () => this.viewManager.sync()));
  }

  onunload() {
    this.viewManager.destroy();
  }

  async loadSettings() {
    const saved = (await this.loadData()) as Partial<ScriptViewSettings> | null;
    this.settings = Object.assign({}, DEFAULT_SETTINGS, saved);
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
