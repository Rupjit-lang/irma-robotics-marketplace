const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8000;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // Handle root path and preview path
  if (pathname === '/' || pathname === '/preview-recommendations.html') {
    const filePath = path.join(__dirname, 'preview-recommendations.html');
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, 'localhost', () => {
  console.log(`🚀 IRMA Recommendation System Preview running at:`);
  console.log(`   Local:    http://localhost:${PORT}`);
  console.log(`   Network:  http://127.0.0.1:${PORT}`);
  console.log('');
  console.log('📱 Features you can test:');
  console.log('   ✅ Algorithm switching (Hybrid, Browsing, Industry, Trending)');
  console.log('   ✅ Interactive product cards with hover effects');
  console.log('   ✅ Recent activity tracking simulation');
  console.log('   ✅ Responsive design for mobile and desktop');
  console.log('   ✅ Mock recommendation scoring and reasoning');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});