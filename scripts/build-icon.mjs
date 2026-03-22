#!/usr/bin/env node
/**
 * Generates app icons for JellyTunes from assets/icon.svg
 *
 * Usage: node scripts/build-icon.mjs
 * Requires: sharp (pnpm add -D sharp)
 *
 * Outputs:
 *   assets/icon.png           (1024×1024, for Linux)
 *   assets/icon.ico           (256×256 renamed, for Windows)
 *   assets/icon.iconset/      (macOS iconset sizes)
 *   assets/icon.icns          (macOS .icns, requires iconutil on macOS)
 */

import { createRequire } from 'module'
import { execSync } from 'child_process'
import { mkdirSync, writeFileSync, renameSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const sharp = require('sharp')

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const svgPath = join(root, 'assets', 'icon.svg')
const iconsetDir = join(root, 'assets', 'icon.iconset')

// Ensure iconset directory exists
mkdirSync(iconsetDir, { recursive: true })

// Generate main 1024×1024 PNG
console.log('Generating assets/icon.png (1024×1024)...')
await sharp(svgPath).resize(1024, 1024).png().toFile(join(root, 'assets', 'icon.png'))

// macOS iconset sizes
const iconsetSizes = [
  { size: 16,   name: 'icon_16x16.png' },
  { size: 32,   name: 'icon_16x16@2x.png' },
  { size: 32,   name: 'icon_32x32.png' },
  { size: 64,   name: 'icon_32x32@2x.png' },
  { size: 128,  name: 'icon_128x128.png' },
  { size: 256,  name: 'icon_128x128@2x.png' },
  { size: 256,  name: 'icon_256x256.png' },
  { size: 512,  name: 'icon_256x256@2x.png' },
  { size: 512,  name: 'icon_512x512.png' },
  { size: 1024, name: 'icon_512x512@2x.png' },
]

for (const { size, name } of iconsetSizes) {
  const outPath = join(iconsetDir, name)
  console.log(`  ${name} (${size}×${size})`)
  await sharp(svgPath).resize(size, size).png().toFile(outPath)
}

// Generate .icns on macOS
if (process.platform === 'darwin') {
  console.log('Generating assets/icon.icns via iconutil...')
  execSync(`iconutil --convert icns "${iconsetDir}" --output "${join(root, 'assets', 'icon.icns')}"`)
  console.log('  assets/icon.icns ✓')
} else {
  console.log('Skipping .icns generation (macOS only)')
}

// Generate .ico for Windows (256×256 PNG renamed)
console.log('Generating assets/icon.ico (256×256)...')
await sharp(svgPath).resize(256, 256).png().toFile(join(root, 'assets', 'icon.ico'))

console.log('\nDone!')
