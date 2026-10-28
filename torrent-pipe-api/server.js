#!/usr/bin/env node

/**
 * Torrent Pipe API Server
 * 
 * A simple HTTP server that accepts torrent data and stores it
 * for the Torrent Pipe Seanime provider.
 * 
 * Usage:
 *   node server.js [port]
 * 
 * Default port: 3456
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.argv[2] || 3456;
const STORAGE_FILE = path.join(__dirname, 'torrents.json');

// Initialize storage file
if (!fs.existsSync(STORAGE_FILE)) {
  fs.writeFileSync(STORAGE_FILE, JSON.stringify({ torrents: [] }, null, 2));
}

// Helper functions
function loadTorrents() {
  try {
    const data = fs.readFileSync(STORAGE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading torrents:', error.message);
    return { torrents: [] };
  }
}

function saveTorrents(data) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving torrents:', error.message);
    return false;
  }
}

function generateId(title) {
  const timestamp = Date.now();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${timestamp}-${slug}`;
}

// Request handler
const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  // GET /torrents - List all torrents
  if (req.method === 'GET' && url.pathname === '/torrents') {
    const data = loadTorrents();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data.torrents));
    return;
  }

  // POST /torrents - Add a new torrent
  if (req.method === 'POST' && url.pathname === '/torrents') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const torrentData = JSON.parse(body);
        
        // Validate required fields
        if (!torrentData.title || (!torrentData.magnet && !torrentData.url)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            error: 'Missing required fields: title and (magnet or url)' 
          }));
          return;
        }

        const data = loadTorrents();
        
        const torrent = {
          id: generateId(torrentData.title),
          title: torrentData.title,
          magnet: torrentData.magnet || '',
          url: torrentData.url || '',
          subOrDub: torrentData.subOrDub || 'both',
          episodes: torrentData.episodes || [],
          addedAt: Date.now(),
        };
        
        data.torrents.push(torrent);
        
        if (saveTorrents(data)) {
          console.log(`Added torrent: ${torrent.title} (${torrent.id})`);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(torrent));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to save torrent' }));
        }
      } catch (error) {
        console.error('Error adding torrent:', error.message);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  // DELETE /torrents/:id - Remove a torrent
  if (req.method === 'DELETE' && url.pathname.startsWith('/torrents/')) {
    const id = url.pathname.split('/')[2];
    const data = loadTorrents();
    const initialLength = data.torrents.length;
    
    data.torrents = data.torrents.filter(t => t.id !== id);
    
    if (data.torrents.length < initialLength) {
      saveTorrents(data);
      console.log(`Removed torrent: ${id}`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Torrent not found' }));
    }
    return;
  }

  // DELETE /torrents - Clear all torrents
  if (req.method === 'DELETE' && url.pathname === '/torrents') {
    saveTorrents({ torrents: [] });
    console.log('Cleared all torrents');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // GET /health - Health check
  if (req.method === 'GET' && url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', torrents: loadTorrents().torrents.length }));
    return;
  }

  // 404 for unknown routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`Torrent Pipe API server listening on http://localhost:${PORT}`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  GET    http://localhost:${PORT}/health`);
  console.log(`  GET    http://localhost:${PORT}/torrents`);
  console.log(`  POST   http://localhost:${PORT}/torrents`);
  console.log(`  DELETE http://localhost:${PORT}/torrents/:id`);
  console.log(`  DELETE http://localhost:${PORT}/torrents`);
  console.log('');
  console.log(`Storage: ${STORAGE_FILE}`);
});
