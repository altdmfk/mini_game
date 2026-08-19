/**
 * Dino Jump Mini Engine
 * Responsive Jump Buffering, 15s Retro Pixel Ghost Hazards & 42-Obstacle Flat Monochrome Origami Paper Boat Hat
 */

// Preset difficulty configurations with fair speeds
const DIFFICULTY_CONFIG = {
  easy: { speed: 280, name: 'Easy' },
  medium: { speed: 380, name: 'Medium' },
  hard: { speed: 480, name: 'Hard' }
};

// Web Audio API Procedural Sound Synthesizer
class SoundController {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  // Lazily initialize audio context on user gesture
  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Toggle audio mute state
  setMuted(muted) {
    this.isMuted = muted;
  }

  // Synthesize jumping sound effect
  playJump() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Synthesize obstacle cleared chime
  playClear() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1320, now + 0.05);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Synthesize speed-up acceleration chime
  playSpeedUp() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(1040, now + 0.18);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Synthesize retro spooky ghost wobble chime
  playGhostSpooky() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.linearRampToValueAtTime(740, now + 0.1);
    osc.frequency.linearRampToValueAtTime(460, now + 0.22);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Synthesize Easter Egg celebration fanfare chime
  playEasterEgg() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const now = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gain.gain.setValueAtTime(0.15, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.25);
    });
  }

  // Synthesize collision failure buzz
  playCollision() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(60, now + 0.25);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }
}

// Defensive Persistent Storage Manager with Schema Validation
class StorageManager {
  constructor(key = 'dino_jump_mini_stats_v6') {
    this.key = key;
    this.defaultSchema = {
      highScores: { easy: 0, medium: 0, hard: 0 },
      bestTime: 0,
      totalRuns: 0,
      lifetimeJumps: 0,
      lastFailureReason: 'None (New Game)',
      difficulty: 'medium',
      isMuted: false,
      reducedMotion: false,
      unlockedPaperHat: false,
      wearPaperHat: false
    };
  }

  // Read persistent stats with schema verification and fallback
  load() {
    if (typeof localStorage === 'undefined') return { ...this.defaultSchema };
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return { ...this.defaultSchema };
      const parsed = JSON.parse(raw);
      const validDiff = (parsed.difficulty === 'easy' || parsed.difficulty === 'hard' || parsed.difficulty === 'medium')
        ? parsed.difficulty
        : 'medium';

      const highScores = {
        easy: (parsed.highScores && typeof parsed.highScores.easy === 'number') ? Math.max(0, parsed.highScores.easy) : 0,
        medium: (parsed.highScores && typeof parsed.highScores.medium === 'number') ? Math.max(0, parsed.highScores.medium) : 0,
        hard: (parsed.highScores && typeof parsed.highScores.hard === 'number') ? Math.max(0, parsed.highScores.hard) : 0
      };

      if (typeof parsed.highScore === 'number' && parsed.highScore > highScores[validDiff]) {
        highScores[validDiff] = parsed.highScore;
      }

      return {
        highScores: highScores,
        bestTime: typeof parsed.bestTime === 'number' && isFinite(parsed.bestTime) ? Math.max(0, parsed.bestTime) : 0,
        totalRuns: typeof parsed.totalRuns === 'number' && isFinite(parsed.totalRuns) ? Math.max(0, parsed.totalRuns) : 0,
        lifetimeJumps: typeof parsed.lifetimeJumps === 'number' && isFinite(parsed.lifetimeJumps) ? Math.max(0, parsed.lifetimeJumps) : 0,
        lastFailureReason: typeof parsed.lastFailureReason === 'string' ? parsed.lastFailureReason : 'None',
        difficulty: validDiff,
        isMuted: Boolean(parsed.isMuted),
        reducedMotion: Boolean(parsed.reducedMotion),
        unlockedPaperHat: Boolean(parsed.unlockedPaperHat),
        wearPaperHat: Boolean(parsed.wearPaperHat)
      };
    } catch (e) {
      console.warn('Storage corrupted, reverting to default stats schema:', e);
      return { ...this.defaultSchema };
    }
  }

  // Save state defensively to localStorage
  save(data) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(this.key, JSON.stringify(data));
    } catch (e) {
      console.warn('Unable to persist data to localStorage:', e);
    }
  }

  // Clear stored stats back to baseline
  clear() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem(this.key);
    } catch (e) {}
  }
}

// Particle Burst System for Jumps
class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  // Reset active particles
  reset() {
    this.particles = [];
  }

  // Spawn dust particle burst upon jump
  spawnDust(x, y) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: x + Math.random() * 10 - 5,
        y: y - 2,
        vx: -(Math.random() * 80 + 20),
        vy: -(Math.random() * 30 + 10),
        size: Math.random() * 3 + 2,
        alpha: 1,
        color: '#94a3b8',
        life: 0.25,
        maxLife: 0.25
      });
    }
  }

  // Update particle physics via delta time
  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  // Draw active particles to canvas
  draw(ctx) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      ctx.restore();
    }
  }
}

// Retro Pixel Art Dino Entity with Jump Buffering & Flat Monochrome Origami Paper Boat Hat
class Dino {
  constructor(groundY) {
    this.x = 60;
    this.groundY = groundY;
    this.width = 44;
    this.height = 48;
    this.y = groundY - this.height;
    this.vy = 0;
    this.gravity = 1500;
    this.jumpVelocity = -540;
    this.isGrounded = true;
    this.legTimer = 0;
    this.legState = 0;
    this.wearPaperHat = false;

    // Platformer Jump Buffering & Coyote Time Grace Window
    this.jumpBufferTimer = 0; // Remembers jump pressed 160ms prior to landing
    this.coyoteTimer = 0;     // 80ms grace window after leaving ground
  }

