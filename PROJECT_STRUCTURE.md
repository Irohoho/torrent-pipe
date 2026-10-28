# Project Structure

## Directory Tree

```
torrent-pipe/
├── README.md                      # Main documentation
├── SETUP.md                       # Detailed setup instructions
├── EXAMPLES.md                    # Usage examples
├── PROJECT_STRUCTURE.md           # This file
├── LICENSE                        # MIT License
├── .gitignore                     # Git ignore rules
├── test.sh                        # Test suite script
│
├── torrent-pipe-provider/         # Seanime Provider Plugin
│   ├── provider.js                # Main provider implementation
│   ├── manifest.json              # Provider metadata
│   └── README.md                  # Provider documentation
│
└── torrent-pipe-api/              # API Server & CLI
    ├── server.js                  # HTTP API server
    ├── cli.js                     # Command-line interface
    ├── package.json               # NPM package definition
    ├── README.md                  # API documentation
    └── torrents.json              # Storage file (created at runtime)
```

## Component Overview

### 1. Torrent Pipe Provider

**Purpose**: Seanime extension that exposes torrents as searchable anime sources

**Key Files**:
- `provider.js` - Implements the AnimeProvider interface
- `manifest.json` - Extension metadata for Seanime

**Key Methods**:
```javascript
search(opts)           // Search for anime by title
findEpisodes(id)       // Get episodes for an anime
findEpisodeServer()    // Get video source (magnet link)
addTorrent(data)       // Add a new torrent
removeTorrent(id)      // Remove a torrent
listTorrents()         // List all torrents
clearAllTorrents()     // Clear all torrents
```

**Storage**: Uses Seanime's `$store` API

### 2. Torrent Pipe API Server

**Purpose**: HTTP server for managing torrents

**Port**: 3456 (default)

**Endpoints**:
```
GET    /health              # Health check
GET    /torrents            # List all torrents
POST   /torrents            # Add a torrent
DELETE /torrents/:id        # Remove a specific torrent
DELETE /torrents            # Clear all torrents
```

**Storage**: JSON file (`torrents.json`)

### 3. Torrent Pipe CLI

**Purpose**: Command-line tool for managing torrents

**Commands**:
```bash
node cli.js add <title> <magnet> [--sub|--dub|--both]
node cli.js list
node cli.js remove <id>
node cli.js clear
```

**API URL**: Configurable via `TORRENT_PIPE_API` environment variable

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        Data Flow                             │
└─────────────────────────────────────────────────────────────┘

1. Adding a Torrent:
   
   User Input
      │
      ├─── CLI Command ────────────┐
      │                             │
      └─── HTTP API Call ──────────┤
                                    │
                                    ▼
                            ┌───────────────┐
                            │  API Server   │
                            │   (server.js) │
                            └───────┬───────┘
                                    │
                                    ▼
                            ┌───────────────┐
                            │ torrents.json │
                            │   (storage)   │
                            └───────────────┘


2. Using in Seanime:

   Seanime UI (Search)
      │
      ▼
   ┌──────────────────┐
   │ Torrent Pipe     │
   │ Provider         │
   │ (provider.js)    │
   └────────┬─────────┘
            │
            ├─── Read from $store ───┐
            │                         │
            └─── OR ──────────────────┤
                                      │
            ┌─── Fetch from API ──────┘
            │
            ▼
   Return magnet links to Seanime
      │
      ▼
   User clicks → Torrent Client opens
```

## Storage Architecture

### Current Implementation

The provider and API use **separate storage**:

```
Provider Storage:          API Storage:
┌─────────────────┐       ┌─────────────────┐
│   Seanime       │       │  torrents.json  │
│   $store API    │       │   (filesystem)  │
│                 │       │                 │
│ - In-memory     │       │ - Persistent    │
│ - Persistent    │       │ - File-based    │
│ - Per-provider  │       │ - Shared        │
└─────────────────┘       └─────────────────┘
        │                          │
        │                          │
    provider.js                server.js
                                   │
                                   └──── cli.js
