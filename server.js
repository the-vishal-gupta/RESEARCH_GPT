import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Request timeout (10 seconds per API call)
const REQUEST_TIMEOUT = 10000;

// API Endpoints Proxy

// arXiv API
app.get('/api/arxiv', async (req, res) => {
  try {
    const response = await axios.get('https://export.arxiv.org/api/query', {
      params: req.query,
      headers: {
        'User-Agent': 'ResearchGPT (https://github.com/vishal/research-gpt)'
      },
      timeout: REQUEST_TIMEOUT
    });
    res.setHeader('Content-Type', 'application/xml');
    res.send(response.data);
  } catch (error) {
    console.error('arXiv proxy error:', error.message);
    res.status(500).json({
      error: 'arXiv API failed',
      message: error.message
    });
  }
});

// Semantic Scholar API
app.get('/api/semantic', async (req, res) => {
  try {
    const response = await axios.get('https://api.semanticscholar.org/graph/v1/paper/search', {
      params: req.query,
      headers: {
        'User-Agent': 'ResearchGPT (https://github.com/vishal/research-gpt)',
        'Accept': 'application/json'
      },
      timeout: REQUEST_TIMEOUT
    });
    res.json(response.data);
  } catch (error) {
    console.error('Semantic Scholar proxy error:', error.message);
    res.status(500).json({
      error: 'Semantic Scholar API failed',
      message: error.message
    });
  }
});

// CORE API
app.get('/api/core', async (req, res) => {
  try {
    const coreApiKey = process.env.VITE_CORE_API_KEY;
    if (!coreApiKey) {
      return res.status(400).json({
        error: 'CORE API key not configured',
        message: 'Please set VITE_CORE_API_KEY environment variable'
      });
    }

    const response = await axios.get('https://api.core.ac.uk/v3/search/works', {
      params: req.query,
      headers: {
        'Authorization': `Bearer ${coreApiKey}`,
        'User-Agent': 'ResearchGPT (https://github.com/vishal/research-gpt)',
        'Accept': 'application/json'
      },
      timeout: REQUEST_TIMEOUT
    });
    res.json(response.data);
  } catch (error) {
    console.error('CORE API proxy error:', error.message);
    res.status(500).json({
      error: 'CORE API failed',
      message: error.message,
      details: error.response?.data || error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));

  // SPA fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 ResearchGPT is ready to fetch papers!\n`);
});
