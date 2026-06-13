import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  Volume2, Mic, MicOff, Send, Sparkles, Flame, RefreshCw, Compass, Play, 
  HelpCircle, Laugh, Heart, AlertTriangle, MessageCircle, AlertCircle, VolumeX, ShieldAlert
} from "lucide-react";
import { playXpSound, playSuccessSound, playClickSound } from "../utils/soundEffects";

interface Message {
  role: "user" | "model";
  content: string;
  expression: "happy" | "cute" | "scolding" | "thinking" | "neutral";
  translation?: string;
  isScolded?: boolean;
}

// 5 Curated voice scenario prompts
const LIN_SCENARIOS = [
  {
    id: "free-talk",
    label: "Free Chat (Full Scold Mode)",
    emoji: "💬",
    desc: "Have a casual friendly talk. Lin is listening closely and loves to scold any minor slip!",
    prompt: "Let's talk about anything! Try greeting me or asking a question inside correct Chinese characters."
  },
  {
    id: "cafe",
    label: "Order Boba Milktea",
    emoji: "🧋",
    desc: "Simulate a bubble tea cafe order. Try demanding different sugar percentages or toppings!",
    prompt: "你好！欢迎光临 Lin's Boba Cafe! (Nǐ hǎo! Huānyíng guānglín Lin's Boba Cafe! - Hello! Welcome to Lin's Boba Cafe!) What would you like to drink today?"
  },
  {
    id: "introduce",
    label: "Who are you?",
    emoji: "🤝",
    desc: "Introduce yourself, your hobbies, and why you are learning Mandarin without sounding silly.",
    prompt: "Hello friend! 我叫 Lin (Wǒ jiào Lin - My name is Lin). I am super excited to learn more about you! Can you tell me your Chinese name or hobby?"
  },
  {
    id: "directions",
    label: "Lost in Chengdu",
    emoji: "🗺️",
    desc: "You are lost in Chengdu seek directions to the Panda breeding base.",
    prompt: "哎呀！(Āiyā! - Oh my!) You look extremely lost in Chengdu! Are you looking for the Giant Panda breeding base (熊猫基地 - xióngmāo jīdì)?"
  },
  {
    id: "weather",
    label: "Weather Plan",
    emoji: "☀️",
    desc: "Describe what the weather is like and plan your weekend study checklist.",
    prompt: "今天成都的天气好极了！(Jīntiān Chéngdū de tiānqì hǎo jí le! - The weather in Chengdu is fantastic today!) How is the weather where you are?"
  }
];

