# GoFileBigUpload

Automatically uploads large files to [GoFile](https://gofile.io) when they go over Discord's upload limit, and then pastes the download link into the chat box.

> Requires [Equicord](https://github.com/Equicord/Equicord).

## Preview
<details>
  <summary><b>Header toolbar section</b></summary>
  
  <img width="367" height="222" alt="Image" src="https://github.com/user-attachments/assets/2f3cea3a-5134-46a4-891e-6ea20b14fd22" />
</details>

<details>
  <summary><b>Settings Page</b></summary>
  
  <img width="604" height="620" alt="Image" src="https://github.com/user-attachments/assets/9e32b4fc-c3f8-4d2d-919b-4a33b3004ac9" />
</details>

<details>
  <summary><b>Preview of intercepting discord upload for 1mb limit as test</b></summary>
  
  ![Image](https://github.com/user-attachments/assets/31ee4148-f546-44b3-a049-c0e60f1ed599)
</details>

## Installation

1. Navigate to your `src/userplugins` folder
2. Clone or pull the plugin: `git clone https://github.com/Sighyu/GoFileBigUpload.git` / `git pull`
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
