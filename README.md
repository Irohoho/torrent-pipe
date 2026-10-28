# Manual Torrent Provider for Seanime

**Paste a batch torrent ONCE, use it for ALL episodes! 🚀**

Perfect for batch torrents - paste the magnet once, watch any episode without re-pasting!

## 🎯 What This Does

**Works PERFECTLY with Seanime's batch torrent support!**

### The Magic Workflow:

```
Step 1: Paste Batch Torrent
  - Find: "[SubsPlease] Frieren Season 1 [1080p] (01-28)"
  - Copy magnet link
  - Paste into Seanime
  - Provider stores it for "Frieren"

Step 2: Watch Episode 10
  - Click Episode 10 in Seanime
  - Seanime automatically uses your batch torrent!
  - Episode 10 streams/downloads

Step 3: Watch Episode 11
  - Click Episode 11
  - SAME batch torrent used automatically!
  - No re-pasting needed!

Step 4+: Watch ANY Episode
  - Episodes 1-28 ALL available
  - ONE magnet link for the entire season
  - Seanime handles episode selection automatically
```

## 🔥 How It Really Works

```
YOU paste:  magnet:?xt=... (Frieren S1 Batch 01-28)
              ↓
PROVIDER:   Stores it for "Frieren"
            Marks as batch torrent (isBatch: true)
              ↓
SEANIME:    Sees batch torrent available
            You click Episode 15
              ↓
SEANIME:    Uses same batch magnet
            Extracts Episode 15 from the batch
              ↓
RESULT:     You watch Episode 15! 🎉
              ↓
TOMORROW:   You click Episode 16
            Same batch torrent used again!
            No re-pasting! 🚀
```

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

## 📖 Usage Examples

### Example 1: Batch Torrent (MOST COMMON)

**Perfect for full seasons!**

```
1. Find on Nyaa: "[SubsPlease] Frieren S1 [1080p] (01-28)"
2. Copy magnet link
3. In Seanime:
   - Go to Frieren
   - Open torrent search  
   - PASTE the magnet link
4. Provider stores it
5. Watch Episode 1 → Uses batch torrent
6. Watch Episode 10 → SAME batch torrent
7. Watch Episode 28 → STILL same batch torrent
8. ONE magnet for 28 episodes! 🎉
```

### Example 2: Single Episodes (If you prefer)

```
Week 1 - Episode 10 releases:
  - Paste Episode 10 magnet
  - Watch Episode 10

Week 2 - Episode 11 releases:
  - Episode 10 still stored
  - Paste Episode 11 magnet
  - Both available now

Week 3+:
  - All pasted episodes available
  - Build collection as you go
```

### Example 3: Multiple Quality Options

```
1. Paste 1080p batch: "Frieren S1 [1080p] (01-28)"
2. Paste 720p batch: "Frieren S1 [720p] (01-28)"
3. Now you have BOTH options
4. Choose quality per episode
5. Seanime handles batch episode extraction
```

### Example 4: Private Tracker Batch

```
1. Get batch from private tracker
2. Paste magnet once
3. Entire season available forever
4. No need to re-login to tracker
5. Batch stored permanently per anime
```

## ✨ Features

- ✅ **Zero configuration** - no API server, no CLI, no database
- ✅ **Instant results** - no scraping or network requests
- ✅ **Persistent memory** - torrents stored per anime automatically 🧠
- ✅ **Supports magnet links, file paths, and info hashes**
- ✅ **Automatically extracts metadata** (resolution, episode, release group)
- ✅ **Build your personal library** as you watch
- ✅ **Never re-paste the same torrent** - stored forever
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
Stores in Seanime's local storage:
  Anime ID 123 → [this torrent]
             ↓
Returns as torrent result immediately
             ↓
Next time you search this anime:
  Provider auto-loads stored torrents!
             ↓
Your collection grows automatically! 🎉
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
