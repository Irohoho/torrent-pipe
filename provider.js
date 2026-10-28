/**
 * Manual Torrent Provider for Seanime
 *
 * Custom Anime Torrent Provider enabling direct ingestion and persistent
 * association of magnet links, info hashes, torrent files, and URLs to anime media.
 */

class Provider {
  constructor() {
    this.STORAGE_KEY = 'manual_torrent_library';
  }

  getSettings() {
    return {
      type: "special",
      canSmartSearch: true,
      smartSearchFilters: ["batch", "episodeNumber", "resolution"],
      supportsAdult: true
    };
  }

  /**
   * Load stored torrents from runtime store
   * @returns {Record<string, Array<object>>}
   */
  loadLibrary() {
    if (typeof $store === "undefined" || !$store || typeof $store.get !== "function") {
      return {};
    }
    try {
      const stored = $store.get(this.STORAGE_KEY);
      if (!stored || typeof stored !== "object") {
        return {};
      }
      return stored;
    } catch (error) {
      console.log(`[Manual Torrent] Failed to load library: ${error ? error.message : error}`);
      return {};
    }
  }

  /**
   * Save library to runtime store
   * @param {Record<string, Array<object>>} library
   */
  saveLibrary(library) {
    if (typeof $store === "undefined" || !$store || typeof $store.set !== "function") {
      return;
    }
    try {
      $store.set(this.STORAGE_KEY, library);
    } catch (error) {
      console.log(`[Manual Torrent] Failed to save library: ${error ? error.message : error}`);
    }
  }

  /**
   * Add a torrent to library for a specific anime
   * @param {number|string|null} mediaId
   * @param {object} torrent
   */
  addToLibrary(mediaId, torrent) {
    const library = this.loadLibrary();
    const key = mediaId != null ? String(mediaId) : "_unassigned";

    if (!Array.isArray(library[key])) {
      library[key] = [];
    }

    const targetHash = (torrent.infoHash || "").toLowerCase();
    const targetMagnet = (torrent.magnetLink || "").toLowerCase();
    const targetUrl = (torrent.downloadUrl || "").toLowerCase();

    const existingIdx = library[key].findIndex(t => {
      const h = (t.infoHash || "").toLowerCase();
      const m = (t.magnetLink || "").toLowerCase();
      const u = (t.downloadUrl || "").toLowerCase();
      return (
        (targetHash && h && targetHash === h) ||
        (targetMagnet && m && targetMagnet === m) ||
        (targetUrl && u && targetUrl === u)
      );
    });

    if (existingIdx >= 0) {
      library[key][existingIdx] = {
        ...library[key][existingIdx],
        ...torrent,
        addedAt: library[key][existingIdx].addedAt || Date.now()
      };
    } else {
      library[key].unshift(torrent);
    }

    this.saveLibrary(library);
  }

  /**
   * Get stored torrents for a specific anime media ID
   * @param {number|string|null} mediaId
   * @returns {Array<object>}
   */
  getFromLibrary(mediaId) {
    if (mediaId == null) return [];
    const library = this.loadLibrary();
    const list = library[String(mediaId)];
    return Array.isArray(list) ? list : [];
  }

  /**
   * Clear stored torrents for an anime (or all unassigned)
   * @param {number|string|null} mediaId
   */
  clearLibrary(mediaId) {
    const library = this.loadLibrary();
    if (mediaId != null) {
      delete library[String(mediaId)];
    } else {
      for (const k of Object.keys(library)) {
        delete library[k];
      }
    }
    this.saveLibrary(library);
  }

  /**
   * Remove a specific torrent from an anime entry by infoHash
   * @param {number|string} mediaId
   * @param {string} infoHash
   */
  removeFromLibrary(mediaId, infoHash) {
    if (mediaId == null || !infoHash) return;
    const library = this.loadLibrary();
    const key = String(mediaId);
    if (Array.isArray(library[key])) {
      const target = infoHash.toLowerCase();
      library[key] = library[key].filter(t => (t.infoHash || "").toLowerCase() !== target);
      if (library[key].length === 0) {
        delete library[key];
      }
      this.saveLibrary(library);
    }
  }

