# Script View

An Obsidian plugin that shows `Name : Dialogue` lines in a clean, commercial script layout.
This plugin was made to improve the readability of scripts written in Markdown files.

for examples...
```
A picks up the bottle.
A : Hello, World!
[[World]] : Hi, A.
```

## What it does

- Adds a **Toggle script layout** button to the note header (on mobile, it is in the `⋯` menu).
- Adds a command with the same name. Assign a hotkey in **Settings > Hotkeys** (search "Script View").
- Lines with a colon (`:`) are split into two columns: the character name on the left, the dialogue on the right.
  - Names that are too long wrap inside the name column.
- Lines without a colon (stage directions) stay as normal text.
- Links such as `[[Name]]`, `![[Embed]]` and `[text](url)` keep working.
- Your note files are never changed.
- 
## Requirements

- Obsidian 1.13.0 or later.

## How it works

Script View is a layout applied on top of **Reading view**.

- Turning it on switches the note to Reading view.
- Going back to Source mode or Live Preview turns it off.
- A line is **not** treated as dialogue if the text before the colon is longer than the "Max name length" option, contains only numbers or punctuation (like `23:45`), or is part of a URL (`http://`).
- Only normal paragraphs are converted. Text inside tables and list items is not.

## Options

| Option | Default |
| --- | --- |
| Name column width (%) | 15 |
| Name alignment | Left |
| Bold names | On |
| Hide colon | On |
| Max name length | 20 |
| Gap between columns (px) | 16 |
| Line spacing (px) | 3 |

## Source code

The source code is available on GitHub.
<br>
<a href="https://github.com/unluxiddream/obsidian-scriptview-plugin" target="_blank"><img src="https://brand.github.com/_next/static/media/logo-03.cc5e5332.png" alt="GitHub" style="height: 40px !important;"></a>

## Support

If this plugin helped you, you can buy me a coffee to support future development.
<br>
<a href="https://ko-fi.com/unluxiddream" target="_blank"><img src="https://storage.ko-fi.com/cdn/brandasset/v2/support_me_on_kofi_red.png" alt="Ko-fi" style="height: 40px !important;"></a>
 
