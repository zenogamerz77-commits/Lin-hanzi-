import React from "react";
import { useApp } from "../context/AppContext";
import { motion } from "motion/react";
import { BookOpen, Tv, Sparkles, Trophy, Flame, Play, Star, ChevronRight } from "lucide-react";

export const LandingPage: React.FC = () => {
  const { setActiveTab, user } = useApp();

  return (
    <div className="min-h-screen bg-brand-ivory text-brand-dark selection:bg-brand-red selection:text-white">
      {/* Decorative Golden Chinese Ribbon Accent */}
      <div className="h-1.5 bg-gradient-to-r from-brand-red via-brand-gold to-brand-red w-full" />

      {/* Hero Section */}
      <header className="relative py-20 px-4 max-w-7xl mx-auto overflow-hidden">
        {/* Subtle Background Watermark element (Traditional cloud symbol vibe) */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none text-[320px] font-black select-none text-brand-red font-serif">
          漢
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            className="lg:col-span-7 space-y-6 text-left"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-light-red border border-brand-light-border text-brand-red text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              Empowered by Spaced Repetition & Immersive Drama
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-brand-dark leading-tight">
              Learn Chinese <br className="hidden sm:inline" />
              From <span className="text-brand-red underline decoration-brand-gold decoration-3">Zero to Fluent</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl font-light">
              Master Mandarin step-by-step through standard <strong className="font-semibold text-brand-dark">HSK roadmaps, stroke-orders</strong>, animated boards, audio-synced reading books, and watching authentic <strong className="font-semibold text-brand-red">Rakuten Viki</strong> Chinese dramas with double-subtitles.
            </p>

            <div className="flex flex-wrap gap-4 pt-3">
              <button
                id="btn-start-learning-hero"
                onClick={() => user ? setActiveTab("Dashboard") : setActiveTab("Login")}
                className="px-8 py-4 bg-brand-red hover:bg-brand-red/90 text-white font-bold rounded-full inline-flex items-center gap-2 shadow-lg shadow-brand-red/20 active:scale-95 transition cursor-pointer"
              >
                Start Learning Now
                <ChevronRight className="w-5 h-5 text-brand-gold" />
              </button>
              
              <button
                id="btn-preview-roadmap-hero"
                onClick={() => setActiveTab("Learn")}
                className="px-6 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-brand-dark font-bold rounded-full inline-flex items-center gap-2 transition cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current text-brand-red" />
                Preview Pinyin Chart
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200/60 max-w-md">
              <div>
                <p className="text-3xl font-black text-brand-dark">1,200+</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest">HSK Words</p>
              </div>
              <div>
                <p className="text-3xl font-black text-brand-dark">100%</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest">Interactive Tones</p>
              </div>
              <div>
                <p className="text-3xl font-black text-brand-dark">20+</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest">Immersive Dramas</p>
              </div>
            </div>
          </motion.div>

          {/* Core Interactive Graphic Mockup */}
          <motion.div 
            className="lg:col-span-5 relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl overflow-hidden aspect-square flex flex-col justify-between">
              {/* Floating Cards */}
              <div className="absolute top-4 right-4 bg-brand-light-red border border-brand-light-border px-3 py-1.5 rounded-full flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-brand-red uppercase tracking-wider">Tones Verified</span>
              </div>

              {/* Character Card Graphic */}
              <div className="my-auto text-center space-y-5">
                <div className="inline-block p-10 bg-[#FCFBF9] rounded-2xl shadow-md border-2 border-brand-gold/20 relative">
                  <div className="absolute top-1 right-2 text-[9px] font-mono text-brand-gold uppercase tracking-widest">Stroke 1</div>
                  <span className="text-8xl font-black text-brand-dark font-serif">漢</span>
                  <div className="mt-2 text-xs text-slate-500 font-mono tracking-wide">hàn (Chinese character)</div>
                </div>
                
                {/* Visual Audio Wave */}
                <div className="flex justify-center items-center gap-1.5 h-10">
                  <span className="w-1.5 h-6 bg-brand-red rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <span className="w-1.5 h-10 bg-brand-gold rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <span className="w-1.5 h-8 bg-brand-red rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                  <span className="w-1.5 h-4 bg-brand-gold rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
                <div className="text-xs text-gray-500 italic">"Listen & Repeat to score tone accuracy"</div>
              </div>

              {/* Bottom Viki Logo bar */}
              <div className="flex justify-between items-center bg-brand-dark text-white p-3.5 rounded-2xl text-xs">
                <span className="font-semibold text-slate-300">Immersion Hub</span>
                <span className="text-[10px] bg-brand-red text-white px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">Rakuten Viki</span>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Benefits Showcase Section */}
      <section className="bg-white py-20 px-4 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark">Why Choose HanziVerse?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto font-light">
              We skip the boring endless translation sheets. Speak immediately with real audio, understand stroke geometries, and acquire vocabulary naturally in full context.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl hover:bg-slate-50 border border-slate-100 transition text-left space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-light-red text-brand-red flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark">Structured HSK Path</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-light">
                Unlock custom, hand-curated lessons mapped matching the official Chinese proficiency standard. Progress sequentially from Pinyin rules up to complex literary structures.
              </p>
            </div>

            <div className="p-8 rounded-3xl hover:bg-slate-50 border border-slate-100 transition text-left space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-warm-yellow text-brand-warm-text flex items-center justify-center font-bold border border-brand-warm-border">
                <Tv className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark">Authentic Viki Immersion</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-light">
                Connect directly into Viki streaming dramas. Click on dialogue captions to instantly search definitions, write notes, and verify pronunciation.
              </p>
            </div>

            <div className="p-8 rounded-3xl hover:bg-slate-50 border border-slate-100 transition text-left space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-dark text-white flex items-center justify-center font-bold">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark">Smart Spaced Repetition (SRS)</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-light">
                HanziVerse analyzes weekly session scores and schedules weak characters to be repeated dynamically exactly before you are about to forget them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Roadmap Grid / Interactive Preview */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark">A Learning Curve Mapped for Absolute Beginners</h2>
            <p className="text-slate-600 leading-relaxed font-light">
              Mandarin character structures are modular building blocks. Once you master core basic strokes and radical semantic symbols, complex vocabulary unlocks on its own.
            </p>

            {/* Roadmap stages */}
            <div className="space-y-4">
              {[
                { step: "01", title: "Interactive Pinyin Chart", desc: "Understand initials, finals, and master the 4 core pronunciation vocal tones" },
                { step: "02", title: "Animated Stroke order Tracing", desc: "Write from left to right, top to bottom. Our tracing board verifies stroke order guidelines" },
                { step: "03", title: "Character Radical Libraries", desc: "Recognize underlying semantic indicators like Wood (木) or Water (氵) for speed reading" },
                { step: "04", title: "HSK Levels 1–6 Certification", desc: "Build extensive lexicon, complete comprehension tests, and read authentic picture-books" }
              ].map((s, i) => (
                <div key={i} className="flex gap-4 items-start p-4 rounded-2xl hover:bg-white hover:border border-slate-150 border border-transparent transition">
                  <span className="text-xl font-bold text-brand-gold font-mono mt-0.5">{s.step}</span>
                  <div>
                    <h4 className="font-bold text-brand-dark">{s.title}</h4>
                    <p className="text-xs text-slate-500 font-light">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial & Showcase */}
          <div className="relative">
            <div className="bg-gradient-to-br from-brand-dark to-[#4A1521] p-8 text-black rounded-3xl relative overflow-hidden shadow-2xl border border-brand-light-border/10">
              <p className="text-lg text-white font-medium italic relative z-10 font-serif leading-relaxed">
                "As an absolute beginner, Chinese felt terrifyingly impossible. The HanziVerse stroke-order tracing board turned write practice into a fun video game. And Viki double-subtitles changed my drama habit into real, useful active learning session!"
              </p>
              
              <div className="mt-6 flex items-center gap-3 relative z-10">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" 
                  alt="Sarah" 
                  className="w-11 h-11 bg-white rounded-full border border-brand-gold" 
                />
                <div>
                  <h4 className="font-extrabold text-white text-sm">Sarah Jenkins</h4>
                  <p className="text-xs text-brand-gold font-mono">Mandarin Learner, Age 19</p>
                </div>
              </div>

              {/* Decorative Traditional Lantern Backdrop SVG */}
              <div className="absolute right-0 bottom-0 opacity-[0.08] translate-x-12 translate-y-12">
                <svg width="200" height="200" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 0V20M50 80V100" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" />
                  <ellipse cx="50" cy="50" rx="30" ry="40" fill="#D4AF37" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final Banner */}
      <section className="bg-brand-dark text-white py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute left-1/2 -translate-x-1/2 -top-24 w-96 h-96 bg-brand-red rounded-full blur-3xl opacity-[0.06] pointer-events-none" />
        
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <GlobeIcon className="w-12 h-12 mx-auto text-brand-gold" />
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight font-serif">Embark on Your HanziVerse Journey Today</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm font-light">
            Unlock all vocabulary quizzes, track characters streak thresholds, read native digital short stories, and stream series with standard Pinyin support.
          </p>
          <div className="pt-2">
            <button
              id="btn-cta-start-vibe"
              onClick={() => user ? setActiveTab("Dashboard") : setActiveTab("Login")}
              className="px-8 py-4 bg-brand-red hover:bg-brand-red/90 text-white font-bold rounded-full shadow-lg hover:shadow-brand-red/10 cursor-pointer transition active:scale-95 duration-100"
            >
              Start Free Setup Quiz
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

// Simple visual decoration icon
const GlobeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);
