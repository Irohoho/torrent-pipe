/**
 * Manual Torrent Provider for Seanime
 * 
 * Allows you to paste magnet links or local torrent file paths directly as search queries.
 * Now with MEMORY: Once you add a magnet to an anime, it's stored and shown automatically next time!
 * 
 * Usage:
 * 1. In Seanime's torrent search, paste your magnet link or file path
 * 2. This provider will return it immediately as a torrent result
 * 3. Provider stores it linked to this anime
 * 4. Next time you search this anime, your magnets appear automatically!
 */

class Provider {
  constructor() {
    this.STORAGE_KEY = 'manual_torrent_library';
  }

  getSettings() {
    return {
      canSmartSearch: false,  // We don't support smart search filters
      smartSearchFilters: [],
      supportsAdult: true,    // We accept any magnet link
      type: "special"         // Special type since we don't scrape torrent sites
    };
  }

  /**
   * Load stored torrents from Seanime's storage
   */
  loadLibrary() {
    try {
      const stored = $store.get(this.STORAGE_KEY);
      return stored || {};
    } catch (error) {
      console.log(`[Manual Torrent] Error loading library: ${error.message}`);
      return {};
    }
  }

  /**
   * Save torrents to Seanime's storage
   */
  saveLibrary(library) {
    try {
      $store.set(this.STORAGE_KEY, library);
      console.log(`[Manual Torrent] Library saved successfully`);
    } catch (error) {
      console.log(`[Manual Torrent] Error saving library: ${error.message}`);
    }
  }

  /**
   * Add torrent to library for a specific anime
   */
  addToLibrary(mediaId, torrent) {
    const library = this.loadLibrary();
    
    if (!library[mediaId]) {
      library[mediaId] = [];
    }

    // Check if this torrent already exists (by info hash or magnet link)
    const exists = library[mediaId].some(t => 
      (t.infoHash && t.infoHash === torrent.infoHash) ||
      (t.magnetLink && t.magnetLink === torrent.magnetLink)
    );

    if (!exists) {
      library[mediaId].push(torrent);
      this.saveLibrary(library);
      console.log(`[Manual Torrent] Added torrent to library for anime ${mediaId}`);
    } else {
      console.log(`[Manual Torrent] Torrent already exists in library`);
    }
  }

  /**
   * Get stored torrents for a specific anime
   */
  getFromLibrary(mediaId) {
    const library = this.loadLibrary();
    return library[mediaId] || [];
  }

  /**
   * Remove a torrent from library
   */
  removeFromLibrary(mediaId, infoHash) {
    const library = this.loadLibrary();
    
    if (library[mediaId]) {
      library[mediaId] = library[mediaId].filter(t => t.infoHash !== infoHash);
      
      // Clean up empty entries
      if (library[mediaId].length === 0) {
        delete library[mediaId];
      }
      
      this.saveLibrary(library);
      console.log(`[Manual Torrent] Removed torrent from library`);
    }
  }

  /**
   * Search accepts:
   * - Magnet links: magnet:?xt=urn:btih:... (stores to library)
   * - File paths: /path/to/file.torrent or C:\path\to\file.torrent (stores to library)
   * - Info hashes: just the hash string (stores to library)
   * - Empty/normal search: Returns previously stored torrents for this anime
   */
  async search(opts) {
    const query = opts.query.trim();
    const mediaId = opts.media.id;
    
    console.log(`[Manual Torrent] Received query: "${query}" for anime ${mediaId}`);

    // FIRST: Check if we have stored torrents for this anime
    const storedTorrents = this.getFromLibrary(mediaId);
    
    // If query is empty or just a regular search term, return stored torrents
    if (!query || (!this.isNewTorrent(query))) {
      if (storedTorrents.length > 0) {
        console.log(`[Manual Torrent] Returning ${storedTorrents.length} stored torrent(s)`);
        // Filter by query if provided
        if (query) {
          return storedTorrents.filter(t => 
            t.name.toLowerCase().includes(query.toLowerCase())
          );
        }
        return storedTorrents;
      }
      
      // No stored torrents and no recognizable input
      if (!query) {
        return [];
      }
      console.log(`[Manual Torrent] No stored torrents and query not recognized`);
      return [];
    }

    // NEW TORRENT: User is adding a new magnet/file/hash
    let newTorrents = [];

    // Check if it's a magnet link
    if (query.toLowerCase().startsWith('magnet:')) {
      newTorrents = this.handleMagnetLink(query, opts.media);
    }
    // Check if it's a file path
    else if (this.isFilePath(query)) {
      newTorrents = this.handleFilePath(query, opts.media);
    }
    // Check if it's an info hash
    else if (this.isInfoHash(query)) {
      newTorrents = this.handleInfoHash(query, opts.media);
    }

    // Store the new torrent(s) in library
    if (newTorrents.length > 0) {
      newTorrents.forEach(torrent => {
        this.addToLibrary(mediaId, torrent);
      });
    }

    // Return both new and stored torrents
    return [...newTorrents, ...storedTorrents];
  }

  /**
   * Check if query is a new torrent being added
   */
  isNewTorrent(query) {
    return query.toLowerCase().startsWith('magnet:') ||
           this.isFilePath(query) ||
           this.isInfoHash(query);
  }

  /**
   * Handle magnet link input
   */
  handleMagnetLink(magnetLink, media) {
    console.log(`[Manual Torrent] Processing NEW magnet link`);
    
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
      confirmed: true,  // User manually provided it, so it's confirmed
      addedAt: Date.now()  // Track when it was added
    }];
  }

  /**
   * Handle file path input
   */
  handleFilePath(filePath, media) {
    console.log(`[Manual Torrent] Processing NEW file path: ${filePath}`);
    
    // Extract filename
    const fileName = filePath.split(/[/\\]/).pop();
    const cleanName = fileName.replace(/\.torrent$/i, '');
    
    // Generate a pseudo info hash from the file path for deduplication
    const pseudoHash = this.hashString(filePath);

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
      infoHash: pseudoHash,  // Use pseudo hash for deduplication
      resolution: this.extractResolution(cleanName),
      isBatch: this.detectBatch(cleanName),
      episodeNumber: this.extractEpisodeNumber(cleanName),
      releaseGroup: this.extractReleaseGroup(cleanName),
      isBestRelease: false,
      confirmed: true,
      addedAt: Date.now()
    }];
  }

  /**
   * Handle raw info hash input
   */
  handleInfoHash(infoHash, media) {
    console.log(`[Manual Torrent] Processing NEW info hash`);
    
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
      confirmed: true,
      addedAt: Date.now()
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

  /**
   * Simple hash function for generating pseudo-hashes from file paths
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(40, '0');
  }
}
