// A tiny local preview server, so you can look at the site before you put it
// anywhere. You do not strictly need it: opening index.html in a browser works
// too. It is here because a few things, mainly how the links between pages
// behave, are easier to judge over http than over file://.
//
//   node serve.js          then open http://localhost:4180
//   node serve.js 8080     to use a different port
//
// Nothing else in this template needs Node. There is no build step: the files
// you edit are the files that get published.

const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.argv[2]) || 4180;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.avif': 'image/avif',
  '.woff2': 'font/woff2', '.ico': 'image/x-icon',
  '.md': 'text/plain; charset=utf-8',
};

http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);
  if (url.endsWith('/')) url += 'index.html';

  const file = path.join(root, url);
  // never serve anything above this folder
  if (!path.resolve(file).startsWith(path.resolve(root))) {
    res.writeHead(403, { 'Content-Type': 'text/plain' }).end('403');
    return;
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404  ' + url + '\n\nIs the filename right? Paths are case-sensitive once this is online.');
      return;
    }
    res.writeHead(200, {
      'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(data);
  });
}).listen(port, () => {
  console.log('Serving ' + root);
  console.log('Open http://localhost:' + port + '   (ctrl-c to stop)');
});
