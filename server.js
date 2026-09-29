'use strict';

/**
 * Minimal zero-dependency static server for a Framer export.
 *
 *  - Serves ./public
 *  - Clean URLs:  /about  ->  about.html  or  about/index.html
 *  - /about.html, /about/ and /index.html redirect to their clean form
 *  - Serves public/404.html (status 404) when present
 *  - gzip for text assets, ETag / 304, HEAD support
 *  - Listens on $PORT (default 3000)
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = path.resolve(__dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.pdf': 'application/pdf',
  '.wasm': 'application/wasm',
};

const COMPRESSIBLE = /^(text\/|application\/(json|xml|manifest\+json)|image\/svg\+xml)/;

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  });
  res.end(res.req && res.req.method === 'HEAD' ? undefined : body);
}

function redirect(res, location) {
  send(res, 308, `Redirecting to ${location}\n`, { Location: location });
}

async function fileStat(p) {
  try {
    const st = await fs.promises.stat(p);
    return st.isFile() ? st : null;
  } catch {
    return null;
  }
}

async function serveFile(req, res, filePath, st, status = 200) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  const etag = `W/"${st.size.toString(16)}-${Math.floor(st.mtimeMs).toString(16)}"`;

  const headers = {
    'Content-Type': type,
    'ETag': etag,
    'Last-Modified': st.mtime.toUTCString(),
    'Cache-Control': ext === '.html' ? 'public, max-age=0, must-revalidate' : 'public, max-age=3600',
    'X-Content-Type-Options': 'nosniff',
  };

  if (status === 200 && req.headers['if-none-match'] === etag) {
    res.writeHead(304, headers);
    return res.end();
  }

  const gzip =
    COMPRESSIBLE.test(type) &&
    st.size > 1024 &&
    /\bgzip\b/.test(req.headers['accept-encoding'] || '');

  if (COMPRESSIBLE.test(type)) headers['Vary'] = 'Accept-Encoding';
  if (gzip) headers['Content-Encoding'] = 'gzip';
  else headers['Content-Length'] = st.size;

  res.writeHead(status, headers);
  if (req.method === 'HEAD') return res.end();

  const stream = fs.createReadStream(filePath);
  stream.on('error', () => res.destroy());
  if (gzip) stream.pipe(zlib.createGzip()).pipe(res);
  else stream.pipe(res);
}

async function notFound(req, res) {
  const page = path.join(ROOT, '404.html');
  const st = await fileStat(page);
  if (st) return serveFile(req, res, page, st, 404);
  return send(res, 404, 'Not Found\n');
}

async function handle(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Method Not Allowed\n', { Allow: 'GET, HEAD' });
  }

  // Split manually: `new URL('//host/x')` would treat the host as authority.
  const [rawPathAndQuery] = req.url.split('#');
  const qIndex = rawPathAndQuery.indexOf('?');
  const query = qIndex === -1 ? '' : rawPathAndQuery.slice(qIndex);
  // Collapse leading slashes so redirects can never become protocol-relative.
  const rawPath = (qIndex === -1 ? rawPathAndQuery : rawPathAndQuery.slice(0, qIndex)).replace(/^\/+/, '/');

  // Canonical clean URLs (matches Vercel's cleanUrls + trailingSlash:false).
  let canonical = rawPath;
  if (canonical.endsWith('/index.html')) canonical = canonical.slice(0, -'index.html'.length);
  else if (canonical.endsWith('.html')) canonical = canonical.slice(0, -'.html'.length);
  if (canonical.length > 1) canonical = canonical.replace(/\/+$/, '');
  if (canonical === '') canonical = '/';
  if (canonical !== rawPath) return redirect(res, canonical + query);

  let decoded;
  try {
    decoded = decodeURIComponent(rawPath);
  } catch {
    return send(res, 400, 'Bad Request\n');
  }
  if (decoded.includes('\0')) return send(res, 400, 'Bad Request\n');

  // No dotfiles or traversal segments (except /.well-known).
  if (decoded.split('/').some((s) => s.startsWith('.') && s !== '.well-known')) {
    return notFound(req, res);
  }

  const base = path.join(ROOT, decoded);
  if (base !== ROOT && !base.startsWith(ROOT + path.sep)) return notFound(req, res);

  const candidates =
    decoded === '/'
      ? [path.join(ROOT, 'index.html')]
      : [base, `${base}.html`, path.join(base, 'index.html')];

  for (const candidate of candidates) {
    const st = await fileStat(candidate);
    if (st) return serveFile(req, res, candidate, st);
  }
  return notFound(req, res);
}

const server = http.createServer((req, res) => {
  res.req = req;
  res.on('finish', () => console.log(`${req.method} ${req.url} ${res.statusCode}`));
  handle(req, res).catch((err) => {
    console.error(err);
    if (!res.headersSent) send(res, 500, 'Internal Server Error\n');
    else res.destroy();
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Serving ${ROOT} on http://${HOST}:${PORT}`);
});

// Docker sends SIGTERM on stop; node as PID 1 ignores it unless handled.
for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5000).unref();
  });
}
