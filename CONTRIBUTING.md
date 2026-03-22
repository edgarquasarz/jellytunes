# Contributing to JellyTunes

Thanks for your interest in contributing! Here's how you can help.

## Reporting Bugs

Open a [GitHub Issue](https://github.com/edgarquasarz/jellytunes/issues) with:

- Steps to reproduce the problem
- What you expected to happen vs. what actually happened
- Your OS, Electron version, and Jellyfin server version

## Submitting Changes

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Run `pnpm typecheck` and `pnpm test` to verify nothing is broken
4. Open a Pull Request with a clear description of what you changed and why

## Development Setup

```bash
pnpm install
pnpm dev
```

See the [README](README.md) for all available commands.

## Code Style

- TypeScript throughout
- React for the renderer UI
- Keep functions small and files focused
- Handle errors explicitly — don't swallow them

## License

By contributing to JellyTunes, you agree that your contributions will be licensed under the [GNU General Public License v3.0](LICENSE).
