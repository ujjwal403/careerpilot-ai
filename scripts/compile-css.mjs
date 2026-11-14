import postcss from 'postcss'
import tailwind from '@tailwindcss/postcss'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

export async function compileTailwindCss() {
  const srcPath = path.join(rootDir, 'src/app/globals.src.css')
  const outPath = path.join(rootDir, 'src/app/globals.css')

  if (!fs.existsSync(srcPath)) {
    console.error('Source CSS file not found:', srcPath)
    return
  }

  const rawInput = fs.readFileSync(srcPath, 'utf-8')
  // Ensure Tailwind scans all component files in src
  const inputWithSource = `@import "tailwindcss";\n@source "./src/**/*.{js,ts,jsx,tsx}";\n\n${rawInput.replace(/@import\s+['"]tailwindcss['"];?\s*/g, '').replace(/@source\s+['"][^'"]+['"];?\s*/g, '')}`

  const result = await postcss([tailwind()]).process(inputWithSource, {
    from: srcPath,
    to: outPath,
  })

  fs.writeFileSync(outPath, result.css, 'utf-8')
  console.log(`✓ Compiled Tailwind CSS successfully (${(result.css.length / 1024).toFixed(1)} KB) -> src/app/globals.css`)
}

compileTailwindCss().catch((err) => {
  console.error('Failed to compile Tailwind CSS:', err)
  process.exit(1)
})

