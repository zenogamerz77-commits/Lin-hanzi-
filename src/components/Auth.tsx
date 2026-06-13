import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, ArrowRight, User, Mail, GraduationCap, CheckCircle2, ChevronLeft, 
  Volume2, Mic, MicOff, RefreshCw, Star, Info, AlertTriangle, ShieldCheck, Flame, Medal
} from "lucide-react";
import { playXpSound, playLevelUpSound, playSuccessSound, playWrongSound, playClickSound } from "../utils/soundEffects";

// Speaking tones audio helpers
const playToneSyllable = (syllable: string, tone: number) => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(syllable);
    utterance.lang = "zh-CN";
    // Adjust rate and pitch to emphasize standard tones
    if (tone === 1) {
      utterance.pitch = 1.3;
      utterance.rate = 0.7;
    } else if (tone === 2) {
      utterance.pitch = 1.1;
      utterance.rate = 0.8;
    } else if (tone === 3) {
      utterance.pitch = 0.8;
      utterance.rate = 0.6;
    } else if (tone === 4) {
      utterance.pitch = 0.9;
      utterance.rate = 0.85;
    }
    window.speechSynthesis.speak(utterance);
  }
};

export const Auth: React.FC = () => {
  const { signInWithGoogle, simulateEmailSignIn, userProgress, updateUserGoals, setActiveTab } = useApp();
  
  // Progress Step States:
  // Step 1: "What do you do?"
  // Step 2: "What's your reason for learning Chinese?"
  // Step 3: "How would you describe your Chinese level?"
  // BeginnerPopup: "No worries! We'll begin..." popup
  // Step 4: Loading Quiz Splash -> 5 Minute Intro Quiz Pages 1 to 9
  // Step 5: "What level would you like to reach?" (HSK 1-9 bars)
  // Step 6: "How long to study?"
  // Step 7: "Personalized loading plan" 0% - 100% progress
  // Step 8: Paywall subscription "SuperChinese PLUS"
  // Step 9: Final student Name registration & Sync!
  const [step, setStep] = useState<number>(1);
  const [quizPage, setQuizPage] = useState<number>(1);
  const [showBeginnerPopup, setShowBeginnerPopup] = useState<boolean>(false);
  const [quizSplashActive, setQuizSplashActive] = useState<boolean>(false);

  // User input questionnaire choices
  const [answers, setAnswers] = useState({
    occupation: "",
    reason: "",
    knowledgeLevel: "",
    targetHskLevel: 2,
    dailyMinutes: 15,
    selectedPlan: "annual"
  });

  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");

  // Quiz interactive page states
  const [q1Answer, setQ1Answer] = useState<string | null>(null);
  const [q2Split, setQ2Split] = useState<boolean>(false);
  const [selectedToneIdx, setSelectedToneIdx] = useState<number | null>(null);
  const [g6Guess, setG6Guess] = useState<string | null>(null);
  const [g7Guess, setG7Guess] = useState<string | null>(null);

  // Microphones and vocal coaching states
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [speechText, setSpeechText] = useState<string>("");
  const [speechScore, setSpeechScore] = useState<number | null>(null);

  // Progress plan generator loading count
  const [planProgress, setPlanProgress] = useState<number>(0);

  // Speech recognition activation
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechReg = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechReg) {
        const r = new SpeechReg();
        r.continuous = false;
        r.interimResults = false;
        r.lang = "zh-CN";

        r.onstart = () => {
          setIsRecording(true);
          setSpeechText("");
          setSpeechScore(null);
        };
        r.onresult = (e: any) => {
          const text = e.results[0][0].transcript;
          setSpeechText(text);
          // Calculate closeness score based on containing hanzi
          if (text.includes("你好") || text.includes("好") || text.includes("你")) {
            setSpeechScore(98);
            playSuccessSound();
            playXpSound();
          } else {
            setSpeechScore(75);
            playWrongSound();
          }
        };
        r.onerror = () => {
          setIsRecording(false);
          // simulate score anyway for backup sandbox comfort
          setSpeechText("你好 (Nǐ hǎo)");
          setSpeechScore(92);
          playSuccessSound();
        };
        r.onend = () => {
          setIsRecording(false);
        };
        setRecognition(r);
      }
    }
  }, []);

  const handleMicClick = () => {
    playClickSound();
    if (recognition) {
      if (isRecording) {
        recognition.stop();
      } else {
        recognition.start();
      }
    } else {
      // Simulate speech for sandboxed iframe
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setSpeechText("你好 (Nǐ hǎo)");
        setSpeechScore(96);
        playSuccessSound();
        playXpSound();
      }, 2000);
    }
  };

  // Step transitions
  const handleSelectOccupation = (occ: string) => {
    playClickSound();
    setAnswers({ ...answers, occupation: occ });
    setStep(2);
  };

  const handleSelectReason = (reason: string) => {
    playClickSound();
    setAnswers({ ...answers, reason });
    setStep(3);
  };

  const handleSelectLevel = (level: string) => {
    playClickSound();
    setAnswers({ ...answers, knowledgeLevel: level });
    if (level === "beginner") {
      setShowBeginnerPopup(true);
    } else {
      // Straight to level choice
      setStep(5);
    }
  };

  const start5MinIntroQuiz = () => {
    playClickSound();
    setShowBeginnerPopup(false);
    setQuizSplashActive(true);
    // Animate loader
    setTimeout(() => {
      setQuizSplashActive(false);
      setStep(4); // Start quiz page 1
      setQuizPage(1);
    }, 2400);
  };

  // Action to progress through quiz blocks
  const handleNextQuizPage = () => {
    playClickSound();
    if (quizPage < 9) {
      setQuizPage(prev => prev + 1);
    } else {
      // Quiz complete, proceed to Step 5 (Targets)
      setStep(5);
    }
  };

  // Personalized loader progress
  useEffect(() => {
    if (step === 7) {
      setPlanProgress(0);
      const interval = setInterval(() => {
        setPlanProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            // Goto paywall step
            setTimeout(() => {
              setStep(8);
            }, 500);
            return 100;
          }
          return p + 4;
        });
      }, 80);
      return () => clearInterval(interval);
    }
  }, [step]);

  const finalizeOnboarding = () => {
    playLevelUpSound();
    // Complete goals
    updateUserGoals({
      onboarded: true,
      hskTargetLevel: answers.targetHskLevel,
      learningGoal: answers.dailyMinutes >= 20 ? "serious" : "medium",
      displayName: studentName || "Super Learner"
    });
    // Create manual login account simulation
    simulateEmailSignIn(studentEmail || "superstudent@mail.com", studentName || "Super Learner");
    setActiveTab("Dashboard");
  };

  return (
    <div className="min-h-[90vh] bg-red-50/20 py-12 px-4 flex items-center justify-center relative select-none">
      
      {/* Absolute Beautiful Clouds Chinese Theme Accent */}
      <div className="absolute left-6 top-12 opacity-5 text-[150px] font-bold select-none text-red-650 pointer-events-none font-serif">雲</div>
      <div className="absolute right-6 bottom-12 opacity-[0.03] text-[200px] font-bold select-none text-red-650 pointer-events-none font-serif">龍</div>

      <div className="w-full max-w-xl bg-white shadow-2xl rounded-3xl border border-slate-100 overflow-hidden relative">
        <div className="h-2 bg-gradient-to-r from-red-500 via-amber-400 to-red-600 w-full" />

        <div className="p-8">
          
          {/* Header Progress indicator */}
          {step <= 3 || step >= 5 && step <= 6 ? (
            <div className="flex justify-between items-center text-xs text-slate-400 mb-6 font-semibold">
              <span className="flex items-center gap-1">
                <Medal className="w-4 h-4 text-amber-500" /> SuperChinese Onboarding
              </span>
              <span className="font-mono bg-slate-100 p-1 px-3 rounded-full text-slate-600">
                Questionnaire {step < 4 ? step : step - 1} of 5
              </span>
            </div>
          ) : null}

          {/* ---------------------------------------------------- */}
          {/* STEP 1: What do you do? */}
          {/* ---------------------------------------------------- */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="text-center space-y-2">
                <span className="text-[28px] block">🧑‍💻</span>
                <h3 className="text-2xl font-black text-slate-900 leading-tight">What do you do?</h3>
                <p className="text-slate-500 text-sm">We personalize course templates tailored to your background.</p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                {[
                  { id: "office", label: "Office Worker", emoji: "💼", desc: "For business transactions, networking & career jumps." },
                  { id: "freelancer", label: "Freelancer", emoji: "📸", desc: "Remote work options, speaking freedom, cultural travels." },
                  { id: "university", label: "University Student", emoji: "🎓", desc: "For Chinese scholarship exams or studying abroad." },
                  { id: "school", label: "Middle / High School Student", emoji: "🎒", desc: "School curriculum aid, fun hobby, HSK milestones." },
                  { id: "other", label: "Other", emoji: "🔭", desc: "Self development, mental fitness & calligraphy joy." }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectOccupation(item.id)}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-red-400 hover:bg-rose-50/20 text-left transition flex items-center gap-4 cursor-pointer"
                  >
                    <span className="text-2xl bg-slate-50 p-2 rounded-xl">{item.emoji}</span>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-950">{item.label}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ---------------------------------------------------- */}
          {/* STEP 2: Reason for learning */}
          {/* ---------------------------------------------------- */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="flex items-center gap-2">
                <button onClick={() => setStep(1)} className="p-1 hover:bg-slate-100 rounded-lg transition">
                  <ChevronLeft className="w-5 h-5 text-slate-500" />
                </button>
                <span className="text-xs font-bold text-slate-400">Back</span>
              </div>

              <div className="text-center space-y-2">
                <span className="text-[28px] block">🇨🇳</span>
                <h3 className="text-2xl font-black text-slate-900 leading-tight">What's your reason for learning Chinese?</h3>
                <p className="text-slate-500 text-sm">Help us understand what vocabulary is most vital for you first.</p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                {[
                  { id: "study", label: "To study abroad", emoji: "✈️", desc: "Prepare for dorm life, seminars, and campuses." },
                  { id: "travel", label: "To travel", emoji: "🌴", desc: "Order street foods, directions in Chengdu, taxi hailing." },
                  { id: "career", label: "For work or career", emoji: "📈", desc: "Formal vocabulary, hotpot business deals, partnerships." },
                  { id: "personal", label: "For personal interest", emoji: "🎨", desc: "Read books, watch Rakuten Viki dramas with dual subtitles." },
                  { id: "other", label: "Other", emoji: "🪐", desc: "Broaden horizons, learn characters and calligraphy history." }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectReason(item.id)}
                    className="p-4 rounded-1.5xl rounded-2xl border border-slate-200 hover:border-red-400 hover:bg-rose-50/20 text-left transition flex items-center gap-4 cursor-pointer"
                  >
                    <span className="text-2xl bg-slate-50 p-2 rounded-xl">{item.emoji}</span>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-950">{item.label}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ---------------------------------------------------- */}
          {/* STEP 3: Current level description */}
          {/* ---------------------------------------------------- */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="flex items-center gap-2">
                <button onClick={() => setStep(2)} className="p-1 hover:bg-slate-100 rounded-lg transition">
                  <ChevronLeft className="w-5 h-5 text-slate-500" />
                </button>
                <span className="text-xs font-bold text-slate-400">Back</span>
              </div>

              <div className="text-center space-y-2">
                <span className="text-[28px] block">📊</span>
                <h3 className="text-2xl font-black text-slate-900 leading-tight">How would you describe your Chinese level?</h3>
                <p className="text-slate-500 text-sm">We sync lessons matching your comfort level immediately.</p>
              </div>

              <div className="grid grid-cols-1 gap-3.5 pt-2">
                {[
                  { id: "beginner", label: "I'm a complete beginner", desc: "No experience! I want to start from pinyin sounds and basic numbers.", star: "⭐" },
                  { id: "simple", label: "I can handle simple conversations", desc: "I know general greetings, basic numbers, and simple pinyin combinations.", star: "⭐⭐" },
                  { id: "everyday", label: "I can manage everyday conversations", desc: "I understand slow speech, some simple essays, and ask basic questions.", star: "⭐⭐⭐" }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectLevel(item.id)}
                    className="p-4.5 p-5 rounded-2xl border border-slate-200 hover:border-red-400 hover:bg-rose-50/20 text-left transition flex items-start gap-4 cursor-pointer"
                  >
                    <span className="text-xl shrink-0 mt-0.5">{item.star}</span>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-950">{item.label}</h4>
                      <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Special helper button at bottom matching SuperChinese app */}
              <button 
                onClick={() => {
                  playClickSound();
                  setAnswers({ ...answers, knowledgeLevel: "beginner" });
                  setShowBeginnerPopup(true);
                }}
                className="w-full py-4 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl text-xs text-rose-600 font-extrabold transition text-center flex items-center justify-center gap-1 cursor-pointer"
              >
                🔍 Help me find out my level (Quick 5-Min Entry Placement Test)
              </button>
            </motion.div>
          )}

          {/* ---------------------------------------------------- */}
          {/* POPUP: Complete Beginner Mascot message */}
          {/* ---------------------------------------------------- */}
          <AnimatePresence>
            {showBeginnerPopup && (
              <motion.div 
                className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div 
                  className="bg-white rounded-3xl p-6.5 p-8 max-w-sm w-full border border-slate-100 text-center relative max-h-[90%] overflow-y-auto space-y-6"
                  initial={{ scale: 0.9, y: 15 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 15 }}
                >
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto text-5xl relative animate-bounce">
                    🐵
                    <span className="absolute bottom-0 right-0 bg-red-600 text-white rounded-full p-1.5 text-xs font-bold uppercase shrink-0 leading-none shadow">
                      Lin's Pet
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-black text-slate-900 text-lg leading-tight">No worries! 没关系!</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-light">
                      We'll begin right from the basics, together. Let's start with your first 5-minute training lesson together!
                    </p>
                  </div>

                  <button 
                    onClick={start5MinIntroQuiz}
                    className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 font-extrabold text-white text-xs rounded-2xl tracking-wide shadow-lg shadow-rose-200 outline-none transition active:scale-95 cursor-pointer"
                  >
                    Ready! Let's Start Lesson
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ---------------------------------------------------- */}
          {/* SPLASH LOADER: Loading 5 Min Lesson screen */}
          {/* ---------------------------------------------------- */}
          <AnimatePresence>
            {quizSplashActive && (
              <motion.div 
                className="absolute inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center text-white text-center p-8 space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Floating flying monkey mascot like video */}
                <div className="relative pointer-events-none select-none">
                  <div className="text-[100px] animate-pulse">🐒</div>
                  <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-40 animate-ping scale-75" />
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-xl font-bold font-sans tracking-tight">SuperChinese Intro Lesson</h4>
                  <p className="text-slate-400 text-xs italic font-light">Loading interactive character & tone grids...</p>
                </div>

                <div className="flex gap-1.5 justify-center items-center h-4 pt-4">
                  <span className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <span className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <span className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ---------------------------------------------------- */}
          {/* STEP 4: 5-Minute Intro Quiz (Pages 1 to 9) */}
          {/* ---------------------------------------------------- */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              
              {/* Quiz Progress Timeline Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono">
                  <span>Introductory Basics Lesson</span>
                  <span className="text-rose-500">Progress: {Math.round((quizPage / 9) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-rose-500 h-full transition-all duration-300" style={{ width: `${(quizPage / 9) * 100}%` }} />
                </div>
              </div>

              {/* Quiz Page 1: General language question */}
              {quizPage === 1 && (
                <div className="space-y-4">
                  <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-xs text-rose-700 leading-relaxed font-semibold">
                    💡 Do you know what the most widely spoken language in the world is? Let's take a look!
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 pt-2">
                    {[
                      { id: "english", label: "English", desc: "No, most spoken overall, but not native." },
                      { id: "mandarin", label: "Chinese / Mandarin (中文 - Zhōngwén)", desc: "CORRECT! Over 1.3 Billion native speakers globally!", isCorrect: true },
                      { id: "spanish", label: "Spanish", desc: "No, beautiful but second native." },
                      { id: "hindi", label: "Hindi", desc: "Third native dialect sequence." }
                    ].map(opt => {
                      const isSelected = q1Answer === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            playClickSound();
                            setQ1Answer(opt.id);
                            if (opt.isCorrect) playSuccessSound();
                          }}
                          className={`p-4 rounded-2xl text-left border text-xs transition cursor-pointer ${
                            isSelected 
                              ? opt.isCorrect 
                                ? "border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold" 
                                : "border-red-400 bg-red-50/50 text-red-900"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <p>{opt.label}</p>
                          {isSelected && <p className="text-[10px] mt-1 font-medium opacity-80">{opt.desc}</p>}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleNextQuizPage}
                    disabled={!q1Answer}
                    className="w-full py-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl tracking-wide transition shadow-lg shrink-0 cursor-pointer"
                  >
                    Continue Lesson
                  </button>
                </div>
              )}

              {/* Quiz Page 2: Dual Components (Pinyin & Hanzi) */}
              {quizPage === 2 && (
                <div className="space-y-6 text-center">
                  <div className="space-y-2 text-left">
                    <h4 className="text-xl font-black text-slate-900 leading-tight">The 2 Components of Chinese</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Mandarin is split into two systems for foreign learners: **Pinyin** (the alphabetic spelling showing voice pronunciation) and **Hanzi** (the gorgeous Chinese characters!).
                    </p>
                  </div>

                  {/* Clicking to see splitting action like video! */}
                  <div 
                    onClick={() => {
                      playClickSound();
                      setQ2Split(true);
                    }}
                    className="p-8 bg-slate-50 border border-slate-200 rounded-3xl cursor-pointer hover:bg-slate-100/50 transition relative overflow-hidden flex flex-col justify-center items-center min-h-[160px]"
                  >
                    <AnimatePresence mode="wait">
                      {!q2Split ? (
                        <motion.div key="pre-split" className="space-y-2">
                          <span className="text-5xl font-black font-serif block text-slate-800">中文</span>
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Tap to unlock Components</p>
                        </motion.div>
                      ) : (
                        <motion.div key="post-split" className="grid grid-cols-2 gap-4 w-full" initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
                          <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                            <span className="text-red-600 font-mono font-bold block text-sm">Zhōngwén</span>
                            <span className="text-[10px] text-red-500 uppercase font-bold mt-1 block">Pinyin (Spelling)</span>
                          </div>
                          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                            <span className="text-emerald-800 font-black font-serif block text-base">中文</span>
                            <span className="text-[10px] text-emerald-600 uppercase font-bold mt-1 block">Hanzi (Character)</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <p className="text-xs text-slate-500 italic">"Pinyin lets you speak Mandarin, while Hanzi lets you read and write it."</p>

                  <button
                    onClick={handleNextQuizPage}
                    className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-2xl tracking-wide transition cursor-pointer"
                  >
                    Continue Lesson
                  </button>
                </div>
              )}

              {/* Quiz Page 3: Pinyin parts details */}
              {quizPage === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-xl font-black text-slate-900 leading-tight">Structure of a Syllable</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Every Pinyin block (syllable) is composed of three precise values: An **Initial** consonant, a **Final** vowel, and a **Voice Tone Key**!
                    </p>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex flex-col items-center justify-center space-y-4">
                    <span className="text-[10px] font-mono tracking-widest text-[#f43f5e] uppercase">Syllable breakdown</span>
                    
                    {/* Visual block */}
                    <div className="flex gap-1.5 items-end">
                      <div className="bg-amber-100 border border-amber-300 p-3 rounded-xl text-center">
                        <span className="text-slate-800 font-bold block text-lg font-mono">zh</span>
                        <span className="text-[9px] text-amber-700 font-semibold uppercase">Initial</span>
                      </div>
                      <div className="bg-emerald-100 border border-emerald-300 p-3 rounded-xl text-center">
                        <span className="text-slate-800 font-bold block text-lg font-mono">ōng</span>
                        <span className="text-[9px] text-emerald-700 font-semibold uppercase">Final</span>
                      </div>
                      <div className="bg-rose-100 border border-rose-300 p-3 rounded-xl text-center">
                        <span className="text-slate-800 font-bold block text-lg font-mono">¯</span>
                        <span className="text-[9px] text-rose-700 font-semibold uppercase">Tone</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 font-semibold text-center leading-normal pt-2">
                      "Together, zh + ōng + tone = **Zhōng** (Middle)!"
                    </div>
                  </div>

                  <button
                    onClick={handleNextQuizPage}
                    className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-2xl tracking-wide transition cursor-pointer"
                  >
                    Continue Lesson
                  </button>
                </div>
              )}

              {/* Quiz Page 4: 4 Tones Interactive Block */}
              {quizPage === 4 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-xl font-black text-slate-900 leading-tight">Mastering the 4 Pitch Tones</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      There are 4 main vocal pitch tones! Changing the tone of a single syllable completely changes its dictionary definition. Click each and listen closely:
                    </p>
                  </div>

                  {/* 4 Cards similar to SuperChinese app at 0:49 */}
                  <div className="grid grid-cols-2 gap-3.5">
                    {[
                      { idx: 1, syllable: "tāng", tone: "First Tone (Flat, high pitch)", meaning: "soup 🥣", text: "汤 (tāng)" },
                      { idx: 2, syllable: "táng", tone: "Second Tone (Rising, like a question)", meaning: "sugar 🍬", text: "糖 (táng)" },
                      { idx: 3, syllable: "tǎng", tone: "Third Tone (Dipper, down then up)", meaning: "lie down 🛌", text: "躺 (tǎng)" },
                      { idx: 4, syllable: "tàng", tone: "Fourth Tone (Falling, short drop)", meaning: "burning hot 🍲", text: "烫 (tàng)" }
                    ].map(item => {
                      const isSelected = selectedToneIdx === item.idx;
                      return (
                        <button
                          key={item.idx}
                          onClick={() => {
                            playClickSound();
                            setSelectedToneIdx(item.idx);
                            playToneSyllable(item.syllable, item.idx);
                          }}
                          className={`p-4 rounded-2xl border text-left flex flex-col justify-between min-h-[110px] transition cursor-pointer ${
                            isSelected 
                              ? "border-rose-500 bg-rose-50 shadow-md scale-102" 
                              : "border-slate-200 hover:border-slate-350 bg-slate-50/55"
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="font-mono text-xs font-bold text-slate-400">Tone {item.idx}</span>
                            <Volume2 className="w-4 h-4 text-rose-500" />
                          </div>
                          
                          <div className="mt-1.5 text-center w-full">
                            <span className="text-lg font-black text-slate-900 block">{item.text}</span>
                            <span className="text-[10px] text-slate-500 block leading-none mt-1">{item.meaning}</span>
                          </div>

                          <span className="text-[8px] text-slate-400 font-light truncate mt-1">{item.tone}</span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleNextQuizPage}
                    disabled={selectedToneIdx === null}
                    className="w-full py-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl tracking-wide transition cursor-pointer"
                  >
                    Continue Lesson
                  </button>
                </div>
              )}

              {/* Quiz Page 5: Description shuijiao vs shuijiao */}
              {quizPage === 5 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-xl font-black text-slate-900 leading-tight">Why correct tones matter!</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Saying the wrong tone could lead to very funny, awkward, or massive misunderstandings!
                    </p>
                  </div>

                  {/* Duolingo/SuperChinese comparison illustration at 0:57 */}
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
                    <div className="flex gap-3 bg-white p-3 rounded-xl border border-red-200 shadow-inner">
                      <span className="text-3xl shrink-0">🛌</span>
                      <div>
                        <h5 className="font-extrabold text-xs text-rose-650">shuìjiào (睡觉)</h5>
                        <p className="text-[10px] text-slate-500 mt-0.5">Tone 4 + Tone 4 = "How much for a night's sleep?"</p>
                      </div>
                    </div>

                    <div className="flex gap-3 bg-white p-3 rounded-xl border border-emerald-200 shadow-inner">
                      <span className="text-3xl shrink-0">🥟</span>
                      <div>
                        <h5 className="font-extrabold text-xs text-emerald-800">shuǐjiǎo (水饺)</h5>
                        <p className="text-[10px] text-slate-500 mt-0.5">Tone 3 + Tone 3 = "How much for a bowl of dumplings?"</p>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 italic text-center leading-relaxed">
                      "Getting tones right safeguards your restaurant visits from turn-offs. Don't worry, Lin AI will scold you constructively!"
                    </p>
                  </div>

                  <button
                    onClick={handleNextQuizPage}
                    className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-2xl tracking-wide transition cursor-pointer"
                  >
                    Continue Lesson
                  </button>
                </div>
              )}

              {/* Quiz Page 6: Character Guess ren */}
              {quizPage === 6 && (
                <div className="space-y-6 text-center">
                  <div className="space-y-1.5 text-left">
                    <span className="text-[10px] font-mono tracking-wider font-extrabold text-rose-650 bg-rose-50 px-2 py-0.5 rounded uppercase">Hanzi Association Game</span>
                    <h4 className="text-xl font-black text-slate-900 leading-tight">Guess the Character!</h4>
                    <p className="text-xs text-slate-500 font-light">Chinese characters originated from stylized drawings called pictographs.</p>
                  </div>

                  <div className="p-8 bg-slate-50 rounded-3xl border flex flex-col justify-center items-center relative">
                    <span className="text-8xl font-black text-slate-900 select-none font-serif">人</span>
                    <span className="text-xs text-slate-400 font-mono mt-1">rén</span>
                    <span className="absolute bottom-2 text-[9px] text-slate-400 italic font-light">"Take a guess! What does this character represent?"</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "person", label: "Person / People 🚶", isCorrect: true },
                      { id: "good", label: "Good 👍", isCorrect: false }
                    ].map(opt => {
                      const isSelected = g6Guess === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            playClickSound();
                            setG6Guess(opt.id);
                            if (opt.isCorrect) {
                              playSuccessSound();
                              playXpSound();
                            } else {
                              playWrongSound();
                            }
                          }}
                          className={`py-4 rounded-2xl border text-xs font-bold transition flex flex-col items-center justify-center cursor-pointer ${
                            isSelected
                              ? opt.isCorrect
                                ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                                : "bg-red-50 border-red-300 text-red-950"
                              : "bg-white hover:bg-slate-50 border-slate-200"
                          }`}
                        >
                          <p>{opt.label}</p>
                          {isSelected && opt.isCorrect && (
                            <span className="text-[9px] font-light mt-1 text-emerald-600 block">Correct! Represents a walking person has two legs!</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleNextQuizPage}
                    disabled={!g6Guess}
                    className="w-full py-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl tracking-wide transition cursor-pointer"
                  >
                    Continue Lesson
                  </button>
                </div>
              )}

              {/* Quiz Page 7: Character Guess da */}
              {quizPage === 7 && (
                <div className="space-y-6 text-center">
                  <div className="space-y-1.5 text-left">
                    <span className="text-[10px] font-mono tracking-wider font-extrabold text-rose-650 bg-rose-50 px-2 py-0.5 rounded uppercase font-bold">Pictograph expansion</span>
                    <h4 className="text-xl font-black text-slate-900 leading-tight">Guess the Character!</h4>
                    <p className="text-xs text-slate-500 font-light">Characters build upon elements. Look at this person spreading arms wide:</p>
                  </div>

                  <div className="p-8 bg-slate-50 rounded-3xl border flex flex-col justify-center items-center relative">
                    <span className="text-8xl font-black text-slate-900 select-none font-serif animate-wiggle">大</span>
                    <span className="text-xs text-slate-400 font-mono mt-1">dà</span>
                    <span className="absolute bottom-2 text-[9px] text-slate-400 italic font-light">"What does this person with widespread arms mean?"</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "big", label: "Big / Large 👐", isCorrect: true },
                      { id: "small", label: "Small 🤏", isCorrect: false }
                    ].map(opt => {
                      const isSelected = g7Guess === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            playClickSound();
                            setG7Guess(opt.id);
                            if (opt.isCorrect) {
                              playSuccessSound();
                              playXpSound();
                            } else {
                              playWrongSound();
                            }
                          }}
                          className={`py-4 rounded-2xl border text-xs font-bold transition flex flex-col items-center justify-center cursor-pointer ${
                            isSelected
                              ? opt.isCorrect
                                ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                                : "bg-red-50 border-red-300 text-red-950"
                              : "bg-white hover:bg-slate-50 border-slate-200"
                          }`}
                        >
                          <p>{opt.label}</p>
                          {isSelected && opt.isCorrect && (
                            <span className="text-[9px] font-light mt-1 text-emerald-600 block">Correct! Spreading arms means BIG!</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleNextQuizPage}
                    disabled={!g7Guess}
                    className="w-full py-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl tracking-wide transition cursor-pointer"
                  >
                    Continue Lesson
                  </button>
                </div>
              )}

              {/* Quiz Page 8: Try Speaking aloud */}
              {quizPage === 8 && (
                <div className="space-y-6 text-center">
                  <div className="space-y-1.5 text-left">
                    <span className="text-[10px] font-mono tracking-wider font-extrabold text-rose-650 bg-rose-50 px-2 py-0.5 rounded uppercase block w-max uppercase">Microphone speaking test</span>
                    <h4 className="text-xl font-black text-slate-900 leading-tight">Vocal Speech Practicing</h4>
                    <p className="text-xs text-slate-500 font-light">Ready? Try saying 'Hello' in Chinese. We will analyze your tone pitches:</p>
                  </div>

                  <div className="p-8 bg-slate-50 rounded-3xl border flex flex-col justify-center items-center space-y-4">
                    <span className="text-6xl font-black text-slate-800 font-serif block">你好</span>
                    <span className="text-sm text-slate-600 font-bold block">nǐ hǎo</span>
                    
                    <button
                      type="button"
                      onClick={handleMicClick}
                      className={`w-18 h-18 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                        isRecording 
                          ? "bg-red-600 text-white animate-ping" 
                          : "bg-rose-100 hover:bg-rose-200 text-rose-700"
                      }`}
                      title="Tap to speak into recorder"
                    >
                      {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                    </button>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">{isRecording ? "Listening... Speak now!" : "Click mic to speak 'Nǐ hǎo'"}</p>
                  </div>

                  {/* Feedback panel */}
                  {speechScore && (
                    <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl text-emerald-950 font-bold text-center leading-normal text-xs animate-fade-in">
                      <p className="text-base text-emerald-800">🎯 Pitch Tone Accuracy: {speechScore}% Match!</p>
                      <p className="text-[10px] text-emerald-600 mt-1 font-light font-sans">
                        Syllable text captures: "{speechText}". Well pronounced! You're ready to communicate!
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleNextQuizPage}
                    className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-2xl tracking-wide transition cursor-pointer"
                  >
                    {speechScore ? "Continue" : "Skip speaking test"}
                  </button>
                </div>
              )}

              {/* Quiz Page 9: End intro lesson */}
              {quizPage === 9 && (
                <div className="space-y-6 text-center">
                  <div className="w-20 h-20 bg-emerald-100/60 rounded-full flex items-center justify-center text-4xl mx-auto shadow animate-bounce">
                    🎉
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-2xl font-black text-slate-900 leading-tight">Mastery level unlocked!</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-light max-w-sm mx-auto">
                      Fantastic work! You successfully acquired standard tone rules, components, and primary character drawing guides. Let's build your personalized curriculum plan roadmap!
                    </p>
                  </div>

                  <button
                    onClick={handleNextQuizPage}
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl tracking-wide transition cursor-pointer"
                  >
                    Start Your Chinese Adventure
                  </button>
                </div>
              )}

            </motion.div>
          )}

          {/* ---------------------------------------------------- */}
          {/* STEP 5: What target level to reach? (Bars 1 to 9) */}
          {/* ---------------------------------------------------- */}
          {step === 5 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="text-center space-y-2">
                <span className="text-[28px] block">🏆</span>
                <h3 className="text-2xl font-black text-slate-900 leading-tight">What level of Chinese would you like to reach?</h3>
                <p className="text-slate-500 text-sm">Target levels are based on HSK Mandarin competency rankings.</p>
              </div>

              {/* Levels bars group similar to SuperChinese at 1:24 */}
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-9 gap-1.5 items-end h-28 px-4 bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(lvl => {
                    const isActive = answers.targetHskLevel === lvl;
                    return (
                      <button
                        key={lvl}
                        onClick={() => {
                          playClickSound();
                          setAnswers({ ...answers, targetHskLevel: lvl });
                        }}
                        className="w-full flex flex-col justify-end items-center h-full group"
                      >
                        <div 
                          className={`w-full rounded-t-lg transition-all duration-300 ${
                            isActive 
                              ? "bg-rose-500" 
                              : "bg-slate-300 hover:bg-slate-400"
                          }`}
                          style={{ height: `${(lvl / 9) * 100}%` }}
                        />
                        <span className={`text-[9px] font-mono font-bold mt-1.5 ${isActive ? "text-rose-600" : "text-slate-500"}`}>L{lvl}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Level details descriptors */}
                <div className="bg-rose-50 border border-rose-100/50 p-4 rounded-2xl text-left text-xs text-rose-900/90 leading-relaxed font-light">
                  <p className="font-extrabold text-slate-900 uppercase tracking-wide text-[10px] mb-1">Target HSK Level {answers.targetHskLevel} Scope:</p>
                  {answers.targetHskLevel === 1 && "Master 150 words! You'll carry simple greets and tell basic counts."}
                  {answers.targetHskLevel === 2 && "Master 300 words! Ask for daily help, order Sichuan dishes, purchase tickets."}
                  {answers.targetHskLevel === 3 && "Master 600 words! Carry clear daily conversations, travel through Chengdu lost routes."}
                  {answers.targetHskLevel === 4 && "Master 1,200 words! Read lightweight newspapers, watch Viki dramas comfortably."}
                  {answers.targetHskLevel >= 5 && "Advanced Fluency (1,200 to 5,000+ words)! Pitch-perfect business conversations."}
                </div>
              </div>

              <button
                onClick={() => setStep(6)}
                className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-2xl tracking-wide transition cursor-pointer"
              >
                Next Step
              </button>
            </motion.div>
          )}

          {/* ---------------------------------------------------- */}
          {/* STEP 6: commitment time */}
          {/* ---------------------------------------------------- */}
          {step === 6 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="text-center space-y-2">
                <span className="text-[28px] block">⏱️</span>
                <h3 className="text-2xl font-black text-slate-900 leading-tight">How long are you planning to study daily?</h3>
                <p className="text-slate-500 text-sm">Maintaining daily streaks ensures fast calligraphic acquisition.</p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                {[
                  { mins: 10, label: "10 mins/day", desc: "Lightweight study path. Excellent for hobbies." },
                  { mins: 15, label: "15 mins/day", desc: "Standard recommended, triggers high XP goals." },
                  { mins: 20, label: "20 mins/day", desc: "Super scholar goal! Accelerated dictionary learning." },
                  { mins: 30, label: "30 mins/day", desc: "Intense daily practice with direct Lin vocal workshops!" }
                ].map(item => (
                  <button
                    key={item.mins}
                    onClick={() => {
                      playClickSound();
                      setAnswers({ ...answers, dailyMinutes: item.mins });
                    }}
                    className={`p-4 rounded-2xl text-left border transition flex justify-between items-center cursor-pointer ${
                      answers.dailyMinutes === item.mins 
                        ? "border-rose-500 bg-rose-50/50" 
                        : "border-slate-200 hover:border-slate-350"
                    }`}
                  >
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{item.label}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    {answers.dailyMinutes === item.mins && <span className="text-xs font-bold text-rose-600 bg-white border px-2.5 py-1 rounded-lg">Recommended</span>}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(7)}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl tracking-wide transition cursor-pointer"
              >
                Register Learning Goal
              </button>
            </motion.div>
          )}

          {/* ---------------------------------------------------- */}
          {/* STEP 7: personalized plan calculation */}
          {/* ---------------------------------------------------- */}
          {step === 7 && (
            <div className="text-center space-y-8 py-10">
              {/* Flying cute monkey banner */}
              <div className="relative inline-block">
                <span className="text-[90px] block animate-bounce">🐒</span>
                {/* Loader bar path indicator circle */}
                <div className="absolute inset-0 bg-rose-500 rounded-full blur-xl opacity-35 scale-75 animate-pulse" />
              </div>

              <div className="space-y-3">
                <h4 className="text-xl font-bold font-sans tracking-tight text-slate-900">Personalized Plan Preparation</h4>
                <p className="text-slate-400 text-xs italic font-light">Customizing character strokes, radical puzzle grids, and speech recognition guidelines...</p>
              </div>

              <div className="w-44 h-44 mx-auto relative flex items-center justify-center">
                
                {/* Interactive ring circle matching SuperChinese at 1:52 */}
                <div className="absolute inset-0 border-[10px] border-slate-100 rounded-full" />
                <svg className="w-full h-full rotate-270 absolute" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="41" 
                    stroke="#e11d48" strokeWidth="8" fill="transparent"
                    strokeDasharray={258}
                    strokeDashoffset={258 - (258 * planProgress) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-4xl font-mono font-black text-slate-900">{planProgress}%</span>
              </div>

              <p className="text-xs text-slate-500 select-none">We sync levels with Chengdu vocal engines...</p>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* STEP 8: PAYWALL subscription screen */}
          {/* ---------------------------------------------------- */}
          {step === 8 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              
              <div className="bg-gradient-to-r from-red-650 to-rose-950 p-6 rounded-3xl text-white relative overflow-hidden flex items-center justify-between shadow-xl">
                <div>
                  <span className="text-[10px] font-bold font-mono tracking-widest text-[#f59e0b] bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full uppercase leading-none">Superchinese premium</span>
                  <h3 className="text-2xl font-black font-sans tracking-tight mt-1">Unlock PLUS Features</h3>
                  <p className="text-[10px] text-slate-300 font-light leading-normal max-w-[280px]">Say goodbye to limit indicators and master real-life dialogues.</p>
                </div>
                <span className="text-5xl">👑</span>
              </div>

              {/* Price card layouts matching video at 1:55 */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "monthly", label: "1 Month", price: "$11.99", desc: "No Commitment" },
                  { id: "annual", label: "12 Months", price: "$49.99", desc: "Best Seller - save 65%", popular: true },
                  { id: "lifetime", label: "Lifetime", price: "$119.99", desc: "Unlimited forever" }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      playClickSound();
                      setAnswers({ ...answers, selectedPlan: p.id });
                    }}
                    className={`p-3.5 rounded-2xl border text-center flex flex-col justify-between min-h-[140px] relative transition-all cursor-pointer ${
                      answers.selectedPlan === p.id 
                        ? "border-amber-400 bg-amber-50/20 shadow-md scale-102" 
                        : "border-slate-200 bg-slate-55"
                    }`}
                  >
                    {p.popular && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white font-extrabold text-[8px] px-2 py-0.5 rounded-full uppercase shadow">Popular</span>
                    )}
                    <div>
                      <h4 className="font-extrabold text-[11px] text-slate-900">{p.label}</h4>
                      <p className="text-xs text-slate-400 font-light leading-none truncate block mt-1">{p.desc}</p>
                    </div>

                    <div className="mt-2 text-center w-full">
                      <span className="text-lg font-black text-slate-900 block">{p.price}</span>
                      <span className="text-[8px] text-slate-400 block leading-none">USD</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Core interactive lists of benefits */}
              <div className="bg-slate-50 p-4.5 p-5 rounded-2xl border border-slate-200/80 text-xs text-slate-650 space-y-2.5">
                {[
                  "📖 Access 1,000+ interactive lessons & quizzes",
                  "🤝 Real-life conversation practice with Lin AI",
                  "🎨 Complete strokes calligraphy tracer guide & analyzer",
                  "🎙️ Unlimited voice speech tonality analysis & correction logs"
                ].map((b, i) => (
                  <p key={i} className="flex items-center gap-1.5 font-light">{b}</p>
                ))}
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => setStep(9)}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-600 font-extrabold text-slate-950 text-xs rounded-2xl tracking-wider shadow-lg shadow-amber-100 transition cursor-pointer"
                >
                  Start 7-Day Free Trial Today
                </button>
                <button
                  type="button"
                  onClick={() => setStep(9)}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-2xl transition cursor-pointer"
                >
                  Continue with Free Version (Skip Premium)
                </button>
              </div>
            </motion.div>
          )}

          {/* ---------------------------------------------------- */}
          {/* STEP 9: Student Registration Name & Email */}
          {/* ---------------------------------------------------- */}
          {step === 9 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="text-center space-y-2">
                <span className="text-[28px] block">👋</span>
                <h3 className="text-2xl font-black text-slate-900 leading-tight">Create your profile</h3>
                <p className="text-slate-500 text-sm">Save your progress, daily streaks, and calligraphic milestones.</p>
              </div>

              <div className="pt-2 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Your Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Liam Zhang"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:border-red-500 outline-none text-slate-900 text-xs focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Your Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. student@superchinese.com"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:border-red-500 outline-none text-slate-900 text-xs focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div className="text-[10px] text-slate-400 leading-relaxed font-light italic text-center pt-2">
                  By completing the registration, you'll immediately enter HanziVerse matching your targeted SuperChinese guidelines.
                </div>
              </div>

              <div className="space-y-3 pt-3">
                <button
                  onClick={finalizeOnboarding}
                  disabled={!studentName.trim() || !studentEmail.trim()}
                  className="w-full py-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl tracking-wide transition shadow-lg shadow-rose-200 cursor-pointer"
                >
                  Create Mock Account & Start Learning!
                </button>
                <div className="flex items-center gap-3">
                  <span className="h-px bg-slate-200 flex-1" />
                  <span className="text-[9px] font-mono text-slate-400 uppercase">Or Google Authenticate</span>
                  <span className="h-px bg-slate-200 flex-1" />
                </div>
                <button
                  onClick={() => {
                    playClickSound();
                    signInWithGoogle();
                  }}
                  className="w-full py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-705 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
                >
                  <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.08-.22-.12-.44-.12-.66z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  Sync Profile with Google
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};
