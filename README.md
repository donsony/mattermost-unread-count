# Mattermost Unread Messages Counter Plugin

A webapp-only Mattermost plugin that displays the exact count of unread messages next to public and private channels in the left sidebar.

Created by **Don Sony** and **infuse.ae**.

---

## Features

- **Exact Unread Count**: Displays a badge containing the exact number of unread messages next to channel names (in addition to the bold styling that Mattermost defaultly provides).
- **Theme Integration**: Automatically uses the user's active theme colors (specifically the sidebar text active border/highlight and sidebar background colors) to blend in seamlessly.
- **Mute Awareness**: Displays a subdued, semi-transparent gray badge for muted channels with unread activity.
- **Dynamic Updates**: Automatically updates counts instantly on new messages or when messages are marked as read, using the Redux store subscription.
- **Zero Server Overhead**: The plugin runs entirely on the client side using the standard Mattermost webapp SDK, making it compatible with any server setup.
- **Desktop App Icon Badge Integration**: Automatically synchronizes the total unread message count (public/private channels, DMs, GMs) with the document window title. The Electron desktop app wrapper reads this title count and updates the native app icon badge (dock/taskbar) instantly.

---

## Folder Structure

```
.
├── dist/                          # Directory containing packaged plugin tarball
├── webapp/                        # Frontend source code and build config
│   ├── src/
│   │   ├── index.jsx              # Plugin entry point
│   │   └── components/
│   │       └── unread_badge.jsx   # Unread count badge React component
│   ├── package.json               # Webapp build dependencies
│   └── webpack.config.js          # Webpack configuration
├── pack.js                        # Node.js packaging script
├── plugin.json                    # Mattermost plugin manifest
└── package.json                   # Root package manager
```

---

## Building and Packaging

To compile and package the plugin from source:

1. **Install Node.js** (v16+ recommended).
2. **Bootstrap the dependencies**:
   ```bash
   npm run bootstrap
   ```
3. **Build and package**:
   ```bash
   npm run build
   ```
   This will compile the webapp React/Redux bundle and package the manifest and JS bundle into `dist/unread-count-plugin.tar.gz`.

---

## Installation

1. Log in to your Mattermost server as a **System Administrator**.
2. Navigate to **System Console > Plugins > Plugin Management**.
3. Under **Upload Plugin**, upload the packaged file:
   `dist/unread-count-plugin.tar.gz`
4. Find **Unread Messages Counter** in the **Installed Plugins** list and click **Enable**.
5. Switch back to your team workspace. Unread counts will now appear next to your channels in the sidebar!
