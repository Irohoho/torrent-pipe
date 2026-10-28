# Manual Torrent Provider for Seanime

**The simplest way to use custom torrents in Seanime - now with MEMORY! 🧠**

Paste your magnet link once, and it's automatically remembered for that anime forever!

## 🎯 What This Does

This provider has **two modes**:

### 1. **ADD Mode** - Paste New Torrents
Paste magnet links, file paths, or info hashes to add them:
- **Magnet Links**: `magnet:?xt=urn:btih:ABC123...`
- **Torrent File Paths**: `/home/user/downloads/anime.torrent`
- **Info Hashes**: `ABC123DEF456...` (converted to magnet automatically)

### 2. **RECALL Mode** - Automatic Memory 🧠
- Next time you search that anime, your torrents appear **automatically**!
- No need to re-paste anything
- Builds a **personal torrent library** for each anime

## 🔥 How It Works

```
First Time (Frieren Episode 10):
  1. Paste magnet link
  2. Provider stores it linked to "Frieren"
  3. Shows your magnet immediately

Second Time (Frieren Episode 11):
  1. Open Frieren's torrent search
  2. Your Episode 10 magnet ALREADY THERE! 🎉
  3. Paste Episode 11 magnet
  4. Now both episodes stored!

Third Time:
  1. Open Frieren
  2. Episodes 10 & 11 automatically shown
  3. Just select and stream! No re-pasting!
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

### Example 1: Building Your Frieren Collection

**Week 1 - Episode 10 drops:**
```
1. Find on Nyaa: "[SubsPlease] Frieren - 10 [1080p]"
2. Copy magnet: magnet:?xt=urn:btih:ABC123...
3. In Seanime, go to Frieren
4. Open torrent search
5. PASTE the magnet link
6. Provider stores it and shows it immediately
7. Stream Episode 10! 🎉
```

**Week 2 - Episode 11 drops:**
```
1. Go to Frieren in Seanime
2. Open torrent search
3. YOUR EPISODE 10 IS ALREADY THERE! 🧠
4. Paste Episode 11 magnet
5. Now you have BOTH episodes stored
6. Select Episode 11 and stream!
```

**Week 3 - Episode 12:**
```
1. Open Frieren
2. Episodes 10 & 11 automatically shown
3. Paste Episode 12
4. All three episodes available forever!
```

### Example 2: Batch Collection

```
1. Download entire season: "Demon Slayer S1 Batch"
2. Paste magnet once
3. Forever available when you search "Demon Slayer"
```

### Example 3: Private Tracker Workflow

```
1. Get exclusive torrent from private tracker
2. Paste magnet into Seanime
3. It's now permanently linked to that anime
4. Never need to find it again!
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