  // Reset character state and positioning
  reset() {
    this.y = this.groundY - this.height;
    this.vy = 0;
    this.isGrounded = true;
    this.legTimer = 0;
    this.legState = 0;
    this.jumpBufferTimer = 0;
    this.coyoteTimer = 0;
  }

  // Request jump impulse with instant execution or buffering
  requestJump() {
    if (this.isGrounded || this.coyoteTimer > 0) {
      this.vy = this.jumpVelocity;
      this.isGrounded = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      return 'jumped';
    } else {
      // Buffer the jump input so the instant dino lands, it jumps automatically!
      this.jumpBufferTimer = 0.16;
      return 'buffered';
    }
  }

  // Update physics, buffer countdowns, and running leg animations
  update(dt, reducedMotion = false) {
    let didBufferedJump = false;

    if (!this.isGrounded) {
      if (this.coyoteTimer > 0) {
        this.coyoteTimer -= dt;
      }
      if (this.jumpBufferTimer > 0) {
        this.jumpBufferTimer -= dt;
      }

      this.vy += this.gravity * dt;
      this.y += this.vy * dt;

      // Touch down on ground
      if (this.y >= this.groundY - this.height) {
        this.y = this.groundY - this.height;
        this.vy = 0;
        this.isGrounded = true;

        // If a jump was queued before landing, execute jump instantly!
        if (this.jumpBufferTimer > 0) {
          this.jumpBufferTimer = 0;
          this.vy = this.jumpVelocity;
          this.isGrounded = false;
          didBufferedJump = true;
        }
      }
    } else {
      if (!reducedMotion) {
        this.legTimer += dt;
        if (this.legTimer > 0.08) {
          this.legTimer = 0;
          this.legState = 1 - this.legState;
        }
      } else {
        this.legState = 0;
      }
    }

    return didBufferedJump;
  }

  // Render Crisp Retro Pixel Art Dino and Flat Monochrome Paper Boat Hat on canvas
  draw(ctx, state) {
    ctx.save();
    const px = Math.round(this.x);
    const py = Math.round(this.y);
    const color = state === 'FAILED' ? '#dc2626' : '#1e293b';

    ctx.fillStyle = color;

    // Head Top & Snout
    ctx.fillRect(px + 22, py + 2, 20, 4);
    ctx.fillRect(px + 20, py + 6, 24, 6);
    ctx.fillRect(px + 20, py + 12, 24, 4);
    ctx.fillRect(px + 20, py + 16, 16, 4);

    // Neck & Back
    ctx.fillRect(px + 18, py + 18, 12, 6);

    // Body Trunk
    ctx.fillRect(px + 10, py + 22, 22, 12);
    ctx.fillRect(px + 8, py + 26, 24, 8);

    // Tail
    ctx.fillRect(px + 4, py + 24, 6, 6);
    ctx.fillRect(px, py + 22, 4, 6);
    ctx.fillRect(px, py + 18, 4, 4);

    // Back Ridge / Spine Pixels
    ctx.fillRect(px + 14, py + 18, 4, 4);

    // Tiny Pixel Arm
    ctx.fillRect(px + 30, py + 24, 6, 3);
    ctx.fillRect(px + 34, py + 27, 2, 3);

    // Pixel Eye
    if (state === 'FAILED') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 26, py + 6, 6, 6);
      ctx.fillStyle = '#000000';
      ctx.fillRect(px + 26, py + 6, 2, 2);
      ctx.fillRect(px + 30, py + 6, 2, 2);
      ctx.fillRect(px + 28, py + 8, 2, 2);
      ctx.fillRect(px + 26, py + 10, 2, 2);
      ctx.fillRect(px + 30, py + 10, 2, 2);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 26, py + 6, 6, 6);
      ctx.fillStyle = '#000000';
      ctx.fillRect(px + 28, py + 8, 3, 3);
    }

    // Pixel Legs Rendering
    ctx.fillStyle = color;
    if (!this.isGrounded) {
      ctx.fillRect(px + 12, py + 36, 4, 6);
      ctx.fillRect(px + 14, py + 40, 4, 3);
      ctx.fillRect(px + 22, py + 36, 4, 6);
      ctx.fillRect(px + 24, py + 40, 4, 3);
    } else {
      if (this.legState === 0) {
        ctx.fillRect(px + 12, py + 36, 4, 10);
        ctx.fillRect(px + 14, py + 44, 4, 3);
        ctx.fillRect(px + 22, py + 36, 4, 6);
        ctx.fillRect(px + 24, py + 40, 4, 3);
      } else {
        ctx.fillRect(px + 12, py + 36, 4, 6);
        ctx.fillRect(px + 14, py + 40, 4, 3);
        ctx.fillRect(px + 22, py + 36, 4, 10);
        ctx.fillRect(px + 24, py + 44, 4, 3);
      }
    }

    // ⛵ Flat Monochrome 2D Pixel Paper Boat Hat Easter Egg
    if (this.wearPaperHat) {
      const bx = px + 20;
      const by = py - 10;

      // 1. Boat Hull Base (Pure White Fill)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx + 2, by + 7, 20, 4);

      // 2. Sail / Triangle Peak (Pure White Fill)
      ctx.fillRect(bx + 6, by + 3, 12, 4);
      ctx.fillRect(bx + 9, by + 1, 6, 2);
      ctx.fillRect(bx + 11, by, 2, 1);

      // 3. Crisp Flat Monochrome Outlines & Creases (Color matching Dino)
      ctx.fillStyle = color;

      // Sail Top & Slope Lines
      ctx.fillRect(bx + 10, by, 4, 2);
      ctx.fillRect(bx + 8, by + 2, 2, 2);
      ctx.fillRect(bx + 14, by + 2, 2, 2);
      ctx.fillRect(bx + 6, by + 4, 2, 3);
      ctx.fillRect(bx + 16, by + 4, 2, 3);

      // Vertical Center Fold Line
      ctx.fillRect(bx + 11, by + 2, 2, 5);

      // Hull Rim, Bottom, and Diagonal Bow/Stern Folds
      ctx.fillRect(bx, by + 7, 24, 2);      // Horizontal rim
      ctx.fillRect(bx + 3, by + 11, 18, 2);  // Flat bottom
      ctx.fillRect(bx + 1, by + 9, 2, 2);   // Left tip
      ctx.fillRect(bx + 21, by + 9, 2, 2);  // Right tip
    }

    ctx.restore();
  }

  // Calculate fair bounding box with 5px inset padding
  getBounds() {
    return {
      x: this.x + 6,
      y: this.y + 4,
      width: this.width - 12,
      height: this.height - 6
    };
  }
}

