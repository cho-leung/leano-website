import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const assets = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
  ['/script.js', ['script.js', 'text/javascript; charset=utf-8']]
]);
// Serve only browser assets. Backend, archives and audit artifacts stay private.
const server = http.createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname.replace(/^\/leano-website(?=\/)/, '');
  const asset = assets.get(path);
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405); res.end(); return;
  }
  if (!asset) { res.writeHead(404); res.end(); return; }
  try {
    const content = await readFile(root + asset[0]);
    res.writeHead(200, { 'Content-Type': asset[1], 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch { res.writeHead(500); res.end(); }
});
server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => {
  console.log(`Local Leano preview: http://127.0.0.1:${server.address().port}/`);
});
