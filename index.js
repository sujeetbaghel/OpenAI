const https = require('https');
const fs = require('fs');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Proxy all requests to OpenAI's ChatGPT
app.use('/', createProxyMiddleware({
  target: 'https://chat.openai.com',
  changeOrigin: true,
}));

// HTTPS options
const options = {
  key: fs.readFileSync('Key/server.key'),
  cert: fs.readFileSync('Key/server.cert'),
};

// Start the HTTPS server
https.createServer(options, app).listen(3000, () => {
  console.log('HTTPS reverse proxy server running on port 3000');
});