// Obstacle Entity (Green Cacti & Retro Pixel Ghosts)
class Obstacle {
  constructor(x, groundY, type = 'small', index = 1) {
    this.x = x;
    this.groundY = groundY;
    this.type = type;
    this.index = index;
    this.cleared = false;
    this.floatTimer = 0;
    this.floatState = 0;
    this.isGhost = type === 'ghost_low' || type === 'ghost_high';

    if (type === 'small') {
      this.width = 20;
      this.height = 36;
      this.y = groundY - this.height;
    } else if (type === 'double') {
      this.width = 36;
      this.height = 38;
      this.y = groundY - this.height;
    } else if (type === 'triple') {
      this.width = 48;
      this.height = 38;
      this.y = groundY - this.height;
    } else if (type === 'tall') {
      this.width = 24;
      this.height = 44;
      this.y = groundY - this.height;
    } else if (type === 'cluster') {
      this.width = 54;
      this.height = 40;
      this.y = groundY - this.height;
    } else if (type === 'ghost_low') {
      // Low floating Pixel Ghost (jumpable by Dino!)
      this.width = 34;
      this.height = 28;
      this.y = groundY - 36;
    } else if (type === 'ghost_high') {
      // High floating Pixel Ghost (safe underpass, catches reckless jumps!)
      this.width = 34;
      this.height = 28;
      this.y = groundY - 80;
    }
  }

  // Update obstacle position and ghost floating skirt animation
  update(dt, speed, reducedMotion = false) {
    this.x -= speed * dt;
    if (this.isGhost && !reducedMotion) {
      this.floatTimer += dt;
      if (this.floatTimer > 0.15) {
        this.floatTimer = 0;
        this.floatState = 1 - this.floatState;
      }
    }
  }