  /**
   * Search handler
   * - Ingests new magnet links, file paths, info hashes, or torrent URLs
   * - Responds to "clear" or "reset" query commands
   * - Recalls stored torrents for the current anime
   */
  async search(opts) {
    try {
      opts = opts || {};
      const query = (opts.query || "").trim();
      const media = opts.media || null;
      const mediaId = media && media.id != null ? media.id : null;

      // Reset / Clear command support
      if (query.toLowerCase() === "clear" || query.toLowerCase() === "reset") {
        if (mediaId != null) {
          this.clearLibrary(mediaId);
          console.log(`[Manual Torrent] Cleared library for anime mediaId: ${mediaId}`);
        }
        return [];
      }

      // Check for remove command: "remove <infoHash>"
      const removeMatch = query.match(/^remove\s+([a-fA-F0-9]{40}|[A-Za-z0-9+/=]{32})/i);
      if (removeMatch && mediaId != null) {
        const hashToRemove = removeMatch[1].toLowerCase();
        this.removeFromLibrary(mediaId, hashToRemove);
        console.log(`[Manual Torrent] Removed torrent ${hashToRemove} from anime mediaId: ${mediaId}`);
        return this.getFromLibrary(mediaId);
      }

      // 1. Ingest NEW torrent
      if (query && this.isNewTorrent(query)) {
        console.log(`[Manual Torrent] Ingesting new torrent input for anime: ${mediaId}`);
        const newTorrents = this.parseTorrentInput(query, media);

        if (newTorrents.length > 0) {
          newTorrents.forEach(t => this.addToLibrary(mediaId, t));
        }

        const stored = mediaId != null ? this.getFromLibrary(mediaId) : [];
        return this.deduplicateTorrents([...newTorrents, ...stored]);
      }

      // 2. Query against existing anime library
      if (mediaId != null) {
        const stored = this.getFromLibrary(mediaId);
        if (stored.length === 0) return [];

        // When query is empty or mirrors the anime title, return full library for this anime
        if (!query || this.isTitleQuery(query, media)) {
          return stored;
        }

        return this.filterTorrentsByQuery(stored, query);
      }

      // 3. Global search fallback when no mediaId is provided
      if (query) {
        const library = this.loadLibrary();
        const all = Object.values(library).flat();
        return this.filterTorrentsByQuery(this.deduplicateTorrents(all), query);
      }

      return [];
    } catch (err) {
      console.log(`[Manual Torrent] search() error: ${err ? err.message : err}`);
      return [];
    }
  }

  /**
   * Smart Search handler
   * Used by Seanime for episode playback, torrent streaming, and auto-downloader.
   */
  async smartSearch(opts) {
    try {
      opts = opts || {};
      const media = opts.media || null;
      const mediaId = media && media.id != null ? media.id : null;
      if (mediaId == null) return [];

      const stored = this.getFromLibrary(mediaId);
      if (stored.length === 0) return [];

      const wantsBatch = Boolean(opts.batch);
      const requestedEp = typeof opts.episodeNumber === "number" && opts.episodeNumber >= 0 ? opts.episodeNumber : null;
      const requestedRes = (opts.resolution || "").trim().toLowerCase();

      // Batch-specific request
      if (wantsBatch) {
        const batches = stored.filter(t => t.isBatch);
        return this.sortByResolution(batches, requestedRes);
      }

      // Episode-specific request
      if (requestedEp != null) {
        const matches = stored.filter(t => {
          // Batch torrents encompass all episodes; Seanime will inspect and extract the file
          if (t.isBatch) return true;
          // Single episode torrent must match the requested episode number
          return t.episodeNumber === requestedEp;
        });
        return this.sortByResolution(matches, requestedRes);
      }

      // Default: return all stored torrents
      return this.sortByResolution(stored, requestedRes);
    } catch (err) {
      console.log(`[Manual Torrent] smartSearch() error: ${err ? err.message : err}`);
      return [];
    }
  }

