class Provider {
  constructor() {
    this.providerName = "Torrent Pipe";
    this.storageKey = "torrent_pipe_data";
  }

  getSettings() {
    return {
      episodeServers: ["Torrent"],
      supportsDub: true,
    };
  }

  /**
   * Search for anime
   * This implementation searches through manually added torrents
   */
  async search(opts) {
    console.log(`[${this.providerName}] Searching for: ${opts.query}`);
    
    try {
      // Get stored torrents
      const storedData = $store.get(this.storageKey) || { torrents: [] };
      const torrents = storedData.torrents || [];
      
      if (torrents.length === 0) {
        console.log(`[${this.providerName}] No torrents stored. Please add torrents first.`);
        return [];
      }

      // Search through stored torrents
      const searchTerms = opts.query.toLowerCase().split(/\s+/);
      const results = [];
      const seen = new Set();

      for (const torrent of torrents) {
        const title = torrent.title.toLowerCase();
        
        // Check if any search term matches the title
        const matches = searchTerms.some(term => title.includes(term));
        
        if (matches && !seen.has(torrent.id)) {
          seen.add(torrent.id);
          results.push({
            id: torrent.id,
            title: torrent.title,
            url: torrent.magnet || torrent.url || "",
            subOrDub: torrent.subOrDub || "both",
          });
        }
      }

      console.log(`[${this.providerName}] Found ${results.length} results`);
      return results;
    } catch (error) {
      console.log(`[${this.providerName}] Search error: ${error.message}`);
      return [];
    }
  }

  /**
   * Find episodes for a given anime ID
   */
  async findEpisodes(id) {
    console.log(`[${this.providerName}] Finding episodes for ID: ${id}`);
    
    try {
      const storedData = $store.get(this.storageKey) || { torrents: [] };
      const torrents = storedData.torrents || [];
      
      // Find the torrent by ID
      const torrent = torrents.find(t => t.id === id);
      
      if (!torrent) {
        console.log(`[${this.providerName}] Torrent not found: ${id}`);
        return [];
      }

      // If episodes are explicitly defined, use them
      if (torrent.episodes && Array.isArray(torrent.episodes)) {
        return torrent.episodes.map((ep, index) => ({
          id: `${id}-ep-${ep.number || index + 1}`,
          number: ep.number || index + 1,
          url: ep.magnet || ep.url || torrent.magnet || torrent.url || "",
          title: ep.title || `Episode ${ep.number || index + 1}`,
        }));
      }

      // Otherwise, create a single episode (batch torrent)
      return [{
        id: `${id}-ep-1`,
        number: 1,
        url: torrent.magnet || torrent.url || "",
        title: torrent.title,
      }];
    } catch (error) {
      console.log(`[${this.providerName}] Find episodes error: ${error.message}`);
      return [];
    }
  }

  /**
   * Find episode server/stream sources
   * For torrents, we return the magnet link as a "stream" source
   */
  async findEpisodeServer(episode, server) {
    console.log(`[${this.providerName}] Finding server for episode: ${episode.id}`);
    
    try {
      const magnetUrl = episode.url;
      
      if (!magnetUrl) {
        throw new Error("No magnet or torrent URL available");
      }

      // Return magnet link as video source
      // Note: Seanime will need to handle magnet links appropriately
      return {
        server: "Torrent",
        headers: {},
        videoSources: [{
          url: magnetUrl,
          type: "unknown", // Magnet links are handled differently
          quality: "Torrent",
          label: "Magnet Link",
          subtitles: [],
        }],
      };
    } catch (error) {
      console.log(`[${this.providerName}] Find server error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper: Add a torrent manually via API or storage
   * This is meant to be called externally or through a companion plugin
   * 
   * @param {Object} torrentData - Torrent information
   * @param {string} torrentData.title - Anime title
   * @param {string} torrentData.magnet - Magnet link
   * @param {string} [torrentData.url] - Alternative URL
   * @param {string} [torrentData.subOrDub] - "sub" | "dub" | "both"
   * @param {Array} [torrentData.episodes] - Array of episode objects
   */
  addTorrent(torrentData) {
    try {
      const storedData = $store.get(this.storageKey) || { torrents: [] };
      
      // Generate a unique ID based on title and timestamp
      const id = `${Date.now()}-${torrentData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      
      const torrent = {
        id: id,
        title: torrentData.title,
        magnet: torrentData.magnet || "",
        url: torrentData.url || "",
        subOrDub: torrentData.subOrDub || "both",
        episodes: torrentData.episodes || [],
        addedAt: Date.now(),
      };
      
      storedData.torrents.push(torrent);
      $store.set(this.storageKey, storedData);
      
      console.log(`[${this.providerName}] Added torrent: ${torrent.title} (${id})`);
      return id;
    } catch (error) {
      console.log(`[${this.providerName}] Add torrent error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper: Remove a torrent by ID
   */
  removeTorrent(id) {
    try {
      const storedData = $store.get(this.storageKey) || { torrents: [] };
      const initialLength = storedData.torrents.length;
      
      storedData.torrents = storedData.torrents.filter(t => t.id !== id);
      $store.set(this.storageKey, storedData);
      
      const removed = initialLength - storedData.torrents.length;
      console.log(`[${this.providerName}] Removed ${removed} torrent(s)`);
      return removed > 0;
    } catch (error) {
      console.log(`[${this.providerName}] Remove torrent error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper: List all stored torrents
   */
  listTorrents() {
    try {
      const storedData = $store.get(this.storageKey) || { torrents: [] };
      return storedData.torrents;
    } catch (error) {
      console.log(`[${this.providerName}] List torrents error: ${error.message}`);
      return [];
    }
  }

  /**
   * Helper: Clear all torrents
   */
  clearAllTorrents() {
    try {
      $store.set(this.storageKey, { torrents: [] });
      console.log(`[${this.providerName}] Cleared all torrents`);
      return true;
    } catch (error) {
      console.log(`[${this.providerName}] Clear torrents error: ${error.message}`);
      return false;
    }
  }
}
