import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { motion } from "motion/react";
import { User, Shield, Target, Award, Trash2, CheckCircle2, ChevronRight, Globe, Inbox, Save } from "lucide-react";

export const Profile: React.FC = () => {
  const { userProgress, updateUserGoals, signOut, activeTab } = useApp();
  const [displayName, setDisplayName] = useState(userProgress.displayName);
  const [learningGoal, setLearningGoal] = useState(userProgress.learningGoal);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserGoals({
      displayName: displayName.trim() || "Studious Traveler",
      learningGoal: learningGoal
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const calculateTargetMinutes = (goal: string) => {
    switch(goal) {
      case "casual": return "5 mins / day";
      case "medium": return "15 mins / day";
      case "serious": return "30 mins / day";
      case "insane": return "60 mins / day";
      default: return "15 mins / day";
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 selection:bg-red-500 selection:text-white">
      
      <div className="space-y-1.5 text-center md:text-left">
        <h2 className="text-3xl font-extrabold text-slate-950 font-sans tracking-tight">Student Settings & Metrics</h2>
        <p className="text-slate-600 text-sm">
          Customize your daily learning goals, update study handles, and secure or purge local database history.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Side: General Profile Metrics Info Card */}
        <div className="md:col-span-4 bg-slate-950 text-white rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden h-fit">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-5 text-9xl font-black text-red-500 font-mono">
            漢
          </div>
          
          <div className="space-y-6 relative z-10 text-center md:text-left">
            <img 
              src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${userProgress.displayName}`} 
              alt="Avatar" 
              className="w-20 h-20 bg-slate-905 rounded-full border-2 border-amber-300 mx-auto md:mx-0 bg-slate-900" 
            />
            
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-sans text-white">{userProgress.displayName}</h3>
              <p className="text-xs text-slate-400 font-mono">Rank: Standard Mandarin Novice</p>
            </div>

            {/* Core statistics tracker tallies */}
            <div className="border-t border-slate-800 pt-4 space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Completed Lessons:</span>
                <span className="font-bold text-white font-mono">{userProgress.completedLessons.length}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Bookmarked books:</span>
                <span className="font-bold text-white font-mono">{userProgress.savedBooks.length}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Saved characters:</span>
                <span className="font-bold text-white font-mono">{userProgress.savedVocabulary.length}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Accumulated XP:</span>
                <span className="font-bold text-amber-300 font-mono">{userProgress.xp} XP</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-850 text-[10px] text-slate-500 font-mono">
            Device synced to HanziVerse Cookie Cache
          </div>
        </div>

        {/* Right Side: Configuration Forms */}
        <div className="md:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-6">
          <h4 className="font-extrabold text-slate-950 font-sans text-lg">Goal Configuration</h4>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-650 block">Your Study Display Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 outline-none rounded-xl text-sm focus:border-red-500 text-slate-900"
              />
            </div>

            {/* Goals selection cards */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-650 block">Daily Study Intensity Goal</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "casual", title: "Casual", desc: "5m / day" },
                  { id: "medium", title: "Regular", desc: "15m / day" },
                  { id: "serious", title: "Serious", desc: "30m / day" },
                  { id: "insane", title: "Insane", desc: "60m / day" }
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setLearningGoal(item.id as any)}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                      learningGoal === item.id
                        ? "border-red-650 bg-red-50/50 text-red-750 border-red-600 font-semibold"
                        : "border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">{item.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-none">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              {savedSuccess ? (
                <span className="text-xs font-semibold text-green-600 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Progress goals saved!
                </span>
              ) : <span />}

              <button
                type="submit"
                className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Configuration
              </button>
            </div>
          </form>

          {/* Destructive state reset tools */}
          <div className="pt-6 border-t border-dashed border-slate-200 space-y-4">
            <h5 className="font-bold text-red-600 text-xs uppercase tracking-wider block">Purge Danger Actions</h5>
            
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-red-900 leading-tight">Reset Learning Progress</p>
                <p className="text-[10px] text-red-700 font-light max-w-sm leading-normal">
                  Clears all compiled HSK lesson credits, daily streak markers, bookmarked novels, and target character lists from cookies.
                </p>
              </div>

              <button
                onClick={() => {
                  if (confirm("Are you sure you want to reset all progress? This will delete your current streak, lessons, bookmarks, and vocabulary lists. This cannot be undone!")) {
                    localStorage.clear();
                    signOut();
                    alert("All cookie learning logs successfully purged. Starting HanziVerse from scratch!");
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-[10px] transition cursor-pointer self-start sm:self-center"
              >
                Reset Progress Board
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
