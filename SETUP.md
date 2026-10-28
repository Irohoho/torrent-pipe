# Setup Guide for Torrent Pipe

Complete setup guide for getting Torrent Pipe working with Seanime.

## Prerequisites

- ✅ Seanime installed and running
- ✅ Node.js installed (for API server)
- ✅ GitHub account (for hosting the provider)
- ✅ Git installed

## Step-by-Step Setup

### Step 1: Host the Provider on GitHub

#### Option A: Use Your Own Repository

1. **Create a new repository** on GitHub:
   ```bash
   # Initialize if not already done
   cd /home/acika/Repositories/torrent-pipe
   git init
   git add .
   git commit -m "Initial commit: Torrent Pipe provider for Seanime"
   ```

2. **Create a new repository** on GitHub.com:
   - Go to https://github.com/new
   - Name it: `torrent-pipe` (or your preferred name)
   - Don't initialize with README (you already have one)

3. **Push your code**:
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/torrent-pipe.git
   git branch -M main
   git push -u origin main
   ```

4. **Update the manifest.json**:
   Edit `torrent-pipe-provider/manifest.json` and replace `YOUR-USERNAME` and `YOUR-REPO`:
   ```json
   {
     "manifestURI": "https://raw.githubusercontent.com/YOUR-USERNAME/torrent-pipe/main/torrent-pipe-provider/manifest.json",
     "payloadURI": "https://raw.githubusercontent.com/YOUR-USERNAME/torrent-pipe/main/torrent-pipe-provider/provider.js"
   }
   ```

5. **Commit and push the update**:
   ```bash
   git add torrent-pipe-provider/manifest.json
   git commit -m "Update manifest URLs"
   git push
   ```

#### Option B: Fork the Seanime-Providers Repository

1. Fork https://github.com/Seanime-contributions/Seanime-Providers
2. Clone your fork
3. Copy the `torrent-pipe-provider` folder into the appropriate location
4. Update the manifest URLs to point to your fork
5. Commit and push

### Step 2: Add Provider to Seanime

1. **Open Seanime**

2. **Navigate to Extensions**:
   - Look for the Extensions tab/section

3. **Add the extension**:
   - Click "Add extensions" or similar button
   - Paste your manifest URL:
     ```
     https://raw.githubusercontent.com/YOUR-USERNAME/torrent-pipe/main/torrent-pipe-provider/manifest.json
     ```
   - Click Add/Install

4. **Verify installation**:
   - The provider should appear in your list of extensions
   - Check for any error messages

### Step 3: Set Up the API Server

1. **Navigate to the API directory**:
   ```bash
   cd /home/acika/Repositories/torrent-pipe/torrent-pipe-api
   ```

2. **Start the server**:
   ```bash
   node server.js
   ```

   You should see:
   ```
   Torrent Pipe API server listening on http://localhost:3456
   
   Available endpoints:
     GET    http://localhost:3456/health
     GET    http://localhost:3456/torrents
     POST   http://localhost:3456/torrents
     DELETE http://localhost:3456/torrents/:id
     DELETE http://localhost:3456/torrents
   
   Storage: /home/acika/Repositories/torrent-pipe/torrent-pipe-api/torrents.json
   ```

3. **Test the server** (in another terminal):
   ```bash
   curl http://localhost:3456/health
   ```

   Expected response:
   ```json
   {"status":"ok","torrents":0}
   ```

### Step 4: Add Your First Torrent

#### Using the CLI:

```bash
cd /home/acika/Repositories/torrent-pipe/torrent-pipe-api

# Add a torrent
node cli.js add "Test Anime" "magnet:?xt=urn:btih:TEST123" --sub

# List torrents
node cli.js list
```

#### Using curl:

```bash
curl -X POST http://localhost:3456/torrents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Anime",
    "magnet": "magnet:?xt=urn:btih:TEST123",
    "subOrDub": "sub"
  }'
```

### Step 5: Integration with Seanime Provider

**Important**: The provider and API currently use separate storage systems. To bridge them:

#### Option A: Modify Provider to Use API (Recommended)

Edit `torrent-pipe-provider/provider.js` to fetch from the API instead of using `$store`:

```javascript
async search(opts) {
  try {
    const response = await fetch('http://localhost:3456/torrents');
    const torrents = await response.json();
    
    // ... rest of search logic using torrents array
  } catch (error) {
    console.log(`Error fetching torrents: ${error.message}`);
    return [];
  }
}
```

#### Option B: Create a Sync Plugin

Create a Seanime plugin that periodically syncs the API's `torrents.json` with the provider's `$store`.

#### Option C: Manual Testing via Console

For now, you can test by manually adding torrents via the browser console when Seanime is open:

```javascript
// Open browser dev tools in Seanime
// Access the provider instance (this depends on Seanime's architecture)
// Call provider.addTorrent(data)
```

### Step 6: Test in Seanime

1. **Restart Seanime** (if needed)

2. **Search for your anime**:
   - Use the search functionality
   - Look for results from "Torrent Pipe" provider

3. **Select and use**:
   - Click on the result
   - The magnet link should be available

## Troubleshooting

### Provider Not Showing in Seanime

- ✓ Check that the manifest URL is correct and accessible
- ✓ Verify the manifest.json syntax is valid
- ✓ Check Seanime logs for errors
- ✓ Try removing and re-adding the provider

### API Server Not Starting

- ✓ Check if port 3456 is already in use
- ✓ Try a different port: `node server.js 8080`
- ✓ Check Node.js is installed: `node --version`

### Torrents Not Appearing in Searches

- ✓ Verify torrents are stored: `node cli.js list`
- ✓ Check the search terms match the torrent titles
- ✓ Review provider logs in Seanime console
- ✓ Ensure storage is properly integrated (see Step 5)

### Magnet Links Not Working

- ✓ Ensure you have a torrent client installed
- ✓ Check that your system handles `magnet:` URLs
- ✓ Verify the magnet link format is correct
- ✓ Seanime may need additional configuration for magnet handling

## Advanced Configuration

### Running Server as a Service

#### Using systemd (Linux):

Create `/etc/systemd/system/torrent-pipe.service`:

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

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable torrent-pipe
sudo systemctl start torrent-pipe
sudo systemctl status torrent-pipe
```

### Custom Port

```bash
# Server
node server.js 8080

# CLI with custom API URL
export TORRENT_PIPE_API=http://localhost:8080
node cli.js list
```

### Remote API Access

To access the API from other machines, bind to 0.0.0.0:

Edit `server.js`:
```javascript
server.listen(PORT, '0.0.0.0', () => {
  // ...
});
```

**Security Warning**: Only do this on trusted networks!

## Next Steps

1. ✅ Add your real torrents
2. ✅ Integrate provider with API (see Step 5)
3. ✅ Create a Seanime plugin for better UX
4. ✅ Set up the server as a service for persistent running
5. ✅ Customize the provider icon and metadata

## Getting Help

- Check the [main README](./README.md)
- Review [provider documentation](./torrent-pipe-provider/README.md)
- Review [API documentation](./torrent-pipe-api/README.md)
- Open an issue on GitHub

---

Good luck! 🚀
