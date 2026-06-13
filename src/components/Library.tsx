import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Star, Sparkles, Volume2, ArrowLeft, ArrowRight, Eye, Search, CheckCircle2 } from "lucide-react";
import { WATCH_READ_LIBRARY } from "../data/mockData";

export const Library: React.FC = () => {
  const { userProgress, saveBook, completeLesson } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [activeStoryBook, setActiveStoryBook] = useState<typeof WATCH_READ_LIBRARY[0] | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [showPinyin, setShowPinyin] = useState<boolean>(true);
  const [showTransl, setShowTransl] = useState<boolean>(true);
  const [activeWordDict, setActiveWordDict] = useState<{ cn: string; py: string; en: string } | null>(null);

  // Filter Logic
  const filteredStories = WATCH_READ_LIBRARY.filter((b) => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter ? b.hskLevel === levelFilter : true;
    return matchesSearch && matchesLevel;
  });

  const handleOpenBook = (book: typeof WATCH_READ_LIBRARY[0]) => {
    setActiveStoryBook(book);
    setCurrentPage(0);
    setActiveWordDict(null);
  };

  const handleCloseBook = () => {
    setActiveStoryBook(null);
  };

  // Play word synthesis
  const speakWord = (word: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "zh-CN";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 selection:bg-red-500 selection:text-white">
      
      {/* Immersive Book Reader view */}
      <AnimatePresence>
        {activeStoryBook ? (
          <motion.div
            key="reader"
            className="fixed inset-0 z-50 bg-slate-900/90 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-amber-50/5 text-slate-800 bg-white w-full max-w-4xl rounded-3xl grid grid-cols-1 md:grid-cols-12 overflow-hidden shadow-2xl min-h-[550px] relative">
              
              {/* Left page controls & info Column */}
              <div className="md:col-span-4 bg-slate-950 text-white p-6 flex flex-col justify-between">
                <div>
                  <button
                    onClick={handleCloseBook}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-bold mb-8 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Close Book
                  </button>

                  <div className="space-y-4">
                    <img 
                      src={activeStoryBook.cover} 
                      alt={activeStoryBook.title} 
                      className="w-28 h-36 rounded-xl shadow-lg border border-slate-800 object-cover mx-auto md:mx-0" 
                    />
                    <div>
                      <h3 className="text-xl font-bold font-sans tracking-tight text-white">{activeStoryBook.title}</h3>
                      <p className="text-xs text-slate-400">By {activeStoryBook.author}</p>
                      
                      <div className="flex gap-2 items-center mt-3">
                        <span className="text-[10px] bg-red-600 text-white font-mono px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                          HSK {activeStoryBook.hskLevel}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Page {currentPage + 1} of {activeStoryBook.pages.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reader Controls */}
                <div className="space-y-4 border-t border-slate-800 pt-6 mt-6 md:mt-0">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                      <input 
                        type="checkbox" 
                        checked={showPinyin} 
                        onChange={(e) => setShowPinyin(e.target.checked)}
                        className="rounded border-slate-800 bg-slate-900 text-red-500 focus:ring-red-500"
                      />
                      Show Pinyin Guides
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                      <input 
                        type="checkbox" 
                        checked={showTransl} 
                        onChange={(e) => setShowTransl(e.target.checked)}
                        className="rounded border-slate-800 bg-slate-900 text-red-500 focus:ring-red-500"
                      />
                      Show English Translation
                    </label>
                  </div>

                  <button
                    onClick={() => {
                      saveBook(activeStoryBook.id);
                      alert(userProgress.savedBooks.includes(activeStoryBook.id) ? "Book removed from library bookmarks" : "Book marked successfully into your collection!");
                    }}
                    className="w-full text-center py-2.5 bg-slate-900 border border-slate-800 text-slate-200 text-xs hover:border-slate-700 hover:text-white rounded-xl transition cursor-pointer"
                  >
                    {userProgress.savedBooks.includes(activeStoryBook.id) ? "★ Bookmarked" : "☆ Save to bookmarks"}
                  </button>
                </div>
              </div>

              {/* Central Pages Column */}
              <div className="md:col-span-8 p-6 md:p-10 flex flex-col justify-between space-y-6">
                
                {/* Book text content block */}
                <div className="space-y-8 flex-1 flex flex-col justify-center">
                  <div className="space-y-6 text-left">
                    
                    {showPinyin && (
                      <p className="text-sm font-mono text-amber-700 tracking-wide font-medium leading-relaxed mb-4">
                        {activeStoryBook.pages[currentPage].py}
                      </p>
                    )}

                     {/* Sentence rendering with tappable individual characters */}
                    <div className="flex flex-wrap gap-x-1.5 gap-y-3.5 items-center leading-loose">
                      {Array.from(activeStoryBook.pages[currentPage].cn).map((char: any, charIdx) => {
                        const isPunctuation = ["。", "，", "！", "？", "、", "；", "：", "“", "”"].includes(char as string);
                        return (
                          <span
                            key={charIdx}
                            onClick={() => {
                              if (isPunctuation) return;
                              speakWord(char as string);
                              setActiveWordDict({
                                cn: char as string,
                                py: "Individual Character",
                                en: "Tap 'AI Dictionary' in the navigation bar to look up full compound word translation!"
                              });
                            }}
                            className={`text-3xl sm:text-4.5xl font-extrabold transition select-none ${
                              isPunctuation 
                                ? "text-slate-400 font-normal px-0.5 animate-none" 
                                : "text-slate-900 hover:text-red-650 hover:scale-110 cursor-pointer active:scale-95"
                            }`}
                          >
                            {char}
                          </span>
                        );
                      })}
                    </div>

                    {showTransl && (
                      <motion.p 
                        className="pt-6 border-t border-slate-100 italic font-light text-slate-500 text-sm leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        "{activeStoryBook.pages[currentPage].en}"
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Footer Dictionary Popover and Pagings */}
                <div className="space-y-4">
                  {/* Dynamic tap word dictionary popup */}
                  <AnimatePresence>
                    {activeWordDict && (
                      <motion.div
                        className="p-3 bg-red-50/50 border border-red-100 rounded-2xl flex items-center justify-between gap-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {activeWordDict.cn} <span className="font-mono text-xs font-normal text-amber-700">({activeWordDict.py})</span>
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">{activeWordDict.en}</p>
                        </div>
                        <button
                          onClick={() => setActiveWordDict(null)}
                          className="text-[10px] text-slate-400 hover:text-slate-700 font-bold font-mono py-1 px-2 cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Previous / next page triggers */}
                  <div className="flex justify-between items-center border-t border-slate-150 pt-4">
                    <button
                      onClick={() => {
                        if (currentPage > 0) {
                          setCurrentPage((prev) => prev - 1);
                          setActiveWordDict(null);
                        }
                      }}
                      disabled={currentPage === 0}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-650 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                    >
                      <ArrowLeft className="w-4 h-4" /> Prev Page
                    </button>

                    <button
                      onClick={() => {
                        if (currentPage + 1 < activeStoryBook.pages.length) {
                          setCurrentPage((prev) => prev + 1);
                          setActiveWordDict(null);
                        } else {
                          // Complete entire story lesson
                          completeLesson(`book-finished-${activeStoryBook.id}`, 60);
                          alert(`🏆 You finished reading "${activeStoryBook.title}"! Claimed 60 XP.`);
                          handleCloseBook();
                        }
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold hover:shadow-sm cursor-pointer flex items-center gap-1"
                    >
                      {currentPage + 1 === activeStoryBook.pages.length ? "Finish Reading Book" : "Next Page"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Main Catalog View */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-950 font-sans tracking-tight">The Watch & Read Library</h2>
          <p className="text-slate-600 text-sm">
            Read Chinese picture books with Pinyin guidance or explore native cartoon chapters. Tap any character to query definitions.
          </p>
        </div>

        {/* Graded External Readers & Audiobook Choice Portal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-r from-red-50 to-amber-50 p-6 rounded-3xl border border-red-200/50 shadow-sm text-slate-800">
          
          {/* Website Selection Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-1.5 text-left">
              <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded tracking-wide uppercase">Web lessons option</span>
              <h3 className="text-base font-extrabold text-slate-950 flex items-center gap-1.5 font-sans">
                <span>🌐 Mandarin Bean Graded Reader</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                Explore 500+ online lesson recordings and graded stories matched accurately across all standard HSK categories.
              </p>
            </div>
            <a
              href="https://mandarinbean.com/all-lessons/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => completeLesson("mandarin-lessons-visit", 25)}
              className="w-full text-center py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition inline-block cursor-pointer shadow-sm text-[11px]"
            >
              Go to Mandarin Bean Lessons ↗
            </a>
          </div>

          {/* Android App Selection Card (Highly Recommended Option) */}
          <div className="bg-white p-5 rounded-2xl border-2 border-brand-gold shadow-md relative flex flex-col justify-between space-y-4 overflow-hidden">
            {/* Highly Recommended Badge */}
            <div className="absolute top-2.5 right-2.5 bg-amber-500 text-white text-[8px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase leading-none shadow-xs">
              ★ Highly Recommended
            </div>

            <div className="space-y-1.5 text-left">
              <span className="text-[9px] font-mono font-bold bg-brand-warm-yellow text-brand-gold px-2 py-0.5 rounded tracking-wide uppercase">Featured companion app</span>
              <h3 className="text-base font-extrabold text-slate-950 flex items-center gap-1.5 font-sans">
                <span>📱 Daily Chinese Audiobook App</span>
              </h3>
              <p className="text-xs text-slate-505 text-slate-505 leading-relaxed font-light">
                Listen to professional native audiobooks and folktales. Downloading the Android app is highly recommended for building standard fluency on-the-go!
              </p>
            </div>
            <a
              href="https://play.google.com/store/apps/details?id=com.brilliantcorp.dailyaudiobook"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => completeLesson("audiobook-download-bonus", 30)}
              className="w-full text-center py-2.5 bg-brand-red hover:bg-brand-red/90 text-white font-extrabold text-xs rounded-xl transition inline-block cursor-pointer shadow-md shadow-brand-red/10 text-[11px]"
            >
              Get Daily Audiobook App 📥
            </a>
          </div>

        </div>

        {/* Filters and search box */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
          
          {/* Search */}
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search books, authors, words..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-red-500 text-sm text-slate-900"
            />
          </div>

          {/* Level Filter tab row */}
          <div className="flex gap-2.5 self-start md:self-center">
            <button
              onClick={() => setLevelFilter(null)}
              className={`p-2 px-3.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                levelFilter === null ? "bg-slate-900 text-white" : "border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              All Levels
            </button>
            {[1, 2, 3].map((level) => (
              <button
                key={level}
                onClick={() => setLevelFilter(level)}
                className={`p-2 px-3.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  levelFilter === level ? "bg-red-600 text-white" : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                HSK {level} Target
              </button>
            ))}
          </div>
        </div>

        {/* Book Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStories.map((book) => {
            const isBookmarked = userProgress.savedBooks.includes(book.id);
            return (
              <div 
                key={book.id}
                className="bg-white border border-slate-200/60 hover:border-slate-350 rounded-2xl p-5 shadow-sm transition hover:shadow-md flex flex-col justify-between space-y-4"
              >
                <div className="flex gap-4">
                  <img 
                    src={book.cover} 
                    alt={book.title} 
                    className="w-20 h-28 bg-slate-100 rounded-xl border border-slate-100 object-cover flex-shrink-0" 
                  />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <span className="inline-block text-[9px] font-bold font-mono tracking-wider bg-amber-50 text-amber-700 border border-amber-200/40 px-1.5 py-0.5 rounded uppercase leading-none">
                      HSK {book.hskLevel} target
                    </span>
                    <h4 className="font-bold text-slate-950 font-sans tracking-tight text-base truncate">{book.title}</h4>
                    <p className="text-xs text-slate-500 truncate">By {book.author}</p>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-light mt-1">{book.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-100/80">
                  <button
                    onClick={() => handleOpenBook(book)}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" /> Open Reader
                  </button>

                  <button
                    onClick={() => saveBook(book.id)}
                    className={`p-2 rounded-xl border transition cursor-pointer ${
                      isBookmarked
                        ? "border-amber-300 bg-amber-50 text-amber-700"
                        : "border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-200"
                    }`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredStories.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400 italic">
              No matching books or stories found in our catalog. Try clearing your filters or keywords!
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
