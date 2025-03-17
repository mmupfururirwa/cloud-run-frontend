import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'https';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// ✅ Parse JSON request bodies
app.use(express.json());
app.use(express.json({limit: '100mb'}));
app.use(express.urlencoded({limit: '100mb'}));

// ✅ 1. Proxy API route FIRST
app.use('/api/*', async (req, res) => {
  delete req.headers.cookie; // Strip SSR cookies to avoid huge headers
  console.log(`Proxying to internal backend`);
  console.log(`🚀 Proxy route hit: ${req.method} ${req.originalUrl}`);

  try {
    const backendBaseURL = 'https://smart-view-ums-api-dev-6bsov2mz7q-ey.a.run.app';
    const backendURL = backendBaseURL + req.originalUrl.replace('/api', '');

    console.log(`Proxying request to backend: ${backendURL}`);
    console.log(`Proxying request body:`, req.body);

    const requestOptions: https.RequestOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers['authorization'] ? { 'Authorization': req.headers['authorization'] } : {}),
      },
      rejectUnauthorized: false, // ⚠️ For internal requests only
    };

    const backendReq = https.request(backendURL, requestOptions, (backendRes) => {
      let data = '';
      backendRes.on('data', (chunk) => {
        data += chunk;
      });

      backendRes.on('end', () => {
        console.log(`✅ Backend responded with status: ${backendRes.statusCode}`);
        console.log('✅ Backend response:', backendRes);
        res.status(backendRes.statusCode || 500).send(data);
      });
    });

    backendReq.on('error', (err) => {
      console.error('❌ Proxy error:', err);
      res.status(500).send('Backend proxy failed.');
    });

    if (!['GET', 'HEAD'].includes(req.method)) {
      backendReq.write(JSON.stringify(req.body));
    }

    backendReq.end();
  } catch (err) {
    console.error('❌ Proxy error:', err);
    res.status(500).send('Backend proxy failed.');
  }
});

// ✅ 2. Serve static Angular browser files
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

// ✅ 3. Handle all other requests via Angular SSR
app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

// ✅ 4. Start Express server
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// ✅ 5. Export for Angular CLI (SSR build)
export const reqHandler = createNodeRequestHandler(app);
