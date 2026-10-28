/**
 * Manual Torrent Provider for Seanime
 * 
 * Allows you to paste magnet links or local torrent file paths directly as search queries.
 * 
 * Usage:
 * 1. In Seanime's torrent search, paste your magnet link or file path
 * 2. This provider will return it immediately as a torrent result
 * 3. Select it and stream/download!
 */

class Provider {
  getSettings() {
    return {
      canSmartSearch: false,  // We don't support smart search filters
      smartSearchFilters: [],
      supportsAdult: true,    // We accept any magnet link
      type: "special"         // Special type since we don't scrape torrent sites
    };
  }

  /**
   * Search accepts:
   * - Magnet links: magnet:?xt=urn:btih:...
   * - File paths: /path/to/file.torrent or C:\path\to\file.torrent
   * - Info hashes: just the hash string (will be converted to magnet)
   */
  async search(opts) {
    const query = opts.query.trim();
    
    console.log(`[Manual Torrent] Received query: ${query}`);
    
    // If empty query, return nothing
    if (!query) {
      return [];
    }

    // Check if it's a magnet link
    if (query.toLowerCase().startsWith('magnet:')) {
      return this.handleMagnetLink(query, opts.media);
    }

    // Check if it's a file path
    if (this.isFilePath(query)) {
      return this.handleFilePath(query, opts.media);
    }

    // Check if it's an info hash
    if (this.isInfoHash(query)) {
      return this.handleInfoHash(query, opts.media);
    }

    // If we can't recognize it, return empty
    console.log(`[Manual Torrent] Could not recognize query format`);
    return [];
  }

  /**
   * Handle magnet link input
   */
  handleMagnetLink(magnetLink, media) {
    console.log(`[Manual Torrent] Processing magnet link`);
    
    // Extract info hash from magnet link
    const infoHash = this.extractInfoHashFromMagnet(magnetLink);
    
    // Try to extract a nice name from the magnet link
    const name = this.extractNameFromMagnet(magnetLink) || 
                 media.romajiTitle || 
                 media.englishTitle || 
                 "Manual Torrent";

    return [{
      name: name,
      date: new Date().toISOString(),
      size: 0,  // Unknown
      formattedSize: "Unknown",
      seeders: 0,
      leechers: 0,
      downloadCount: 0,
      link: "",  // No webpage
      downloadUrl: "",
      magnetLink: magnetLink,
      infoHash: infoHash,
      resolution: this.extractResolution(name),
      isBatch: this.detectBatch(name),
      episodeNumber: this.extractEpisodeNumber(name),
      releaseGroup: this.extractReleaseGroup(name),
      isBestRelease: false,
      confirmed: true  // User manually provided it, so it's confirmed
    }];
  }

  /**
   * Handle file path input
   */
  handleFilePath(filePath, media) {
    console.log(`[Manual Torrent] Processing file path: ${filePath}`);
    
    // Extract filename
    const fileName = filePath.split(/[/\\]/).pop();
    const cleanName = fileName.replace(/\.torrent$/i, '');

    return [{
      name: cleanName,
      date: new Date().toISOString(),
      size: 0,
      formattedSize: "Unknown",
      seeders: 0,
      leechers: 0,
      downloadCount: 0,
      link: filePath,  // Store the file path here
      downloadUrl: filePath,  // And here
      magnetLink: "",  // Will be empty - torrent client should handle file path
      infoHash: "",
      resolution: this.extractResolution(cleanName),
      isBatch: this.detectBatch(cleanName),
      episodeNumber: this.extractEpisodeNumber(cleanName),
      releaseGroup: this.extractReleaseGroup(cleanName),
      isBestRelease: false,
      confirmed: true
    }];
  }

  /**
   * Handle raw info hash input
   */
  handleInfoHash(infoHash, media) {
    console.log(`[Manual Torrent] Processing info hash`);
    
    const magnetLink = `magnet:?xt=urn:btih:${infoHash}`;
    const name = media.romajiTitle || media.englishTitle || "Manual Torrent";

    return [{
      name: name,
      date: new Date().toISOString(),
      size: 0,
      formattedSize: "Unknown",
      seeders: 0,
      leechers: 0,
      downloadCount: 0,
      link: "",
      downloadUrl: "",
      magnetLink: magnetLink,
      infoHash: infoHash,
      isBestRelease: false,
      confirmed: true
    }];
  }

