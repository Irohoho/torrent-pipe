# Torrent Pipe API

API server and CLI tool for managing torrents with the Torrent Pipe Seanime provider.

## Installation

```bash
cd torrent-pipe-api
npm install -g .
```

Or run without installing:

```bash
node server.js
node cli.js [command]
```

## Usage

### 1. Start the API Server

```bash
# Default port (3456)
node server.js

# Custom port
node server.js 8080
```

The server will create a `torrents.json` file to store your torrent data.

### 2. Use the CLI to Manage Torrents

**Add a torrent:**
```bash
node cli.js add "Anime Title" "magnet:?xt=urn:btih:..." --sub
node cli.js add "Another Anime" "https://example.com/torrent.torrent" --dub
```

**List all torrents:**
```bash
node cli.js list
```

**Remove a torrent:**
```bash
node cli.js remove <torrent-id>
```

**Clear all torrents:**
```bash
node cli.js clear
```

### 3. Using the HTTP API Directly

**Add a torrent:**
```bash
curl -X POST http://localhost:3456/torrents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Anime",
    "magnet": "magnet:?xt=urn:btih:...",
    "subOrDub": "sub"
  }'
```

**List torrents:**
```bash
curl http://localhost:3456/torrents
```

**Remove a torrent:**
```bash
curl -X DELETE http://localhost:3456/torrents/<id>
```

**Health check:**
```bash
curl http://localhost:3456/health
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/torrents` | List all torrents |
| POST | `/torrents` | Add a new torrent |
| DELETE | `/torrents/:id` | Remove a torrent by ID |
| DELETE | `/torrents` | Clear all torrents |

## Configuration

Set the API URL for the CLI using an environment variable:

```bash
export TORRENT_PIPE_API=http://localhost:3456
```

## Integration with Seanime

1. Start the API server
2. Add torrents using the CLI or API
3. The Torrent Pipe Seanime provider will read from the same `torrents.json` file
4. Search for your torrents in Seanime

**Note:** For this to work, you'll need to modify the Seanime provider to read from the same JSON file instead of using `$store`. See the integration instructions in the provider README.

## Example Workflow

```bash
# Start the server
node server.js &

# Add some torrents
node cli.js add "Attack on Titan S1" "magnet:?xt=..." --sub
node cli.js add "Demon Slayer" "magnet:?xt=..." --both

# List them
node cli.js list

# Use them in Seanime!
```

## Torrent Data Format

```json
{
  "title": "Anime Title",
  "magnet": "magnet:?xt=urn:btih:...",
  "url": "https://example.com/torrent.torrent",
  "subOrDub": "sub",
  "episodes": [
    {
      "number": 1,
      "title": "Episode 1",
      "magnet": "magnet:?xt=..."
    }
  ]
}
```

## License

MIT
