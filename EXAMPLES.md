# Usage Examples

Practical examples for using Torrent Pipe with Seanime.

## Basic Examples

### Example 1: Add a Single Batch Torrent

Add a complete season as a single torrent:

```bash
node cli.js add "Attack on Titan Season 1" \
  "magnet:?xt=urn:btih:1234567890abcdef" \
  --sub
```

### Example 2: Add with Dual Audio

```bash
node cli.js add "Cowboy Bebop Complete Series" \
  "magnet:?xt=urn:btih:abcdef1234567890" \
  --both
```

### Example 3: Using HTTP API

```bash
curl -X POST http://localhost:3456/torrents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Steins;Gate",
    "magnet": "magnet:?xt=urn:btih:xyz789abc123",
    "subOrDub": "sub"
  }'
```

## Advanced Examples

### Example 4: Multi-Episode Torrent

Add a torrent with individual episodes:

```bash
curl -X POST http://localhost:3456/torrents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Death Note",
    "magnet": "magnet:?xt=urn:btih:mainbatch",
    "subOrDub": "both",
    "episodes": [
      {
        "number": 1,
        "title": "Rebirth",
        "magnet": "magnet:?xt=urn:btih:ep01"
      },
      {
        "number": 2,
        "title": "Confrontation",
        "magnet": "magnet:?xt=urn:btih:ep02"
      },
      {
        "number": 3,
        "title": "Dealings",
        "magnet": "magnet:?xt=urn:btih:ep03"
      }
    ]
  }'
```

### Example 5: Bulk Import from File

Create a JSON file with multiple torrents:

**torrents-import.json:**
```json
[
  {
    "title": "One Punch Man S1",
    "magnet": "magnet:?xt=urn:btih:opm1",
    "subOrDub": "sub"
  },
  {
    "title": "One Punch Man S2",
    "magnet": "magnet:?xt=urn:btih:opm2",
    "subOrDub": "sub"
  },
  {
    "title": "Mob Psycho 100",
    "magnet": "magnet:?xt=urn:btih:mp100",
    "subOrDub": "dub"
  }
]
```

Import script:
```bash
#!/bin/bash

# Import multiple torrents from JSON file
for row in $(cat torrents-import.json | jq -c '.[]'); do
  curl -X POST http://localhost:3456/torrents \
    -H "Content-Type: application/json" \
    -d "$row"
  echo ""
done
```

### Example 6: Quality-Specific Collections

Organize torrents by quality:

```bash
# 4K Collection
node cli.js add "[4K] Your Name" "magnet:?xt=..." --both
node cli.js add "[4K] Weathering With You" "magnet:?xt=..." --both

# HEVC/x265 Collection
node cli.js add "[HEVC] Naruto Shippuden" "magnet:?xt=..." --sub

# BD Remux Collection
node cli.js add "[BD Remux] Violet Evergarden" "magnet:?xt=..." --both
```

### Example 7: Release Group Following

Track specific fansub or release groups:

```bash
# SubsPlease releases
node cli.js add "[SubsPlease] Spy x Family - 01" "magnet:?xt=..." --sub
node cli.js add "[SubsPlease] Spy x Family - 02" "magnet:?xt=..." --sub

# Judas releases (mini-encodes)
node cli.js add "[Judas] Demon Slayer S3" "magnet:?xt=..." --sub
```

## Management Examples

### Example 8: List All Torrents

```bash
node cli.js list
```

Output:
```
Found 3 torrent(s):

1. Attack on Titan Season 1
   ID: 1234567890-attack-on-titan-season-1
   Type: sub
   Link: magnet:?xt=urn:btih:1234567890abcdef...
   Episodes: batch
   Added: 10/28/2026, 2:30:45 PM

2. Cowboy Bebop Complete Series
   ID: 1234567891-cowboy-bebop-complete-series
   Type: both
   Link: magnet:?xt=urn:btih:abcdef1234567890...
   Episodes: batch
   Added: 10/28/2026, 2:35:12 PM

3. Death Note
   ID: 1234567892-death-note
   Type: both
   Link: magnet:?xt=urn:btih:mainbatch...
   Episodes: 3
   Added: 10/28/2026, 2:40:33 PM
```

### Example 9: Remove a Torrent

```bash
node cli.js remove 1234567890-attack-on-titan-season-1
```

### Example 10: Clear All Torrents

```bash
node cli.js clear
```

## Integration Examples

### Example 11: RSS Feed Auto-Import

Create a script to automatically import from RSS:

**rss-import.sh:**
```bash
#!/bin/bash

# Fetch RSS feed
RSS_URL="https://example-tracker.com/rss"
RSS_DATA=$(curl -s "$RSS_URL")

# Parse and add torrents
# (This is a simplified example - you'd need proper XML parsing)
echo "$RSS_DATA" | grep -o 'magnet:?[^"]*' | while read MAGNET; do
  TITLE=$(echo "$RSS_DATA" | grep -B 5 "$MAGNET" | grep '<title>' | sed 's/<[^>]*>//g')
  
  node cli.js add "$TITLE" "$MAGNET" --sub
done
```

### Example 12: Nyaa.si Integration

Search and add from Nyaa.si:

```bash
#!/bin/bash

# Search term
QUERY="Frieren"

# Fetch search results (simplified)
SEARCH_URL="https://nyaa.si/?page=rss&q=${QUERY}"

# Download RSS and extract magnets
curl -s "$SEARCH_URL" | grep -o 'magnet:?[^"]*' | head -5 | while read MAGNET; do
  # Extract title (you'd parse this properly from XML)
  echo "Adding: $QUERY"
  node cli.js add "$QUERY Latest" "$MAGNET" --sub
done
```

### Example 13: Private Tracker Workflow

For authenticated trackers:

```bash
#!/bin/bash

# Login and get session cookie (tracker-specific)
SESSION_COOKIE="your-session-cookie"

# Fetch torrent with authentication
TORRENT_URL="https://private-tracker.com/download.php?id=12345"

# Download .torrent file
curl -b "$SESSION_COOKIE" "$TORRENT_URL" -o temp.torrent

# Convert .torrent to magnet (requires a tool like transmission-show)
INFO_HASH=$(transmission-show temp.torrent | grep "Hash:" | cut -d' ' -f2)
MAGNET="magnet:?xt=urn:btih:$INFO_HASH"

# Add to Torrent Pipe
node cli.js add "Anime from Private Tracker" "$MAGNET" --sub

# Cleanup
rm temp.torrent
```

## Automation Examples

### Example 14: Systemd Service for Auto-Start

**/etc/systemd/system/torrent-pipe.service:**
```ini
[Unit]
Description=Torrent Pipe API Server
After=network.target

[Service]
Type=simple
User=acika
WorkingDirectory=/home/acika/Repositories/torrent-pipe/torrent-pipe-api
ExecStart=/usr/bin/node /home/acika/Repositories/torrent-pipe/torrent-pipe-api/server.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable torrent-pipe
sudo systemctl start torrent-pipe
```

### Example 15: Cron Job for Regular Updates

Add to crontab:
```bash
# Check RSS feed every hour and import new torrents
0 * * * * /home/acika/scripts/rss-import.sh >> /var/log/torrent-pipe-rss.log 2>&1

# Clean up old torrents every week
0 0 * * 0 /home/acika/scripts/cleanup-old-torrents.sh
```

### Example 16: Webhook Integration

Create a webhook endpoint that triggers on new releases:

**webhook-server.js:**
```javascript
const http = require('http');
const { exec } = require('child_process');

http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';
    
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      
      // Add torrent when webhook is triggered
      const cmd = `node cli.js add "${data.title}" "${data.magnet}" --sub`;
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error('Error:', error);
          res.writeHead(500);
          res.end('Error');
        } else {
          console.log('Added:', data.title);
          res.writeHead(200);
          res.end('OK');
        }
      });
    });
  }
}).listen(3457);
```

## Testing Examples

### Example 17: Test with Mock Data

```bash
# Add test torrents
node cli.js add "Test Anime 1" "magnet:?xt=urn:btih:test1" --sub
node cli.js add "Test Anime 2" "magnet:?xt=urn:btih:test2" --dub
node cli.js add "Test Anime 3" "magnet:?xt=urn:btih:test3" --both

# Verify
curl http://localhost:3456/torrents | jq

# Clean up
node cli.js clear
```

### Example 18: Health Monitoring

```bash
#!/bin/bash

# Check if server is running
if curl -s http://localhost:3456/health | grep -q "ok"; then
  echo "✓ Server is healthy"
  
  # Get torrent count
  COUNT=$(curl -s http://localhost:3456/health | jq '.torrents')
  echo "  Torrents: $COUNT"
else
  echo "✗ Server is down"
  # Restart server or send alert
fi
```

## Real-World Workflow

### Example 19: Complete Workflow

1. **Find anime on tracker:**
   ```bash
   # Search Nyaa for latest episode
   TITLE="Frieren Episode 10"
   MAGNET="magnet:?xt=urn:btih:..."
   ```

2. **Add to Torrent Pipe:**
   ```bash
   node cli.js add "$TITLE" "$MAGNET" --sub
   ```

3. **Search in Seanime:**
   - Open Seanime
   - Search for "Frieren"
   - Provider shows your torrent
   - Click to get magnet link

4. **Download:**
   - Torrent client picks up magnet
   - Episode downloads
   - Watch!

5. **Clean up after watching:**
   ```bash
   # Remove from Torrent Pipe
   node cli.js remove <id>
   ```

## Tips & Tricks

### Use Descriptive Titles

Good:
```bash
node cli.js add "[SubsPlease] Frieren - 10 [1080p]" "magnet:..." --sub
```

Not as good:
```bash
node cli.js add "Frieren 10" "magnet:..." --sub
```

### Organize by Season

```bash
node cli.js add "Attack on Titan S1" "magnet:..." --sub
node cli.js add "Attack on Titan S2" "magnet:..." --sub
node cli.js add "Attack on Titan S3 Part 1" "magnet:..." --sub
node cli.js add "Attack on Titan S3 Part 2" "magnet:..." --sub
```

### Use Environment Variables

```bash
# Set API URL
export TORRENT_PIPE_API=http://localhost:3456

# Now CLI commands use this automatically
node cli.js list
```

### Backup Your Torrents

```bash
# Backup
cp torrent-pipe-api/torrents.json torrents-backup-$(date +%Y%m%d).json

# Restore
cp torrents-backup-20261028.json torrent-pipe-api/torrents.json
```

---

Have more examples? Contribute them back to the project!
