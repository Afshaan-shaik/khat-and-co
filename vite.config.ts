import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { handleApiRequest } from './src/server/apiHandler';

function apiDevServerPlugin(): Plugin {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api')) {
          try {
            const handled = await handleApiRequest(req, res, req.url);
            if (handled) return;
          } catch (err) {
            console.error('API middleware error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal API Server Error' }));
            return;
          }
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api')) {
          try {
            const handled = await handleApiRequest(req, res, req.url);
            if (handled) return;
          } catch (err) {
            console.error('API preview server error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal API Server Error' }));
            return;
          }
        }
        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), apiDevServerPlugin()],
  server: {
    port: 3000,
    open: false
  }
});