```

### Recommended Integration

For seamless integration, modify the provider to fetch from the API:

```
┌─────────────────────────────────────┐
│           Single Source             │
│                                     │
│        torrents.json                │
│                                     │
│  ┌────────────┬────────────┐       │
│  │            │            │       │
│  ▼            ▼            ▼       │
│ API       Provider      CLI        │
└─────────────────────────────────────┘
```

## File Formats

### torrents.json Structure

```json
{
  "torrents": [
    {
      "id": "1234567890-anime-title",
      "title": "Anime Title",
      "magnet": "magnet:?xt=urn:btih:...",
      "url": "https://...",
      "subOrDub": "sub",
      "episodes": [
        {
          "number": 1,
          "title": "Episode 1",
          "magnet": "magnet:?xt=..."
        }
      ],
      "addedAt": 1234567890000
    }
  ]
}
```

### manifest.json Structure

```json
{
  "id": "torrent-pipe",
  "name": "Torrent Pipe",
  "description": "...",
  "manifestURI": "https://raw.githubusercontent.com/.../manifest.json",
  "version": "1.0.0",
  "author": "Custom",
  "type": "onlinestream-provider",
  "language": "javascript",
  "lang": "en",
  "icon": "",
  "website": "",
  "payloadURI": "https://raw.githubusercontent.com/.../provider.js"
}
```

## API Reference

### Provider API

Based on Seanime's `AnimeProvider` interface:

```typescript
interface AnimeProvider {
  search(opts: SearchOptions): Promise<SearchResult[]>
  findEpisodes(id: string): Promise<EpisodeDetails[]>
  findEpisodeServer(episode: EpisodeDetails, server: string): Promise<EpisodeServer>
  getSettings(): Settings
}
```

### HTTP API

**Request Format:**
```http
POST /torrents HTTP/1.1
Content-Type: application/json

{
  "title": "Anime Title",
  "magnet": "magnet:?xt=...",
  "subOrDub": "sub",
  "episodes": []
}
```

**Response Format:**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "1234567890-anime-title",
  "title": "Anime Title",
  "magnet": "magnet:?xt=...",
  "url": "",
  "subOrDub": "sub",
  "episodes": [],
  "addedAt": 1234567890000
}
```

## Dependencies

### Provider
- No external dependencies
- Uses Seanime's built-in APIs:
  - `$store` - Persistent storage
  - `fetch` - HTTP requests
  - `console` - Logging

### API Server
- **Node.js** - Runtime
- **http** - Built-in HTTP server (no Express needed)
- **fs** - File system access

### CLI
- **Node.js** - Runtime
- **http** - Built-in HTTP client

## Extension Points

### Adding Features

**1. RSS Feed Support**
```javascript
// Add to provider.js
async importFromRSS(feedUrl) {
  const response = await fetch(feedUrl);
  const xml = await response.text();
  // Parse XML and extract torrents
  // Add each torrent using addTorrent()
}
```

**2. Automatic Quality Detection**
```javascript
// Add to provider.js
detectQuality(title) {
  if (title.includes('1080p')) return '1080p';
  if (title.includes('720p')) return '720p';
  if (title.includes('4K')) return '4K';
  return 'Unknown';
}
```

**3. Web UI**
```javascript
// Create a new Express app
// Serve HTML form to add torrents
// Call API endpoints
```

## Deployment Options

### Option 1: Local Development
```
[Your Machine]
  ├── API Server (localhost:3456)
  ├── Seanime with Provider
  └── CLI for management
```

### Option 2: Remote API
```
[Remote Server]
  └── API Server (0.0.0.0:3456)

[Your Machine]
  ├── Seanime with Provider (fetch from remote)
  └── CLI configured for remote API
```

### Option 3: Docker Container
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY torrent-pipe-api/ .
EXPOSE 3456
CMD ["node", "server.js"]
```

## Security Considerations

1. **API Server**: Currently has no authentication
   - Add API keys if exposing publicly
   - Use HTTPS in production

2. **Magnet Links**: Treat as user-provided data
   - Validate format before storing
   - Sanitize for display

3. **File Storage**: `torrents.json` is world-readable
   - Set appropriate file permissions
   - Consider encryption for sensitive data

## Performance Notes

- **Storage**: JSON file is read/written on each operation
  - Consider SQLite for larger datasets
  - Add caching for read-heavy workloads

- **Search**: Linear search through all torrents
  - Add indexing for large collections
  - Consider full-text search (like MiniSearch)

- **API**: Single-threaded Node.js
  - Sufficient for personal use
  - Scale with clustering or load balancer if needed

## Future Enhancements

- [ ] Database backend (SQLite/PostgreSQL)
- [ ] Web UI for management
- [ ] RSS feed auto-import
- [ ] Torrent health tracking
- [ ] Integration with torrent clients
- [ ] Episode progress tracking
- [ ] Automatic metadata from AniList/MAL
- [ ] Multi-user support with auth
- [ ] Torrent streaming support
- [ ] Mobile app

## Contributing

See the main README.md for contribution guidelines.

## Related Documentation

- [Main README](./README.md)
- [Setup Guide](./SETUP.md)
- [Usage Examples](./EXAMPLES.md)
- [Provider README](./torrent-pipe-provider/README.md)
- [API README](./torrent-pipe-api/README.md)
