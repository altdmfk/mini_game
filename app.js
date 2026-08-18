/**
 * Wordle Mini-Game Engine
 */

// Web Audio API Procedural Sound Synthesizer
class SoundController {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
  }

  playKeySound() {
    if (this.isMuted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  playDeleteSound() {
    if (this.isMuted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playShakeSound() {
    if (this.isMuted) return;
    this.init();
    [130, 123].forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    });
  }

  playFlipSound(index) {
    if (this.isMuted) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    const baseFreq = 300 + index * 80;
    osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playWinSound() {
    if (this.isMuted) return;
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.1 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + i * 0.1);
      osc.stop(this.ctx.currentTime + i * 0.1 + 0.35);
    });
  }

  playLoseSound() {
    if (this.isMuted) return;
    this.init();
    const notes = [400, 370, 340, 300];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.15);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.15 + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + i * 0.15);
      osc.stop(this.ctx.currentTime + i * 0.15 + 0.25);
    });
  }
}

// Obfuscation helper (Anti-Cheat)
const Obfuscator = {
  encode: (w, key = 0x5a) => Array.from(w).map(c => (c.charCodeAt(0) ^ key).toString(16).padStart(2, "0")).join(""),
  decode: (h, key = 0x5a) => h.match(/.{2}/g).map(hex => String.fromCharCode(parseInt(hex, 16) ^ key)).join("")
};

// Main Game Manager
class GameManager {
  constructor() {
    this.WORD_LENGTH = 5;
    this.MAX_ATTEMPTS = 6;

    this.state = "READY"; // "READY" | "PLAYING" | "SUCCESS" | "FAILED"
    this._encodedTarget = "";
    this.currentRow = 0;
    this.currentTile = 0;
    this.guesses = [];
    this.isAnimating = false;

    this.sound = new SoundController();
    this.reducedMotion = false;

    this.initStats();
    this.cacheDOM();
    this.bindEvents();
    this.buildBoard();
    this.resetGame();
  }

  cacheDOM() {
    this.boardEl = document.getElementById("board");
    this.statusEl = document.getElementById("game-status");
    this.toastContainer = document.getElementById("toast-container");
    this.restartBtn = document.getElementById("restart-btn");
    this.soundToggleBtn = document.getElementById("sound-toggle-btn");
    this.motionToggleBtn = document.getElementById("motion-toggle-btn");
    this.difficultySelect = document.getElementById("difficulty-select");

    this.rulesBtn = document.getElementById("rules-btn");
    this.statsBtn = document.getElementById("stats-btn");
    this.rulesModal = document.getElementById("rules-modal");
    this.statsModal = document.getElementById("stats-modal");
    this.closeRulesBtn = document.getElementById("close-rules-btn");
    this.closeStatsBtn = document.getElementById("close-stats-btn");
  }

  initStats() {
    const raw = localStorage.getItem("wordle_mini_stats");
    this.stats = raw ? JSON.parse(raw) : { played: 0, wins: 0, streak: 0, maxStreak: 0 };
  }

  saveStats() {
    localStorage.setItem("wordle_mini_stats", JSON.stringify(this.stats));
  }

  updateStatsUI() {
    document.getElementById("stat-played").textContent = this.stats.played;
    const rate = this.stats.played ? Math.round((this.stats.wins / this.stats.played) * 100) : 0;
    document.getElementById("stat-winrate").textContent = `${rate}%`;
    document.getElementById("stat-streak").textContent = this.stats.streak;
    document.getElementById("stat-maxstreak").textContent = this.stats.maxStreak;
  }

