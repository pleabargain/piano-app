// https://github.com/pleabargain/piano-app
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Note: Vite automatically handles SPA routing in dev mode
// For production, ensure your server is configured to serve index.html for all routes
export default defineConfig({
  plugins: [
    react(),
    // Plugin to redirect .md requests to .html
    {
      name: 'redirect-md-to-html',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // If requesting a .md file, redirect to .html version
          if (req.url && req.url.endsWith('.md')) {
            const htmlUrl = req.url.replace(/\.md$/, '.html')
            res.writeHead(301, { Location: htmlUrl })
            res.end()
            return
          }
          next()
        })
      }
    }
  ],
})
