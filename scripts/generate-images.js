/**
 * Script zum Generieren von PNG-Bildern aus SVG-Vorlagen
 *
 * Verwendung: bun run scripts/generate-images.js
 *
 * Benötigt: bun add -D sharp
 */

import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
const iconsDir = join(publicDir, 'icons')

async function generateImages() {
  console.log('Generiere Bilder...\n')

  // OG-Image: SVG -> PNG (1200x630)
  try {
    const ogSvg = readFileSync(join(publicDir, 'og-image.svg'))
    await sharp(ogSvg)
      .resize(1200, 630)
      .png()
      .toFile(join(publicDir, 'og-image.png'))
    console.log('✓ og-image.png erstellt (1200x630)')
  } catch (e) {
    console.error('✗ og-image.png fehlgeschlagen:', e.message)
  }

  // Favicon 16x16
  try {
    const faviconSvg = readFileSync(join(iconsDir, 'favicon.svg'))
    await sharp(faviconSvg)
      .resize(16, 16)
      .png()
      .toFile(join(iconsDir, 'favicon-16.png'))
    console.log('✓ favicon-16.png erstellt (16x16)')
  } catch (e) {
    console.error('✗ favicon-16.png fehlgeschlagen:', e.message)
  }

  // Favicon ICO (32x32 PNG als Basis)
  try {
    const faviconSvg = readFileSync(join(iconsDir, 'favicon.svg'))
    await sharp(faviconSvg)
      .resize(32, 32)
      .png()
      .toFile(join(publicDir, 'favicon.ico'))
    console.log('✓ favicon.ico erstellt (32x32)')
  } catch (e) {
    console.error('✗ favicon.ico fehlgeschlagen:', e.message)
  }

  console.log('\nFertig!')
}

generateImages().catch(console.error)