  /**
   * SmartSearch - not supported, just pass through to regular search
   */
  async smartSearch(opts) {
    return this.search(opts);
  }

  /**
   * Get torrent info hash - should already be available
   */
  async getTorrentInfoHash(torrent) {
    if (torrent.infoHash) {
      return torrent.infoHash;
    }
    
    if (torrent.magnetLink) {
      return this.extractInfoHashFromMagnet(torrent.magnetLink);
    }

    throw new Error("No info hash available");
  }

  /**
   * Get torrent magnet link - should already be available
   */
  async getTorrentMagnetLink(torrent) {
    if (torrent.magnetLink) {
      return torrent.magnetLink;
    }

    if (torrent.infoHash) {
      return `magnet:?xt=urn:btih:${torrent.infoHash}`;
    }

    throw new Error("No magnet link available");
  }

  /**
   * Get latest torrents - not applicable for manual input
   */
  async getLatest() {
    return [];
  }

  // ========== Utility Functions ==========

  /**
   * Check if query is a file path
   */
  isFilePath(query) {
    // Windows: C:\path\to\file.torrent or \\network\path
    // Linux/Mac: /path/to/file.torrent
    // Relative: ./file.torrent or ../file.torrent
    return /^([a-zA-Z]:[\\\/]|[\\\/]{1,2}|\.\.?[\\\/]).*\.torrent$/i.test(query) ||
           /^[~\/].*\.torrent$/i.test(query);
  }

  /**
   * Check if query is an info hash (40 hex characters or 32 base32)
   */
  isInfoHash(query) {
    // Hex hash: 40 characters
    if (/^[a-fA-F0-9]{40}$/.test(query)) {
      return true;
    }
    // Base32 hash: 32 characters
    if (/^[A-Z2-7]{32}$/.test(query)) {
      return true;
    }
    return false;
  }

  /**
   * Extract info hash from magnet link
   */
  extractInfoHashFromMagnet(magnetLink) {
    const match = magnetLink.match(/urn:btih:([a-fA-F0-9]{40}|[A-Z2-7]{32})/i);
    return match ? match[1] : "";
  }

  /**
   * Extract display name from magnet link
   */
  extractNameFromMagnet(magnetLink) {
    const match = magnetLink.match(/[?&]dn=([^&]+)/);
    if (match) {
      return decodeURIComponent(match[1].replace(/\+/g, ' '));
    }
    return null;
  }

  /**
   * Extract resolution from filename
   */
  extractResolution(name) {
    const match = name.match(/(\d{3,4}[pP]|[248]K)/);
    return match ? match[1] : "";
  }

  /**
   * Detect if it's a batch torrent
   */
  detectBatch(name) {
    const lower = name.toLowerCase();
    return lower.includes('batch') || 
           lower.includes('complete') ||
           lower.includes('season') ||
           /\d+-\d+/.test(name);  // e.g. "01-12" episode range
  }

  /**
   * Extract episode number from filename
   */
  extractEpisodeNumber(name) {
    // Try various patterns: E01, EP01, - 01, [01]
    const patterns = [
      /[Ee](?:pisode)?[\s._-]?(\d{1,4})/,
      /[\s._-](\d{1,4})[\s._-]/,
      /\[(\d{1,4})\]/,
      /\((\d{1,4})\)/
    ];

    for (const pattern of patterns) {
      const match = name.match(pattern);
      if (match) {
        const num = parseInt(match[1], 10);
        // Sanity check: episode numbers are usually 1-999
        if (num > 0 && num < 1000) {
          return num;
        }
      }
    }

    return -1;  // Unknown
  }

  /**
   * Extract release group from filename
   */
  extractReleaseGroup(name) {
    // Usually at the start in brackets: [SubsPlease] or [Judas]
    const match = name.match(/^\[([^\]]+)\]/);
    return match ? match[1] : "";
  }
}
