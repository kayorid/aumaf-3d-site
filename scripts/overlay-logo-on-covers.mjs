#!/usr/bin/env node
/**
 * Aplica o logo AUMAF (branco) no canto inferior centralizado de capas de blog.
 * Logo escala para ~14% da largura da imagem, margem inferior ~4%, opacidade 90%.
 * Saída sempre webp para padronizar.
 *
 * Uso:
 *   node scripts/overlay-logo-on-covers.mjs <input1> [input2 ...]
 *
 * Se input já tem extensão .webp, sobrescreve. Senão, salva como .webp ao lado.
 */
import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..')
const LOGO_PATH = path.join(REPO_ROOT, 'frontend-public/public/logo-branca.png')

const LOGO_WIDTH_RATIO = 0.14
const BOTTOM_MARGIN_RATIO = 0.04
const LOGO_OPACITY = 0.9

async function applyLogo(inputPath) {
  const absInput = path.resolve(inputPath)
  const ext = path.extname(absInput).toLowerCase()
  const dir = path.dirname(absInput)
  const baseName = path.basename(absInput, ext)
  const outputPath = path.join(dir, `${baseName}.webp`)

  const img = sharp(absInput)
  const meta = await img.metadata()
  const W = meta.width
  const H = meta.height

  const logoTargetWidth = Math.round(W * LOGO_WIDTH_RATIO)
  const logoBuffer = await sharp(LOGO_PATH)
    .resize({ width: logoTargetWidth })
    .ensureAlpha()
    .composite([
      {
        input: Buffer.from([255, 255, 255, Math.round(LOGO_OPACITY * 255)]),
        raw: { width: 1, height: 1, channels: 4 },
        tile: true,
        blend: 'dest-in',
      },
    ])
    .png()
    .toBuffer()

  const logoMeta = await sharp(logoBuffer).metadata()
  const left = Math.round((W - logoMeta.width) / 2)
  const top = Math.round(H - logoMeta.height - W * BOTTOM_MARGIN_RATIO)

  const tmpOutput = outputPath + '.tmp.webp'
  await sharp(absInput)
    .composite([{ input: logoBuffer, top, left }])
    .webp({ quality: 85, effort: 5 })
    .toFile(tmpOutput)

  await import('node:fs/promises').then((fs) => fs.rename(tmpOutput, outputPath))
  console.log(`✓ ${path.relative(REPO_ROOT, outputPath)} (${W}×${H}, logo ${logoMeta.width}×${logoMeta.height})`)
}

async function main() {
  const inputs = process.argv.slice(2)
  if (inputs.length === 0) {
    console.error('Uso: node scripts/overlay-logo-on-covers.mjs <input1> [input2 ...]')
    process.exit(1)
  }
  for (const input of inputs) {
    try {
      await applyLogo(input)
    } catch (err) {
      console.error(`✗ ${input}: ${err.message}`)
      process.exit(1)
    }
  }
}

main()
