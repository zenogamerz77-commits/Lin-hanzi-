import React from "react";
import { useApp } from "../context/AppContext";
import { motion } from "motion/react";
import { Flame, Trophy, GraduationCap, ChevronRight, BookOpen, Star, Plus, Check, Play, Brain, Sparkles, Volume2 } from "lucide-react";
import { WATCH_READ_LIBRARY, HSK_VOCABULARY } from "../data/mockData";
import { speakMandarin } from "../utils/pronounce";

export const Dashboard: React.FC = () => {
  const { userProgress, setActiveTab, toggleSaveVocabulary, srsCards, completeLesson } = useApp();

  // Find next lessons recommended
  const isPinyinFinished = userProgress.completedLessons.includes("pinyin-all");
  const isStrokesFinished = userProgress.completedLessons.includes("strokes-all");

  const srsDueCount = srsCards.filter(
    (card) => new Date(card.nextReviewDate).getTime() <= Date.now()
  ).length;

  const xpPercent = userProgress.xp % 100;
  
  // Get bookmarked books
  const savedBooksList = WATCH_READ_LIBRARY.filter((b) => userProgress.savedBooks.includes(b.id));
  
  // Get saved vocabulary Info
  const savedVocabList = HSK_VOCABULARY.filter((v) => userProgress.savedVocabulary.includes(v.character));

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 selection:bg-brand-red selection:text-white">
      {/* Dynamic Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        {/* Absolute Red Gold ribbon edge */}
        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-brand-red to-brand-gold" />
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-brand-red bg-brand-light-red border border-brand-light-border px-2.5 py-1 rounded-full flex items-center gap-1 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
              HSK Level {userProgress.hskTargetLevel} Path
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-brand-dark font-sans tracking-tight">
            Nǐ hǎo, {userProgress.displayName}!
          </h2>
          <p className="text-slate-500 text-sm max-w-xl">
            You are currently on a <span className="font-semibold text-brand-red">{userProgress.learningGoal}</span> goal. Keep practicing daily to maintain your vocabulary streak!
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="flex gap-4 self-start md:self-center">
          {/* Flame streak */}
          <div className="bg-brand-light-red px-5 py-4 rounded-2xl border border-brand-light-border flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-500 fill-current animate-pulse" />
            <div>
              <p className="text-2xl font-black text-brand-dark leading-tight">{userProgress.streak}</p>
              <p className="text-[10px] text-brand-red font-bold uppercase tracking-widest">Day Streak</p>
            </div>
          </div>

          {/* Level Badge */}
          <div className="bg-brand-warm-yellow px-5 py-4 rounded-2xl border border-brand-warm-border flex items-center gap-3">
            <Trophy className="w-8 h-8 text-brand-gold" />
            <div>
              <p className="text-2xl font-black text-brand-dark leading-tight">Lvl {userProgress.level}</p>
              <p className="text-[10px] text-brand-warm-text font-bold uppercase tracking-widest">Global Rank</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Learning Progress & Recommended Action */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* XP Progress Bar */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-slate-800">Weekly Progress Threshold</span>
              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{userProgress.xp} XP total</span>
            </div>
            
            {/* Real metric progress tracking bar */}
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden p-0.5 border border-slate-200/30">
              <div 
                className="bg-gradient-to-r from-brand-red to-brand-gold h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.max(8, Math.min(100, xpPercent))}%` }}
              />
            </div>
            
            <div className="flex justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              <span>Level {userProgress.level}</span>
              <span>{100 - xpPercent} XP to Level {userProgress.level + 1}</span>
            </div>

            {/* Interactive Level Up testing platform / Reward claim */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200/50">
              <div className="text-left">
                <p className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1">
                  <span>⚡ HSK Daily Interactive Study Boost</span>
                </p>
                <p className="text-[9px] text-slate-500 mt-0.5 font-light">
                  Practice vocabulary or simulate study sessions to test the triumphant **Level Up celebration**!
                </p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  id="btn-claim-30-xp"
                  onClick={() => {
                    completeLesson("daily-practice-bonus", 30);
                  }}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold transition active:scale-95 cursor-pointer leading-none inline-flex items-center justify-center gap-1 shadow-sm"
                >
                  Claim +30 XP
                </button>
                <button
                  id="btn-trigger-level-up"
                  onClick={() => {
                    completeLesson("mandarin-immersion-level-up-test", 100);
                  }}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-brand-red hover:bg-brand-red/95 text-white rounded-xl text-[10px] font-black transition active:scale-95 cursor-pointer leading-none inline-flex items-center justify-center gap-1 shadow-md shadow-brand-red/10 border border-brand-red/30"
                >
                  ⚡ Trigger Level Up!
                </button>
              </div>
            </div>
          </div>

          {/* Core Recommended Action Drawer */}
          <div className="bg-gradient-to-br from-brand-dark to-[#4A1521] text-white p-8 rounded-3xl relative overflow-hidden shadow-xl">
            <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4 text-[180px] font-bold font-mono text-brand-red select-none pointer-events-none">
              學
            </div>

            <div className="space-y-4 max-w-lg relative z-10">
              <span className="text-[10px] font-mono font-bold text-brand-gold bg-white/10 border border-white/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Up next in HSK Path
              </span>

              <h3 className="text-2xl sm:text-3xl font-extrabold font-sans tracking-tight">
                {isPinyinFinished ? "Basic Strokes Writing Practice" : "Complete Pinyin Pronunciation Chart"}
              </h3>
              
              <p className="text-sm text-slate-300 leading-relaxed font-light">
                {isPinyinFinished 
                  ? "Now that you mastered letters and phonetics, learn to sketch Chinese radicals synchronously with standard stroke orders."
                  : "Listen to standard Mandarin initial consonants, vowels, and verify your 4 voice tones inside the training laboratory."
                }
              </p>

              <button
                id="btn-continue-learning-dashboard"
                onClick={() => setActiveTab("Learn")}
                className="px-6 py-3.5 bg-brand-red hover:bg-brand-red/90 text-white rounded-xl font-bold flex items-center gap-2 transition text-sm cursor-pointer"
              >
                Continue Learning Chinese
                <ChevronRight className="w-5 h-5 text-brand-gold" />
              </button>
            </div>
          </div>

          {/* Spaced Repetition (SRS) Card Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-brand-warm-yellow text-brand-warm-text rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-brand-dark text-base">Spaced Repetition Review</h4>
                <p className="text-xs text-slate-500">
                  {srsDueCount > 0 
                    ? `You currently have ${srsDueCount} vocabulary flashcards due for smart memory review today.` 
                    : "Zero vocabulary cards pending! Your learning curve memory is perfectly clear."
                  }
                </p>
              </div>

              <button
                id="btn-review-flashcards-dashboard"
                onClick={() => {
                  setActiveTab("Learn");
                }}
                className="w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 font-bold rounded-xl text-xs text-slate-700 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                Launch Spaced Review
                <span className="bg-brand-red text-white rounded-full px-2 py-0.5 text-[10px] font-mono leading-none">{srsDueCount}</span>
              </button>
            </div>

            {/* Drama listening practice quick suggestion */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-brand-light-red text-brand-red rounded-xl flex items-center justify-center">
                  <Play className="w-5 h-5 fill-current" />
                </div>
                <h4 className="font-bold text-brand-dark text-base">Drama Watch Companion</h4>
                <p className="text-xs text-slate-500">
                  Practice authentic conversation hearing using dual-subtitled Rakuten Viki drama streams.
                </p>
              </div>

              <button
                id="btn-watch-drama-dashboard"
                onClick={() => setActiveTab("Drama")}
                className="w-full py-3 bg-brand-light-red hover:bg-brand-light-red/80 text-brand-red font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                Watch Chinese Dramas
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side Column: Bookmarks, Word-Tap savings, HSK selector */}
        <div className="lg:col-span-4 space-y-8">

          {/* Achievements Bento-Grid (Super Chinese Game Style) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4 text-left">
            <h4 className="font-bold text-brand-dark text-base flex items-center gap-2">
              <Trophy className="w-5 h-5 text-brand-gold animate-bounce" />
              Super Chinese Achievements
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  title: "Pinyin Pioneer",
                  desc: "Learn core sounds",
                  unlocked: userProgress.completedLessons.length > 0,
                  metric: `${userProgress.completedLessons.filter(l => l.includes("pinyin") || l.includes("lesson")).length}/1`,
                  icon: "🗣️"
                },
                {
                  title: "Stroke Artisan",
                  desc: "Sketched radicals",
                  unlocked: userProgress.completedLessons.some(l => l.includes("stroke") || l.includes("character") || l.includes("radical")),
                  metric: userProgress.completedLessons.some(l => l.includes("stroke") || l.includes("radical")) ? "1/1" : "0/1",
                  icon: "✍️"
                },
                {
                  title: "Vocabulary Sage",
                  desc: "Saved study terms",
                  unlocked: userProgress.savedVocabulary.length >= 3,
                  metric: `${userProgress.savedVocabulary.length}/3`,
                  icon: "📚"
                },
                {
                  title: "XP Powerhouse",
                  desc: "Hit 100+ points",
                  unlocked: userProgress.xp >= 100,
                  metric: `${userProgress.xp}/100`,
                  icon: "⚡"
                }
              ].map((badge, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-2xl border transition relative overflow-hidden flex flex-col justify-between ${
                    badge.unlocked 
                      ? "border-amber-300 bg-amber-50/20" 
                      : "border-slate-100 bg-slate-50/50 grayscale opacity-60"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xl">{badge.icon}</span>
                    {badge.unlocked && (
                      <span className="text-[7px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded uppercase leading-none">
                        Won
                      </span>
                    )}
                  </div>
                  <div>
                    <h5 className="font-extrabold text-brand-dark text-[11px] leading-tight mb-0.5">{badge.title}</h5>
                    <p className="text-[8px] text-slate-400 font-light truncate mb-1.5">{badge.desc}</p>
                    <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${badge.unlocked ? "bg-amber-400" : "bg-slate-350 bg-slate-300"}`}
                        style={{ width: badge.unlocked ? "100%" : "30%" }}
                      />
                    </div>
                    <span className="text-[8px] font-mono font-bold text-slate-500 mt-1 block">{badge.metric}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* My Target Vocabulary */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
            <h4 className="font-bold text-brand-dark text-base flex items-center gap-2">
              <Star className="w-5 h-5 text-brand-gold fill-current animate-pulse" />
              My Saved Words ({userProgress.savedVocabulary.length})
            </h4>

            {savedVocabList.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 italic">
                No saved vocabulary words yet. Look up in Dictionary and press Star to save!
              </div>
            ) : (
              <div className="space-y-2.5">
                {savedVocabList.map((vocab, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-2xl hover:bg-slate-50 border border-slate-100 transition group text-left">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => speakMandarin(vocab.character)}
                        className="p-1.5 bg-brand-light-red/50 hover:bg-brand-light-red text-brand-red rounded-lg transition"
                        title="Vocalize standard pronunciation"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="cursor-pointer" onClick={() => speakMandarin(vocab.character)}>
                        <p className="font-bold text-brand-dark text-sm hover:text-brand-red transition flex items-center gap-1">
                          {vocab.character}
                        </p>
                        <p className="text-xs text-slate-500 font-mono italic leading-none">{vocab.pinyin}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSaveVocabulary(vocab.character)}
                      className="p-1 px-2 text-slate-400 hover:text-brand-red hover:bg-brand-light-red rounded-lg text-[10px] font-bold transition"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bookmarked Stories & Readings */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
            <h4 className="font-bold text-brand-dark text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-red" />
              Bookmarked Reads ({savedBooksList.length})
            </h4>

            {savedBooksList.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 italic">
                No bookmarked storybooks yet. Explore stories in Watch & Read Library to save.
              </div>
            ) : (
              <div className="space-y-3">
                {savedBooksList.map((book, i) => (
                  <div 
                    key={i} 
                    onClick={() => setActiveTab("Library")}
                    className="flex gap-3 items-center p-2 rounded-2xl hover:bg-slate-50 border border-slate-100/60 transition cursor-pointer"
                  >
                    <img 
                      src={book.cover} 
                      alt={book.title} 
                      className="w-12 h-14 bg-slate-100 rounded-lg object-cover" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-brand-dark text-xs truncate">{book.title}</p>
                      <p className="text-[10px] text-slate-400 font-light">By {book.author}</p>
                      <span className="inline-block mt-1 text-[9px] font-bold bg-brand-warm-yellow text-brand-warm-text px-1.5 py-0.5 rounded font-mono leading-none">
                        HSK {book.hskLevel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Beautiful Motivating Card Quote from Professional Polish mockup */}
          <div className="p-5 bg-brand-warm-yellow border border-brand-warm-border rounded-2xl flex flex-col gap-2 shadow-sm text-left">
            <p className="text-xs text-brand-warm-text font-medium leading-relaxed italic">
              "The best time to plant a tree was 20 years ago. The second best time is now."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
