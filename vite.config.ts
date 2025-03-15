import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        contentScript: "src/content-scripts/contentScript.ts",
        popup: "index.html"
      },
      output: {
        entryFileNames(chunkInfo) {
          return chunkInfo.name === "contentScript" ? "[name].js" : "assets/[name]-[hash].js"
        }
      }
    }
  }
})
