# Torrent Pipe for Seanime

A custom Seanime provider plugin that enables you to pipe custom magnet links or torrents directly into Seanime to hook up as a provider.

## 📦 What's Included

This repository contains:

1. **torrent-pipe-provider** - The Seanime provider plugin
2. **torrent-pipe-api** - API server and CLI tool for managing torrents

## 🚀 Quick Start

### 1. Set Up the Provider

1. **Host the provider files** on GitHub:
   - Fork or clone this repository
   - Upload to your GitHub account

2. **Update manifest URLs** in `torrent-pipe-provider/manifest.json`:
   ```json
   {
     "manifestURI": "https://raw.githubusercontent.com/YOUR-USERNAME/torrent-pipe/main/torrent-pipe-provider/manifest.json",
     "payloadURI": "https://raw.githubusercontent.com/YOUR-USERNAME/torrent-pipe/main/torrent-pipe-provider/provider.js"
   }
   ```

3. **Add to Seanime**:
   - Open Seanime
   - Go to **Extensions** tab
   - Click **Add extensions**
   - Paste your manifest URL

### 2. Start Managing Torrents

#### Using the API Server + CLI

```bash
# Start the server
cd torrent-pipe-api
node server.js

# In another terminal, add torrents
node cli.js add "Attack on Titan S1" "magnet:?xt=urn:btih:..." --sub
node cli.js add "Demon Slayer" "magnet:?xt=..." --both

# List your torrents
node cli.js list

# Remove a torrent
node cli.js remove <id>
```

#### Using HTTP API Directly

```bash
# Add a torrent
curl -X POST http://localhost:3456/torrents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Anime",
    "magnet": "magnet:?xt=urn:btih:...",
    "subOrDub": "sub"
  }'

# List torrents
curl http://localhost:3456/torrents
```

## 🔧 How It Works

```
┌─────────────────┐
│   Your CLI      │  Add torrents via CLI
│   or API Call   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Torrent Pipe   │  Stores torrents in
│   API Server    │  torrents.json
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Seanime      │  Provider reads torrents
│    Provider     │  and makes them searchable
└─────────────────┘
         │
         ▼
┌─────────────────┐
│    Seanime      │  Search and access your
│      UI         │  custom torrents
└─────────────────┘
```

## 📖 Documentation

- [Provider README](./torrent-pipe-provider/README.md) - Detailed provider documentation
- [API README](./torrent-pipe-api/README.md) - API and CLI documentation

## 🎯 Features

- ✅ Add custom magnet links or torrent URLs
- ✅ Store multiple torrents locally
- ✅ Search through your piped torrents in Seanime
- ✅ Support for both sub and dub
- ✅ Single-file or multi-episode torrents
- ✅ CLI tool for easy torrent management
- ✅ HTTP API for programmatic access
- ✅ Persistent storage

## 🔍 Use Cases

1. **Personal Collection**: Manage anime you've downloaded
2. **Private Trackers**: Add torrents from private trackers not supported by standard providers
3. **Specific Release Groups**: Follow fansub groups or specific encoders
4. **Custom Quality**: Add torrents with specific quality/codec preferences
5. **Offline Viewing**: Track torrents you want to download for offline viewing

## 📋 Requirements

- [Seanime](https://github.com/5rahim/seanime) installed and running
- Node.js (for the API server and CLI)
- A way to host the provider files (GitHub recommended)

## 🛠️ Installation

### Provider Installation

1. **Upload files to GitHub:**
   ```bash
   git clone https://github.com/Seanime-contributions/Seanime-Providers
   cd Seanime-Providers
   # Copy the torrent-pipe-provider folder here
   git add .
   git commit -m "Add Torrent Pipe provider"
   git push
   ```

2. **Add to Seanime:**
   - Navigate to Extensions in Seanime
   - Add extension using the manifest URL

### API/CLI Installation

```bash
cd torrent-pipe-api
npm install -g .
```

Or use directly without installing:
```bash
node server.js
node cli.js
```

## 📝 Usage Examples

### Example 1: Adding a Batch Torrent

```bash
node cli.js add "Cowboy Bebop Complete" "magnet:?xt=urn:btih:ABC123..." --sub
```

This adds the entire series as a single batch torrent.

### Example 2: Adding Individual Episodes

Via API:
```bash
curl -X POST http://localhost:3456/torrents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Steins;Gate",
    "magnet": "magnet:?xt=urn:btih:...",
    "subOrDub": "both",
    "episodes": [
      {
        "number": 1,
        "title": "Turning Point",
        "magnet": "magnet:?xt=urn:btih:EP1..."
      },
      {
        "number": 2,
        "title": "Time Travel Paranoia",
        "magnet": "magnet:?xt=urn:btih:EP2..."
      }
    ]
  }'
```

### Example 3: Searching in Seanime

1. Start the API server
2. Add your torrents
3. Open Seanime
4. Search for your anime title
5. The Torrent Pipe provider will show your torrents!

## ⚠️ Important Notes

### Magnet Link Handling

Seanime is primarily designed for streaming providers. The magnet links are exposed as "video sources" but Seanime itself doesn't download or stream torrents. You'll need:

- A torrent client configured to handle magnet links
- Or a torrent streaming service
- Or integration with a download manager

### Storage Synchronization

Currently, the provider uses Seanime's internal storage (`$store`), which is separate from the API's `torrents.json` file. To fully integrate:

1. **Option A**: Modify the provider to read from a shared JSON file
2. **Option B**: Create a Seanime plugin that syncs with the API
3. **Option C**: Use the provider's built-in methods via console

See the provider README for integration details.

## 🔮 Future Enhancements

- [ ] RSS feed support for automatic torrent discovery
- [ ] Integration with popular torrent trackers
- [ ] Automatic episode detection from torrent names
- [ ] Quality and resolution filtering
- [ ] Seeder/leecher information
- [ ] Torrent health monitoring
- [ ] Web UI for torrent management
- [ ] Seanime plugin for seamless integration

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📄 License

MIT

## 🙏 Credits

- [Seanime](https://github.com/5rahim/seanime) by [5rahim](https://github.com/5rahim)
- [Seanime-Providers](https://github.com/Seanime-contributions/Seanime-Providers) community

## 📞 Support

- Open an issue on GitHub
- Check the documentation in each subfolder
- Review the Seanime provider documentation

---

**Note**: This is a custom provider plugin for personal use. Ensure you comply with your local laws and the terms of service of any torrent trackers you use.