  // Render obstacle graphic on canvas
  draw(ctx) {
    ctx.save();
    const ox = Math.round(this.x);
    const oy = Math.round(this.y);

    if (this.isGhost) {
      // 👻 8-Bit Retro Pixel Arcade Ghost
      const isLow = this.type === 'ghost_low';
      // Low: Neon Purple / Amethyst; High: Spectral Cyan / Phantom Blue
      const bodyColor = isLow ? '#8b5cf6' : '#06b6d4';
      const glowHighlight = isLow ? '#c4b5fd' : '#a5f3fc';

      // 1. Ghost Body Fill
      ctx.fillStyle = bodyColor;
      ctx.fillRect(ox + 6, oy, 22, 4);
      ctx.fillRect(ox + 3, oy + 4, 28, 6);
      ctx.fillRect(ox + 1, oy + 10, 32, 12);

      // 2. Dome Highlight (Retro Shine)
      ctx.fillStyle = glowHighlight;
      ctx.fillRect(ox + 8, oy + 2, 8, 2);
      ctx.fillRect(ox + 5, oy + 4, 4, 4);

      // 3. Wavy Undulating Ghost Skirt (2-Frame Animation)
      ctx.fillStyle = bodyColor;
      if (this.floatState === 0) {
        // Frame A: 3 hanging tentacles
        ctx.fillRect(ox + 1, oy + 22, 6, 6);
        ctx.fillRect(ox + 14, oy + 22, 6, 6);
        ctx.fillRect(ox + 27, oy + 22, 6, 6);
      } else {
        // Frame B: Inverted wavy tentacles
        ctx.fillRect(ox + 7, oy + 22, 7, 6);
        ctx.fillRect(ox + 20, oy + 22, 7, 6);
      }

      // 4. Expressive Arcade Ghost Eyes (Looking Left toward Dino!)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(ox + 6, oy + 8, 8, 8);   // Left eye sclera
      ctx.fillRect(ox + 18, oy + 8, 8, 8);  // Right eye sclera

      // Pupils (Deep Blue/Dark, shifted left)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(ox + 6, oy + 10, 4, 6);   // Left pupil
      ctx.fillRect(ox + 18, oy + 10, 4, 6);  // Right pupil

      // White Glint
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(ox + 7, oy + 10, 2, 2);
      ctx.fillRect(ox + 19, oy + 10, 2, 2);

    } else {
      // 🌵 100% Vibrant Green Desert Cactus
      const greenMain = '#16a34a';
      const greenLight = '#4ade80';
      ctx.fillStyle = greenMain;

      if (this.type === 'small') {
        ctx.fillRect(ox + 8, oy, 4, this.height);
        ctx.fillRect(ox, oy + 8, 8, 4);
        ctx.fillRect(ox, oy + 4, 4, 6);
        ctx.fillRect(ox + 12, oy + 12, 8, 4);
        ctx.fillRect(ox + 16, oy + 8, 4, 6);
        ctx.fillStyle = greenLight;
        ctx.fillRect(ox + 8, oy + 2, 2, this.height - 4);
      } else if (this.type === 'double') {
        ctx.fillRect(ox + 6, oy + 4, 4, this.height - 4);
        ctx.fillRect(ox, oy + 12, 6, 4);
        ctx.fillRect(ox + 22, oy, 4, this.height);
        ctx.fillRect(ox + 26, oy + 10, 6, 4);
        ctx.fillRect(ox + 28, oy + 6, 4, 6);
        ctx.fillStyle = greenLight;
        ctx.fillRect(ox + 6, oy + 6, 2, this.height - 8);
        ctx.fillRect(ox + 22, oy + 2, 2, this.height - 4);
      } else if (this.type === 'triple') {
        ctx.fillRect(ox + 6, oy + 6, 4, this.height - 6);
        ctx.fillRect(ox + 20, oy, 4, this.height);
        ctx.fillRect(ox + 34, oy + 4, 4, this.height - 4);
        ctx.fillRect(ox + 12, oy + 14, 6, 4);
        ctx.fillRect(ox + 26, oy + 12, 6, 4);
        ctx.fillRect(ox + 38, oy + 10, 6, 4);
        ctx.fillStyle = greenLight;
        ctx.fillRect(ox + 20, oy + 2, 2, this.height - 4);
        ctx.fillRect(ox + 34, oy + 6, 2, this.height - 8);
      } else if (this.type === 'tall') {
        ctx.fillRect(ox + 10, oy, 5, this.height);
        ctx.fillRect(ox + 2, oy + 10, 8, 4);
        ctx.fillRect(ox + 2, oy + 6, 4, 6);
        ctx.fillRect(ox + 15, oy + 16, 8, 4);
        ctx.fillRect(ox + 19, oy + 12, 4, 6);
        ctx.fillStyle = greenLight;
        ctx.fillRect(ox + 10, oy + 2, 2, this.height - 4);
      } else {
        // Cluster
        ctx.fillRect(ox + 6, oy + 6, 4, this.height - 6);
        ctx.fillRect(ox + 18, oy, 4, this.height);
        ctx.fillRect(ox + 32, oy + 4, 4, this.height - 4);
        ctx.fillRect(ox + 44, oy + 8, 4, this.height - 8);
        ctx.fillRect(ox, oy + 14, 6, 4);
        ctx.fillRect(ox + 24, oy + 12, 6, 4);
        ctx.fillRect(ox + 38, oy + 10, 6, 4);
        ctx.fillStyle = greenLight;
        ctx.fillRect(ox + 18, oy + 2, 2, this.height - 4);
        ctx.fillRect(ox + 32, oy + 6, 2, this.height - 8);
      }
    }

    ctx.restore();
  }

  // Calculate obstacle bounding box
  getBounds() {
    if (this.isGhost) {
      return {
        x: this.x + 4,
        y: this.y + 3,
        width: this.width - 8,
        height: this.height - 6
      };
    }
    return {
      x: this.x + 3,
      y: this.y + 3,
      width: this.width - 6,
      height: this.height - 3
    };
  }
}

// Main Game Controller
class DinoGame {
  constructor() {
    this.VIRTUAL_WIDTH = 800;
    this.VIRTUAL_HEIGHT = 300;
    this.GROUND_Y = 250;

    this.state = 'READY'; // READY | PLAYING | PAUSED | FAILED
    this.difficulty = 'medium';
    this.speed = DIFFICULTY_CONFIG.medium.speed;
    this.baseSpeed = this.speed;
    this.roundTimer = 0;
    this.obstaclesCleared = 0;
    this.jumpsCount = 0;
    this.totalSpawned = 0;
    this.spawnTimer = 0;
    this.nextSpawnInterval = 1.6;
    this.speedToastTimer = null;
    this.aerialUnlocked = false;
    this.forceNextGhost = false;

    this.lastTime = 0;
    this.animationFrameId = null;

    this.groundOffset = 0;
    this.clouds = [
      { x: 120, y: 50, speed: 20 },
      { x: 450, y: 80, speed: 25 },
      { x: 720, y: 40, speed: 18 }
    ];

    this.sound = new SoundController();
    this.storage = new StorageManager();
    this.particles = new ParticleSystem();
    this.dino = new Dino(this.GROUND_Y);
    this.obstacles = [];

    this.persistentData = this.storage.load();

    this.cacheDOM();
    this.applyInitialSettings();
    this.bindEventsOnce();
    this.updateTelemetryUI();
    this.drawScene();
  }

