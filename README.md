# Manual Torrent Provider for Seanime

**The simplest way to use custom torrents in Seanime.**

Just paste your magnet link or file path directly into Seanime's torrent search, and it instantly becomes available!

## 🎯 What This Does

Instead of searching torrent sites, this provider lets you **manually input** torrents in three ways:

1. **Magnet Links**: `magnet:?xt=urn:btih:ABC123...`
2. **Torrent File Paths**: `/home/user/downloads/anime.torrent`
3. **Info Hashes**: `ABC123DEF456...` (converted to magnet automatically)

## 🚀 Installation

### 1. Upload to GitHub

```bash
cd /home/acika/Repositories/torrent-pipe

git init
git add .
git commit -m "Add Manual Torrent provider"

# Using gh CLI:
gh repo create torrent-pipe --public --source=. --push
```

### 2. Update manifest.json

Replace `YOUR-USERNAME` with your GitHub username:

```json
{
  "manifestURI": "https://raw.githubusercontent.com/YOUR-USERNAME/torrent-pipe/main/manifest.json",
  "payloadURI": "https://raw.githubusercontent.com/YOUR-USERNAME/torrent-pipe/main/provider.js"
}
```

Commit and push:
```bash
git add manifest.json
git commit -m "Update URLs"
git push
```

### 3. Add to Seanime

1. Open Seanime
2. Go to **Settings** → **Extensions**
3. Click **"Add Extension"**
4. Paste your manifest URL:
   ```
   https://raw.githubusercontent.com/YOUR-USERNAME/torrent-pipe/main/manifest.json
   ```
5. Install!

## 📖 Usage

### Example 1: Paste a Magnet Link

1. Find a torrent on Nyaa.si or your tracker
2. Copy the magnet link: `magnet:?xt=urn:btih:ABC123...`
3. In Seanime, go to an anime's page
4. Open the torrent search/downloader
5. **Paste the entire magnet link** into the search box
6. Hit search
7. The "Manual Torrent" provider returns your magnet
8. Select it and stream/download!

### Example 2: Use a Local .torrent File

1. Download a .torrent file to `/home/user/anime.torrent`
2. In Seanime's torrent search, paste the path:
   ```
   /home/user/anime.torrent
   ```
3. Search
4. Select and use!

### Example 3: Paste Just the Info Hash

1. Copy just the hash: `ABC123DEF456...`
2. Paste it in Seanime's search
3. Provider converts it to a magnet automatically

## ✨ Features

- ✅ **Zero configuration** - no API server, no CLI, no database
- ✅ **Instant results** - no scraping or network requests
- ✅ **Supports magnet links, file paths, and info hashes**
- ✅ **Automatically extracts metadata** from filenames (resolution, episode, release group)
- ✅ **Works with debrid services** and torrent streaming
- ✅ **Simple and lightweight**

## 🔍 How It Works

```
You paste:  magnet:?xt=urn:btih:ABC123&dn=[SubsPlease]+Frieren+-+10+[1080p]
             ↓
Provider extracts:
  - Name: "[SubsPlease] Frieren - 10 [1080p]"
  - Info Hash: ABC123
  - Resolution: 1080p
  - Episode: 10
  - Release Group: SubsPlease
             ↓
Returns as torrent result
             ↓
Seanime displays it
             ↓
You click to stream/download!
```

## 🎬 Real Workflow Example

```
1. You're watching "Frieren" on Seanime

2. New episode drops, you find it on Nyaa:
   "[SubsPlease] Frieren - 11 [1080p].mkv"
   magnet:?xt=urn:btih:XYZ789...

3. In Seanime, click to download episode 11

4. Seanime shows torrent search dialog

5. Instead of searching, you PASTE the magnet link

6. Manual Torrent provider instantly returns it

7. Click "Download" or "Stream"

8. Done! 🎉
```

## 📝 Supported Formats

### Magnet Links
```
magnet:?xt=urn:btih:ABC123DEF456...
magnet:?xt=urn:btih:ABC123&dn=Anime+Name&tr=tracker...
```

### File Paths
```
Linux/Mac:
/home/user/downloads/anime.torrent
~/downloads/anime.torrent
../anime.torrent

Windows:
C:\Downloads\anime.torrent
\\network\share\anime.torrent
```

### Info Hashes
```
Hex (40 chars):
abc123def456789...

Base32 (32 chars):
ABCDEFGH234567...
```

## 🆚 vs Other Torrent Providers

| Feature | Manual Torrent | Nyaa/AnimeTosho Providers |
|---------|---------------|---------------------------|
| Setup | Just install | Need to configure |
| Speed | Instant | Depends on site |
| Private torrents | ✅ Yes | ❌ No |
| Custom trackers | ✅ Yes | ❌ No |
| Network needed | ❌ No | ✅ Yes |
| Torrent sites down | ✅ Still works | ❌ Breaks |

## 💡 Use Cases

1. **Private Trackers**: Use torrents from trackers not supported by other providers
2. **Offline**: Use torrents you already have without internet
3. **Custom Sources**: RSS feeds, personal collections, etc.
4. **Backup**: When your main torrent provider is down
5. **Testing**: Quickly test a specific torrent

## ⚙️ Technical Details

- **Type**: `anime-torrent-provider` (special)
- **Smart Search**: Not supported (no filters)
- **Latest Torrents**: Not applicable
- **Adult Content**: Supported (provider doesn't filter)

## 🐛 Troubleshooting

### "No results found"

- Make sure you pasted the **entire** magnet link (starts with `magnet:`)
- For file paths, include the `.torrent` extension
- Check there are no extra spaces

### "Invalid format"

- Magnet links must start with `magnet:`
- File paths must end with `.torrent`
- Info hashes must be 40 hex or 32 base32 characters

### Provider doesn't appear

- Verify the manifest URL is correct
- Check you pushed the files to GitHub
- Try removing and re-adding the extension

## 📄 License

MIT - Use freely!

## 🙏 Credits

- [Seanime](https://github.com/5rahim/seanime) by [5rahim](https://github.com/5rahim)

---

**That's it! No complex setup, no API servers, no CLI tools. Just paste and go.** 🚀
