// Simple static file server for deployment
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;

// MIME types for common file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.csv': 'text/csv',
  '.md': 'text/markdown'
};

const server = http.createServer((req, res) => {
  // Parse URL and remove query string
  let filePath = req.url.split('?')[0];
  
  // Default to index.html for root
  if (filePath === '/') {
    filePath = '/index.html';
  }
  
  // Security: prevent directory traversal
  filePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
  filePath = path.join(__dirname, filePath);
  
  // Get file extension
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // Read and serve the file
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // File not found - try index.html for SPA routing
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
          if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 - File Not Found\n');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end('500 - Internal Server Error: ' + error.code + '\n');
      }
    } else {
      // Success
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Cache-Control': extname === '.html' ? 'no-cache' : 'public, max-age=86400'
      });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`LPC Spritesheet Character Generator is ready!`);
});