  /**
   * Retrieve torrent info hash
   * @param {object} torrent
   * @returns {Promise<string>}
   */
  async getTorrentInfoHash(torrent) {
    if (torrent && torrent.infoHash) {
      return torrent.infoHash;
    }
    const source = (torrent && (torrent.magnetLink || torrent.downloadUrl || torrent.link)) || "";
    const hash = this.extractInfoHashFromMagnet(source);
    if (hash) return hash;

    throw new Error("No info hash available for torrent");
  }

  /**
   * Retrieve torrent magnet link
   * @param {object} torrent
   * @returns {Promise<string>}
   */
  async getTorrentMagnetLink(torrent) {
    if (torrent && torrent.magnetLink) {
      return torrent.magnetLink;
    }
    if (torrent && torrent.downloadUrl && /^magnet:\?/i.test(torrent.downloadUrl)) {
      return torrent.downloadUrl;
    }
    if (torrent && torrent.infoHash) {
      const name = encodeURIComponent(torrent.name || "Torrent");
      return `magnet:?xt=urn:btih:${torrent.infoHash}&dn=${name}`;
    }

    throw new Error("No magnet link available for torrent");
  }

  /**
   * Get latest torrents (noop for manual provider)
   * @returns {Promise<Array<object>>}
   */
  async getLatest() {
    return [];
  }

  // =========================================================================
  // Parsing & Input Handlers
  // =========================================================================

  /**
   * Check if query is an incoming torrent payload
   * @param {string} query
   * @returns {boolean}
   */
  isNewTorrent(query) {
    if (!query) return false;
    const q = query.trim();
    return (
      /^magnet:\?/i.test(q) ||
      this.isInfoHash(q) ||
      this.isTorrentUrl(q) ||
      this.isFilePath(q)
    );
  }

  /**
   * Parse any supported input format into an AnimeTorrent array
   * @param {string} input
   * @param {object|null} media
   * @returns {Array<object>}
   */
  parseTorrentInput(input, media) {
    const trimmed = input.trim();

    if (/^magnet:\?/i.test(trimmed)) {
      return this.handleMagnetLink(trimmed, media);
    }
    if (this.isTorrentUrl(trimmed)) {
      return this.handleTorrentUrl(trimmed, media);
    }
    if (this.isFilePath(trimmed)) {
      return this.handleFilePath(trimmed, media);
    }
    if (this.isInfoHash(trimmed)) {
      return this.handleInfoHash(trimmed, media);
    }

    return [];
  }

  /**
   * Process magnet link input
   * @param {string} magnetLink
   * @param {object|null} media
   * @returns {Array<object>}
   */
  handleMagnetLink(magnetLink, media) {
    const infoHash = this.extractInfoHashFromMagnet(magnetLink);
    const extractedName = this.extractNameFromMagnet(magnetLink);
    const mediaTitle = media ? (media.romajiTitle || media.englishTitle || media.nativeTitle) : null;
    const name = extractedName || mediaTitle || (infoHash ? `Torrent [${infoHash.slice(0, 8)}]` : "Manual Torrent");

    const meta = this.parseMetadata(name, media);

    return [{
      name: name,
      date: new Date().toISOString(),
      size: 0,
      formattedSize: "Unknown",
      seeders: 1, // Positive seed count so Seanime auto-select and players do not reject as dead
      leechers: 0,
      downloadCount: 0,
      link: magnetLink,
      downloadUrl: magnetLink,
      magnetLink: magnetLink,
      infoHash: infoHash.toLowerCase(),
      resolution: meta.resolution,
      isBatch: meta.isBatch,
      episodeNumber: meta.isBatch ? -1 : meta.episodeNumber,
      releaseGroup: meta.releaseGroup,
      isBestRelease: false,
      confirmed: true,
      addedAt: Date.now()
    }];
  }

