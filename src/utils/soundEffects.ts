/**
 * Browser-native Web Audio API synthesizer for instant, zero-latency gaming feedback.
 * No external static asset downloads required - sounds are generated mathematically inside client cycles.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Vibrant progressive chime (XP gain - sounds like collecting a Super Chinese gold coin)
 */
export const playXpSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.35); // C6
    
    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.4);
  } catch (e) {
    console.debug("Web Audio muted or uninitiated", e);
  }
};

/**
 * Triumphant multi-stage melody fanfare for level ups
 */
export const playLevelUpSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const notes = [
      { note: 261.63, delay: 0 },      // C4
      { note: 329.63, delay: 0.1 },    // E4
      { note: 392.00, delay: 0.2 },    // G4
      { note: 523.25, delay: 0.3 },    // C5
      { note: 659.25, delay: 0.45 },   // E5
      { note: 783.99, delay: 0.6 },    // G5
      { note: 1046.50, delay: 0.75 }    // C6
    ];
    
    notes.forEach((item) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(item.note, now + item.delay);
      
      gainNode.gain.setValueAtTime(0.12, now + item.delay);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + item.delay + 0.35);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(now + item.delay);
      osc.stop(now + item.delay + 0.4);
    });
  } catch (e) {
    console.debug("Web Audio muted", e);
  }
};

/**
 * High pitched happy correct bell chimes
 */
export const playSuccessSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode1 = ctx.createGain();
    const gainNode2 = ctx.createGain();
    
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880.00, now); // A5
    gainNode1.gain.setValueAtTime(0.08, now);
    gainNode1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1174.66, now + 0.08); // D6
    gainNode2.gain.setValueAtTime(0.08, now + 0.08);
    gainNode2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    
    osc1.connect(gainNode1);
    gainNode1.connect(ctx.destination);
    
    osc2.connect(gainNode2);
    gainNode2.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.25);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.3);
  } catch (e) {
    console.debug("Web Audio muted", e);
  }
};

/**
 * Subtle click pop sound for satisfying navigation elements
 */
export const playClickSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.06);
    
    gainNode.gain.setValueAtTime(0.05, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.08);
  } catch (e) {
    // ignore
  }
};

/**
 * Double error dull vibration sound
 */
export const playWrongSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.25);
    
    gainNode.gain.setValueAtTime(0.08, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.28);
  } catch (e) {
    // ignore
  }
};
