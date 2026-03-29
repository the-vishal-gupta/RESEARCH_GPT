import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api/arxiv': {
        target: 'https://export.arxiv.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/arxiv/, '/api/query'),
      },
      '/api/semantic': {
        target: 'https://api.semanticscholar.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/semantic/, '/graph/v1/paper/search'),
      },
      '/api/core': {
        target: 'https://api.core.ac.uk',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/core/, '/v3/search/works'),
      },
    },
  },
});