  /**
   * Process direct .torrent URL input
   * @param {string} url
   * @param {object|null} media
   * @returns {Array<object>}
   */
  handleTorrentUrl(url, media) {
    const fileName = url.split('/').pop().split('?')[0].replace(/\.torrent$/i, '');
    const cleanName = decodeURIComponent(fileName.replace(/[._+]/g, ' ').trim());
    const mediaTitle = media ? (media.romajiTitle || media.englishTitle) : null;
    const name = cleanName || mediaTitle || "Manual Torrent File";

    const pseudoHash = this.hashString(url);
    const meta = this.parseMetadata(name, media);

    return [{
      name: name,
      date: new Date().toISOString(),
      size: 0,
      formattedSize: "Unknown",
      seeders: 1,
      leechers: 0,
      downloadCount: 0,
      link: url,
      downloadUrl: url,
      magnetLink: "",
      infoHash: pseudoHash,
      resolution: meta.resolution,
      isBatch: meta.isBatch,
      episodeNumber: meta.isBatch ? -1 : meta.episodeNumber,
      releaseGroup: meta.releaseGroup,
      isBestRelease: false,
      confirmed: true,
      addedAt: Date.now()
    }];
  }

  /**
   * Process local filesystem path to .torrent file
   * @param {string} filePath
   * @param {object|null} media
   * @returns {Array<object>}
   */
  handleFilePath(filePath, media) {
    const fileName = filePath.split(/[/\\]/).pop().replace(/\.torrent$/i, '');
    const cleanName = fileName.replace(/[._]/g, ' ').trim();
    const mediaTitle = media ? (media.romajiTitle || media.englishTitle) : null;
    const name = cleanName || mediaTitle || "Local Torrent File";

    const pseudoHash = this.hashString(filePath);
    const meta = this.parseMetadata(name, media);

    return [{
      name: name,
      date: new Date().toISOString(),
      size: 0,
      formattedSize: "Unknown",
      seeders: 1,
      leechers: 0,
      downloadCount: 0,
      link: filePath,
      downloadUrl: filePath,
      magnetLink: "",
      infoHash: pseudoHash,
      resolution: meta.resolution,
      isBatch: meta.isBatch,
      episodeNumber: meta.isBatch ? -1 : meta.episodeNumber,
      releaseGroup: meta.releaseGroup,
      isBestRelease: false,
      confirmed: true,
      addedAt: Date.now()
    }];
  }

  /**
   * Process standalone info hash
   * @param {string} hash
   * @param {object|null} media
   * @returns {Array<object>}
   */
  handleInfoHash(hash, media) {
    const normalizedHash = this.normalizeInfoHash(hash);
    const mediaTitle = media ? (media.romajiTitle || media.englishTitle) : null;
    const name = mediaTitle ? `${mediaTitle} [${normalizedHash.slice(0, 8)}]` : `Torrent [${normalizedHash.slice(0, 8)}]`;
    const magnetLink = `magnet:?xt=urn:btih:${normalizedHash}&dn=${encodeURIComponent(name)}`;

    const meta = this.parseMetadata(name, media);

    return [{
      name: name,
      date: new Date().toISOString(),
      size: 0,
      formattedSize: "Unknown",
      seeders: 1,
      leechers: 0,
      downloadCount: 0,
      link: magnetLink,
      downloadUrl: magnetLink,
      magnetLink: magnetLink,
      infoHash: normalizedHash,
      resolution: meta.resolution,
      isBatch: meta.isBatch,
      episodeNumber: meta.isBatch ? -1 : meta.episodeNumber,
      releaseGroup: meta.releaseGroup,
      isBestRelease: false,
      confirmed: true,
      addedAt: Date.now()
    }];
  }

  // =========================================================================
  // Metadata & Resolution Helpers
  // =========================================================================

