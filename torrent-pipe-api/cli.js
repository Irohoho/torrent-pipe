#!/usr/bin/env node

/**
 * Torrent Pipe CLI
 * 
 * Command-line tool to manage torrents for the Torrent Pipe Seanime provider.
 * 
 * Usage:
 *   node cli.js add <title> <magnet|url> [options]
 *   node cli.js list
 *   node cli.js remove <id>
 *   node cli.js clear
 */

const http = require('http');

const API_URL = process.env.TORRENT_PIPE_API || 'http://localhost:3456';

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.error || `HTTP ${res.statusCode}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function addTorrent(args) {
  if (args.length < 2) {
    console.error('Usage: add <title> <magnet|url> [--sub|--dub|--both]');
    process.exit(1);
  }

  const title = args[0];
  const magnetOrUrl = args[1];
  
  let subOrDub = 'both';
  if (args.includes('--sub')) subOrDub = 'sub';
  if (args.includes('--dub')) subOrDub = 'dub';

  const data = {
    title: title,
    subOrDub: subOrDub,
  };

  if (magnetOrUrl.startsWith('magnet:')) {
    data.magnet = magnetOrUrl;
  } else {
    data.url = magnetOrUrl;
  }

  try {
    const result = await request('POST', '/torrents', data);
    console.log('✓ Torrent added successfully!');
    console.log(`  ID: ${result.id}`);
    console.log(`  Title: ${result.title}`);
    console.log(`  Type: ${result.subOrDub}`);
    console.log(`  Link: ${result.magnet || result.url}`);
  } catch (error) {
    console.error('✗ Failed to add torrent:', error.message);
    process.exit(1);
  }
}

async function listTorrents() {
  try {
    const torrents = await request('GET', '/torrents');
    
    if (torrents.length === 0) {
      console.log('No torrents found.');
      return;
    }

    console.log(`Found ${torrents.length} torrent(s):\n`);
    
    torrents.forEach((torrent, index) => {
      console.log(`${index + 1}. ${torrent.title}`);
      console.log(`   ID: ${torrent.id}`);
      console.log(`   Type: ${torrent.subOrDub}`);
      console.log(`   Link: ${(torrent.magnet || torrent.url).substring(0, 60)}...`);
      console.log(`   Episodes: ${torrent.episodes.length || 'batch'}`);
      console.log(`   Added: ${new Date(torrent.addedAt).toLocaleString()}`);
      console.log('');
    });
  } catch (error) {
    console.error('✗ Failed to list torrents:', error.message);
    process.exit(1);
  }
}

async function removeTorrent(args) {
  if (args.length < 1) {
    console.error('Usage: remove <id>');
    process.exit(1);
  }

  const id = args[0];

  try {
    await request('DELETE', `/torrents/${id}`);
    console.log('✓ Torrent removed successfully!');
  } catch (error) {
    console.error('✗ Failed to remove torrent:', error.message);
    process.exit(1);
  }
}

async function clearTorrents() {
  try {
    await request('DELETE', '/torrents');
    console.log('✓ All torrents cleared successfully!');
  } catch (error) {
    console.error('✗ Failed to clear torrents:', error.message);
    process.exit(1);
  }
}

function printUsage() {
  console.log('Torrent Pipe CLI');
  console.log('');
  console.log('Usage:');
  console.log('  node cli.js add <title> <magnet|url> [--sub|--dub|--both]');
  console.log('  node cli.js list');
  console.log('  node cli.js remove <id>');
  console.log('  node cli.js clear');
  console.log('');
  console.log('Examples:');
  console.log('  node cli.js add "My Anime" "magnet:?xt=urn:btih:..." --sub');
  console.log('  node cli.js list');
  console.log('  node cli.js remove 1234567890-my-anime');
  console.log('');
  console.log('Environment:');
  console.log(`  TORRENT_PIPE_API: ${API_URL} (default: http://localhost:3456)`);
}

// Main
const command = process.argv[2];
const args = process.argv.slice(3);

(async () => {
  try {
    switch (command) {
      case 'add':
        await addTorrent(args);
        break;
      case 'list':
        await listTorrents();
        break;
      case 'remove':
        await removeTorrent(args);
        break;
      case 'clear':
        await clearTorrents();
        break;
      case 'help':
      case '--help':
      case '-h':
      case undefined:
        printUsage();
        break;
      default:
        console.error(`Unknown command: ${command}`);
        printUsage();
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
