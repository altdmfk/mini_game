/**
 * Dynamic Online Dictionary Service
 * Cache-First Architecture with live REST API fallback and explicit network error reporting.
 */

class DynamicDictionaryService {
  constructor() {
    this.targetPool = [];
    this.validCache = new Set();
    this.isReady = false;
    this.loadPersistedValidCache();
  }

  // Load previously validated words from localStorage
  loadPersistedValidCache() {
    this.definitionCache = {};
    if (typeof localStorage === "undefined") return;
    try {
      const cachedValid = localStorage.getItem("wordle_valid_cache");
      if (cachedValid) {
        const words = JSON.parse(cachedValid);
        words.forEach(w => this.validCache.add(w));
      }
      const cachedDefs = localStorage.getItem("wordle_def_cache");
      if (cachedDefs) {
        this.definitionCache = JSON.parse(cachedDefs);
      }
    } catch (e) {}
  }

  // Save new validated word to persistent cache
  persistValidWord(word) {
    this.validCache.add(word);
    if (typeof localStorage === "undefined") return;
    try {
      const arr = Array.from(this.validCache);
      localStorage.setItem("wordle_valid_cache", JSON.stringify(arr));
    } catch (e) {}
  }

  // Initialize word pool: Check cache first, then fetch from API if cache is empty
  async init() {
    // 1. Check local persistent cache
    if (typeof localStorage !== "undefined") {
      try {
        const cached = localStorage.getItem("wordle_target_pool_v2");
        const cachedDefs = localStorage.getItem("wordle_def_cache_v2");
        if (cached && cachedDefs) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.targetPool = parsed;
            this.targetPool.forEach(w => this.validCache.add(w));
            this.isReady = true;
            return { success: true, fromCache: true };
          }
        }
      } catch (e) {}
    }

    // 2. If cache is empty, fetch from online API
    try {
      // Use md=dp to fetch definitions AND part of speech tags
      const res = await fetch("https://api.datamuse.com/words?sp=?????&max=800&md=dp");
      if (!res.ok) throw new Error("HTTP error " + res.status);
      const data = await res.json();

      // Filter out proper nouns, obscure words, and ensure it has a definition
      const validItems = data.filter(item => {
        const isFiveLetters = /^[a-zA-Z]{5}$/.test(item.word);
        const hasDef = item.defs && item.defs.length > 0;
        const isProperNoun = item.tags && item.tags.includes("prop");
        return isFiveLetters && hasDef && !isProperNoun;
      }).slice(0, 350); // Keep only the top 350 most common English words

      this.targetPool = validItems.map(item => item.word.toUpperCase());
      
      // Cache definitions in a simple map
      this.definitionCache = {};
      validItems.forEach(item => {
        const upper = item.word.toUpperCase();
        this.validCache.add(upper);
        // Datamuse defs look like "n\tA small rodent". Clean it up.
        let rawDef = item.defs[0];
        let cleaned = rawDef.includes('\t') ? rawDef.split('\t')[1] : rawDef;
        this.definitionCache[upper] = cleaned;
      });

      if (!this.targetPool.length) throw new Error("Empty API payload");

      if (typeof localStorage !== "undefined") {
        localStorage.setItem("wordle_target_pool_v2", JSON.stringify(this.targetPool));
        localStorage.setItem("wordle_def_cache_v2", JSON.stringify(this.definitionCache));
      }

      this.isReady = true;
      return { success: true, fromCache: false };
    } catch (err) {
      console.warn("Dictionary API fetch failed and cache is empty:", err);
      this.isReady = false;
      return { success: false, error: "NETWORK_ERROR" };
    }
  }

  // Pick a random target word from pool
  getRandomTarget() {
    if (!this.targetPool.length) {
      return null;
    }
    const idx = Math.floor(Math.random() * this.targetPool.length);
    return this.targetPool[idx];
  }

  // Validate guess: Check cache first, then verify with live API
  async isValidGuess(word) {
    const upper = word.toUpperCase();
    if (this.validCache.has(upper)) {
      return { valid: true, fromCache: true };
    }

    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
      if (res.ok) {
        this.persistValidWord(upper);
        return { valid: true, fromCache: false };
      }
      
      // If explicitly not found in dictionary, reject it
      if (res.status === 404) {
        return { valid: false, fromCache: false };
      }
      
      // If we hit a rate limit (429) or server error (500+), be lenient and accept the word
      // rather than falsely rejecting valid words like "MOUSE".
      return { valid: true, fromCache: false };
    } catch (e) {
      // API blocked, CORS, or offline. Fallback to true to not ruin the game.
      return { valid: true, fromCache: false };
    }
  }

  // Fetch definition & phonetics for end-game card
  async fetchDefinition(word) {
    const upper = word.toUpperCase();
    if (this.definitionCache && this.definitionCache[upper]) {
      return {
        word: word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        definition: this.definitionCache[upper]
      };
    }

    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
      if (!res.ok) return null;
      const data = await res.json();
      const firstEntry = data[0];
      const meaning = firstEntry.meanings?.[0];
      const def = meaning?.definitions?.[0]?.definition;
      const partOfSpeech = meaning?.partOfSpeech;
      const phonetic = firstEntry.phonetic || firstEntry.phonetics?.find(p => p.text)?.text || "";

      return {
        word: word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        partOfSpeech,
        phonetic,
        definition: def || "Definition unavailable."
      };
    } catch (e) {
      return null;
    }
  }
}

const dictionaryService = new DynamicDictionaryService();

if (typeof window !== "undefined") {
  window.dictionaryService = dictionaryService;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { DynamicDictionaryService, dictionaryService };
}
