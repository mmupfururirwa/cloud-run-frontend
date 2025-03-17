import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// ✅ Parse JSON bodies
app.use(express.json()); 

// ✅ 1. Proxy API route FIRST
/**
 * 🔥 Backend Proxy Route: Catch any `/api/*` calls
 */
app.use('/api/*', async (req, res) => {
  delete req.headers.cookie; // 🔥 Strip cookies from SSR
  console.log(`🚀 Proxy route hit: ${req.method} ${req.originalUrl}`);

  try {
    const backendBaseURL = 'https://smart-view-ums-api-dev-426000542377.europe-west3.run.app';
    const backendURL = backendBaseURL + req.originalUrl.replace('/api', '');

    console.log(`Proxying request to backend: ${backendURL}`);
    console.log(`Proxying request to body:`, req.body);

    const backendResponse = await fetch(backendURL, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers['authorization'] ? { 'Authorization': req.headers['authorization'] } : {}),
      },
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
    });
    
    const data = await backendResponse.text();
    console.log(`✅ Backend responded with status: ${backendResponse.status}`);
    res.status(backendResponse.status).send(data);
  } catch (err) {
    console.error('❌ Proxy error:', err);
    res.status(500).send('Backend proxy failed.');
  }
});

// ✅ 2. Static files
/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

// ✅ 3. Angular SSR wildcard handler LAST
/**
 * Handle all other requests by rendering the Angular application.
 */
app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build).
 */
export const reqHandler = createNodeRequestHandler(app);
