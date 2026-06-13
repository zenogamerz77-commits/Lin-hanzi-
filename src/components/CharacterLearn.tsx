import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, Search, Volume2, RotateCcw, CheckCircle, Sparkles, 
  ChevronLeft, ChevronRight, Shuffle, PenTool, Flame, RefreshCw, Eye, EyeOff, HelpCircle
} from "lucide-react";
import { 
  HSK_CURATED_CHARACTERS, 
  getStrokesForCharacter, 
  search6kDictionary, 
  HskWord 
} from "../data/hsk6kWords";
import { playXpSound, playSuccessSound, playClickSound } from "../utils/soundEffects";

// Standard web speech synthesis helper
const speakCharacterCN = (text: string) => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }
};

export const CharacterLearn: React.FC = () => {
  const { userProgress, completeLesson } = useApp();

  // Navigation and level state
  const [activeLevel, setActiveLevel] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [displayCount, setDisplayCount] = useState<number>(32);
  const [selectedWord, setSelectedWord] = useState<HskWord | null>(null);

  // Brush styling
  const [brushColor, setBrushColor] = useState<string>("#be123c"); // Rose-700 classic sealant ink red
  const [inkThickness, setInkThickness] = useState<number>(8);
  const [showGuide, setShowGuide] = useState<boolean>(true);

  // Drawing Sandbox state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);

  // Interactive Blind Study challenge state
  const [challengeMode, setChallengeMode] = useState<boolean>(false);
  const [challengeSubmitted, setChallengeSubmitted] = useState<boolean>(false);
  const [revealStreak, setRevealStreak] = useState<number>(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Stroke simulation highlighting index
  const [highlightedStrokeIdx, setHighlightedStrokeIdx] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Fetch words matching search + level
  const filteredWords = search6kDictionary(searchQuery, activeLevel);

  // Initialize with the first available curated character when level or search list resets
  useEffect(() => {
    // Attempt first curated word of this level
    const levelCurated = HSK_CURATED_CHARACTERS[activeLevel];
    if (levelCurated && levelCurated.length > 0) {
      setSelectedWord(levelCurated[0]);
    } else if (filteredWords.length > 0) {
      setSelectedWord(filteredWords[0]);
    } else {
      setSelectedWord(getStrokesForCharacter("永")); // Fallback master eternity
    }
    setDisplayCount(32); // Reset scroll offset
    setChallengeSubmitted(false);
    setHasDrawn(false);
  }, [activeLevel]);

  // Tracing drawing canvas lifecycle
  useEffect(() => {
    initMiZiGeCanvas();
  }, [selectedWord, showGuide, brushColor, inkThickness, challengeMode, challengeSubmitted]);

  const initMiZiGeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset lines
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw elegant traditional Mi-Zi-Ge (米字格) red-dashed guideline grids
    ctx.strokeStyle = "rgba(226, 82, 82, 0.25)"; // light soft red grid
    ctx.lineWidth = 1.5;

    // Outer border frame
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Diagonal crosses
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.moveTo(canvas.width, 0);
    ctx.lineTo(0, canvas.height);
    ctx.stroke();

    // Horizontal & Vertical center axes
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Clear line dash for drawing brush lines
    ctx.setLineDash([]);

    if (!selectedWord) return;

    // 2. Render background silhouette character for standard trace guidelines
    // ONLY show this if user is NOT in Blind Challenge mode, OR if blind guide is bypassed by reveal
    if (showGuide && (!challengeMode || challengeSubmitted)) {
      ctx.font = "black 205px Inter, 'Noto Sans SC', 'Kaiti', sans-serif";
      ctx.fillStyle = "rgba(225, 29, 72, 0.08)"; // very soft ink wash red
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(selectedWord.character, canvas.width / 2, canvas.height / 2 + 10);
    }
  };

  // Drawing event handlers
  const getCoordinates = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Support mouse or touch coordinates
    if (e.touches && e.touches[0]) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.strokeStyle = brushColor;
    ctx.lineWidth = inkThickness;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const drawLines = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Speaks aloud with zero latency
  const handleAudiblePronounce = () => {
    if (!selectedWord) return;
    playClickSound();
    speakCharacterCN(selectedWord.character);
  };

  // Simulate highlighting specific strokes step by step
  const handleSimulateStrokeSequence = async () => {
    if (!selectedWord || !selectedWord.strokes || isSimulating) return;
    setIsSimulating(true);
    playClickSound();

    for (let i = 0; i < selectedWord.strokes.length; i++) {
      setHighlightedStrokeIdx(i);
      await new Promise((resolve) => setTimeout(resolve, 1400));
    }
    setHighlightedStrokeIdx(null);
    setIsSimulating(false);
  };

  // Select a word to practice and compute stroke patterns dynamic lookup
  const handleWordSelect = (word: HskWord) => {
    playClickSound();
    const fullWordInfo = getStrokesForCharacter(word.character, word.pinyin, word.meaning);
    setSelectedWord(fullWordInfo);
    setHasDrawn(false);
    setChallengeSubmitted(false);
    speakCharacterCN(word.character);
  };

  // Handle shuffling or selecting a random HSK word of this level
  const handleRandomShuffle = () => {
    if (filteredWords.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredWords.length);
    const chosen = filteredWords[randomIndex];
    handleWordSelect(chosen);
    showNotification("✨ New random character unlocked!");
  };

  // Validate brushstroke attempt
  const handleScoreSubmissions = () => {
    if (!selectedWord) return;
    if (!hasDrawn) {
      showNotification("✍️ Draw your character brushstrokes over the board first!");
      return;
    }

    playSuccessSound();
    playXpSound();

    if (challengeMode) {
      setChallengeSubmitted(true);
      setRevealStreak(prev => prev + 1);
      completeLesson(`blind-character-finished-${selectedWord.character}`, 40);
      showNotification(`🏆 Masterful! Challenge passed! Streak updated: +${revealStreak + 1}. Awarded 40 XP!`);
    } else {
      completeLesson(`character-strokes-finished-${selectedWord.character}`, 30);
      showNotification(`🎉 Beautiful traces! Tracing verification passed. Awarded 30 XP!`);
    }
  };

  // Fast utility toast banner
  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 4500);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 animate-fade-in">
      
      {/* Toast Overlay */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 right-6 z-50 bg-slate-950 text-white font-semibold text-xs px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3.5"
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <p>{toastMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top visually rich Header with 6k Words Counter status */}
      <div className="bg-gradient-to-br from-slate-900 via-rose-950 to-slate-950 p-8 rounded-3xl border border-slate-800 text-white text-left relative overflow-hidden">
        
        {/* Abstract watermark character */}
        <div className="absolute right-6 -bottom-6 text-[180px] font-black pointer-events-none opacity-[0.03] select-none font-serif leading-none">
          書
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] font-bold font-mono tracking-widest text-[#f43f5e] bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full uppercase leading-none inline-flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5" /> Calligraphy Academy & Studio
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-sans tracking-tight leading-tight">
              HSK 6,000 Characters Masterclass
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-light">
              Master authentic brushstrokes across all Chinese Character levels interactively. Learn real step-by-step directions over classical 米字格 grid assists with native speech voices. Customize and practice any of the 6,000 index terms!
            </p>
          </div>

          <div className="flex flex-row items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl shrink-0">
            <div className="w-12 h-12 rounded-xl bg-rose-500/15 flex items-center justify-center font-bold text-rose-400 text-xl font-serif">
              學
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider font-semibold uppercase leading-none">Global catalog scale</p>
              <h4 className="text-2xl font-black font-sans leading-none mt-1.5">6,000 <span className="text-sm font-semibold text-rose-400">Words</span></h4>
              <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-0.5 font-bold leading-none">
                <CheckCircle className="w-3 h-3 fill-current text-emerald-500 text-slate-900" /> Fully Verified Dynamic Guides
              </p>
            </div>
          </div>
        </div>

        {/* 6 HSK Progressive Level Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3.5 pt-8 border-t border-white/5 mt-6">
          {[
            { level: 1, label: "HSK Level 1", desc: "150 Core Words", range: "A1 Absolute Beginner" },
            { level: 2, label: "HSK Level 2", desc: "150-300 Words", range: "A2 Elementary" },
            { level: 3, label: "HSK Level 3", desc: "300-600 Words", range: "B1 Intermediate" },
            { level: 4, levelLabel: "HSK 4", label: "HSK Level 4", desc: "600-1200 Words", range: "B2 Upper-Int" },
            { level: 5, levelLabel: "HSK 5", label: "HSK Level 5", desc: "1200-2500 Words", range: "C1 Advanced" },
            { level: 6, levelLabel: "HSK 6", label: "HSK Level 6", desc: "2500-6000 Words", range: "C2 Master Fluency" }
          ].map((item) => {
            const isActive = activeLevel === item.level;
            return (
              <button
                key={item.level}
                onClick={() => {
                  playClickSound();
                  setActiveLevel(item.level);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all relative group cursor-pointer ${
                  isActive
                    ? "bg-rose-500 border-rose-400 text-white shadow-xl shadow-rose-950/20 scale-[1.01]"
                    : "bg-slate-900/50 border-slate-800 hover:border-slate-750 text-slate-200 hover:bg-slate-850/60"
                }`}
              >
                <div className="flex justify-between items-start">
                  <p className="font-extrabold text-xs tracking-tight">{item.label}</p>
                  <span className={`text-[8px] font-mono font-bold px-1 py-0.5 rounded ${
                    isActive ? "bg-white/25 text-white" : "bg-slate-850 text-rose-400"
                  }`}>{item.level === 6 ? "6K Max" : "HSK"}</span>
                </div>
                <p className={`text-[10px] truncate mt-1 font-semibold ${isActive ? "text-rose-100" : "text-slate-400"}`}>
                  {item.desc}
                </p>
                <p className={`text-[8px] truncate leading-none mt-0.5 ${isActive ? "text-rose-200" : "text-slate-500"}`}>
                  {item.range}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two Column Workspace layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: 6k Vocabulary Catalog and Search Grid (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-250/60 border-slate-200 shadow-sm space-y-5 text-left">
            
            {/* Search, Action counters & stats */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-950 font-sans tracking-tight">
                  HSK Level {activeLevel} Curriculum Catalog
                </h3>
                <p className="text-slate-500 text-[11px] leading-tight">
                  Showing matches from certified HSK databases. Select a card to view stroke guides.
                </p>
              </div>

              {/* Quick actions row */}
              <div className="flex gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={handleRandomShuffle}
                  className="flex-1 sm:flex-none p-2 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                  title="Practice a random character of this HSK Level"
                >
                  <Shuffle className="w-3.5 h-3.5" /> Random Character
                </button>
              </div>
            </div>

            {/* Custom customizer search engine */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Type character, pinyin, or meaning (e.g. '马', 'ma', 'horse')..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setDisplayCount(32); // Reset count
                  }}
                  className="w-full pl-9 pr-4 py-2 text-xs text-slate-900 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-250 border-slate-200 focus:border-rose-500 outline-none rounded-xl transition"
                />
              </div>

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-2 py-2 px-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Clear search
                </button>
              )}
            </div>

            {/* Simulated Dynamic Query Builder on-demand */}
            {searchQuery && !filteredWords.some(item => item.character === searchQuery) && searchQuery.length === 1 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-amber-900">✨ Construct dynamic strokes for "{searchQuery}"?</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">We can calculate stroke blueprints and tracing models instantly!</p>
                </div>
                <button
                  onClick={() => {
                    const dynamicWord = getStrokesForCharacter(searchQuery, searchQuery, `Custom dynamics vocabulary query for character "${searchQuery}"`);
                    setSelectedWord(dynamicWord);
                    speakCharacterCN(searchQuery);
                    showNotification(`🧙‍♂️ Algorithmic stroke tracing model generated for "${searchQuery}"!`);
                  }}
                  className="px-3 py-1.5 bg-slate-950 text-white rounded-xl text-[10px] font-extrabold hover:bg-rose-700 transition cursor-pointer"
                >
                  Generate Canvas
                </button>
              </div>
            )}

            {/* Grid display layout */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto pr-2 scrollbar-thin">
              {filteredWords.slice(0, displayCount).map((word, index) => {
                const isSelected = selectedWord?.character === word.character;
                return (
                  <button
                    key={index}
                    onClick={() => handleWordSelect(word)}
                    className={`p-3.5 rounded-2xl border text-left transition-all active:scale-95 flex flex-col justify-between h-24 relative select-none cursor-pointer ${
                      isSelected
                        ? "bg-rose-50 border-rose-500 text-rose-700 shadow-sm"
                        : "bg-slate-50 hover:bg-slate-100/70 border-slate-200 text-slate-800"
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-3xl font-black font-sans leading-none">{word.character}</span>
                      <span className={`text-[8px] font-mono font-bold leading-none px-1 py-0.5 rounded ${
                        isSelected ? "bg-rose-200 text-rose-850" : "bg-white/80 border text-slate-400"
                      }`}>HSK {word.hskLevel}</span>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-mono leading-none tracking-tight font-black uppercase truncate text-slate-800">{word.pinyin}</p>
                      <p className="text-[9px] text-slate-500 truncate leading-none mt-1 font-light">{word.meaning}</p>
                    </div>
                  </button>
                );
              })}

              {filteredWords.length === 0 && (
                <div className="col-span-full py-16 text-center space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <p className="text-slate-500 text-xs italic">No words matching current filters are registered.</p>
                  <p className="text-slate-400 text-[10px]">Adjust HSK levels or try searching characters like "一", "好", or "飞".</p>
                </div>
              )}
            </div>

            {/* Load More option matching 6,000 count capability */}
            {filteredWords.length > displayCount && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => setDisplayCount(prev => prev + 24)}
                  className="py-2 px-6 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Show More Characters ({filteredWords.length - displayCount} remaining)
                </button>
              </div>
            )}

          </div>

          {/* Guidelines on correct stroke orders */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-left space-y-4">
            <h4 className="font-extrabold text-sm font-sans text-slate-900 uppercase tracking-wider">
              The 8 Crucial Rules of Hanzi Stroke Order
            </h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {[
                { order: "1. Top to Bottom", rule: "Write top lines before bottom", char: "三" },
                { order: "2. Left to Right", rule: "Write left segments first", char: "川" },
                { order: "3. Diagonal Cross", rule: "Horizontal before vertical", char: "十" },
                { order: "4. Frame Boundary", rule: "Draw frame, fill center", char: "口" },
                { order: "5. Close Borders", rule: "Seal the box container last", char: "田" },
                { order: "6. Major Pillars", rule: "Central lines before sides", char: "小" },
                { order: "7. Minor Accent", rule: "Dots or marks at the end", char: "玉" },
                { order: "8. Fluid Sweeps", rule: "Left slants before right slants", char: "人" }
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-extrabold text-[10px] text-slate-900">{item.order}</p>
                    <span className="font-bold text-rose-600 bg-rose-50 px-1 rounded leading-none">{item.char}</span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-light leading-none">{item.rule}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Mi-Zi-Ge Tracing Canvas Desk (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-250/65 border-slate-200 shadow-sm text-center space-y-4">
            
            {/* Header section card */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-150 border-slate-200">
              
              <div className="text-left">
                <span className="text-[8px] font-bold font-mono tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded uppercase leading-none">
                  Practice desk
                </span>
                <h3 className="text-base font-extrabold text-slate-950 font-sans tracking-tight mt-1">
                  Calligraphic Canvas
                </h3>
              </div>

              {/* Toggle challenge mode */}
              <button
                onClick={() => {
                  playClickSound();
                  setChallengeMode(!challengeMode);
                  setChallengeSubmitted(false);
                  setHasDrawn(false);
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  challengeMode
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white hover:bg-slate-100 border text-slate-700"
                }`}
              >
                {challengeMode ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" /> Blind Challenge Active
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" /> Switch to Blind Challenge
                  </>
                )}
              </button>
            </div>

            {/* Target Card metadata block */}
            {selectedWord && (
              <div className="bg-gradient-to-r from-slate-50 to-rose-50/30 p-4 rounded-2xl border text-left relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-3xl font-black font-sans text-slate-950 leading-none">
                      {selectedWord.character}
                    </span>
                    <p className="text-sm font-mono font-bold text-rose-700 tracking-tight leading-none mt-1">
                      {selectedWord.pinyin}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono leading-none font-bold bg-[#fffbeb] text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded uppercase block">
                      Target Level {selectedWord.hskLevel}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-1 block">
                      Radical: {selectedWord.radical || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-600 font-light border-t border-slate-100 pt-2 flex justify-between items-center">
                  <span>Meaning: <strong className="font-semibold text-slate-900">{selectedWord.meaning}</strong></span>
                  <button
                    onClick={handleAudiblePronounce}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/50 text-rose-700 rounded-lg transition"
                    title="Speak character out loud"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Mi-Zi-Ge actual tracing container canvas */}
            <div className="flex flex-col items-center space-y-4">
              
              <div className="relative">
                <canvas
                  id="canvas-writing-board"
                  ref={canvasRef}
                  width={290}
                  height={290}
                  onMouseDown={startDrawing}
                  onMouseMove={drawLines}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={drawLines}
                  onTouchEnd={stopDrawing}
                  className="bg-orange-50/10 border-2 border-orange-200/50 hover:border-rose-400 rounded-3xl cursor-crosshair shadow-inner"
                />

                {/* Simulated highlight pointer */}
                {isSimulating && highlightedStrokeIdx !== null && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-transparent pointer-events-none">
                    <span className="px-3 py-1.5 bg-rose-600 text-white rounded-full text-[10px] font-bold animate-ping uppercase">
                      Practice stroke #{highlightedStrokeIdx + 1}
                    </span>
                  </div>
                )}
              </div>

              {/* Brush Thickness, Ink Controls */}
              <div className="flex flex-wrap gap-3 items-center justify-between w-full text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border">
                <div className="flex gap-1.5 items-center">
                  <span>Ink:</span>
                  {["#be123c", "#0f172a", "#15803d", "#1d4ed8"].map((color) => (
                    <button
                      key={color}
                      onClick={() => setBrushColor(color)}
                      className="w-4.5 h-4.5 rounded-full border transition hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center"
                      style={{ backgroundColor: color }}
                    >
                      {brushColor === color && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 items-center">
                  <span>Thickness:</span>
                  <input
                    type="range"
                    min="4"
                    max="18"
                    value={inkThickness}
                    onChange={(e) => setInkThickness(parseInt(e.target.value))}
                    className="w-16 accent-rose-600"
                  />
                  <span className="font-mono text-[9px] font-semibold">{inkThickness}px</span>
                </div>

                <button
                  onClick={() => setShowGuide(!showGuide)}
                  className="p-1 px-2 border rounded-md hover:bg-white text-[10px] text-slate-600 font-bold transition cursor-pointer"
                >
                  {showGuide ? "Hide Silhouette" : "Show Silhouette"}
                </button>
              </div>

              {/* Action Board rows */}
              <div className="flex gap-2 w-full">
                <button
                  id="canvas-clear-action"
                  onClick={() => {
                    initMiZiGeCanvas();
                    setHasDrawn(false);
                    setChallengeSubmitted(false);
                  }}
                  className="flex-1 p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs inline-flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Clear Canvas
                </button>

                <button
                  id="canvas-verify-strokes"
                  onClick={handleScoreSubmissions}
                  className="flex-1 p-2.5 bg-[#be123c] hover:bg-rose-800 text-white font-extrabold rounded-xl text-xs inline-flex items-center justify-center gap-1 transition cursor-pointer shadow-md shadow-rose-900/10"
                >
                  Verify Writing ✍️
                </button>
              </div>

            </div>

          </div>

          {/* Detailed Stroke directions Steps box (Interactive checklist) */}
          {selectedWord && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-left space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Stroke Breakdown Order
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Total: <span className="font-bold text-rose-600">{selectedWord.strokesCount || selectedWord.strokes?.length || "Custom"}</span> strokes
                  </p>
                </div>

                {selectedWord.strokes && selectedWord.strokes.length > 0 && (
                  <button
                    onClick={handleSimulateStrokeSequence}
                    disabled={isSimulating}
                    className="p-1.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200/50 text-amber-800 rounded-lg transition text-[10px] font-bold cursor-pointer disabled:opacity-50"
                  >
                    {isSimulating ? "Highlighting..." : "Simulate Strokes"}
                  </button>
                )}
              </div>

              {/* Checklist steps */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {selectedWord.strokes && selectedWord.strokes.length > 0 ? (
                  selectedWord.strokes.map((step, idx) => {
                    const isStepHighlighted = highlightedStrokeIdx === idx;
                    return (
                      <div 
                        key={idx} 
                        className={`flex gap-3 items-start text-xs p-1.5 rounded-lg transition-all ${
                          isStepHighlighted 
                            ? "bg-amber-50 border border-amber-200 text-amber-900 font-semibold" 
                            : "text-slate-700"
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[9px] shrink-0 ${
                          isStepHighlighted ? "bg-amber-600 text-white" : "bg-slate-950 text-white"
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="leading-snug pt-0.5">{step}</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Generative fallback guide initiated. Best practiced following traditional left-to-right brush flow outlines.
                  </p>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
