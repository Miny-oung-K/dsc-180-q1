const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '../dist');
const types = {'.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json'};
const port = Number(process.env.PORT || 8000);
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const target = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!target.startsWith(root + path.sep)) { res.writeHead(403); res.end('Forbidden'); return; }
    const body = await fs.readFile(target);
    res.writeHead(200, {'Content-Type':types[path.extname(target)] || 'application/octet-stream', 'Cache-Control':'no-store'});
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch (error) {
    res.writeHead(error.code === 'ENOENT' || error.code === 'EISDIR' ? 404 : 400);
    res.end('Resource unavailable');
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Harmonic Lab: http://127.0.0.1:${server.address().port}`));
