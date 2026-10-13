// A loopback-only fixture server, owned by the runner rather than a shell process.
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

module.exports = async function serve() {
  const root = path.resolve('dist');
  const types = {'.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon', '.png': 'image/png', '.json': 'application/json'};
  const server = http.createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
      if (!file.startsWith(root + path.sep)) {
        response.writeHead(403).end();
        return;
      }
      const data = await fs.readFile(file);
      response.writeHead(200, {'Content-Type': types[path.extname(file)] || 'application/octet-stream'});
      response.end(request.method === 'HEAD' ? undefined : data);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(8794, '127.0.0.1', resolve);
  });
  return async () => {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  };
};
