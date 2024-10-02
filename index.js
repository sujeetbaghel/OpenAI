const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Reverse proxy to ChatGPT without exposing the target URL
app.use('/', createProxyMiddleware({
  target: 'https://chat.openai.com',
  changeOrigin: true,
  selfHandleResponse: true, // Prevent the proxy from automatically handling the response
  onProxyRes(proxyRes, req, res) {
    let body = [];
    proxyRes.on('data', chunk => {
      body.push(chunk);
    });
    
    proxyRes.on('end', () => {
      // Combine all the body chunks
      body = Buffer.concat(body).toString();
      
      // Modify 'Location' header to prevent redirection to 'chat.openai.com'
      if (proxyRes.headers['location']) {
        proxyRes.headers['location'] = proxyRes.headers['location'].replace('https://chat.openai.com', req.headers.host);
      }

      // Forward the modified response to the client
      Object.keys(proxyRes.headers).forEach(key => {
        res.setHeader(key, proxyRes.headers[key]);
      });

      res.status(proxyRes.statusCode).send(body);
    });
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).send('Something went wrong while trying to proxy the request.');
  },
}));

// Start the server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Reverse proxy server running on port ${PORT}`);
});
