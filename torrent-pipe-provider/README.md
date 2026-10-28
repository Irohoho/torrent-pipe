# Torrent Pipe Provider for Seanime

A custom Seanime provider that allows you to pipe magnet links or torrents directly into Seanime.

## Features

- Add custom magnet links or torrent URLs
- Store multiple torrents locally
- Search through your piped torrents
- Support for both single-file and multi-episode torrents
- Manual torrent management (add, remove, list, clear)

## Installation

1. **Host the files**: Upload the `manifest.json` and `provider.js` files to a public repository (e.g., GitHub).

2. **Update URLs**: Edit `manifest.json` and replace `YOUR-USERNAME` and `YOUR-REPO` with your actual GitHub username and repository name:
   ```json
   "manifestURI": "https://raw.githubusercontent.com/YOUR-USERNAME/YOUR-REPO/main/torrent-pipe-provider/manifest.json",
   "payloadURI": "https://raw.githubusercontent.com/YOUR-USERNAME/YOUR-REPO/main/torrent-pipe-provider/provider.js"
   ```

3. **Add to Seanime**:
   - Open Seanime
   - Go to the **Extensions** tab
   - Click **Add extensions**
   - Paste the manifest URL: `https://raw.githubusercontent.com/YOUR-USERNAME/YOUR-REPO/main/torrent-pipe-provider/manifest.json`

## Usage

### Adding Torrents

Since Seanime providers don't have a built-in UI for adding torrents, you'll need to use one of these methods:

#### Method 1: Create a Companion Plugin (Recommended)

Create a separate plugin with a UI that calls the provider's `addTorrent()` method. This would give you a user-friendly interface to add torrents.

#### Method 2: Browser Console (For Testing)

While in Seanime, you can open the browser console and manually add torrents:

```javascript
// This would need to be adapted based on how Seanime exposes providers
// Example structure:
const torrentData = {
  title: "My Anime Series",
  magnet: "magnet:?xt=urn:btih:...",
  subOrDub: "sub", // or "dub" or "both"
  episodes: [
    { number: 1, title: "Episode 1", magnet: "magnet:?xt=urn:btih:..." },
    { number: 2, title: "Episode 2", magnet: "magnet:?xt=urn:btih:..." }
  ]
};
```

#### Method 3: HTTP API Integration

You could set up a simple HTTP server that accepts torrent data and stores it using the provider's methods.

### Torrent Data Structure

```javascript
{
  title: "Anime Title",           // Required: The anime title
  magnet: "magnet:?xt=...",       // Magnet link (preferred)
  url: "https://...",             // Alternative: direct torrent URL
  subOrDub: "both",               // "sub", "dub", or "both"
  episodes: [                     // Optional: For multi-episode torrents
    {
      number: 1,
      title: "Episode 1",
      magnet: "magnet:?xt=..."    // Per-episode magnet link
    }
  ]
}
```

### Single vs Multi-Episode Torrents

- **Batch Torrents**: If you add a torrent without specifying episodes, it will be treated as a single batch torrent containing all episodes.
- **Per-Episode Torrents**: If you specify individual episodes with their own magnet links, each episode will be available separately.

## API Methods

The provider exposes these helper methods:

- `addTorrent(torrentData)` - Add a new torrent
- `removeTorrent(id)` - Remove a torrent by ID
- `listTorrents()` - List all stored torrents
- `clearAllTorrents()` - Clear all torrents

## Limitations

1. **Magnet Link Handling**: Seanime is primarily designed for streaming providers. You'll need to ensure your Seanime setup can handle magnet links (this might require integration with a torrent client).

2. **No Built-in UI**: This provider doesn't include a UI for adding torrents. You'll need to create a companion plugin or use console/API methods.

3. **Storage**: Torrents are stored in Seanime's extension storage. They persist across sessions but are tied to this specific provider.

## Creating a Companion UI Plugin

For a better user experience, consider creating a companion plugin with a UI. Here's a basic structure:

```json
{
  "id": "torrent-pipe-ui",
  "name": "Torrent Pipe UI",
  "type": "plugin",
  "language": "typescript",
  ...
}
```

The plugin would:
1. Provide a form to input torrent data
2. Call the Torrent Pipe provider's `addTorrent()` method
3. Display the list of stored torrents
4. Allow removing/managing torrents

## Example Use Cases

### 1. Personal Anime Collection
Add torrents for anime you've downloaded or want to track through Seanime.

### 2. Private Tracker Integration
Pipe torrents from private trackers that aren't supported by standard providers.

### 3. Custom Release Groups
Follow specific fansub groups or release groups by manually adding their torrents.

## Troubleshooting

### Torrents Not Appearing in Search
- Verify the torrent was added successfully by checking the console logs
- Ensure your search terms match the torrent title
- Check that the storage is working: `$store.get('torrent_pipe_data')`

### Magnet Links Not Working
- Seanime may need additional configuration to handle magnet links
- Consider using a torrent client integration or streaming service

## Future Improvements

- [ ] Add RSS feed support for automatic torrent discovery
- [ ] Integration with popular torrent sites
- [ ] Automatic episode detection from torrent names
- [ ] Quality and resolution filtering
- [ ] Torrent health/seeder information

## License

MIT

## Contributing

PRs are welcome! Feel free to improve the provider or add features.