  /**
   * Parse metadata from release title using $habari with regex fallbacks
   * @param {string} title
   * @param {object|null} media
   * @returns {{ resolution: string, episodeNumber: number, releaseGroup: string, isBatch: boolean }}
   */
  parseMetadata(title, media) {
    let resolution = "";
    let episodeNumber = -1;
    let releaseGroup = "";
    let seasonNumber = null;
    let isBatch = false;

    // 1. Seanime's built-in Habari Goja binding
    if (typeof $habari !== "undefined" && $habari && typeof $habari.parse === "function") {
      try {
        const meta = $habari.parse(title);
        if (meta) {
          if (meta.video_resolution) {
            resolution = meta.video_resolution;
          }
          if (meta.release_group) {
            releaseGroup = meta.release_group;
          }
          if (Array.isArray(meta.season_number) && meta.season_number.length > 0) {
            const parsedSeason = parseInt(meta.season_number[0], 10);
            if (!isNaN(parsedSeason)) seasonNumber = parsedSeason;
          }
          if (Array.isArray(meta.episode_number) && meta.episode_number.length > 0) {
            if (meta.episode_number.length > 1 || /[-~]/.test(meta.episode_number[0])) {
              isBatch = true;
            } else {
              const ep = parseInt(meta.episode_number[0], 10);
              if (!isNaN(ep) && ep >= 0 && ep < 2000) {
                episodeNumber = ep;
              }
            }
          }
        }
      } catch (e) {
        // Fallback to internal regex parser
      }
    }

    // 2. Comprehensive batch detection
    if (!isBatch) {
      isBatch = this.detectBatch(title, seasonNumber, episodeNumber);
    }

    // 3. Fallbacks
    if (!resolution) {
      resolution = this.extractResolution(title);
    }
    if (!releaseGroup) {
      releaseGroup = this.extractReleaseGroup(title);
    }
    if (!isBatch && episodeNumber === -1) {
      episodeNumber = this.extractEpisodeNumber(title);
    }

    // 4. Single-episode / Movie anime rules (matches AnimeTosho behavior)
    if (!isBatch && episodeNumber === -1 && media && (media.episodeCount === 1 || media.format === "MOVIE")) {
      episodeNumber = 1;
    }

    return {
      resolution,
      episodeNumber: isBatch ? -1 : episodeNumber,
      releaseGroup,
      isBatch
    };
  }

  /**
   * Detect whether a release is a multi-episode batch
   * @param {string} name
   * @param {number|null} seasonNumber
   * @param {number} episodeNumber
   * @returns {boolean}
   */
  detectBatch(name, seasonNumber, episodeNumber) {
    if (!name) return false;
    const lower = name.toLowerCase();

    // Explicit batch tokens
    if (/\b(?:batch|complete|all\s+episodes|full\s+season|seasons?)\b/i.test(lower)) {
      return true;
    }
    if (/\bvol(?:ume)?\.?\s*\d+\b/i.test(lower)) {
      return true;
    }

    // Episode range notations: "01-12", "01~24", "01-74", "(01-28)", "[01-12]"
    if (/(?:^|[\[\(._\s-])(?:ep?|episode)?\s*\d{1,4}\s*[-~]\s*\d{1,4}(?:[\]\)._\s-]|$)/i.test(lower)) {
      return true;
    }

    // Season tags like S01, S1, Season 1 without an accompanying single episode number
    if (seasonNumber !== null && (episodeNumber === -1 || episodeNumber === null)) {
      return true;
    }
    if (/\b[sS]\d{1,2}(?:-[sS]\d{1,2})?\b/.test(name) && !/\b[eE]\d{1,4}\b/.test(name) && (episodeNumber === -1 || episodeNumber === null)) {
      return true;
    }

    return false;
  }

  /**
   * Extract video resolution
   * @param {string} name
   * @returns {string}
   */
  extractResolution(name) {
    if (!name) return "";
    const match = name.match(/\b(\d{3,4}[pP]|[248][kK])\b/);
    return match ? match[1] : "";
  }

  /**
   * Extract release group
   * @param {string} name
   * @returns {string}
   */
  extractReleaseGroup(name) {
    if (!name) return "";
    // Common pattern: bracketed tag at beginning of string
    const match = name.match(/^\[([^\]]+)\]/);
    if (match) return match[1].trim();