  buildBoard() {
    this.boardEl.innerHTML = "";
    this.boardEl.style.gridTemplateRows = `repeat(${this.MAX_ATTEMPTS}, 1fr)`;
    this.boardEl.style.aspectRatio = `5 / ${this.MAX_ATTEMPTS}`;

    for (let r = 0; r < this.MAX_ATTEMPTS; r++) {
      const row = document.createElement("div");
      row.className = "row";
      row.dataset.row = r;
      row.setAttribute("role", "row");

      for (let c = 0; c < this.WORD_LENGTH; c++) {
        const tile = document.createElement("div");
        tile.className = "tile";
        tile.dataset.col = c;
        tile.setAttribute("role", "gridcell");
        tile.setAttribute("aria-label", `Row ${r + 1} Column ${c + 1}: Empty`);
        row.appendChild(tile);
      }
      this.boardEl.appendChild(row);
    }
  }

  bindEvents() {
    // Physical keyboard listener
    window.addEventListener("keydown", (e) => this.handlePhysicalKey(e));

    // Virtual keyboard listener
    document.getElementById("keyboard").addEventListener("click", (e) => {
      const keyBtn = e.target.closest("button.key");
      if (!keyBtn) return;
      this.processInput(keyBtn.dataset.key);
    });

    // Control bar buttons
    this.restartBtn.addEventListener("click", () => this.resetGame(true));
    this.soundToggleBtn.addEventListener("click", () => this.toggleSound());
    this.motionToggleBtn.addEventListener("click", () => this.toggleReducedMotion());

    this.difficultySelect.addEventListener("change", (e) => {
      this.changeDifficulty(e.target.value);
    });

    // Modal triggers
    this.rulesBtn.addEventListener("click", () => this.openModal(this.rulesModal));
    this.statsBtn.addEventListener("click", () => {
      this.updateStatsUI();
      this.openModal(this.statsModal);
    });
    this.closeRulesBtn.addEventListener("click", () => this.closeModal(this.rulesModal));
    this.closeStatsBtn.addEventListener("click", () => this.closeModal(this.statsModal));

    [this.rulesModal, this.statsModal].forEach(modal => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) this.closeModal(modal);
      });
    });

    // Match OS motion preferences
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.setReducedMotion(true);
    }
  }

  openModal(modal) {
    modal.classList.add("open");
  }

  closeModal(modal) {
    modal.classList.remove("open");
  }

  toggleSound() {
    const isMuted = !this.sound.isMuted;
    this.sound.setMuted(isMuted);
    this.soundToggleBtn.textContent = isMuted ? "🔇 Sound: OFF" : "🔊 Sound: ON";
    this.soundToggleBtn.classList.toggle("is-active", isMuted);
    this.soundToggleBtn.setAttribute("aria-pressed", (!isMuted).toString());
    this.showToast(isMuted ? "Sound Muted" : "Sound Enabled", 1200);
  }

  toggleReducedMotion() {
    this.setReducedMotion(!this.reducedMotion);
    this.showToast(this.reducedMotion ? "Reduced Motion ON" : "Reduced Motion OFF", 1200);
  }

  setReducedMotion(enabled) {
    this.reducedMotion = enabled;
    document.body.classList.toggle("reduced-motion", enabled);
    document.body.classList.toggle("allow-motion", !enabled);
    this.motionToggleBtn.textContent = enabled ? "⚡ Motion: OFF" : "⚡ Motion: ON";
    this.motionToggleBtn.classList.toggle("is-active", enabled);
    this.motionToggleBtn.setAttribute("aria-pressed", enabled.toString());
  }

  changeDifficulty(level) {
    if (level === "easy") this.MAX_ATTEMPTS = 8;
    else if (level === "hard") this.MAX_ATTEMPTS = 4;
    else this.MAX_ATTEMPTS = 6;
    
    this.difficultyLevel = level;
    this.buildBoard();
    this.resetGame(true);
    this.showToast(`Difficulty set to ${level.toUpperCase()}`);
  }

  setStatus(newState) {
    this.state = newState;
    this.statusEl.textContent = newState;
    this.statusEl.className = `status-badge status-${newState.toLowerCase()}`;
  }

  // Get active target word (decoded on demand)
  getTargetWord() {
    return Obfuscator.decode(this._encodedTarget);
  }

  saveGameState() {
    const stateObj = {
      target: this._encodedTarget,
      guesses: this.guesses,
      state: this.state,
      difficulty: this.difficultyLevel || "medium",
      maxAttempts: this.MAX_ATTEMPTS
    };
    localStorage.setItem("wordle_mini_state", JSON.stringify(stateObj));
  }

  clearBoardUI() {
    const rows = this.boardEl.querySelectorAll(".row");
    rows.forEach((row, r) => {
      row.classList.remove("shake");
      const tiles = row.querySelectorAll(".tile");
      tiles.forEach((tile, c) => {
        tile.textContent = "";
        tile.className = "tile";
        delete tile.dataset.state;
        tile.setAttribute("aria-label", `Row ${r + 1} Column ${c + 1}: Empty`);
      });
    });

    const keys = document.querySelectorAll("#keyboard .key");
    keys.forEach(k => delete k.dataset.state);

    const defContainer = document.getElementById("word-definition-container");
    if (defContainer) defContainer.innerHTML = "";
  }

  restoreGuesses() {
    this.guesses.forEach((guess, r) => {
      const row = this.boardEl.children[r];
      const evaluation = this.evaluateGuess(guess);
      
      for (let c = 0; c < this.WORD_LENGTH; c++) {
        const tile = row.children[c];
        tile.textContent = guess[c];
        tile.dataset.state = evaluation[c];
        this.updateKeyboardKey(guess[c], evaluation[c]);
      }
      this.currentRow++;
    });
  }

  async resetGame(forceNew = false) {
    if (!window.dictionaryService.isReady) {
      this.showToast("Checking cache & connecting...", 1500);
      const res = await window.dictionaryService.init();
      if (!res.success) {
        this.setStatus("OFFLINE");
        this.showToast("⚠️ Network Error: Cache is empty and no internet connection. Please reconnect and click Restart.", 5000);
        return;
      }
    }

    if (!forceNew) {
      try {
        const raw = localStorage.getItem("wordle_mini_state");
        if (raw) {
          const savedState = JSON.parse(raw);
          if (savedState && savedState.target) {
            this._encodedTarget = savedState.target;
            this.guesses = savedState.guesses || [];
            this.state = savedState.state || "READY";
            
            if (savedState.difficulty) {
              this.difficultyLevel = savedState.difficulty;
              this.MAX_ATTEMPTS = savedState.maxAttempts || 6;
              if (this.difficultySelect) this.difficultySelect.value = this.difficultyLevel;
              this.buildBoard();
            }

            this.setStatus(this.state);
            this.currentRow = 0;
            this.currentTile = 0;
            this.isAnimating = false;
            this.clearBoardUI();
            this.restoreGuesses();
            
            // If the game was already over, show the answer/definition immediately
            if (this.state === "SUCCESS" || this.state === "FAILED") {
              this.renderDefinition(this.getTargetWord());
            } else {
              this.showToast("Game Restored", 1200);
            }
            return;
          }
        }
      } catch (e) {}
    }

    const rawWord = window.dictionaryService.getRandomTarget();
    if (!rawWord) {
      this.setStatus("OFFLINE");
      this.showToast("⚠️ Network Error: No word list available. Please connect to the internet.", 4000);
      return;
    }

    this._encodedTarget = Obfuscator.encode(rawWord);
    this.currentRow = 0;
    this.currentTile = 0;
    this.guesses = [];
    this.isAnimating = false;
    this.setStatus("READY");
    this.clearBoardUI();
    this.saveGameState();

    this.showToast("New Game Started!", 1400);
  }

  handlePhysicalKey(e) {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    const key = e.key.toUpperCase();
    if (key === "ENTER") {
      this.processInput("ENTER");
    } else if (key === "BACKSPACE") {
      this.processInput("BACKSPACE");
    } else if (/^[A-Z]$/.test(key)) {
      this.processInput(key);
    }
  }

  processInput(key) {
    if (this.state === "SUCCESS" || this.state === "FAILED" || this.state === "OFFLINE" || this.isAnimating) {
      return;
    }

    if (key === "BACKSPACE") {
      this.deleteLetter();
    } else if (key === "ENTER") {
      this.submitGuess();
    } else if (/^[A-Z]$/.test(key)) {
      this.addLetter(key);
    }
  }

  addLetter(letter) {
    if (this.currentTile >= this.WORD_LENGTH) return;

    if (this.state === "READY") {
      this.setStatus("PLAYING");
    }

    const row = this.boardEl.children[this.currentRow];
    const tile = row.children[this.currentTile];
    tile.textContent = letter;
    tile.dataset.state = "filled";
    tile.setAttribute("aria-label", `Row ${this.currentRow + 1} Column ${this.currentTile + 1}: ${letter}`);

    this.sound.playKeySound();
    this.currentTile++;
  }

  deleteLetter() {
    if (this.currentTile <= 0) return;

    this.currentTile--;
    const row = this.boardEl.children[this.currentRow];
    const tile = row.children[this.currentTile];
    tile.textContent = "";
    delete tile.dataset.state;
    tile.setAttribute("aria-label", `Row ${this.currentRow + 1} Column ${this.currentTile + 1}: Empty`);

    this.sound.playDeleteSound();
  }

  // Dual-pass letter evaluation algorithm
  evaluateGuess(guess) {
    const targetWord = this.getTargetWord();
    const result = new Array(this.WORD_LENGTH).fill("absent");
    const targetCounts = {};

    for (let char of targetWord) {
      targetCounts[char] = (targetCounts[char] || 0) + 1;
    }

    // Pass 1: exact matches (green)
    for (let i = 0; i < this.WORD_LENGTH; i++) {
      if (guess[i] === targetWord[i]) {
        result[i] = "correct";
        targetCounts[guess[i]]--;
      }
    }

    // Pass 2: misplaced matches (yellow)
    for (let i = 0; i < this.WORD_LENGTH; i++) {
      if (result[i] === "correct") continue;
      const char = guess[i];
      if (targetCounts[char] && targetCounts[char] > 0) {
        result[i] = "present";
        targetCounts[char]--;
      }
    }

    return result;
  }

  async submitGuess() {
    if (this.currentTile < this.WORD_LENGTH) {
      this.shakeRow();
      this.showToast("Not enough letters");
      return;
    }

    const row = this.boardEl.children[this.currentRow];
    let guess = "";
    for (let i = 0; i < this.WORD_LENGTH; i++) {
      guess += row.children[i].textContent;
    }

    this.isAnimating = true;
    const check = await window.dictionaryService.isValidGuess(guess);

    if (check.networkError) {
      this.isAnimating = false;
      this.shakeRow();
      this.showToast("⚠️ Network Error: Cannot validate word while offline");
      return;
    }

    if (!check.valid) {
      this.isAnimating = false;
      this.shakeRow();
      this.showToast("Not in word list");
      return;
    }

    const evaluation = this.evaluateGuess(guess);
    this.revealRow(evaluation, guess);
  }

  shakeRow() {
    const row = this.boardEl.children[this.currentRow];
    row.classList.remove("shake");
    void row.offsetWidth; // Trigger reflow
    row.classList.add("shake");
    this.sound.playShakeSound();
  }

  revealRow(evaluation, guess) {
    this.isAnimating = true;
    const row = this.boardEl.children[this.currentRow];
    const tiles = Array.from(row.children);

    const applyTileResult = (index) => {
      const tile = tiles[index];
      const state = evaluation[index];
      const letter = guess[index];

      tile.dataset.state = state;
      tile.setAttribute("aria-label", `Row ${this.currentRow + 1} Column ${index + 1}: ${letter} (${state})`);
      this.updateKeyboardKey(letter, state);
      this.sound.playFlipSound(index);
    };

    if (this.reducedMotion) {
      for (let i = 0; i < this.WORD_LENGTH; i++) {
        applyTileResult(i);
      }
      this.finalizeGuess(guess);
      this.isAnimating = false;
    } else {
      tiles.forEach((tile, i) => {
        setTimeout(() => {
          tile.classList.add("flip-in");
          setTimeout(() => {
            applyTileResult(i);
            tile.classList.remove("flip-in");
            tile.classList.add("flip-out");
            setTimeout(() => {
              tile.classList.remove("flip-out");
              if (i === this.WORD_LENGTH - 1) {
                this.finalizeGuess(guess);
                this.isAnimating = false;
              }
            }, 120);
          }, 120);
        }, i * 200);
      });
    }
  }

  updateKeyboardKey(letter, state) {
    const keyBtn = document.querySelector(`#keyboard button[data-key="${letter}"]`);
    if (!keyBtn) return;

    const currentState = keyBtn.dataset.state;
    if (currentState === "correct") return;
    if (currentState === "present" && state === "absent") return;

    keyBtn.dataset.state = state;
  }

  finalizeGuess(guess) {
    const targetWord = this.getTargetWord();
    const isWin = guess === targetWord;
    
    this.guesses.push(guess);
    this.currentRow++;
    this.currentTile = 0;

    if (isWin) {
      this.handleVictory();
    } else if (this.currentRow >= this.MAX_ATTEMPTS) {
      this.handleDefeat(targetWord);
    }
    
    // ALWAYS save state so refresh remembers the final win/loss
    this.saveGameState();
  }

  async handleVictory() {
    this.setStatus("SUCCESS");
    this.stats.played++;
    this.stats.wins++;
    this.stats.streak++;
    this.stats.maxStreak = Math.max(this.stats.streak, this.stats.maxStreak);
    this.saveStats();

    const winningRow = this.boardEl.children[this.currentRow - 1];
    if (!this.reducedMotion) {
      Array.from(winningRow.children).forEach((tile, i) => {
        setTimeout(() => tile.classList.add("bounce"), i * 100);
      });
    }

    this.sound.playWinSound();
    const praise = ["Genius!", "Magnificent!", "Impressive!", "Splendid!", "Great!", "Phew!"];
    const message = praise[Math.min(this.currentRow - 1, praise.length - 1)];
    this.showToast(message, 2500);

    await this.renderDefinition(this.getTargetWord());
  }

  async handleDefeat(targetWord) {
    this.setStatus("FAILED");
    this.stats.played++;
    this.stats.streak = 0;
    this.saveStats();

    this.sound.playLoseSound();
    this.showToast(`Game Over! Word was ${targetWord}`, 3500);

    await this.renderDefinition(targetWord);
  }

  async renderDefinition(word) {
    const defContainer = document.getElementById("word-definition-container");
    if (!defContainer) return;

    defContainer.innerHTML = `<div style="text-align:center; padding: 8px; color:var(--text-secondary); font-size:0.8rem;">Loading definition...</div>`;
    const data = await window.dictionaryService.fetchDefinition(word);
    
    if (data) {
      defContainer.innerHTML = `
        <div class="definition-card">
          <div class="def-header">
            <span class="def-word">Answer: ${data.word}</span>
            ${data.phonetic ? `<span class="def-phonetic">${data.phonetic}</span>` : ""}
            ${data.partOfSpeech ? `<span class="def-pos">${data.partOfSpeech}</span>` : ""}
          </div>
          <div class="def-text">${data.definition}</div>
        </div>
      `;
    } else {
      defContainer.innerHTML = `
        <div class="definition-card">
          <div class="def-header">
            <span class="def-word">Answer: ${word}</span>
          </div>
          <div class="def-text">Definition unavailable.</div>
        </div>
      `;
    }
  }

  showToast(message, duration = 1800) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.2s ease";
      setTimeout(() => toast.remove(), 200);
    }, duration);
  }
}

// Bootstrap game when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  if (window.dictionaryService) {
    await window.dictionaryService.init();
  }
  window.game = new GameManager();
});
