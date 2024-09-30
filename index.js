const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Proxy all requests to OpenAI's ChatGPT
app.use('/', createProxyMiddleware({
  target: 'https://chat.openai.com',
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).send('Something went wrong while trying to proxy the request.');
  },
}));

// Start the server
const PORT = process.env.PORT || 10000; // Use Render's port
app.listen(PORT, () => {
  console.log(`Reverse proxy server running on port ${PORT}`);
});