    // Secondary pattern: hyphenated group suffix (e.g. "...-kitsune")
    const suffix = name.match(/-([a-zA-Z0-9_]+)(?:\.[a-zA-Z0-9]+)?$/);
    if (suffix && !/^(?:mkv|mp4|avi|1080p|720p|hevc|x264|x265)$/i.test(suffix[1])) {
      return suffix[1].trim();
    }

    return "";
  }

  /**
   * Extract single episode number
   * @param {string} name
   * @returns {number}
   */
  extractEpisodeNumber(name) {
    if (!name) return -1;

    const patterns = [
      /\b[eE](?:p(?:isode)?)?[\s._-]?(\d{1,4})\b/,
      /(?:^|[\s._-])(?:ep|episode)\.?\s*(\d{1,4})\b/i,
      /(?:-\s*)(\d{1,4})(?:\s*\[|\s*\()/i,
      /\s+-\s+(\d{1,4})\s+/
    ];

    for (const pat of patterns) {
      const match = name.match(pat);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num >= 0 && num < 2000) {
          return num;
        }
      }
    }

    return -1;
  }

  /**
   * Extract info hash from magnet link (handles 40-char hex, 32-char Base32, and v2 hashes)
   * @param {string} magnetLink
   * @returns {string}
   */
  extractInfoHashFromMagnet(magnetLink) {
    if (!magnetLink) return "";

    // Standard 40-char Hex
    const hexMatch = magnetLink.match(/urn:btih:([a-fA-F0-9]{40})/i);
    if (hexMatch) {
      return hexMatch[1].toLowerCase();
    }

    // 32-char Base32
    const b32Match = magnetLink.match(/urn:btih:([2-7a-zA-Z]{32})/i);
    if (b32Match) {
      const decoded = this.base32ToHex(b32Match[1]);
      if (decoded.length === 40) return decoded.toLowerCase();
    }

    // BitTorrent v2: urn:btmh:1220<64-hex>
    const v2Match = magnetLink.match(/urn:btmh:1220([a-fA-F0-9]{64})/i);
    if (v2Match) {
      return v2Match[1].substring(0, 40).toLowerCase();
    }

    return "";
  }

  /**
   * Extract display name parameter from magnet URI
   * @param {string} magnetLink
   * @returns {string|null}
   */
  extractNameFromMagnet(magnetLink) {
    if (!magnetLink) return null;
    const match = magnetLink.match(/[?&]dn=([^&]+)/);
    if (match) {
      try {
        return decodeURIComponent(match[1].replace(/\+/g, ' ')).trim();
      } catch (e) {
        return match[1].replace(/\+/g, ' ').trim();
      }
    }
    return null;
  }

  /**
   * Decode Base32 (RFC 4648) to Hex string
   * @param {string} base32
   * @returns {string}
   */
  base32ToHex(base32) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    const clean = base32.toUpperCase().replace(/=+$/, '');
    for (let i = 0; i < clean.length; i++) {
      const val = alphabet.indexOf(clean[i]);
      if (val === -1) return '';
      bits += val.toString(2).padStart(5, '0');
    }
    let hex = '';
    for (let i = 0; i + 4 <= bits.length; i += 4) {
      hex += parseInt(bits.substring(i, i + 4), 2).toString(16);
    }
    return hex.toLowerCase();
  }

  /**
   * Normalize an info hash to a 40-char lowercase hex string
   * @param {string} hash
   * @returns {string}
   */
  normalizeInfoHash(hash) {
    const trimmed = (hash || "").trim();
    if (/^[a-fA-F0-9]{40}$/.test(trimmed)) {
      return trimmed.toLowerCase();
    }
    if (/^[2-7a-zA-Z]{32}$/.test(trimmed)) {
      const decoded = this.base32ToHex(trimmed);
      if (decoded.length === 40) return decoded;
    }
    return trimmed.toLowerCase();
  }

  /**
   * Check if query is a valid info hash
   * @param {string} query
   * @returns {boolean}
   */
  isInfoHash(query) {
    const q = (query || "").trim();
    return /^[a-fA-F0-9]{40}$/.test(q) || /^[2-7a-zA-Z]{32}$/.test(q);
  }

  /**
   * Check if query is a direct torrent URL
   * @param {string} query
   * @returns {boolean}
   */
  isTorrentUrl(query) {
    const q = (query || "").trim();
    return /^https?:\/\/.+\.torrent(?:\?.*)?$/i.test(q);
  }

  /**
   * Check if query is a local torrent file path
   * @param {string} query
   * @returns {boolean}
   */
  isFilePath(query) {
    const q = (query || "").trim();
    return (
      /^([a-zA-Z]:[\\\/]|[\\\/]{1,2}|\.\.?[\\\/]).*\.torrent$/i.test(q) ||
      /^[~\/].*\.torrent$/i.test(q)
    );
  }

  /**
   * Check if query matches the media titles (so Seanime's pre-filled search does not filter out results)
   * @param {string} query
   * @param {object|null} media
   * @returns {boolean}
   */
  isTitleQuery(query, media) {
    if (!query || !media) return false;
    const q = query.trim().toLowerCase();
    const candidateTitles = [
      media.romajiTitle,
      media.englishTitle,
      media.nativeTitle,
      ...(media.synonyms || [])
    ].filter(Boolean).map(t => t.trim().toLowerCase());

    return candidateTitles.some(t => t === q || t.includes(q) || q.includes(t));
  }

  /**
   * Intelligent query filter:
   * - Keeps batch torrents when an episode number is requested
   * - Filters single-episode torrents to matching episode numbers
   * - Matches keywords against name, release group, or resolution
   * @param {Array<object>} torrents
   * @param {string} query
   * @returns {Array<object>}
   */
  filterTorrentsByQuery(torrents, query) {
    const q = (query || "").trim().toLowerCase();
    if (!q) return torrents;

    // Check if query is targeting an episode number
    const epMatch = q.match(/(?:^|\b)(?:ep(?:isode)?\.?\s*|e)?(\d{1,4})(?:\b|$)/i);
    const requestedEp = epMatch ? parseInt(epMatch[1], 10) : null;

    return torrents.filter(t => {
      // Batches always match episode lookups because they contain all episodes
      if (t.isBatch && requestedEp !== null) {
        return true;
      }
      // Single-episode torrent matches if the episode matches
      if (requestedEp !== null && t.episodeNumber === requestedEp) {
        return true;
      }
      // Match keywords in release title, group, or resolution
      return (
        (t.name && t.name.toLowerCase().includes(q)) ||
        (t.releaseGroup && t.releaseGroup.toLowerCase().includes(q)) ||
        (t.resolution && t.resolution.toLowerCase().includes(q))
      );
    });
  }

  /**
   * Sort torrents placing requested resolution first
   * @param {Array<object>} torrents
   * @param {string} requestedRes
   * @returns {Array<object>}
   */
  sortByResolution(torrents, requestedRes) {
    if (!requestedRes) return torrents;
    const target = requestedRes.toLowerCase();
    return [...torrents].sort((a, b) => {
      const aMatches = (a.resolution || "").toLowerCase().includes(target) ? 1 : 0;
      const bMatches = (b.resolution || "").toLowerCase().includes(target) ? 1 : 0;
      return bMatches - aMatches;
    });
  }

  /**
   * Deduplicate torrent array by infoHash or magnetLink
   * @param {Array<object>} torrents
   * @returns {Array<object>}
   */
  deduplicateTorrents(torrents) {
    const seen = new Set();
    const result = [];

    for (const t of torrents) {
      const key = (t.infoHash || t.magnetLink || t.downloadUrl || t.name).toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(t);
      }
    }

    return result;
  }

  /**
   * Generate a deterministic 40-char hex hash from string
   * @param {string} str
   * @returns {string}
   */
  hashString(str) {
    let h1 = 0xdeadbeef;
    let h2 = 0x41c64e6d;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const combined = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
    return combined.padStart(40, '0').slice(-40);
  }
}
