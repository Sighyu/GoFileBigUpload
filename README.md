# GoFileBigUpload

Automatically uploads large files to [GoFile](https://gofile.io) when they go over Discord's upload limit, and then pastes the download link into the chat box.

> Requires [Vencord](https://github.com/Vendicated/Vencord) or any fork such as [Equicord](https://github.com/Equicord/Equicord).

## Installation

1. Navigate to your `src/userplugins` folder
2. Clone or pull the plugin: `git clone <will replace once I make repo :3>` / `git pull`
3. Run `pnpm build` from the root directory
4. Enable **GoFileBigUpload** in the plugins menu

## Features

- Intercepts files over a certain size (default 500 MB) before Discord rejects them (depends on nitro idk what it is for free/basic tier so I did this)
- Uploads to GoFile through their API with progress tracking
- funny neko girl in header bar button with upload progress and history popout
- Copy any old upload link from the history panel
- setting to change upload region for optimized speeds and shiz

## Settings

| Setting | Description | Default |
|---------|-------------|---------|
| API Token | GoFile API token from your profile page. Leave empty for guest uploads. | *(empty)* |
| Upload Region | Server region for uploads (Auto, EU, NA, AP, SA). | Automatic |
| Size Threshold | Minimum file size in MB to trigger GoFile upload. | 500 |