  // Cache DOM references
  cacheDOM() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvasStage = document.getElementById('canvasStage');
    this.statusBadge = document.getElementById('statusBadge');
    this.speedBadge = document.getElementById('speedBadge');
    this.speedToast = document.getElementById('speedToast');
    this.overlay = document.getElementById('gameOverlay');
    this.overlayTitle = document.getElementById('overlayTitle');
    this.overlaySubtitle = document.getElementById('overlaySubtitle');
    this.overlayAction = document.getElementById('overlayAction');

    this.btnToggleHat = document.getElementById('btnToggleHat');
    this.btnPauseResume = document.getElementById('btnPauseResume');
    this.btnRestart = document.getElementById('btnRestart');
    this.btnToggleSound = document.getElementById('btnToggleSound');
    this.btnToggleMotion = document.getElementById('btnToggleMotion');
    this.btnClearStats = document.getElementById('btnClearStats');

    this.difficultySelect = document.getElementById('difficultySelect');

    this.telTimer = document.getElementById('telTimer');
    this.telObstacles = document.getElementById('telObstacles');
    this.telHighScoreLabel = document.getElementById('telHighScoreLabel');
    this.telHighScore = document.getElementById('telHighScore');
    this.telRuns = document.getElementById('telRuns');
    this.telFailReason = document.getElementById('telFailReason');
  }

  // Initialize persistent UI settings
  applyInitialSettings() {
    this.difficulty = this.persistentData.difficulty || 'medium';
    this.baseSpeed = DIFFICULTY_CONFIG[this.difficulty].speed;
    this.speed = this.baseSpeed;
    if (this.difficultySelect) {
      this.difficultySelect.value = this.difficulty;
    }

    this.sound.setMuted(this.persistentData.isMuted);
    this.btnToggleSound.textContent = this.persistentData.isMuted ? '🔇 Sound: Off' : '🔊 Sound: On';
    this.btnToggleSound.classList.toggle('active-toggle', this.persistentData.isMuted);
    this.btnToggleSound.setAttribute('aria-pressed', (!this.persistentData.isMuted).toString());

    this.dino.wearPaperHat = Boolean(this.persistentData.wearPaperHat);
    this.updateHatButton();

    this.setReducedMotion(this.persistentData.reducedMotion);
  }

  // Bind all single-instance event listeners
  bindEventsOnce() {
    // Physical keyboard input
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        this.handleActionInput();
      } else if (e.code === 'KeyP') {
        this.togglePause();
      }
    });

    // Pointer / Touch / Click input on canvas stage
    this.canvasStage.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.handleActionInput();
    });

    // Control buttons
    if (this.btnToggleHat) {
      this.btnToggleHat.addEventListener('click', () => this.togglePaperHat());
    }
    this.btnPauseResume.addEventListener('click', () => this.togglePause());
    this.btnRestart.addEventListener('click', () => this.resetGame());
    this.btnToggleSound.addEventListener('click', () => this.toggleSound());
    this.btnToggleMotion.addEventListener('click', () => this.toggleMotion());
    this.btnClearStats.addEventListener('click', () => this.clearAllStats());

    // Difficulty mode selection
    if (this.difficultySelect) {
      this.difficultySelect.addEventListener('change', (e) => {
        this.setDifficulty(e.target.value);
      });
    }

    // Tab visibility and focus change events
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'PLAYING') {
        this.pauseGame();
      }
    });

    window.addEventListener('blur', () => {
      if (this.state === 'PLAYING') {
        this.pauseGame();
      }
    });
  }

  // Toggle Paper Boat Hat Easter Egg
  togglePaperHat() {
    if (!this.persistentData.unlockedPaperHat) return;
    this.persistentData.wearPaperHat = !this.persistentData.wearPaperHat;
    this.dino.wearPaperHat = this.persistentData.wearPaperHat;
    this.updateHatButton();
    this.storage.save(this.persistentData);
    this.drawScene();
  }

  // Synchronize Hat Button Visibility & Text
  updateHatButton() {
    if (this.btnToggleHat) {
      if (this.persistentData.unlockedPaperHat) {
        this.btnToggleHat.classList.remove('hidden');
        this.btnToggleHat.textContent = this.persistentData.wearPaperHat ? '⛵ Hat: On' : '⛵ Hat: Off';
        this.btnToggleHat.classList.toggle('active-toggle', !this.persistentData.wearPaperHat);
      } else {
        this.btnToggleHat.classList.add('hidden');
      }
    }
  }

  // Trigger Easter Egg Unlock at 42 obstacles
  unlockPaperHatEasterEgg() {
    if (this.persistentData.unlockedPaperHat) return;
    this.persistentData.unlockedPaperHat = true;
    this.persistentData.wearPaperHat = true;
    this.dino.wearPaperHat = true;
    this.updateHatButton();
    this.storage.save(this.persistentData);
    this.sound.playEasterEgg();

    if (this.speedToast) {
      this.speedToast.textContent = '⛵ Easter Egg: Origami Paper Boat Hat Unlocked! 🎉';
      this.speedToast.classList.add('active');
      if (this.speedToastTimer) clearTimeout(this.speedToastTimer);
      this.speedToastTimer = setTimeout(() => {
        if (this.speedToast) this.speedToast.classList.remove('active');
      }, 3000);
    }
  }

  // Update game difficulty mode
  setDifficulty(mode) {
    if (DIFFICULTY_CONFIG[mode]) {
      this.difficulty = mode;
      this.baseSpeed = DIFFICULTY_CONFIG[mode].speed;
      this.speed = this.baseSpeed;
      this.persistentData.difficulty = mode;
      this.storage.save(this.persistentData);
      this.resetGame();
    }
  }

  // Handle jump or state start trigger
  handleActionInput() {
    this.sound.init();

    if (this.state === 'READY') {
      this.startGame();
      this.performJump();
    } else if (this.state === 'PLAYING') {
      this.performJump();
    } else if (this.state === 'PAUSED') {
      this.resumeGame();
    } else if (this.state === 'FAILED') {
      this.resetGame();
      this.startGame();
    }
  }

  // Execute jump impulse with buffering support
  performJump() {
    const result = this.dino.requestJump();
    if (result === 'jumped') {
      this.jumpsCount++;
      this.persistentData.lifetimeJumps++;
      this.sound.playJump();
      if (!this.persistentData.reducedMotion) {
        this.particles.spawnDust(this.dino.x + 10, this.GROUND_Y);
      }
      this.updateTelemetryUI();
    }
  }

  // Set explicit finite state and synchronize UI
  setState(newState) {
    this.state = newState;
    const stateDisplayNames = {
      READY: 'Ready',
      PLAYING: 'Playing',
      PAUSED: 'Paused',
      FAILED: 'Failed'
    };
    this.statusBadge.textContent = stateDisplayNames[newState] || newState;
    this.statusBadge.setAttribute('data-state', newState);

    if (newState === 'READY') {
      this.overlay.classList.remove('hidden');
      this.overlayTitle.textContent = '🦖 Ready to Run!';
      this.overlaySubtitle.textContent = 'Endless Runner Mode: Speed increases every 5 obstacles! Pixel ghosts appear after 15s!';
      this.overlayAction.textContent = 'Press Space or Tap to start';
      this.btnPauseResume.textContent = '⏸️ Pause';
    } else if (newState === 'PLAYING') {
      this.overlay.classList.add('hidden');
      this.btnPauseResume.textContent = '⏸️ Pause';
    } else if (newState === 'PAUSED') {
      this.overlay.classList.remove('hidden');
      this.overlayTitle.textContent = '⏸️ Game Paused';
      this.overlaySubtitle.textContent = 'The game loop was suspended cleanly. No time or position desync occurred.';
      this.overlayAction.textContent = 'Click or press Space to resume';
      this.btnPauseResume.textContent = '▶️ Resume';
    } else if (newState === 'FAILED') {
      this.overlay.classList.remove('hidden');
      this.overlayTitle.textContent = '💥 Game Over!';
      this.overlaySubtitle.textContent = `Crash! You cleared ${this.obstaclesCleared} obstacles on ${DIFFICULTY_CONFIG[this.difficulty].name} in ${this.roundTimer.toFixed(1)}s!`;
      this.overlayAction.textContent = 'Press Space to play again';
      this.btnPauseResume.textContent = '⏸️ Pause';
    }
  }

  // Start round loop
  startGame() {
    this.setState('PLAYING');
    this.lastTime = performance.now();
    this.persistentData.totalRuns++;
    this.storage.save(this.persistentData);
    this.updateTelemetryUI();

    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  // Pause round loop cleanly
  pauseGame() {
    if (this.state === 'PLAYING') {
      this.setState('PAUSED');
    }
  }

  // Resume round loop without time jumps
  resumeGame() {
    if (this.state === 'PAUSED') {
      this.setState('PLAYING');
      this.lastTime = performance.now();
      this.animationFrameId = requestAnimationFrame((ts) => this.gameLoop(ts));
    }
  }

  // Toggle pause/resume button handler
  togglePause() {
    if (this.state === 'PLAYING') {
      this.pauseGame();
    } else if (this.state === 'PAUSED') {
      this.resumeGame();
    }
  }

  // Reset round loop, entities, and telemetry
  resetGame() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.speedToastTimer) {
      clearTimeout(this.speedToastTimer);
      this.speedToastTimer = null;
    }
    if (this.speedToast) {
      this.speedToast.classList.remove('active');
    }

    this.roundTimer = 0;
    this.obstaclesCleared = 0;
    this.jumpsCount = 0;
    this.totalSpawned = 0;
    this.spawnTimer = 0;
    this.speed = this.baseSpeed || DIFFICULTY_CONFIG[this.difficulty].speed;
    this.nextSpawnInterval = this.calculateNextSpawnInterval();
    this.aerialUnlocked = false;
    this.forceNextGhost = false;
    this.obstacles = [];
    this.particles.reset();
    this.dino.reset();

    this.setState('READY');
    this.updateTelemetryUI();
    this.drawScene();
  }

  // Mathematically guarantees that EVERY consecutive obstacle leaves safe landing room!
  calculateNextSpawnInterval() {
    // Jump air time: t = 2 * 540 / 1500 = 0.72s
    const jumpFlightDist = this.speed * 0.72;
    const roll = Math.random();
    let distance;

    if (roll < 0.35) {
      // 1. Rapid Double Cadence: Minimum landing room guaranteed >= 65px!
      distance = jumpFlightDist + 65 + Math.random() * 60;
    } else if (roll < 0.80) {
      // 2. Medium Fair Spacing
      distance = jumpFlightDist + 150 + Math.random() * 140;
    } else {
      // 3. Short Breather Stretch
      distance = jumpFlightDist + 320 + Math.random() * 180;
    }

    return distance / Math.max(1, this.speed);
  }

  // Main timestamp-driven delta-time loop
  gameLoop(timestamp) {
    if (this.state !== 'PLAYING') {
      this.drawScene();
      return;
    }

    // Clamp delta time to 100ms to avoid tunneling during long pauses
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    this.update(dt);
    this.drawScene();

    if (this.state === 'PLAYING') {
      this.animationFrameId = requestAnimationFrame((ts) => this.gameLoop(ts));
    }
  }

  // Update world state and physics
  update(dt) {
    this.roundTimer += dt;

    // Trigger 15-second ghost hazard unlock (schedules next spawn as Ghost without clobbering runway!)
    if (this.roundTimer >= 15 && !this.aerialUnlocked) {
      this.aerialUnlocked = true;
      this.forceNextGhost = true;
      this.triggerGhostToast();
      this.sound.playGhostSpooky();
    }

    // Update player & handle buffered landing jumps
    const didBufferedJump = this.dino.update(dt, this.persistentData.reducedMotion);
    if (didBufferedJump) {
      this.jumpsCount++;
      this.persistentData.lifetimeJumps++;
      this.sound.playJump();
      if (!this.persistentData.reducedMotion) {
        this.particles.spawnDust(this.dino.x + 10, this.GROUND_Y);
      }
      this.updateTelemetryUI();
    }

    // Update particles
    this.particles.update(dt);

    // Update background parallax clouds
    if (!this.persistentData.reducedMotion) {
      this.clouds.forEach(c => {
        c.x -= c.speed * dt;
        if (c.x < -100) c.x = this.VIRTUAL_WIDTH + Math.random() * 50;
      });
      this.groundOffset = (this.groundOffset + this.speed * dt) % 24;
    }

    // Spawn obstacles with mathematically guaranteed jumpable spacing
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.nextSpawnInterval) {
      this.spawnObstacle();
      this.spawnTimer = 0;
      this.nextSpawnInterval = this.calculateNextSpawnInterval();
    }

    // Update and check obstacles
    const dinoBounds = this.dino.getBounds();

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.update(dt, this.speed, this.persistentData.reducedMotion);

      // Axis-Aligned Bounding Box (AABB) Collision Detection
      const obsBounds = obs.getBounds();
      if (this.checkAABBCollision(dinoBounds, obsBounds)) {
        this.handleCollision(obs);
        return;
      }

      // Clearance detection
      if (!obs.cleared && obs.x + obs.width < this.dino.x) {
        obs.cleared = true;
        this.obstaclesCleared++;
        this.sound.playClear();

        // ⛵ Check Easter Egg Unlock: 42 Obstacles Cleared!
        if (this.obstaclesCleared === 42 && !this.persistentData.unlockedPaperHat) {
          this.unlockPaperHatEasterEgg();
        }

        // Speed increases every 5 obstacles starting at obstacle 10
        if (this.obstaclesCleared >= 10 && this.obstaclesCleared % 5 === 0) {
          const oldSpeed = this.speed;
          const boostTiers = Math.floor((this.obstaclesCleared - 10) / 5) + 1;
          const speedBoost = Math.min(220, boostTiers * 25);
          this.speed = (this.baseSpeed || DIFFICULTY_CONFIG[this.difficulty].speed) + speedBoost;

          // Trigger visual and audio speed up feedback
          if (this.speed > oldSpeed) {
            this.triggerSpeedUpEffect();
          }
        }

        this.updateTelemetryUI();
      }

      // Off-screen cleanup
      if (obs.x + obs.width < -50) {
        this.obstacles.splice(i, 1);
      }
    }

    this.updateTelemetryUI();
  }

  // Trigger floating speed-up toast notification on screen
  triggerSpeedUpEffect() {
    this.sound.playSpeedUp();
    if (this.speedToast) {
      this.speedToast.textContent = '⚡ Speed Up!';
      this.speedToast.classList.add('active');
      if (this.speedToastTimer) clearTimeout(this.speedToastTimer);
      this.speedToastTimer = setTimeout(() => {
        if (this.speedToast) this.speedToast.classList.remove('active');
      }, 1200);
    }
  }

  // Trigger pixel ghost hazard unlock notification
  triggerGhostToast() {
    if (this.speedToast) {
      this.speedToast.textContent = '👻 Pixel Ghosts have appeared!';
      this.speedToast.classList.add('active');
      if (this.speedToastTimer) clearTimeout(this.speedToastTimer);
      this.speedToastTimer = setTimeout(() => {
        if (this.speedToast) this.speedToast.classList.remove('active');
      }, 1800);
    }
  }

  // Spawn a new obstacle instance with fair rhythmic spacing
  spawnObstacle(forcedGhost = false) {
    this.totalSpawned++;
    let type;

    // Once ghosts unlock after 15 seconds:
    if (forcedGhost || this.forceNextGhost || (this.aerialUnlocked && Math.random() < 0.50)) {
      this.forceNextGhost = false;
      type = (this.totalSpawned % 2 === 0) ? 'ghost_low' : 'ghost_high';
    } else {
      const groundTypes = ['small', 'small', 'double', 'tall', 'triple', 'cluster'];
      type = groundTypes[Math.floor(Math.random() * groundTypes.length)];
    }

    const obs = new Obstacle(this.VIRTUAL_WIDTH + 20, this.GROUND_Y, type, this.totalSpawned);
    this.obstacles.push(obs);
  }

  // Exact Axis-Aligned Bounding Box (AABB) intersection formula
  checkAABBCollision(boxA, boxB) {
    return (
      boxA.x < boxB.x + boxB.width &&
      boxA.x + boxA.width > boxB.x &&
      boxA.y < boxB.y + boxB.height &&
      boxA.y + boxA.height > boxB.y
    );
  }

  // Handle collision failure event
  handleCollision(obstacle) {
    const obstacleName = obstacle.isGhost ? 'Pixel Ghost' : 'Cactus';
    const reason = `Collision with ${obstacleName} #${obstacle.index}`;
    this.persistentData.lastFailureReason = reason;

    // Update difficulty-specific high score
    const currentDiffHigh = this.persistentData.highScores[this.difficulty] || 0;
    if (this.obstaclesCleared > currentDiffHigh) {
      this.persistentData.highScores[this.difficulty] = this.obstaclesCleared;
    }

    if (this.roundTimer > this.persistentData.bestTime) {
      this.persistentData.bestTime = this.roundTimer;
    }

    this.storage.save(this.persistentData);
    this.sound.playCollision();

    // Screen shake feedback
    if (!this.persistentData.reducedMotion) {
      this.canvasStage.classList.remove('screen-shake');
      void this.canvasStage.offsetWidth;
      this.canvasStage.classList.add('screen-shake');
    }

    this.setState('FAILED');
    this.updateTelemetryUI();
  }

  // Render complete canvas scene
  drawScene() {
    this.ctx.clearRect(0, 0, this.VIRTUAL_WIDTH, this.VIRTUAL_HEIGHT);

    // Draw sky elements (clouds) - always visible, frozen in place when motion is off
    this.ctx.fillStyle = '#e2e8f0';
    for (const cloud of this.clouds) {
      this.ctx.beginPath();
      this.ctx.arc(cloud.x, cloud.y, 14, 0, Math.PI * 2);
      this.ctx.arc(cloud.x + 12, cloud.y - 6, 18, 0, Math.PI * 2);
      this.ctx.arc(cloud.x + 28, cloud.y, 14, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Draw ground line
    this.ctx.strokeStyle = '#94a3b8';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.GROUND_Y);
    this.ctx.lineTo(this.VIRTUAL_WIDTH, this.GROUND_Y);
    this.ctx.stroke();

    // Draw ground terrain dashes
    if (!this.persistentData.reducedMotion) {
      this.ctx.fillStyle = '#cbd5e1';
      for (let gx = -this.groundOffset; gx < this.VIRTUAL_WIDTH; gx += 24) {
        this.ctx.fillRect(gx, this.GROUND_Y + 6, 8, 2);
        this.ctx.fillRect(gx + 12, this.GROUND_Y + 12, 4, 2);
      }
    }

    // Draw obstacles
    for (const obs of this.obstacles) {
      obs.draw(this.ctx);
    }

    // Draw player
    this.dino.draw(this.ctx, this.state);

    // Draw particles
    this.particles.draw(this.ctx);
  }

  // Synchronize live telemetry values to DOM
  updateTelemetryUI() {
    this.telTimer.textContent = `${this.roundTimer.toFixed(1)}s`;
    this.telObstacles.textContent = this.obstaclesCleared;

    // Display High Score with active difficulty in the title
    const diffName = DIFFICULTY_CONFIG[this.difficulty].name;
    const diffHighScore = (this.persistentData.highScores && this.persistentData.highScores[this.difficulty]) || 0;
    if (this.telHighScoreLabel) {
      this.telHighScoreLabel.textContent = `🏆 High Score (${diffName})`;
    }
    this.telHighScore.textContent = `${diffHighScore}`;

    this.telRuns.textContent = this.persistentData.totalRuns;
    this.telFailReason.textContent = this.persistentData.lastFailureReason;

    if (this.speedBadge) {
      this.speedBadge.textContent = `⚡ ${Math.round(this.speed)} px/s`;
      if (this.obstaclesCleared >= 10) {
        this.speedBadge.style.backgroundColor = '#ea580c';
      } else {
        this.speedBadge.style.backgroundColor = '#0369a1';
      }
    }
  }

  // Audio mute button handler
  toggleSound() {
    const muted = !this.persistentData.isMuted;
    this.persistentData.isMuted = muted;
    this.sound.setMuted(muted);
    this.btnToggleSound.textContent = muted ? '🔇 Sound: Off' : '🔊 Sound: On';
    this.btnToggleSound.classList.toggle('active-toggle', muted);
    this.btnToggleSound.setAttribute('aria-pressed', (!muted).toString());
    this.storage.save(this.persistentData);
  }

  // Reduced motion toggle handler
  toggleMotion() {
    this.setReducedMotion(!this.persistentData.reducedMotion);
  }

  // Apply reduced motion state across DOM and storage
  setReducedMotion(enabled) {
    this.persistentData.reducedMotion = enabled;
    document.body.classList.toggle('reduced-motion', enabled);
    this.btnToggleMotion.textContent = enabled ? '⚡ Motion: Off (Still)' : '⚡ Motion: On (Full)';
    this.btnToggleMotion.classList.toggle('active-toggle', enabled);
    this.btnToggleMotion.setAttribute('aria-pressed', enabled.toString());
    this.storage.save(this.persistentData);
    this.drawScene();
  }

  // Clear telemetry and high score data
  clearAllStats() {
    if (confirm('Reset all lifetime stats and records?')) {
      this.storage.clear();
      this.persistentData = this.storage.load();
      this.applyInitialSettings();
      this.updateTelemetryUI();
    }
  }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.dinoGame = new DinoGame();
});
