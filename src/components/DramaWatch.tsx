import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { Tv, Play, Pause, Volume2, Key, Star, Sparkles, ChevronRight, Bookmark, RefreshCw, MessageSquare } from "lucide-react";
import { DRAMA_LIST } from "../data/mockData";

export const DramaWatch: React.FC = () => {
  const { userProgress, toggleSaveVocabulary, completeLesson } = useApp();
  const [selectedDrama, setSelectedDrama] = useState<typeof DRAMA_LIST[0]>(DRAMA_LIST[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [activeSubIndex, setActiveSubIndex] = useState<number>(0);
  const [clickedSubtitleWord, setClickedSubtitleWord] = useState<{ cn: string; py: string; en: string } | null>(null);

  // Subtitle timing simulator (4 seconds per scene text, looping)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const maxSeconds = selectedDrama.scenes.length * 4;

    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          const nextTime = prev + 1;
          if (nextTime >= maxSeconds) {
            setIsPlaying(false);
            return 0;
          }
          return nextTime;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, selectedDrama]);

  // Map timer to active scene index
  useEffect(() => {
    const sceneIdx = Math.floor(currentTime / 4) % selectedDrama.scenes.length;
    setActiveSubIndex(sceneIdx);
  }, [currentTime, selectedDrama]);

  const handleSelectDrama = (drama: typeof DRAMA_LIST[0]) => {
    setSelectedDrama(drama);
    setIsPlaying(false);
    setCurrentTime(0);
    setActiveSubIndex(0);
    setClickedSubtitleWord(null);
  };

  const handleSpeech = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      window.speechSynthesis.speak(utterance);
    }
  };

  const activeScene = selectedDrama.scenes[activeSubIndex] || selectedDrama.scenes[0];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 selection:bg-red-500 selection:text-white">
      
      <div className="space-y-2 text-left">
        <h2 className="text-3xl font-extrabold text-slate-950 font-sans tracking-tight flex items-center gap-2">
          <span className="bg-red-600 text-white rounded-lg px-2.5 py-0.5 text-xs font-mono">VIKI MULTI-SUB</span>
          Mandarin Immersion Cinema
        </h2>
        <p className="text-slate-600 text-sm">
          Watch authentic Chinese drama clips directly with double-subtitle systems. Click characters to speak and analyze them!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Player and dialogue interaction card */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Player Display Container */}
          <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-850 relative aspect-video flex flex-col justify-between">
            
            {/* Backdrop cover mockup info */}
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-slate-950 select-none pointer-events-none">
              <img 
                src={selectedDrama.cover} 
                alt={selectedDrama.title} 
                className="w-full h-full object-cover opacity-60" 
              />
            </div>

            {/* Viki Tag watermarks */}
            <div className="relative z-10 p-5 flex justify-between items-center bg-gradient-to-b from-slate-950 to-transparent">
              <span className="text-[11px] font-bold bg-blue-600 text-white px-2.5 py-1 rounded font-mono uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Viki Licensed Stream
              </span>

              <span className="text-xs font-mono font-bold text-slate-350">
                0:{(currentTime < 10 ? "0" : "") + currentTime} / 0:{selectedDrama.scenes.length * 4}
              </span>
            </div>

            {/* Play trigger overlay */}
            <div className="relative z-10 text-center my-auto">
              {!isPlaying ? (
                <button
                  id="btn-play-drama-video"
                  onClick={() => setIsPlaying(true)}
                  className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full text-white inline-flex items-center justify-center hover:bg-red-600 hover:scale-105 active:scale-95 border border-white/20 transition cursor-pointer"
                >
                  <Play className="w-6 h-6 fill-current text-white translate-x-0.5" />
                </button>
              ) : (
                <button
                  id="btn-pause-drama-video"
                  onClick={() => setIsPlaying(false)}
                  className="w-16 h-16 bg-black/40 backdrop-blur-md rounded-full text-white inline-flex items-center justify-center hover:bg-black/60 hover:scale-105 active:scale-95 border border-white/15 transition cursor-pointer opacity-0 hover:opacity-100"
                >
                  <Pause className="w-6 h-6 text-white" />
                </button>
              )}
            </div>

            {/* In-Video Active Subtitle Guides */}
            <div className="relative z-10 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-6 text-center space-y-1.5">
              <p className="text-2xl sm:text-3xl font-black text-amber-300 tracking-wide font-sans select-none">
                {activeScene.cn}
              </p>
              <p className="text-xs sm:text-sm text-slate-300 font-mono italic select-none">
                {activeScene.py}
              </p>
            </div>
          </div>

          {/* Interactive Dialogue Captions Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="text-left">
                <h4 className="font-bold text-slate-950 text-base">Interactive Dialogue Captions</h4>
                <p className="text-[11px] text-slate-500">Tap individual characters below to query pronunciation meanings immediately during playback.</p>
              </div>

              <span className="text-[10px] uppercase font-mono font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-xl">
                Current Subtitle Track
              </span>
            </div>

             {/* Split individual characters loop */}
            <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-200/50 space-y-4 text-center">
              <div className="flex flex-wrap gap-x-1.5 gap-y-4 justify-center leading-loose">
                {Array.from(activeScene.cn).map((char: any, idx) => {
                  const isPunctuation = ["。", "，", "！", "？", "：", "、", "；"].includes(char as string);
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (isPunctuation) return;
                        setIsPlaying(false); // Pause during query
                        setClickedSubtitleWord({
                          cn: char as string,
                          py: "Interactive Character",
                          en: "Tap 'AI Dictionary' in high-level search for full sentence definitions!"
                        });
                        handleSpeech(char as string);
                      }}
                      className="flex flex-col items-center group cursor-pointer"
                    >
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-905 hover:text-red-600 transition select-none decoration-dashed decoration-slate-400 group-hover:scale-110 active:scale-95 text-slate-900">
                        {char as string}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Central translating translation */}
              <div className="pt-3 border-t border-slate-200 mt-3 text-xs text-slate-500 italic">
                "{activeScene.en}"
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
              <span>Streaming speed: 1.0x</span>
              <button
                onClick={() => {
                  completeLesson(`drama-listen-${selectedDrama.id}`, 45);
                  alert("🎉 Great! Watching credit recorded. Awarded 45 XP!");
                }}
                className="text-red-650 hover:underline cursor-pointer font-bold text-red-600"
              >
                ✓ Claim Listen Verification Credit
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Click details + playlist */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Analyze card info */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4 text-left">
            <h4 className="font-bold text-slate-950 text-base flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-red-600" />
              Word Analyzer
            </h4>

            <AnimatePresence mode="wait">
              {!clickedSubtitleWord ? (
                <div className="text-center py-8 text-slate-400 text-xs italic">
                  Tap any Chinese character in the dialogue captions to analyze its tone and trigger text-to-speech.
                </div>
              ) : (
                <motion.div
                  key={clickedSubtitleWord.cn}
                  className="space-y-4"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 space-y-2 relative">
                    <p className="text-4xl font-extrabold text-slate-950 font-sans tracking-tight leading-none text-red-600">
                      {clickedSubtitleWord.cn}
                    </p>
                    <p className="text-xs font-mono font-bold text-amber-700">{clickedSubtitleWord.py}</p>
                    <p className="text-xs text-slate-600 leading-normal">{clickedSubtitleWord.en}</p>
                    
                    <button
                      onClick={() => clickedSubtitleWord && handleSpeech(clickedSubtitleWord.cn)}
                      className="absolute top-4 right-4 p-2 bg-white hover:bg-slate-100 rounded-full border border-slate-200/80 transition cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (clickedSubtitleWord) {
                        toggleSaveVocabulary(clickedSubtitleWord.cn);
                        alert(`Character "${clickedSubtitleWord.cn}" successfully bookmarked into your study list!`);
                      }
                    }}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl inline-flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                  >
                    <Star className="w-4 h-4 fill-current text-white" /> Save Character Bookmarks
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Playlist picker */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4 text-left">
            <h4 className="font-bold text-slate-950 text-sm uppercase tracking-wider block">More Drama Watch Clips</h4>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {DRAMA_LIST.map((drama) => {
                const isActive = drama.id === selectedDrama.id;
                return (
                  <div
                    key={drama.id}
                    onClick={() => handleSelectDrama(drama)}
                    className={`flex gap-3 items-center p-2 rounded-2xl cursor-pointer border transition ${
                      isActive
                        ? "border-red-400 bg-red-50/20"
                        : "border-slate-100 hover:bg-slate-100"
                    }`}
                  >
                    <img 
                      src={drama.cover} 
                      alt={drama.title} 
                      className="w-16 h-12 rounded-lg object-cover flex-shrink-0 bg-slate-100" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-955 text-xs truncate text-slate-900">{drama.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">{drama.category}</p>
                      <span className="inline-block mt-0.5 text-[8px] font-bold bg-amber-50 text-amber-700 px-1.5 rounded leading-none">
                        Target: HSK {drama.hskLevel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
