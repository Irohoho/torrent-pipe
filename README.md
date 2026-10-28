# Manual Torrent Provider for Seanime

A custom `anime-torrent-provider` extension for Seanime that allows directly inputting and caching magnet links, info hashes, remote torrent URLs, and local `.torrent` files linked to specific anime entries.

## Features

- **Direct Ingestion**: Paste magnet links, 40-character hex info hashes, 32-character Base32 hashes, `.torrent` HTTP/HTTPS URLs, or local file paths into Seanime's torrent search dialog.
- **Anime Association**: Ingested torrents are stored against the active anime's media ID (`opts.media.id`), making them available whenever you search or stream that title.
- **Batch Detection & Smart Search**: Automatically recognizes multi-episode releases (e.g. `S01`, `(01-28)`, `Complete`, `Batch`). Configured with `canSmartSearch: true`, allowing Seanime's torrentstream and playback engines to resolve individual episodes directly from batch releases.
- **Metadata Extraction**: Leverages Seanime's built-in `$habari` metadata parser (with robust regex fallback) to extract video resolution, release group, season number, and episode number.
- **Query Flexibility**: Normal searches for an anime title retain stored torrents without stripping them due to substring mismatches, while still allowing targeted filtering by episode or resolution.
- **Cache Management**: Typing `clear` or `reset` in the search bar clears cached torrents for the current anime. Individual torrents can be removed via `remove <infoHash>`.

## Supported Input Formats

### Magnet Links
```text
magnet:?xt=urn:btih:a6c37e59357d72b8ac034702d4956b0474b990f6&dn=Anime.Title.S01.1080p...
magnet:?xt=urn:btih:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&dn=Base32Example...
magnet:?xt=urn:btmh:1220... (BitTorrent v2)
```

### Standalone Info Hashes
```text
a6c37e59357d72b8ac034702d4956b0474b990f6
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
```

### Remote Torrent URLs
```text
https://example.com/downloads/release.torrent
http://tracker.local/torrents/12345.torrent
```

### Local File Paths
```text
/home/user/Downloads/release.torrent
C:\Users\User\Downloads\release.torrent
```

## Installation

1. In Seanime, navigate to **Settings** → **Extensions**.
2. Click **Add Extension**.
3. Enter the manifest URL:
   ```text
   https://raw.githubusercontent.com/Irohoho/torrent-pipe/master/manifest.json
   ```
4. Confirm installation. The provider will now be available under the extension identifier `manual-torrent`.

## Usage

1. Open Seanime and navigate to an anime series.
2. Open the **Torrent Search** modal (or select an episode to stream/download).
3. Select **Manual Torrent** in the provider selector if not set as default.
4. Paste the magnet link, info hash, or torrent URL into the search box.
5. The provider ingests the payload, extracts release metadata, and saves it linked to that anime.
6. The torrent is returned immediately for playback or download. For batch torrents, subsequent episode selections will automatically use the stored batch without requiring re-pasting.

### Cache Controls

- `clear` or `reset`: Enter into the search box to remove all manual torrents stored for the currently viewed anime.
- `remove <infoHash>`: Remove a specific release from the anime's stored torrents.

## Provider Architecture

Implements Seanime's `AnimeProvider` interface:

- `getSettings()`: Exposes `type: "special"` and `canSmartSearch: true` with filters `["batch", "episodeNumber", "resolution"]`.
- `search(opts)`: Parses incoming payloads or queries stored torrents by anime media ID.
- `smartSearch(opts)`: Resolves batch and episode-matched releases for Seanime's streaming and auto-downloader workflows.
- `getTorrentInfoHash(torrent)` / `getTorrentMagnetLink(torrent)`: Extracts or reconstructs compliant magnet links and 40-character hex hashes.

## Testing

A test suite verifying batch detection, Base32 decoding, smart search filtering, and library lifecycle is included in `test/provider.test.js`:

```bash
node test/provider.test.js
```