export const LinVoiceTutor: React.FC = () => {
  const { userProgress, completeLesson } = useApp();

  const [activeScenario, setActiveScenario] = useState<string>("free-talk");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: "Hello! 我是 Lin (Wǒ shì Lin - I am Lin)! Your super friendly talking companion. Let's practice speaking Chinese! Type or tap the mic below to talk. Don't worry, I only bite when you make bad grammatical mistakes, haha!",
      expression: "cute"
    }
  ]);
  
  const [userInput, setUserInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [linExpression, setLinExpression] = useState<"happy" | "cute" | "scolding" | "thinking" | "neutral">("cute");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(true);
  const [scoldCount, setScoldCount] = useState<number>(0);
  const [happiness, setHappiness] = useState<number>(90);
  const [speechActive, setSpeechActive] = useState<boolean>(false);
  
  // Audio playback cache
  const [currentlyPlaying, setCurrentlyPlaying] = useState<boolean>(false);
  const speechUtteranceRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Web Speech API interfaces
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Scroll chat on load or response update
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle Speech Recognition setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = false;
        // Recognize both Chinese/English interchangeably
        recog.lang = "zh-CN";

        recog.onstart = () => {
          setIsListening(true);
        };

        recog.onresult = (event: any) => {
          const text = event.results[event.results.length - 1][0].transcript;
          setUserInput(text);
          playSuccessSound();
        };

        recog.onerror = (event: any) => {
          console.error("Speech recognition error: ", event.error);
          setIsListening(false);
        };

        recog.onend = () => {
          setIsListening(false);
        };

        setRecognition(recog);
      }
    }
  }, []);

  // Set initial scenario prompt triggers
  const handleScenarioChange = (scenarioId: string) => {
    playClickSound();
    setActiveScenario(scenarioId);
    const scenario = LIN_SCENARIOS.find(s => s.id === scenarioId);
    if (scenario) {
      setMessages([
        {
          role: "model",
          content: scenario.prompt,
          expression: "happy"
        }
      ]);
      setLinExpression("happy");
      speakLinVoice(scenario.prompt);
    }
  };

  const toggleMicListening = () => {
    if (!recognition) {
      alert("🎙️ Web speech recognition is not supported in this browser, please type your message manually in the input box!");
      return;
    }
    playClickSound();
    if (isListening) {
      recognition.stop();
    } else {
      setUserInput("");
      recognition.start();
    }
  };

  // Speaks Lin's response with native multi-language voice or server TTS fallbacks
  const speakLinVoice = async (text: string) => {
    if (!ttsEnabled) return;
    setCurrentlyPlaying(true);

    // Cancel existing
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    try {
      // 1. First attempt native speech synthesis browser engine
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Isolate Hanzi for pronouncing
        const cleanHanziText = text.replace(/\([^)]*\)/g, ""); // Strip pronunciation braces
        utterance.text = cleanHanziText;

        // Fetch user languages to match Chinese standard
        const voices = window.speechSynthesis.getVoices();
        const mandarinVoice = voices.find(v => v.lang.includes("zh") || v.lang.includes("CN") || v.lang.includes("raw"));
        if (mandarinVoice) {
          utterance.voice = mandarinVoice;
        }
        utterance.rate = 0.9; // speak slightly slower for learning aid
        
        utterance.onend = () => {
          setCurrentlyPlaying(false);
        };
        utterance.onerror = () => {
          setCurrentlyPlaying(false);
        };

        speechUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } else {
        // 2. Alternate Server TTS
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: text.replace(/\([^)]*\)/g, ""), voice: "Zephyr" })
        });
        if (response.ok) {
          const data = await response.json();
          if (data.audio) {
            const audioObj = new Audio(`data:audio/wav;base64,${data.audio}`);
            audioObj.play();
            audioObj.onended = () => setCurrentlyPlaying(false);
          }
        }
      }
    } catch (err) {
      console.warn("TTS speak fallbacks failed gracefully: ", err);
      setCurrentlyPlaying(false);
    }
  };

  // Submit messaging
  const handleSubmitMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || loading) return;

    const userMsg = userInput.trim();
    setUserInput("");
    setLoading(true);

    const oldMessages = [...messages];
    const newChatHistory = [
      ...oldMessages,
      { role: "user" as const, content: userMsg, expression: "neutral" as const }
    ];
    setMessages(newChatHistory);
    setLinExpression("thinking");

    try {
      // Send chat log to Lin service API
      const response = await fetch("/api/gemini/lin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: newChatHistory.map(m => ({ role: m.role, content: m.content })),
          scenario: activeScenario
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          // Detect if scolded in response dynamically (presence of angry words or scolded payload)
          const isScolded = data.isScolded || /💢|🤬|哎呀|笨蛋|不对|错误|nonsense|rubbish|how dare you/gi.test(data.reply);
          
          let expr: "happy" | "cute" | "scolding" | "thinking" = "happy";
          if (isScolded) {
            expr = "scolding";
            setScoldCount(prev => prev + 1);
            setHappiness(prev => Math.max(20, prev - 15));
            completeLesson("scolded-by-lin", 15); // Dynamic mini-bonus for receiving scold corrections
          } else {
            expr = Math.random() > 0.5 ? "cute" : "happy";
            setHappiness(prev => Math.min(100, prev + 5));
          }

          setLinExpression(expr);
          setMessages(prev => [
            ...prev,
            {
              role: "model",
              content: data.reply,
              expression: expr,
              translation: data.translation || "",
              isScolded
            }
          ]);

          // Play success effects
          if (isScolded) {
            playClickSound(); // Shock effect
          } else {
            playSuccessSound();
          }

          // Trigger speaking voice
          speakLinVoice(data.reply);
          
          // Complete normal study boost path milestones
          completeLesson("talked-with-lin-speech", 20);
        }
      } else {
        throw new Error("Talking bot reply endpoint failed.");
      }
    } catch (err) {
      console.error(err);
      setLinExpression("neutral");
      setMessages(prev => [
        ...prev,
        {
          role: "model",
          content: "哎呀！(Āiyā! - Oh no!) Connection details with Chengdu failed to load! Can you check your network or try again, pretty please?",
          expression: "scolding"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Renders beautiful anime interactive avatars representing Lin depending on emotional expression state
  const renderLinAvatar = () => {
    switch (linExpression) {
      case "happy":
        return (
          <div className="relative group select-none">
            <div className="w-32 h-32 rounded-full bg-emerald-100 border-4 border-emerald-400 flex items-center justify-center text-6xl animate-bounce relative z-10 shadow-lg shadow-emerald-200">
              😄
            </div>
            <div className="absolute inset-0 bg-emerald-300 rounded-full blur-xl opacity-30 animate-pulse scale-105" />
            <span className="absolute -top-1 -right-1 bg-emerald-500 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase shadow">
              Friendly
            </span>
          </div>
        );
      case "cute":
        return (
          <div className="relative group select-none">
            <div className="w-32 h-32 rounded-full bg-rose-100 border-4 border-rose-400 flex items-center justify-center text-6xl animate-pulse relative z-10 shadow-lg shadow-rose-200">
              🥰
            </div>
            <div className="absolute inset-0 bg-rose-300 rounded-full blur-xl opacity-30 animate-pulse scale-105" />
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase shadow">
              Cute Mode
            </span>
          </div>
        );
      case "scolding":
        return (
          <div className="relative group select-none">
            <div className="w-32 h-32 rounded-full bg-red-100 border-4 border-red-500 flex items-center justify-center text-6xl relative z-10 shadow-2xl shadow-red-200 animate-wiggle">
              💢
            </div>
            {/* Red glow pulse overlays */}
            <div className="absolute inset-0 bg-red-600 rounded-full blur-2xl opacity-40 animate-pulse scale-110" />
            <span className="absolute -top-1.5 -right-2 bg-red-600 text-white font-black text-[9px] px-2.5 py-1.5 rounded-full uppercase shadow-md flex items-center gap-0.5">
              <ShieldAlert className="w-3 h-3 animate-bounce" /> SCOLDING!
            </span>
          </div>
        );
      case "thinking":
        return (
          <div className="relative group select-none">
            <div className="w-32 h-32 rounded-full bg-indigo-100 border-4 border-indigo-400 flex items-center justify-center text-6xl relative z-10 shadow-lg shadow-indigo-100">
              🤔
            </div>
            <div className="absolute inset-0 bg-indigo-300 rounded-full blur-xl opacity-30 animate-pulse scale-105" />
            <span className="absolute -top-1 -right-1 bg-indigo-500 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase shadow">
              Thinking...
            </span>
          </div>
        );
      default:
        return (
          <div className="relative group select-none">
            <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-slate-300 flex items-center justify-center text-6xl relative z-10 shadow-md">
              😊
            </div>
            <span className="absolute -top-1 -right-1 bg-slate-500 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase shadow">
              Listening
            </span>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 animate-fade-in text-left">
      
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-red-950 via-rose-900 to-slate-950 p-8 rounded-3xl text-white relative overflow-hidden shadow-xl border border-red-900/45">
        <div className="absolute right-4 -bottom-8 text-[150px] opacity-[0.03] pointer-events-none select-none font-serif">
          语音
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <span className="text-[10px] font-bold font-mono tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full uppercase leading-none inline-flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" /> Sakura-Style AI Companion
            </span>
            <h2 className="text-3xl font-extrabold font-sans tracking-tight">Talk with Lin: Super Friendly & Scolding Tutor</h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-3xl font-light">
              We took inspiration from Sakura Japanese AI to build **Lin**, a native Chengdu resident, extremely energetic, bubbly, and helpful companion. But watch out! Speak bad grammar, broken accents, or incorrect pinyin, and watch her immediately transform into a passionate Chinese mother scolding you, then back to sweet!
            </p>
          </div>

          {/* Quick interactive stats dashboard */}
          <div className="grid grid-cols-3 gap-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl w-full md:w-auto text-xs font-mono">
            <div className="text-center p-2 px-3 bg-white/5 rounded-xl border border-white/5">
              <p className="text-slate-400 text-[9px] uppercase">Happiness</p>
              <p className="text-base font-black text-rose-400 mt-1">{happiness}%</p>
            </div>
            <div className="text-center p-2 px-3 bg-white/5 rounded-xl border border-white/5">
              <p className="text-slate-400 text-[9px] uppercase">Times Scolded</p>
              <p className="text-base font-black text-red-400 mt-1">{scoldCount}</p>
            </div>
            <div className="text-center p-2 px-3 bg-white/5 rounded-xl border border-white/5">
              <p className="text-slate-400 text-[9px] uppercase">Language</p>
              <p className="text-base font-black text-amber-400 mt-1">CN + EN</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Classroom Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Dynamic interactive Live Lin Avatar Desk (Span 4) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 flex flex-col items-center justify-center text-center">
          
          {/* Avatar frame */}
          <div className="py-6 min-h-[220px] flex items-center justify-center w-full relative">
            {renderLinAvatar()}

            {/* Speaking soundwave animations */}
            {currentlyPlaying && (
              <div className="absolute bottom-2 flex gap-1 items-center justify-center h-4 w-full">
                {[0.2, 0.4, 0.6, 0.8, 1, 0.8, 0.6, 0.4, 0.2].map((delay, index) => (
                  <motion.div
                    key={index}
                    className="w-1 bg-rose-500 rounded-full"
                    animate={{ height: ["4px", "16px", "4px"] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: delay
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Persona descriptor overlay */}
          <div className="space-y-1.5 border-t border-slate-100 pt-4 w-full text-center">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center justify-center gap-1">
              Lin 林
            </h4>
            <p className="text-xs text-slate-500 font-light leading-relaxed max-w-xs mx-auto">
              "Nice to meet you! I live next to Chengdu Panda park. I serve Sichuan hotpot and make sure your Mandarin characters have perfect pitch tones!"
            </p>
          </div>

          {/* Quick Voice Playback Controls */}
          <div className="w-full bg-slate-50 p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTtsEnabled(!ttsEnabled)}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  ttsEnabled 
                    ? "bg-rose-500 text-white shadow-sm" 
                    : "bg-slate-200 text-slate-500"
                }`}
                title="Enable / Disable Verbal Vocal audio voices"
              >
                {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <span className="font-semibold">Vocal Speech Enabled</span>
            </div>

            {currentlyPlaying && (
              <button
                onClick={() => {
                  if (typeof window !== "undefined") window.speechSynthesis.cancel();
                  setCurrentlyPlaying(false);
                }}
                className="py-1 px-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition text-[10px] font-bold"
              >
                Mute Lin
              </button>
            )}
          </div>

          {/* Scenarios Panel */}
          <div className="w-full text-left space-y-3 pt-2">
            <label className="text-[11px] font-extrabold text-slate-700 tracking-wider uppercase block">
              💡 Speech Topic Scenarios
            </label>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {LIN_SCENARIOS.map((item) => {
                const isActive = activeScenario === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleScenarioChange(item.id)}
                    className={`p-3 rounded-2xl border text-left w-full transition flex items-start gap-3 cursor-pointer ${
                      isActive 
                        ? "bg-rose-50 border-rose-350 text-rose-900" 
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-750"
                    }`}
                  >
                    <span className="text-xl bg-white p-1 rounded-xl shadow-xs leading-none">{item.emoji}</span>
                    <div className="min-w-0">
                      <p className="font-extrabold text-xs tracking-tight">{item.label}</p>
                      <p className="text-[9px] text-slate-500 leading-normal font-light truncate mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Scroller Dialogue Arena (Span 8) */}
        <div className="lg:col-span-8 bg-slate-50 border border-slate-200 rounded-3xl h-[630px] flex flex-col justify-between overflow-hidden shadow-sm">
          
          {/* Header */}
          <div className="bg-slate-950 text-white p-4 flex justify-between items-center px-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-rose-500 flex items-center justify-center font-bold text-white shadow text-sm">
                林
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-white">Lin's Interactive Voice Desk</h4>
                <p className="text-[9px] text-rose-400 font-mono flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Online via Chengdu Speech Channel
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleScenarioChange(activeScenario)}
                className="p-1.5 px-3 bg-white/10 hover:bg-white/15 rounded-xl text-[10px] text-slate-200 font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Restart this conversational practice"
              >
                <RefreshCw className="w-3 h-3" /> Reset Topic
              </button>
            </div>
          </div>

          {/* Dialog Space */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[460px]">
            {messages.map((msg, index) => {
              const isUser = msg.role === "user";
              return (
                <div 
                  key={index} 
                  className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-3`}
                >
                  {!isUser && (
                    <span className="w-7 h-7 rounded-full bg-rose-200 flex items-center justify-center text-[11px] font-bold text-rose-800 shrink-0">林</span>
                  )}
                  
                  <div className="space-y-1 max-w-[85%] text-left">
                    <div className={`p-4 rounded-3xl leading-relaxed text-xs shadow-inner ${
                      isUser
                        ? "bg-slate-900 border border-slate-800 text-white rounded-tr-none"
                        : msg.isScolded
                          ? "bg-red-50 border-2 border-red-300 text-red-950 rounded-tl-none font-bold relative group"
                          : "bg-white border text-slate-800 rounded-tl-none font-light"
                    }`}>
                      
                      {/* Highlight label if scolded */}
                      {msg.isScolded && (
                        <div className="flex items-center gap-1.5 mb-1 text-red-700 font-extrabold text-[10px] uppercase font-mono tracking-wider animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5 fill-red-200" /> Lin Corrected translation mistake!
                        </div>
                      )}

                      <p>{msg.content}</p>

                      {/* Optional Pronounce button for specific dialogue bubble */}
                      {!isUser && (
                        <button
                          onClick={() => speakLinVoice(msg.content)}
                          className="mt-2.5 p-1 px-2.5 bg-slate-50 hover:bg-slate-100 border text-[9px] font-bold text-slate-600 rounded-lg flex items-center gap-1"
                        >
                          <Volume2 className="w-3 h-3" /> Hear pronunciation
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 p-2 italic text-xs text-slate-500">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: "0.2s" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: "0.4s" }} />
                <span>Lin is formatting a friendly correction response...</span>
              </div>
            )}

            <div ref={scrollRef} />
          </div>

          {/* Interactive Mic Control & Keyboard Entry */}
          <div className="p-4 bg-white border-t border-slate-200">
            
            {/* Visual sound level when listening */}
            {isListening && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl mb-3 flex items-center justify-between text-xs text-rose-700">
                <span className="flex items-center gap-2 font-bold animate-pulse">
                  <span className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-ping" />
                  Lin is listening! Speak in Chinese/English now...
                </span>
                
                {/* Simulated vocal microphone audio bars */}
                <div className="flex gap-0.5 items-end h-5.5">
                  <div className="w-0.75 bg-rose-600 rounded-full animate-bounce h-2" style={{ animationDuration: "0.5s" }} />
                  <div className="w-0.75 bg-rose-600 rounded-full animate-bounce h-4" style={{ animationDuration: "0.6s" }} />
                  <div className="w-0.75 bg-rose-600 rounded-full animate-bounce h-1.5" style={{ animationDuration: "0.4s" }} />
                  <div className="w-0.75 bg-rose-600 rounded-full animate-bounce h-5" style={{ animationDuration: "0.7s" }} />
                </div>
              </div>
            )}

            {/* Form row */}
            <form onSubmit={handleSubmitMessage} className="flex gap-2.5">
              
              {/* Push To Talk Voice Mic Capture (Sakura AI vibe!) */}
              <button
                type="button"
                onClick={toggleMicListening}
                className={`p-3.5 rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer max-w-16 flex items-center justify-center shrink-0 ${
                  isListening
                    ? "bg-red-600 text-white animate-pulse"
                    : "bg-rose-50 hover:bg-rose-100/80 border border-rose-200/50 text-rose-700"
                }`}
                title="Tap to speak Chinese voice input"
              >
                {isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>

              <div className="relative flex-1 flex items-center">
                <input
                  type="text"
                  placeholder={isListening ? "Listening..." : "Type english or chinese response (e.g. 'Nǐ hǎo! I like tea')" }
                  disabled={isListening}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-rose-500 outline-none rounded-2xl text-xs text-slate-900 transition disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={!userInput.trim() || loading}
                className="p-3 px-5 bg-rose-700 hover:bg-rose-800 disabled:opacity-50 font-extrabold text-white rounded-2xl text-xs transition shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>

            </form>

            <div className="flex justify-between items-center py-2 px-1 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                💡 <strong className="font-semibold text-slate-500">Quick Tips:</strong> Use basic words and test spelling!
              </span>
              <span>成都 - Chengdu Lab 🎋</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
