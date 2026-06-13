import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { LandingPage } from "./components/LandingPage";
import { Auth } from "./components/Auth";
import { Dashboard } from "./components/Dashboard";
import { LearnPath } from "./components/LearnPath";
import { Library } from "./components/Library";
import { DramaWatch } from "./components/DramaWatch";
import { Dictionary } from "./components/Dictionary";
import { CharacterLearn } from "./components/CharacterLearn";
import { Profile } from "./components/Profile";
import { LinVoiceTutor } from "./components/LinVoiceTutor";
import { motion, AnimatePresence } from "motion/react";
import { 
  Tv, BookOpen, Brain, PenTool, User, Search, Flame, Trophy, 
  Sparkles, LogIn, LogOut, ChevronUp, ChevronDown, Smile, Send, Compass, Volume2,
  Sun, Moon
} from "lucide-react";
import { playClickSound } from "./utils/soundEffects";


const AppContent: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    user, 
    userProgress, 
    signOut,
    xpNotification,
    clearXpNotification,
    levelUpLevel,
    clearLevelUpLevel
  } = useApp();

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("hanziverse_theme") === "dark";
    }
    return false;
  });

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("hanziverse_theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("hanziverse_theme", "light");
    }
  }, [darkMode]);


  React.useEffect(() => {
    if (xpNotification) {
      const timer = setTimeout(() => {
        clearXpNotification();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [xpNotification, clearXpNotification]);

  const [forumChatOpen, setForumChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "model"; content: string }>>([
    { role: "model", content: "你好！(Nǐ hǎo! - Hello!) I'm Master Chen, your speaking tutor. How is your learning coming along today?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Chat Submission handler with `/api/gemini/chat`
  const handleSendChatMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatLoading(true);

    const updatedHistory = [...chatMessages, { role: "user" as const, content: userMessage }];
    setChatMessages(updatedHistory);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedHistory })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          setChatMessages((prev) => [...prev, { role: "model", content: data.reply }]);
        }
      } else {
        throw new Error("Tutor chat failed.");
      }
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev, 
        { role: "model", content: "对不起 (duìbuqǐ - Sorry), I had a short connection mismatch tutor glitch. Let's try saying that again!" }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const renderActiveTab = () => {
    // Intercept with quiz setup if not onboarded and trying to view dashboard/lessons
    if (!userProgress.onboarded && activeTab !== "Landing" && activeTab !== "Login") {
      return <Auth />;
    }

    switch(activeTab) {
      case "Landing":
        return <LandingPage />;
      case "Login":
        return <Auth />;
      case "Dashboard":
        return <Dashboard />;
      case "Learn":
        return <LearnPath />;
      case "Library":
        return <Library />;
      case "Drama":
        return <DramaWatch />;
      case "Dictionary":
        return <Dictionary />;
      case "Characters":
        return <CharacterLearn />;
      case "LinVoice":
        return <LinVoiceTutor />;
      case "Profile":
        return <Profile />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-ivory text-brand-dark flex flex-col justify-between selection:bg-brand-red selection:text-white relative">
      
      {/* Top Main Navigation Bar */}
      <nav className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20">
          
          {/* Logo Brand */}
          <button 
            onClick={() => setActiveTab("Landing")}
            className="flex items-center gap-3.5 text-left cursor-pointer group"
          >
            <div className="w-10 h-10 bg-brand-red rounded-lg flex items-center justify-center shadow-md shadow-brand-red/10 group-hover:scale-105 active:scale-95 transition">
              <span className="text-white font-bold text-2xl font-serif">汉</span>
            </div>
            <div>
              <h1 className="font-black text-brand-dark text-xl tracking-tight leading-tight">
                Hanzi<span className="text-brand-red">Verse</span>
              </h1>
              <p className="text-[10px] text-gray-500 font-mono leading-none tracking-widest uppercase">Mandarin Immersion HUB</p>
            </div>
          </button>

          {/* Navigation Links (Responsive center row matches Professional Polish) */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-semibold text-gray-500 uppercase tracking-wider">
            {[
              { id: "Landing", label: "Home", icon: Compass },
              { id: "Dashboard", label: "Dashboard", icon: Trophy, authRequired: true },
              { id: "Learn", label: "Study Path", icon: Brain, authRequired: true },
              { id: "Library", label: "Library Books", icon: BookOpen },
              { id: "Drama", label: "Viki Drama", icon: Tv },
              { id: "Dictionary", label: "AI Dictionary", icon: Search },
              { id: "Characters", label: "Character Learn", icon: PenTool },
              { id: "LinVoice", label: "Talk with Lin (AI)", icon: Sparkles }
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-1.5 transition-colors font-semibold tracking-wider cursor-pointer flex items-center gap-1.5 border-b-2 border-transparent ${
                    isSelected
                      ? "text-brand-red border-brand-red pb-1"
                      : "text-gray-500 hover:text-brand-red pb-1"
                  }`}
                >
                  <tab.icon className="w-4 h-4 text-xs" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right side user status panel */}
          <div className="flex items-center gap-3">
            
            {/* Sun / Moon Theme Toggle */}
            <button
              onClick={() => {
                setDarkMode(!darkMode);
                playClickSound();
              }}
              className="p-2 rounded-full border border-slate-200 hover:border-slate-350 bg-slate-50 hover:bg-slate-100 transition text-slate-700 inline-flex items-center justify-center cursor-pointer shadow-xs focus:ring-1 focus:ring-slate-300 outline-hidden"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              ) : (
                <Moon className="w-4 h-4 text-slate-800" />
              )}
            </button>

            {/* Day Streak Flame (Only if logged in) */}
            {user && (
              <div className="flex items-center gap-2 bg-brand-light-red px-3 py-1.5 rounded-full border border-brand-light-border text-xs font-bold text-brand-red">
                <Flame className="w-4 h-4 fill-current text-orange-500" />
                <span>{userProgress.streak} Day Streak</span>
              </div>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                {/* Profile Link */}
                <button
                  onClick={() => setActiveTab("Profile")}
                  className="w-10 h-10 rounded-full border-2 border-brand-gold p-0.5"
                >
                  <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                    <img 
                      src={user.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${userProgress.displayName}`} 
                      alt="avatar" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </button>

                {/* Sign Out */}
                <button
                  onClick={signOut}
                  className="px-3.5 py-1.5 bg-brand-dark text-white hover:bg-brand-dark/95 rounded-full text-xs transition font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Leave</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab("Login")}
                className="px-5 py-2.5 bg-brand-red hover:bg-brand-red/90 text-white text-xs font-bold rounded-full transition inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-brand-red/15"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </button>
            )}
          </div>

        </div>

        {/* Mobile Submenu tabs */}
        <div className="flex lg:hidden overflow-x-auto gap-2 py-2 border-t border-slate-100 scrollbar-none justify-start px-1 text-xs">
          {[
            { id: "Landing", label: "Home" },
            { id: "Dashboard", label: "Dashboard" },
            { id: "Learn", label: "Study" },
            { id: "Library", label: "Books" },
            { id: "Drama", label: "Drama" },
            { id: "Dictionary", label: "Search" },
            { id: "Characters", label: "Characters" },
            { id: "LinVoice", label: "Talk with Lin" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold transition cursor-pointer ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-650 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Primary Page viewport content */}
      <main className="flex-1 min-h-[75vh]">
        {renderActiveTab()}
      </main>

      {/* Universal Footer */}
      <footer className="bg-slate-950 text-slate-400 py-10 px-4 mt-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-center md:text-left">
          <div className="space-y-1">
            <h5 className="font-extrabold text-white text-sm tracking-tight flex items-center justify-center md:justify-start gap-1">
              <span className="text-red-550 text-red-500">HanziVerse</span>
              漢
            </h5>
            <p className="font-light text-slate-500">Empowering steps towards fluid character communication.</p>
          </div>

          <div className="flex gap-6 font-semibold">
            <button onClick={() => setActiveTab("Landing")} className="hover:text-white transition cursor-pointer">Product Tour</button>
            <button onClick={() => setActiveTab("Learn")} className="hover:text-white transition cursor-pointer">Radical Grid</button>
            <button onClick={() => setActiveTab("Library")} className="hover:text-white transition cursor-pointer">Immersive Stories</button>
          </div>

          <div className="text-slate-600 text-[11px] font-mono">
            Licensed with Rakuten Viki & @google/genai SDK Integration
          </div>
        </div>
      </footer>

      {/* Floating Gemini AI Speaking Tutor Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {forumChatOpen && (
            <motion.div
              className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-[320px] sm:w-[360px] h-[480px] flex flex-col justify-between overflow-hidden mb-3"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
            >
              {/* Tutor Chat Header */}
              <div className="bg-slate-950 text-white p-4 flex justify-between items-center bg-gradient-to-r from-slate-950 to-red-950">
                <div className="flex items-center gap-2.5 text-left">
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-bold text-white text-sm">
                    陈
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-white">Master Chen</h4>
                    <p className="text-[9px] text-amber-300 font-mono">Pro Speaking Companion</p>
                  </div>
                </div>

                <button 
                  onClick={() => setForumChatOpen(false)}
                  className="text-slate-400 hover:text-white transition p-1"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Message Scroll */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
                {chatMessages.map((msg, i) => {
                  const isUser = msg.role === "user";
                  return (
                    <div 
                      key={i} 
                      className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-2.5 text-xs`}
                    >
                      {!isUser && (
                        <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">陈</span>
                      )}
                      
                      <div className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                        isUser 
                          ? "bg-slate-900 text-white rounded-tr-none" 
                          : "bg-white border border-slate-200 text-slate-800 rounded-tl-none font-light"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}

                {chatLoading && (
                  <div className="flex items-center gap-1.5 text-slate-405 italic text-[11px] p-2 text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0.4s" }} />
                    <span>Master Chen is reviewing pinyin tones...</span>
                  </div>
                )}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendChatMsg} className="p-3 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. How to say 'airport' in Pinyin?"
                  required
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 outline-none rounded-xl text-xs focus:border-red-500 text-slate-900"
                />
                <button
                  type="submit"
                  className="p-2 px-3.5 bg-red-650 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Chat Trigger button */}
        {!forumChatOpen && (
          <button
            onClick={() => setForumChatOpen(true)}
            className="w-12 h-12 rounded-full bg-red-650 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 border border-red-500/10 cursor-pointer"
          >
            <Smile className="w-6 h-6 animate-pulse" />
          </button>
        )}
      </div>

      {/* Floating XP Toasts */}
      <AnimatePresence>
        {xpNotification && (
          <motion.div
            initial={{ opacity: 0, y: -40, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-full flex items-center gap-3 shadow-2xl backdrop-blur-md border border-slate-800"
          >
            <div className="w-7 h-7 bg-brand-gold rounded-full flex items-center justify-center text-xs font-black text-brand-dark animate-pulse">
              +
            </div>
            <div className="text-left font-sans">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-brand-gold text-sm leading-none">{xpNotification.xp} XP</span>
                <span className="text-[10px] bg-white/10 text-slate-300 font-mono font-bold leading-none py-0.5 px-1.5 rounded uppercase">Earned</span>
              </div>
              <p className="text-[10px] text-slate-300 font-light max-w-[180px] truncate leading-normal block">{xpNotification.reason}</p>
            </div>
            <button 
              onClick={clearXpNotification}
              className="text-slate-400 hover:text-white text-[10px] font-bold p-1 ml-2 bg-white/5 hover:bg-white/10 rounded-full"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Up Celebration Screen Modal */}
      <AnimatePresence>
        {levelUpLevel !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white border-2 border-brand-gold rounded-3xl p-8 max-w-sm w-full text-center space-y-6 relative overflow-hidden shadow-2xl text-left"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-red via-brand-gold to-brand-red animate-pulse" />
              
              <div className="w-20 h-20 bg-brand-warm-yellow text-brand-gold rounded-full flex items-center justify-center mx-auto shadow-md border border-brand-warm-border">
                <Trophy className="w-10 h-10 animate-bounce" />
              </div>
              
              <div className="space-y-2 text-center">
                <h3 className="text-2xl font-black text-brand-dark tracking-tight leading-none uppercase">LEVEL UP!</h3>
                <p className="text-xs text-slate-500 font-mono tracking-wider uppercase">Chinese Language Journey</p>
              </div>
              
              <div className="py-2.5 bg-brand-light-red border border-brand-light-border rounded-2xl text-center">
                <span className="text-[10px] text-brand-red font-bold uppercase tracking-wider block mb-1">Completed Level Milestone</span>
                <span className="text-4xl font-extrabold text-brand-red">Level {levelUpLevel}</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-light text-center">
                "Jiābāng! You have reached a brand new level of Chinese mastery! Keep going to build your fluency gold standard."
              </p>

              <button
                onClick={clearLevelUpLevel}
                className="w-full py-3 bg-brand-red hover:bg-brand-red/90 text-white font-bold text-sm rounded-xl transition cursor-pointer shadow-md shadow-brand-red/10 border border-brand-red"
              >
                Continue Learning
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
