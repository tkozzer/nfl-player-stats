import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'
import fs from 'fs'
import path from 'path'

// Custom plugin to copy data files
function copyDataPlugin() {
  return {
    name: 'copy-data',
    writeBundle() {
      // Create src/data structure in dist
      const srcDir = path.resolve('src/data')
      const destDir = path.resolve('dist/src/data')

      // Ensure the destination directory exists
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true })
      }

      // Copy function
      function copyDir(src, dest) {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true })
        }

        const entries = fs.readdirSync(src, { withFileTypes: true })

        for (const entry of entries) {
          const srcPath = path.join(src, entry.name)
          const destPath = path.join(dest, entry.name)

          if (entry.isDirectory()) {
            copyDir(srcPath, destPath)
          } else {
            fs.copyFileSync(srcPath, destPath)
          }
        }
      }

      // Copy the data directory
      copyDir(srcDir, destDir)
    }
  }
}

export default defineConfig({
  plugins: [
    vue(),
    copyDataPlugin()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
