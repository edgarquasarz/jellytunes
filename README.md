# JellyTunes

[![BDD Tests](https://github.com/edgarquasarz/jellytunes/actions/workflows/bdd-tests.yml/badge.svg)](https://github.com/edgarquasarz/jellytunes/actions/workflows/bdd-tests.yml)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

Desktop app that syncs music libraries from a [Jellyfin](https://jellyfin.org) media server to portable devices (USB drives, SD cards). Built with Electron + React.

Select artists, albums or playlists from your server, pick a destination, and JellyTunes handles the rest — downloading tracks, optionally converting FLAC to MP3, and preserving the server's folder structure on the device.

## Features

- Browse and select artists, albums, and playlists from your Jellyfin server
- Selective sync — skips tracks already up to date on the device
- FLAC → MP3 conversion via FFmpeg with configurable bitrate (128k / 192k / 320k)
- Automatic filesystem detection on destination (FAT32, exFAT, NTFS) with filename sanitization
- Per-device sync history and previously-synced item tracking
- Cancellable at any point during sync

## Requirements

- A [Jellyfin](https://jellyfin.org) server reachable on your network
- Node.js ≥ 18 and [pnpm](https://pnpm.io)
- FFmpeg (bundled via `@ffmpeg-installer/ffmpeg`, or system install)

## Quick Start

```bash
pnpm install
pnpm dev
```

This starts the Vite dev server and launches the Electron window.

## Commands

```bash
# Development
pnpm dev              # Start dev server + Electron
pnpm build            # Compile with electron-vite
pnpm typecheck        # TypeScript type checking

# Testing
pnpm test             # Unit tests (Vitest)
pnpm test:unit:watch  # Unit tests in watch mode
pnpm test:bdd         # BDD tests headless (Cucumber + Playwright)
pnpm test:bdd:dev     # BDD tests with visible UI

# Packaging
pnpm package          # Build + create installers
```

## Architecture

Three Electron processes plus a standalone sync engine:

- **Main process** (`src/main/`) — IPC handlers, USB/filesystem detection, sync orchestration
- **Preload** (`src/preload/`) — typed IPC bridge between main and renderer
- **Renderer** (`src/renderer/`) — React UI for library navigation, device selection, and sync progress
- **Sync module** (`src/sync/`) — dependency-injected sync engine (API client, file ops, FFmpeg converter); fully unit-testable without hitting the network or filesystem

## License

This project is licensed under the GNU General Public License v3.0 — see the [LICENSE](LICENSE) file for details.
