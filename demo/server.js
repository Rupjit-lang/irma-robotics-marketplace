var http = require('http');
var fs = require('fs');
var path = require('path');

var server = http.createServer(function(req, res) {
  var filePath = path.join(__dirname, 'index.html');
  
  fs.readFile(filePath, function(err, data) {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  });
});

var PORT = 3000;
server.listen(PORT, function() {
  console.log('IRMA Marketplace Demo running on http://localhost:' + PORT);
});