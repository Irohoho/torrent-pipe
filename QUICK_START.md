# Quick Start Guide

Get up and running with Torrent Pipe in 5 minutes.

## Prerequisites Check

```bash
# Check Node.js
node --version  # Should be v14 or higher

# Check if you're in the right directory
pwd  # Should show: /home/acika/Repositories/torrent-pipe
```

## 1. Test the Installation (30 seconds)

```bash
# Run the test suite
./test.sh
```

Expected output: "All critical tests passed! ✓"

## 2. Start the API Server (1 minute)

```bash
# Open a terminal and start the server
cd torrent-pipe-api
node server.js
```

You should see:
```
Torrent Pipe API server listening on http://localhost:3456
```

**Keep this terminal open!**

## 3. Add Your First Torrent (1 minute)

Open a **new terminal**:

```bash
cd /home/acika/Repositories/torrent-pipe/torrent-pipe-api

# Add a test torrent
node cli.js add "Test Anime" "magnet:?xt=urn:btih:TESTMAGNETLINK123" --sub

# Verify it was added
node cli.js list
```

You should see your torrent listed!

## 4. Set Up GitHub Hosting (2 minutes)

### Option A: Quick GitHub Setup

```bash
# Make sure you're in the project root
cd /home/acika/Repositories/torrent-pipe

# Initialize git (if not already done)
git init

# Create .gitignore is already there
# Now add your files
git add .
git commit -m "Initial commit: Torrent Pipe for Seanime"
```

### Create Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `torrent-pipe` (or any name you like)
3. **Don't** initialize with README (you already have one)
4. Click "Create repository"

### Push to GitHub

```bash
# Add your GitHub repo as remote (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/torrent-pipe.git

# Push
git branch -M main
git push -u origin main
```

### Update Manifest URLs

Edit `torrent-pipe-provider/manifest.json`:

```bash
# Replace YOUR-USERNAME with your actual GitHub username
nano torrent-pipe-provider/manifest.json
```

Change:
```json
"manifestURI": "https://raw.githubusercontent.com/YOUR-USERNAME/torrent-pipe/main/torrent-pipe-provider/manifest.json",
"payloadURI": "https://raw.githubusercontent.com/YOUR-USERNAME/torrent-pipe/main/torrent-pipe-provider/provider.js"
```

Save and commit:
```bash
git add torrent-pipe-provider/manifest.json
git commit -m "Update manifest URLs"
git push
```

## 5. Add to Seanime (1 minute)

1. **Open Seanime**

2. **Navigate to Extensions**

3. **Click "Add extensions"**

4. **Paste your manifest URL**:
   ```
   https://raw.githubusercontent.com/YOUR-USERNAME/torrent-pipe/main/torrent-pipe-provider/manifest.json
   ```

5. **Click Add/Install**

Done! The Torrent Pipe provider should now be installed.

## 6. Test in Seanime (30 seconds)

1. Go to the search in Seanime
2. Search for "Test Anime" (or whatever you named your torrent)
3. You should see it in the results from the Torrent Pipe provider!

## Common Issues & Fixes

### "Cannot connect to API"
```bash
# Check if server is running
curl http://localhost:3456/health

# If not, restart it:
cd torrent-pipe-api
node server.js
```

### "Provider not showing in Seanime"
- Verify the manifest URL is correct and accessible
- Check that you pushed the files to GitHub
- Try removing and re-adding the provider
- Check Seanime logs for errors

### "Torrents not appearing in search"
```bash
# Verify torrents are stored
node cli.js list

# Check the API
curl http://localhost:3456/torrents
```

## Next Steps

### Add Real Torrents

Replace the test torrent with real ones:

```bash
# Remove test torrent
node cli.js remove <id-from-list>

# Add real torrents
node cli.js add "Attack on Titan S1" "magnet:?xt=urn:btih:REAL_MAGNET" --sub
```

### Keep Server Running

Use systemd or run in background:

```bash
# Background (simple)
cd torrent-pipe-api
nohup node server.js &

# Or use screen/tmux
screen -S torrent-pipe
node server.js
# Press Ctrl+A then D to detach
```

### Add More Features

Check out:
- [EXAMPLES.md](./EXAMPLES.md) - More usage examples
- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Technical details

## Full Workflow Example

```bash
# 1. Start server (terminal 1)
cd /home/acika/Repositories/torrent-pipe/torrent-pipe-api
node server.js

# 2. Add torrents (terminal 2)
cd /home/acika/Repositories/torrent-pipe/torrent-pipe-api
node cli.js add "Frieren E10" "magnet:?xt=urn:btih:XYZ" --sub

# 3. Search in Seanime
# Open Seanime → Search "Frieren" → See your torrent!

# 4. Get magnet link
# Click on the result → Copy magnet link → Use in torrent client

# 5. Clean up when done
node cli.js remove <id>
```

## Tips

- **Descriptive titles**: Use `[SubsPlease] Anime - Episode [1080p]` format
- **Organize**: Prefix with quality tags like `[4K]` or `[HEVC]`
- **Backup**: Copy `torrents.json` regularly
- **Monitor**: Check `curl http://localhost:3456/health` periodically

## Getting Help

1. Check the error message carefully
2. Review the relevant README:
   - [Main README](./README.md)
   - [Provider README](./torrent-pipe-provider/README.md)
   - [API README](./torrent-pipe-api/README.md)
3. Run `./test.sh` to diagnose issues
4. Open an issue on GitHub

---

**You're all set! Happy torrenting! 🚀**
