import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        contentScript: "./src/content-scripts/contentScript.js",
        popup: "index.html"
      },
      output: {
        entryFileNames: (chunk) => chunk.name == "contentScript" ? "[name].js" : "assets/[name]-[hash].js",
      }
    }
  }
})
