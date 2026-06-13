import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { Search, Star, Volume2, Sparkles, AlertCircle, BookOpen, ChevronRight } from "lucide-react";

interface ExampleSentence {
  cn: string;
  py: string;
  en: string;
}

interface DictionaryResult {
  character: string;
  pinyin: string;
  meaning: string;
  hskLevel: number;
  examples: ExampleSentence[];
}

export const Dictionary: React.FC = () => {
  const { userProgress, toggleSaveVocabulary } = useApp();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DictionaryResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/gemini/dictionary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() })
      });

      if (!response.ok) {
        throw new Error("Unable to fetch definitions from translation server.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.details || data.error);
      }

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong during translation.");
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      window.speechSynthesis.speak(utterance);
    }
  };

  const popularSearches = ["Friend", "He", "Chinese Language", "Hospital", "Hello", "Coffee"];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 selection:bg-red-500 selection:text-white">
      
      <div className="space-y-2 text-center md:text-left">
        <h2 className="text-3xl font-extrabold text-slate-950 font-sans tracking-tight flex flex-wrap items-center justify-center md:justify-start gap-2.5">
          <BookOpen className="w-8 h-8 text-red-600" />
          Lexicon & AI Dictionary
        </h2>
        <p className="text-slate-600 text-sm max-w-xl">
          Search any word in English, Pinyin, or Hanzi. Gemini translates and decomposes character definitions with audio examples.
        </p>
      </div>

      {/* Form Input */}
      <form onSubmit={handleSearch} className="relative bg-white p-2 rounded-2xl border border-slate-205 shadow-sm hover:shadow-md transition">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Type 'friend', 'xièxie', or '咖啡'..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-transparent outline-none text-slate-900 text-base placeholder-slate-400"
            />
          </div>

          <button
            id="btn-trigger-ai-dictionary-search"
            type="submit"
            disabled={loading}
            className="px-6 py-4 bg-red-650 bg-red-650 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Searching AI..." : "Search Word"}
          </button>
        </div>
      </form>

      {/* Popular quick searches tags */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">Quick suggestions:</span>
        {popularSearches.map((term) => (
          <button
            key={term}
            onClick={() => {
              setQuery(term);
              // Trigger a programmatical submission
              setTimeout(() => {
                const btn = document.getElementById("btn-trigger-ai-dictionary-search");
                btn?.click();
              }, 50);
            }}
            className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
          >
            {term}
          </button>
        ))}
      </div>

      {/* States handler */}
      <AnimatePresence mode="wait">
        
        {loading && (
          <motion.div 
            className="py-12 text-center space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-8 h-8 rounded-full border-3 border-red-600 border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-mono">Gemini lexicographer analysis translating and compiling sentence structures...</p>
          </motion.div>
        )}

        {error && (
          <motion.div 
            className="p-5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-red-900 text-sm">Search failed</h4>
              <p className="text-xs text-red-700 leading-normal mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        {result && (
          <motion.div
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/60 shadow-md space-y-8 relative overflow-hidden"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-amber-400" />
            
            {/* Header layout */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <h3 className="text-5xl font-black text-slate-950 font-sans tracking-tight">{result.character}</h3>
                  
                  <button
                    onClick={() => speakText(result.character)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-650 transition cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-lg font-mono font-bold text-amber-600">{result.pinyin}</p>
              </div>

              {/* HSK standard label & bookmarks */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-205 font-bold uppercase">
                  HSK Level {result.hskLevel}
                </span>

                <button
                  onClick={() => {
                    toggleSaveVocabulary(result.character);
                    alert(`Saved \"${result.character}\" into your workspace dictionary!`);
                  }}
                  className={`p-2.5 rounded-xl border transition cursor-pointer ${
                    userProgress.savedVocabulary.includes(result.character)
                      ? "border-amber-300 bg-amber-50 text-amber-700"
                      : "border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-200"
                  }`}
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>

            {/* English meanings */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">English Definition</span>
              <p className="text-base text-slate-900 leading-normal font-bold">
                {result.meaning}
              </p>
            </div>

            {/* Example sentences */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Contextual Examples</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {result.examples.map((ex, i) => (
                  <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl relative group flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <p className="text-lg font-bold text-slate-950 font-sans">{ex.cn}</p>
                      <p className="text-xs text-slate-500 font-mono font-medium">{ex.py}</p>
                      <p className="text-xs text-slate-700 italic font-light">"{ex.en}"</p>
                    </div>

                    <button
                      onClick={() => speakText(ex.cn)}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-red-650 hover:border-red-200 self-end transition cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
