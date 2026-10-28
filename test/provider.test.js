const fs = require('fs');
const assert = require('assert');

// Mock Seanime $store global
const storeData = new Map();
global.$store = {
  get: (key) => storeData.get(key) || null,
  set: (key, val) => storeData.set(key, val),
  has: (key) => storeData.has(key)
};

// Mock Seanime $habari global
global.$habari = {
  parse: (title) => {
    // Quick mock of habari parser
    const res = {};
    if (title.includes('1080p')) res.video_resolution = '1080p';
    if (title.includes('720p')) res.video_resolution = '720p';
    if (title.includes('kitsune')) res.release_group = 'kitsune';
    if (title.includes('SubsPlease')) res.release_group = 'SubsPlease';
    if (title.includes('s01') || title.includes('Season 1')) res.season_number = ['1'];
    if (title.includes('01-28')) res.episode_number = ['01', '28'];
    const epMatch = title.match(/-\s*(\d{2,3})\b/);
    if (epMatch && !title.includes('01-28')) res.episode_number = [epMatch[1]];
    return res;
  }
};

// Evaluate provider.js
const vm = require('vm');
const code = fs.readFileSync(__dirname + '/../provider.js', 'utf8');
vm.runInThisContext(code);

async function runTests() {
  console.log("Running manual-torrent provider tests...\n");

  const p = new Provider();

  // Test 1: Provider settings
  const settings = p.getSettings();
  assert.strictEqual(settings.canSmartSearch, true, "canSmartSearch must be true");
  assert.strictEqual(settings.type, "special", "type must be special");
  assert.ok(settings.smartSearchFilters.includes("batch"), "Filters must include batch");
  console.log("✓ Test 1: getSettings() returns valid configuration with canSmartSearch=true");

  // Test 2: Ingest Monster S1 batch magnet (user's exact log example)
  const monsterMagnet = "magnet:?xt=urn:btih:a6c37e59357d72b8ac034702d4956b0474b990f6&dn=monster.2004.s01.1080p.bluray.dual.flac.2.0.x264-kitsune&tr=http://nyaa.tracker.wf:7777/announce";
  const mediaMonster = {
    id: 19,
    romajiTitle: "Monster",
    englishTitle: "Monster",
    episodeCount: 74
  };

  const results = await p.search({
    query: monsterMagnet,
    media: mediaMonster
  });

  assert.strictEqual(results.length, 1, "Should return 1 ingested torrent");
  const monster = results[0];
  assert.strictEqual(monster.infoHash, "a6c37e59357d72b8ac034702d4956b0474b990f6");
  assert.strictEqual(monster.isBatch, true, "s01 release MUST be detected as batch");
  assert.strictEqual(monster.episodeNumber, -1, "Batch episodeNumber must be -1");
  assert.strictEqual(monster.resolution, "1080p", "Resolution must be 1080p");
  assert.strictEqual(monster.releaseGroup, "kitsune", "Release group must be kitsune");
  assert.strictEqual(monster.seeders, 1, "Seeders should be positive");
  assert.strictEqual(monster.confirmed, true, "Confirmed should be true");
  console.log("✓ Test 2: Ingested Monster S1 batch magnet correctly detected as batch (-1)");

  // Test 3: Normal Search by anime title retrieves stored batch
  const searchByTitle = await p.search({
    query: "Monster",
    media: mediaMonster
  });
  assert.strictEqual(searchByTitle.length, 1, "Searching by anime title must return stored batch");
  assert.strictEqual(searchByTitle[0].infoHash, monster.infoHash);
  console.log("✓ Test 3: Normal search with query='Monster' successfully recalls stored torrent");

  // Test 4: Normal Search with query='Monster 02' retrieves stored batch
  const searchByEp = await p.search({
    query: "Monster 02",
    media: mediaMonster
  });
  assert.strictEqual(searchByEp.length, 1, "Searching by 'Monster 02' must retain batch torrent");
  console.log("✓ Test 4: Search with query='Monster 02' correctly retains stored batch torrent");

  // Test 5: Smart Search for Episode 2
  const smartEp2 = await p.smartSearch({
    episodeNumber: 2,
    batch: false,
    media: mediaMonster
  });
  assert.strictEqual(smartEp2.length, 1, "smartSearch for ep 2 must return batch");
  console.log("✓ Test 5: smartSearch(episodeNumber=2) successfully returns batch torrent");

  // Test 6: Smart Search for Episode 10
  const smartEp10 = await p.smartSearch({
    episodeNumber: 10,
    batch: false,
    media: mediaMonster
  });
  assert.strictEqual(smartEp10.length, 1, "smartSearch for ep 10 must return batch");
  console.log("✓ Test 6: smartSearch(episodeNumber=10) successfully returns batch torrent");

  // Test 7: Single episode ingestion and isolation
  const mediaFrieren = {
    id: 154587,
    romajiTitle: "Sousou no Frieren",
    englishTitle: "Frieren: Beyond Journey's End",
    episodeCount: 28
  };
  const frierenEp5Magnet = "magnet:?xt=urn:btih:0123456789abcdef0123456789abcdef01234567&dn=[SubsPlease]+Sousou+no+Frieren+-+05+[1080p].mkv";

  await p.search({
    query: frierenEp5Magnet,
    media: mediaFrieren
  });

  const frierenEp5Smart = await p.smartSearch({
    episodeNumber: 5,
    batch: false,
    media: mediaFrieren
  });
  assert.strictEqual(frierenEp5Smart.length, 1, "Must return ep 5 torrent");
  assert.strictEqual(frierenEp5Smart[0].episodeNumber, 5);
  assert.strictEqual(frierenEp5Smart[0].isBatch, false);

  // smartSearch for ep 6 should NOT return ep 5 single episode torrent
  const frierenEp6Smart = await p.smartSearch({
    episodeNumber: 6,
    batch: false,
    media: mediaFrieren
  });
  assert.strictEqual(frierenEp6Smart.length, 0, "Must not return ep 5 for ep 6 smart search");
  console.log("✓ Test 7: Single episode torrent matches only requested episode number");

  // Test 8: Base32 InfoHash support
  // 32-char Base32 RFC test
  const b32Magnet = "magnet:?xt=urn:btih:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA&dn=Test+Base32";
  const b32Results = await p.search({
    query: b32Magnet,
    media: { id: 9999 }
  });
  assert.strictEqual(b32Results[0].infoHash, "0000000000000000000000000000000000000000");
  console.log("✓ Test 8: Base32 infohash decoded to 40-char lowercase hex string");

  // Test 9: Clear command
  const clearResult = await p.search({
    query: "clear",
    media: mediaMonster
  });
  assert.strictEqual(clearResult.length, 0, "Clear query returns empty array");
  const monsterAfterClear = await p.search({
    query: "Monster",
    media: mediaMonster
  });
  assert.strictEqual(monsterAfterClear.length, 0, "Monster library should be empty after clear");
  console.log("✓ Test 9: 'clear' command wipes stored torrents for that mediaId");

  console.log("\nAll 9 tests PASSED successfully!");
}

runTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
