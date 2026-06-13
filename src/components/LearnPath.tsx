import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import {
  Mic,
  Play,
  RotateCcw,
  Sparkles,
  BookOpen,
  Volume2,
  Trash2,
  CheckCircle2,
  HelpCircle,
  HelpCircle as QuestionIcon,
  ChevronsRight,
  ChevronRight,
  Smile,
  Flame,
  Award
} from "lucide-react";
import {
  PINYIN_CHART_INITIALS,
  PINYIN_CHART_FINALS,
  PINYIN_SYLLABLES,
  STROKES_TUTORIAL,
  STROKE_CHARACTERS,
  RADICALS_LIBRARY,
  HSK_VOCABULARY
} from "../data/mockData";
import {
  HSK_CURATED_CHARACTERS,
  getStrokesForCharacter,
  search6kDictionary,
  HskWord
} from "../data/hsk6kWords";

// Global premium audio speaker helper
const speakMandarin = async (text: string, useAiTts = false, selectedVoice = "Kore") => {
  if (useAiTts) {
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: selectedVoice })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.audio) {
          const audio = new Audio("data:audio/wav;base64," + data.audio);
          audio.play();
          return;
        }
      }
    } catch (err) {
      console.warn("AI voice endpoint failed to connect. Defaulting to client synthesis fallback", err);
    }
  }

  // Fallback to standard browser Spech Synthesis
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }
};

export const LearnPath: React.FC = () => {
  const { completeLesson, recordSrsReview, completeQuiz, srsCards, toggleSaveVocabulary, userProgress } = useApp();
  const [activeTab, setActiveTab] = useState<string>("pinyin"); // pinyin, strokes, radicals, srs, hsk, reading

  // 1. Pinyin states
  const [selectedPinyin, setSelectedPinyin] = useState<typeof PINYIN_SYLLABLES[0] | null>(PINYIN_SYLLABLES[0]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingFeedback, setRecordingFeedback] = useState<string>("");
  const [isTtsPremium, setIsTtsPremium] = useState<boolean>(false);

  // 2. Stroke orders states
  const [selectedStrokeChar, setSelectedStrokeChar] = useState<typeof STROKE_CHARACTERS[0]>(STROKE_CHARACTERS[0]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // New HSK 1-6 character stroke & vocabulary search state (6,000 words scale)
  const [hskStrokeLevel, setHskStrokeLevel] = useState<number>(1);
  const [hskStrokeSearch, setHskStrokeSearch] = useState<string>("");
  const [selectedHskStrokeChar, setSelectedHskStrokeChar] = useState<HskWord | null>({
    character: "永",
    pinyin: "yǒng",
    meaning: "Forever / Eternity",
    hskLevel: 5,
    strokes: [
      "点 (diǎn) - Top Dot",
      "横折 (héng-zhé) - Top Horizontal and Bend",
      "横折钩 (héng-zhé-gōu) - Inner hook-action",
      "提 (tí) - Bottom-Left stroke upward",
      "撇 (piě) - Diagonally downward left",
      "捺 (nà) - Broad downward right stroke"
    ],
    strokesCount: 5,
    radical: "水 (shuǐ)"
  });

  // 3. Radicals Game states
  const [radicalMatches, setRadicalMatches] = useState<Record<string, string>>({});
  const [activeRadical, setActiveRadical] = useState<string | null>(null);
  const [gameScore, setGameScore] = useState<number>(0);
  const [gameMessage, setGameMessage] = useState<string>("");

  // 4. SRS spaced cards state
  const [currentSrsIndex, setCurrentSrsIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const dueSrsCards = srsCards.filter(
    (c) => new Date(c.nextReviewDate).getTime() <= Date.now()
  );

  // 5. HSK Vocabulary Lesson & Quiz states
  const [hskFilter, setHskFilter] = useState<number>(1);
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [quizStep, setQuizStep] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizSelectedAnswer, setQuizSelectedAnswer] = useState<string | null>(null);

  // Quiz content structured from mockData
  const mockQuizQuestions = [
    {
      q: "What is the Pinyin for '谢谢' (Thank you)?",
      options: ["nǐ hǎo", "xièxie", "kāfēi", "Hànyǔ"],
      answer: "xièxie"
    },
    {
      q: "What is the English meaning of HSK Vocabulary word '中国'?",
      options: ["China", "Korea", "America", "Coffee"],
      answer: "China"
    },
    {
      q: "Which word represents the Pinyin 'kāfēi'?",
      options: ["你好", "谢谢", "咖啡", "汉语"],
      answer: "咖啡"
    }
  ];

  // 6. Daily Reading Practice Dual-Toggle states
  const [showPinyinText, setShowPinyinText] = useState<boolean>(true);
  const [showTranslationText, setShowTranslationText] = useState<boolean>(true);
  const [tappedWord, setTappedWord] = useState<{ cn: string; py: string; en: string } | null>(null);

  const readingParagraph = {
    cnText: "我的 朋友 喜欢 吃 汉堡 ， 他 打算 去 中国 学习 汉语 。",
    words: [
      { cn: "我的", py: "wǒ de", en: "My" },
      { cn: "朋友", py: "péngyǒu", en: "friend" },
      { cn: "喜欢", py: "xǐhuān", en: "likes / to like" },
      { cn: "吃", py: "chī", en: "to eat" },
      { cn: "汉堡", py: "hànbǎo", en: "hamburger" },
      { cn: "，", py: "", en: "," },
      { cn: "他", py: "tā", en: "he / him" },
      { cn: "打算", py: "dǎsuàn", en: "plans / to plan" },
      { cn: "去", py: "qù", en: "to go" },
      { cn: "中国", py: "Zhōngguó", en: "China" },
      { cn: "学习", py: "xuéxí", en: "to learn / study" },
      { cn: "汉语", py: "Hànyǔ", en: "Mandarin Chinese" },
      { cn: "。", py: "", en: "." }
    ],
    pinyinBlock: "Wǒ de péngyǒu xǐhuān chī hànbǎo, tā dǎsuàn qù Zhōngguó xuéxí Hànyǔ.",
    englishTranslation: "My friend likes to eat hamburgers, he is planning to go to China to study Chinese."
  };

  // Setup Strokes Tracing canvas interaction
  useEffect(() => {
    if (activeTab === "strokes") {
      initCanvas();
    }
  }, [activeTab, selectedStrokeChar, selectedHskStrokeChar]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw traditional grid lines (rice field grid 米字格)
    ctx.strokeStyle = "#fed7aa"; // light gold orange
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);

    // Horizontal & Vertical
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    
    // Diagonals
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.moveTo(canvas.width, 0);
    ctx.lineTo(0, canvas.height);
    ctx.stroke();

    ctx.setLineDash([]); // clear dash

    // Draw transparent character background
    ctx.font = "bold 150px Inter, 'Noto Sans SC', sans-serif";
    ctx.fillStyle = "rgba(226, 40, 40, 0.08)"; // very soft background red
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const activeChar = selectedHskStrokeChar ? selectedHskStrokeChar.character : selectedStrokeChar.character;
    ctx.fillText(activeChar, canvas.width / 2, canvas.height / 2);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = "#c53030"; // blood red
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const drawCharacter = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Mic Simulation Speaking Evaluation
  const simulateRecordPronunciation = () => {
    if (!selectedPinyin) return;
    setIsRecording(true);
    setRecordingFeedback("Microphone active... Speak your syllables clearly...");

    setTimeout(() => {
      setIsRecording(false);
      // Give realistic tone feedback
      const randomScores = [
        "Perfect standard pronunciation matching 1st Tone (flat high)!",
        "Tone pitch was too low. Try saying it with a sharp rising motion.",
        "Perfect 3rd Tone dip! Deeply expressed.",
        "Excellent 4th Tone (steep drop) pronunciation!"
      ];
      setRecordingFeedback(randomScores[Math.floor(Math.random() * randomScores.length)]);
      // award XP
      completeLesson(`pinyin-say-${selectedPinyin.syllable}`, 15);
    }, 2800);
  };

  // Radical Pairing Logic
  const handleRadicalChoice = (radical: string) => {
    setActiveRadical(radical);
  };

  const handleRadicalGoalMatch = (meaning: string) => {
    if (!activeRadical) {
      setGameMessage("Select a radical on the left first!");
      return;
    }

    // correct mapping targets
    const correctAnswers: Record<string, string> = {
      "亻 (人)": "Person radical",
      "氵 (水)": "Water radical",
      "女": "Woman radical",
      "口": "Mouth radical"
    };

    if (correctAnswers[activeRadical] === meaning) {
      setRadicalMatches({ ...radicalMatches, [activeRadical]: meaning });
      setGameScore((prev) => prev + 25);
      setGameMessage("✨ Correct pairing matched! Well done!");
      setActiveRadical(null);

      // Verify if all matched
      if (Object.keys(radicalMatches).length + 1 === 4) {
        setGameMessage("🏆 Awesome! You mastered all semantic radical groups!");
        completeLesson("radicals-game-finished", 50);
      }
    } else {
      setGameMessage("❌ Incorrect match! Feel the semantic background detail and try again.");
    }
  };

  const resetRadicalsGame = () => {
    setRadicalMatches({});
    setActiveRadical(null);
    setGameScore(0);
    setGameMessage("");
  };

  // Vocabulary Quiz Logic
  const handleAnswerQuiz = (selectedOpt: string) => {
    setQuizSelectedAnswer(selectedOpt);
    const correctOpt = mockQuizQuestions[quizStep].answer;
    if (selectedOpt === correctOpt) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuizStep = () => {
    setQuizSelectedAnswer(null);
    if (quizStep + 1 < mockQuizQuestions.length) {
      setQuizStep((prev) => prev + 1);
    } else {
      // Completed!
      const totalXpGained = quizScore * 25 + 15;
      completeQuiz(`lesson-quiz-hsk-${hskFilter}`, quizScore, totalXpGained);
      setQuizActive(false);
      alert(`Quiz completed! You scored ${quizScore}/${mockQuizQuestions.length} and earned ${totalXpGained} XP!`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 selection:bg-brand-red selection:text-white">
      
      {/* Tab Select Header */}
      <div className="flex flex-wrap gap-2.5 border-b border-slate-200 pb-3 justify-center md:justify-start">
        {[
          { id: "pinyin", label: "Master Pinyin", desc: "Initials & Vowels" },
          { id: "strokes", label: "Stroke Orders", desc: "Writing Tracing" },
          { id: "radicals", label: "Radicals Pack", desc: "Character Puzzle" },
          { id: "srs", label: "SRS Flashcards", desc: "Smart Revise" },
          { id: "hsk", label: "HSK Lessons", desc: "Vocabulary & Quiz" },
          { id: "reading", label: "Reading Practice", desc: "Tap Dictionary" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 rounded-2xl text-left transition cursor-pointer ${
              activeTab === tab.id
                ? "bg-brand-red text-white shadow-md shadow-brand-red/10"
                : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700"
            }`}
          >
            <p className="font-bold text-sm tracking-tight">{tab.label}</p>
            <p className={`text-[10px] font-medium leading-none mt-1 ${activeTab === tab.id ? "text-brand-gold font-semibold" : "text-slate-400"}`}>{tab.desc}</p>
          </button>
        ))}
      </div>

      {/* ---------------------------------------------------- */}
      {/* SECTION 1: MASTER PINYIN */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence mode="wait">
        {activeTab === "pinyin" && (
          <motion.div
            key="pinyin"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left side: interactive pinyin initials/finals chart */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-950">Interactive Pinyin Grid</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Pinyin translates Chinese characters to alphabetical sound values. Tap letters to pronounce.
                    </p>
                  </div>
                  
                  {/* TTS Premium Switch */}
                  <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70 text-xs">
                    <input 
                      type="checkbox" 
                      checked={isTtsPremium} 
                      onChange={(e) => setIsTtsPremium(e.target.checked)}
                      className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                    />
                    <Sparkles className="w-4 h-4 text-amber-500 fill-current" />
                    <span className="font-bold text-slate-700">Premium AI Voice (Gemini TTS)</span>
                  </label>
                </div>

                <div className="space-y-4 pt-3">
                  {/* Initials */}
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded tracking-wide uppercase">Initials (Consonants)</span>
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2 mt-2">
                      {PINYIN_CHART_INITIALS.map((init) => (
                        <button
                          key={init}
                          onClick={() => {
                            speakMandarin(init, isTtsPremium);
                            // Set custom syllable lookups
                            const matchingSyllable = PINYIN_SYLLABLES.find((s) => s.initial === init);
                            if (matchingSyllable) setSelectedPinyin(matchingSyllable);
                          }}
                          className="py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-800 font-bold text-sm tracking-wide transition uppercase cursor-pointer"
                        >
                          {init}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Finals */}
                  <div>
                    <span className="text-[10px] font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded tracking-wide uppercase">Vowels & Finals</span>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-2 mt-2">
                      {PINYIN_CHART_FINALS.map((vow) => (
                        <button
                          key={vow}
                          onClick={() => {
                            speakMandarin(vow, isTtsPremium);
                            const matchingSyllable = PINYIN_SYLLABLES.find((s) => s.final === vow);
                            if (matchingSyllable) setSelectedPinyin(matchingSyllable);
                          }}
                          className="py-2.5 rounded-xl bg-slate-50 hover:bg-red-50 hover:text-red-800 border border-slate-200 hover:border-red-200 text-slate-800 font-bold text-sm tracking-wide transition cursor-pointer"
                        >
                          {vow}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Syllables Tone practice laboratory */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
                <div className="flex justify-between items-center bg-red-50/50 p-4 rounded-2xl border border-red-100">
                  <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Syllable Focus Lab</span>
                  <div className="flex gap-2">
                    {PINYIN_SYLLABLES.map((syl) => (
                      <button
                        key={syl.syllable}
                        onClick={() => setSelectedPinyin(syl)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          selectedPinyin?.syllable === syl.syllable
                            ? "bg-red-600 text-white shadow-md shadow-red-600/10"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {syl.syllable}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-slate-900 text-base">The Pitch Tones comparison</h4>
                    <p className="text-xs text-slate-500">
                      Standard Chinese is tonal. Changing pitch directly shifts the dictionary meaning. Click tones below to verify audio sound signatures.
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      {selectedPinyin?.tones.map((toneText, i) => (
                        <button
                          key={i}
                          onClick={() => speakMandarin(toneText.split(" ")[0], isTtsPremium)}
                          className="py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left transition flex items-center justify-between group cursor-pointer"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-400">Tone {i + 1}</p>
                            <p className="text-sm font-bold text-slate-800 mt-0.5">{toneText}</p>
                          </div>
                          <Volume2 className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Character tone outcomes */}
                  <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Tone Resulting Characters</h4>
                    <div className="space-y-2">
                      {selectedPinyin?.examples.map((item, i) => (
                        <div key={i} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100">
                          <div className="flex gap-3 items-center">
                            <span className="text-lg font-bold text-red-600 font-sans">{item.character}</span>
                            <div>
                              <p className="font-mono text-xs font-bold text-slate-800">{item.pinyin}</p>
                              <p className="text-[10px] text-slate-500">{item.meaning}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => speakMandarin(item.character, isTtsPremium)}
                            className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5" /> Hear
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Speaking Exercises / Mic Evaluation */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                  <Mic className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-950">Microphone Speak Practice</h3>
                <p className="text-xs text-slate-500">
                  Select a syllable and read it aloud. Our custom transcription simulator scores pitch accuracy!
                </p>

                <div className="border border-dashed border-slate-200 p-6 rounded-2xl bg-slate-50/50 text-center space-y-4">
                  <div className="space-y-1">
                    <span className="text-5xl font-black text-slate-950 tracking-tight">{selectedPinyin?.syllable}</span>
                    <p className="text-[10px] text-slate-400 font-mono">active: standard Mandarin pitch</p>
                  </div>

                  <button
                    id="btn-speak-mic-pinyin"
                    onClick={simulateRecordPronunciation}
                    disabled={isRecording}
                    className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide text-white transition flex items-center justify-center gap-2 ${
                      isRecording 
                        ? "bg-amber-500 cursor-not-allowed animate-pulse" 
                        : "bg-red-600 hover:bg-red-700 active:scale-95 cursor-pointer shadow-md shadow-red-600/10"
                    }`}
                  >
                    {isRecording ? "Listening & Recording..." : "Tap to Speak Syllable"}
                    <Mic className="w-4 h-4 ml-1" />
                  </button>

                  {recordingFeedback && (
                    <motion.div 
                      className="p-3 bg-white text-slate-800 text-xs border border-slate-200 rounded-xl text-left text-light"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <span className="font-bold text-amber-500 block mb-1">Feedback Report:</span>
                      {recordingFeedback}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SECTION 2: BASIC STROKES & WRITING BOARD */}
        {/* ---------------------------------------------------- */}
        {activeTab === "strokes" && (() => {
          const matchedWordsList = search6kDictionary(hskStrokeSearch, hskStrokeLevel);
          const currentStrokeObj = selectedHskStrokeChar || {
            character: selectedStrokeChar.character,
            pinyin: selectedStrokeChar.pinyin,
            meaning: selectedStrokeChar.meaning,
            strokes: selectedStrokeChar.strokes,
            strokesCount: selectedStrokeChar.strokesCount,
            radical: selectedStrokeChar.radical,
            hskLevel: 1
          };

          return (
            <motion.div
              key="strokes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column: 6-Level Selector & 6K words Catalog (8 Col widths) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Visual Header */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 bg-brand-light-red border border-brand-light-border text-brand-red rounded-lg flex items-center justify-center font-serif font-black">書</span>
                    <h3 className="text-xl font-extrabold text-slate-950 font-sans tracking-tight">HSK Character Writing Studio</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-light">
                    Practice traditional stroke orders across all 6 HSK levels, offering up to <span className="font-semibold text-brand-red">6,000 curriculum words</span>. Use the level selectors below to explore, click on any word to load it, or type any character to construct its guide instantly on-the-go.
                  </p>

                  {/* Level Tabs (HSK 1 to 6) */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
                    {[
                      { l: 1, label: "HSK 1", text: "Beginner", count: "150 words" },
                      { l: 2, label: "HSK 2", text: "Elementary", count: "300 cumulative" },
                      { l: 3, label: "HSK 3", text: "Intermediate", count: "600 cumulative" },
                      { l: 4, label: "HSK 4", text: "Upper-Int", count: "1,200 cumulative" },
                      { l: 5, label: "HSK 5", text: "Advanced", count: "2,500 cumulative" },
                      { l: 6, label: "HSK 6", text: "Fluent", count: "6,000 words" }
                    ].map((step) => {
                      const isActive = hskStrokeLevel === step.l;
                      return (
                        <button
                          key={step.l}
                          onClick={() => {
                            setHskStrokeLevel(step.l);
                            // Auto select the first item of that curated group to populate the canvas
                            const levelCurated = HSK_CURATED_CHARACTERS[step.l];
                            if (levelCurated && levelCurated.length > 0) {
                              setSelectedHskStrokeChar(levelCurated[0]);
                            }
                          }}
                          className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                            isActive 
                              ? "bg-slate-950 border-slate-950 text-white shadow-sm"
                              : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                          }`}
                        >
                          <p className="font-extrabold text-xs tracking-tight">{step.label}</p>
                          <p className="text-[9px] opacity-80 leading-none mt-0.5">{step.text}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Search Bar & Grid catalog view */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">HSK Level {hskStrokeLevel} Vocabulary Selection ({matchedWordsList.length} matches)</h4>
                      <p className="text-[10px] text-slate-400">Click a card to speak and display its correct stroke sequence.</p>
                    </div>

                    <input
                      type="text"
                      placeholder="Search HSK characters / Pinyin / English..."
                      value={hskStrokeSearch}
                      onChange={(e) => setHskStrokeSearch(e.target.value)}
                      className="w-full sm:w-64 px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-brand-red outline-none rounded-lg text-xs text-slate-900"
                    />
                  </div>

                  {/* Word grid list */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                    {matchedWordsList.slice(0, 40).map((word, idx) => {
                      const isSelected = currentStrokeObj.character === word.character;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            const fullDetails = getStrokesForCharacter(word.character, word.pinyin, word.meaning);
                            setSelectedHskStrokeChar(fullDetails);
                            speakMandarin(word.character);
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex flex-col justify-between h-24 ${
                            isSelected
                              ? "bg-brand-light-red border-brand-red text-brand-red"
                              : "bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800"
                          }`}
                        >
                          <div className="flex justify-between items-start w-full">
                            <span className="text-2xl font-black font-sans leading-none">{word.character}</span>
                            <span className="text-[8px] font-mono font-bold bg-white/60 px-1 py-0.5 rounded leading-none">HSK {word.hskLevel}</span>
                          </div>
                          <div>
                            <p className="text-[10px] font-mono leading-none tracking-tight font-semibold truncate max-w-[120px]">{word.pinyin}</p>
                            <p className="text-[9px] text-slate-500 truncate max-w-[120px] mt-0.5">{word.meaning}</p>
                          </div>
                        </button>
                      );
                    })}

                    {matchedWordsList.length === 0 && (
                      <div className="col-span-full py-8 text-center bg-slate-50 border border-dashed rounded-2xl">
                        <p className="text-xs text-slate-500 italic">No exact catalog matches.</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">Press 'Practice Writing' to generate custom stroke simulation anyway!</p>
                        
                        {hskStrokeSearch && (
                          <button
                            onClick={() => {
                              const wordGenerated = getStrokesForCharacter(hskStrokeSearch, hskStrokeSearch, `Searched dynamic query "${hskStrokeSearch}"`);
                              setSelectedHskStrokeChar(wordGenerated);
                              speakMandarin(hskStrokeSearch);
                            }}
                            className="mt-3 py-1.5 px-3 bg-slate-900 text-white rounded-lg text-[10px] font-bold hover:bg-brand-red transition cursor-pointer"
                          >
                            Generate Custom Strokes for "{hskStrokeSearch}"
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stroke directions & strokes tutorial panel */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">The 8 Fundamental Stroke Guides</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {STROKES_TUTORIAL.map((stroke, i) => (
                      <div key={i} className="flex gap-2.5 items-center bg-slate-100/50 p-2 rounded-xl border border-slate-200/40 text-left">
                        <span className="w-7 h-7 rounded bg-white font-sans font-bold text-amber-600 flex items-center justify-center text-sm shadow-xs border">{stroke.symbol}</span>
                        <div className="min-w-0">
                          <p className="font-extrabold text-[10px] text-slate-900 truncate">{stroke.name}</p>
                          <p className="text-[8px] text-slate-400 truncate leading-none mt-0.5">{stroke.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Dynamic Calligraphy Sketchpad (4 Col widths) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* The visual writing stage card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm text-center space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold font-mono tracking-wider text-brand-red bg-brand-light-red border border-brand-light-border px-2 py-0.5 rounded uppercase leading-none">
                      Active Practice Target
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-950 font-sans tracking-tight">Calligraphy Desk</h3>
                  </div>

                  {/* Target metadata info block */}
                  <div className="bg-slate-50 p-3 rounded-2xl border text-left">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-2xl font-black font-sans text-brand-dark leading-none">{currentStrokeObj.character}</span>
                      <span className="text-[9px] font-mono font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded leading-none uppercase">HSK {currentStrokeObj.hskLevel} word</span>
                    </div>

                    <p className="text-xs font-mono font-bold text-slate-705 text-slate-755">{currentStrokeObj.pinyin}</p>
                    <p className="text-[10px] text-slate-500 leading-snug truncated font-light mt-1">{currentStrokeObj.meaning}</p>
                  </div>

                  {/* Calligraphy rice grid canvas */}
                  <div className="flex flex-col items-center gap-3">
                    <canvas
                      ref={canvasRef}
                      width={285}
                      height={285}
                      onMouseDown={startDrawing}
                      onMouseMove={drawCharacter}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      className="border-2 border-orange-200 bg-orange-50/10 rounded-2xl cursor-crosshair max-w-full shadow-inner shadow-orange-100"
                    />

                    {/* Controls Row */}
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={initCanvas}
                        className="flex-1 p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs inline-flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Clear Canvas
                      </button>

                      <button
                        onClick={() => {
                          completeLesson(`stroke-order-finished-${currentStrokeObj.character}`, 30);
                          alert(`🏆 Wonderful writing practice for "${currentStrokeObj.character}"! Awarded 30 XP.`);
                          initCanvas();
                        }}
                        className="flex-1 p-2 bg-brand-red hover:bg-brand-red/95 text-white font-bold rounded-xl text-xs inline-flex items-center justify-center gap-1 transition cursor-pointer shadow-md shadow-brand-red/10"
                      >
                        Verify Writing ✍️
                      </button>
                    </div>
                  </div>
                </div>

                {/* Walkthrough Guidelines */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-3.5 text-left">
                  <div className="space-y-1 border-b border-slate-100 pb-2.5">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Stroke order breakdown</h4>
                    <p className="text-[9px] text-slate-400">Total Stroke counts: <span className="font-semibold text-brand-red">{currentStrokeObj.strokesCount || currentStrokeObj.strokes?.length || "Custom"}</span>. Radical key: {currentStrokeObj.radical || "Unknown"}</p>
                  </div>

                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {currentStrokeObj.strokes && currentStrokeObj.strokes.length > 0 ? (
                      currentStrokeObj.strokes.map((step, idx) => (
                        <div key={idx} className="flex gap-3 items-start text-xs text-slate-700">
                          <span className="w-5 h-5 bg-slate-950 text-white rounded-full flex items-center justify-center font-mono font-bold text-[9px] mt-0.5 shrink-0">{idx + 1}</span>
                          <span className="font-light leading-snug">{step}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">No specific path database registered. Follow top-down, left-to-right stroke principles.</p>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          );
        })()}

        {/* ---------------------------------------------------- */}
        {/* SECTION 3: RADICALS MODULE & MATCHING PUZZLE */}
        {/* ---------------------------------------------------- */}
        {activeTab === "radicals" && (
          <motion.div
            key="radicals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Overview Library list */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4 mr-0">
                <h3 className="text-lg font-bold text-slate-950">Semantic radical Library</h3>
                <p className="text-xs text-slate-500">
                  Radicals represent the categorical category keys. Mastering the top 40 radicals solves 3/4 of comprehension struggles!
                </p>

                <div className="space-y-4">
                  {RADICALS_LIBRARY.map((item, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:shadow-sm transition space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-black text-red-650 font-sans">{item.radical}</span>
                        <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-2.0 py-0.5 rounded uppercase font-bold uppercase">{item.english}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 italic font-light leading-snug">{item.explanation}</p>
                      
                      <div className="pt-2 border-t border-slate-200/50 flex gap-2 flex-wrap items-center">
                        <span className="text-[9px] font-bold text-slate-400 select-none">Examples:</span>
                        {item.examples.map((ex, i) => (
                          <button 
                            key={i} 
                            onClick={() => {
                              speakMandarin(ex.character);
                            }}
                            className="text-xs bg-white hover:bg-brand-light-red border border-slate-250 hover:border-brand-red font-bold px-2.5 py-1 rounded-xl text-slate-800 cursor-pointer transition flex items-center gap-1 group/ex"
                          >
                            <span>{ex.character}</span>
                            <span className="font-mono text-[9px] font-normal text-slate-400">{ex.pinyin}</span>
                            <Volume2 className="w-2.5 h-2.5 text-slate-400 group-hover/ex:text-brand-red inline-block" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Match Game widget */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-950">Semantic Matching Puzzle</h3>
                  <p className="text-xs text-slate-500">
                    Test your radical memory! Tap a Radical on the left, then map it to the English definition card on the right.
                  </p>
                </div>

                <div className="flex justify-between items-center text-xs bg-amber-100/30 p-3.5 border border-amber-200/55 rounded-2xl px-5">
                  <span className="font-mono text-[10px] font-bold text-amber-700 flex items-center gap-1 uppercase">
                    <Sparkles className="w-4 h-4 text-amber-500 fill-current" /> Active Match score: {gameScore} XP points
                  </span>
                  <button
                    onClick={resetRadicalsGame}
                    className="text-xs text-red-600 font-bold hover:underline cursor-pointer"
                  >
                    Reset Board
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-4">
                  
                  {/* Left Column Radicals cards */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-500 text-[10px] uppercase tracking-wider block text-center">Radical Symbol</h4>
                    {RADICALS_LIBRARY.map((item) => {
                      const isMatched = !!radicalMatches[item.radical];
                      return (
                        <button
                          key={item.radical}
                          disabled={isMatched}
                          onClick={() => handleRadicalChoice(item.radical)}
                          className={`w-full py-4 rounded-2xl border font-sans font-bold text-lg transition flex items-center justify-between px-5 cursor-pointer ${
                            isMatched
                              ? "bg-green-55/40 border-green-200 text-green-700 bg-green-50/25"
                              : activeRadical === item.radical
                              ? "border-red-650 bg-red-50 text-red-700 border-red-600"
                              : "border-slate-200 hover:border-slate-350 bg-slate-50 "
                          }`}
                        >
                          <span className="text-xl">{item.radical}</span>
                          <span className="text-[10px] font-normal italic font-mono">{isMatched ? "Matched" : activeRadical === item.radical ? "Ready" : "Aim"}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Column Definitions cards */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-500 text-[10px] uppercase tracking-wider block text-center">Definition Link</h4>
                    {["Person radical", "Water radical", "Woman radical", "Mouth radical"].map((meaningOption) => {
                      // Check if already matching
                      const isMatched = Object.values(radicalMatches).includes(meaningOption);
                      return (
                        <button
                          key={meaningOption}
                          disabled={isMatched}
                          onClick={() => handleRadicalGoalMatch(meaningOption)}
                          className={`w-full py-4 rounded-2xl border font-bold text-xs transition px-4 cursor-pointer min-h-[58px] ${
                            isMatched
                              ? "bg-green-55/40 border-green-200 text-green-700 bg-green-50/25"
                              : "border-slate-250 hover:bg-slate-50 hover:border-slate-400"
                          }`}
                        >
                          <span>{meaningOption}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {gameMessage && (
                  <div className="p-4 bg-slate-100 rounded-2xl border text-center text-xs font-bold text-slate-800">
                    {gameMessage}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SECTION 4: SMART REVISION (SRS FLASHCARDS) */}
        {/* ---------------------------------------------------- */}
        {activeTab === "srs" && (
          <motion.div
            key="srs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-950">Spaced Repetition Review (SRS)</h3>
                  <p className="text-xs text-slate-500">
                    Spacings intervals are automatically generated utilizing cards review ratings (Again/Good/Easy).
                  </p>
                </div>
                <span className="text-xs font-mono font-bold bg-amber-50 text-amber-600 px-2 rounded-xl py-1 border border-amber-200/50">
                  {dueSrsCards.length} Dued Review
                </span>
              </div>

              {dueSrsCards.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-green-550 mx-auto text-green-500" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-base">Perfect review schedule!</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      All your target vocabulary characters have been reviewed. New revisions generate automatically over time.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Active Card Body - Flip support */}
                  <div className="perspective-1000">
                    <motion.div
                      onClick={() => {
                        setIsFlipped(!isFlipped);
                        speakMandarin(dueSrsCards[currentSrsIndex]?.character);
                      }}
                      className={`relative min-h-[220px] rounded-3xl p-8 cursor-pointer flex flex-col justify-between overflow-hidden touch-none border shadow-md ${
                        isFlipped 
                          ? "bg-slate-900 text-white border-slate-800" 
                          : "bg-gradient-to-tr from-amber-50/40 via-white to-red-50/20 border-amber-200 text-slate-950"
                      }`}
                      whileHover={{ scale: 1.01 }}
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* absolute top level code */}
                      <div className="flex justify-between items-center text-[10px] font-mono tracking-widest uppercase">
                        <span>Card {currentSrsIndex + 1} of {dueSrsCards.length}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              speakMandarin(dueSrsCards[currentSrsIndex]?.character);
                            }}
                            className="bg-brand-red/15 hover:bg-brand-red/35 text-brand-red p-1 rounded transition"
                            title="Pronounce Chinese character"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                          <span className="text-amber-500 font-bold">HSK {dueSrsCards[currentSrsIndex]?.hskLevel}</span>
                        </div>
                      </div>

                      {/* Content center */}
                      <div className="text-center my-auto space-y-4 py-6">
                        {!isFlipped ? (
                          <div className="space-y-2">
                            <p className="text-6xl font-black text-slate-950 font-sans tracking-tight">
                              {dueSrsCards[currentSrsIndex]?.character}
                            </p>
                            <p className="text-xs text-slate-400 italic">Click card to reveal translation</p>
                          </div>
                        ) : (
                          <div className="space-y-2 rotate-y-180">
                            <p className="text-2xl font-bold font-mono text-amber-400">{dueSrsCards[currentSrsIndex]?.pinyin}</p>
                            <p className="text-lg font-bold text-white">{dueSrsCards[currentSrsIndex]?.meaning}</p>
                            
                            <div className="pt-4 border-t border-slate-800 space-y-1 text-left max-w-sm mx-auto">
                              <div className="flex justify-between items-center">
                                <p className="text-[10px] text-slate-400 font-mono italic">Context Example:</p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    speakMandarin(dueSrsCards[currentSrsIndex]?.exampleSentence);
                                  }}
                                  className="p-1 bg-white/5 hover:bg-white/10 rounded text-amber-400 transition"
                                  title="Pronounce context sentence"
                                >
                                  <Volume2 className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="text-xs text-white font-bold">{dueSrsCards[currentSrsIndex]?.exampleSentence}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{dueSrsCards[currentSrsIndex]?.exampleSentencePy}</p>
                              <p className="text-[10px] text-amber-200/80 font-light">{dueSrsCards[currentSrsIndex]?.exampleSentenceEn}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="text-center text-[10px] uppercase font-mono font-bold tracking-wider opacity-60">
                        {isFlipped ? "Tap relative back representation" : "Tap center to show translation"}
                      </div>
                    </motion.div>
                  </div>

                  {/* Rating response buttons */}
                  {isFlipped && (
                    <div className="grid grid-cols-3 gap-4 pt-3">
                      <button
                        onClick={() => {
                          recordSrsReview(dueSrsCards[currentSrsIndex].id, "again");
                          setIsFlipped(false);
                        }}
                        className="p-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Again (Hard)
                        <span className="block text-[9px] font-normal text-red-500 uppercase font-mono mt-0.5 mt-1 leading-none">Repeat tomorrow</span>
                      </button>

                      <button
                        onClick={() => {
                          recordSrsReview(dueSrsCards[currentSrsIndex].id, "good");
                          setIsFlipped(false);
                          if (currentSrsIndex + 1 < dueSrsCards.length) setCurrentSrsIndex((prev) => prev + 1);
                        }}
                        className="p-3 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Good (Okay)
                        <span className="block text-[9px] font-normal text-slate-450 uppercase font-mono mt-0.5 mt-1 leading-none">Due in 3 days</span>
                      </button>

                      <button
                        onClick={() => {
                          recordSrsReview(dueSrsCards[currentSrsIndex].id, "easy");
                          setIsFlipped(false);
                          if (currentSrsIndex + 1 < dueSrsCards.length) setCurrentSrsIndex((prev) => prev + 1);
                        }}
                        className="p-3 bg-green-50 hover:bg-green-105 border border-green-200 hover:bg-green-100 text-green-800 font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Easy (Great)
                        <span className="block text-[9px] font-normal text-green-500 uppercase font-mono mt-0.5 mt-1 leading-none">Due in 7 days</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SECTION 5: HSK VOCABULARY ROADMAP & QUIZZES */}
        {/* ---------------------------------------------------- */}
        {activeTab === "hsk" && (
          <motion.div
            key="hsk"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left side level filters & list */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-6">
                
                <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-xl font-bold text-slate-950">HSK Vocabulary Lessons</h3>
                    <p className="text-xs text-slate-500">
                      Standard HSK curriculum structures. Learn character combinations, meanings, and practical grammar syntax.
                    </p>
                  </div>

                  {/* Level select */}
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    {[1, 2, 3, 4].map((level) => (
                      <button
                        key={level}
                        onClick={() => {
                          setHskFilter(level);
                          setQuizActive(false);
                        }}
                        className={`p-2 px-3.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          hskFilter === level
                            ? "bg-slate-900 text-white"
                            : "text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        HSK {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vocabulary Items row matching the selected level */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {HSK_VOCABULARY.filter((vocab) => vocab.hskLevel === hskFilter).map((item, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-100/80 rounded-2xl hover:shadow-sm transition space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-2xl font-bold text-slate-950 font-sans tracking-tight">{item.character}</p>
                          <p className="text-xs font-mono font-bold text-amber-600 font-semibold">{item.pinyin}</p>
                        </div>
                        <button
                          onClick={() => speakMandarin(item.character)}
                          className="p-1.5 bg-white border border-slate-200 text-slate-700 hover:text-red-650 hover:border-red-200 rounded-xl transition cursor-pointer"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">English Definition:</span>
                        <p className="text-xs text-slate-800 font-bold leading-normal">{item.meaning}</p>
                      </div>

                      <div className="border-t border-slate-200 pt-3 space-y-2 text-left">
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">Sentence Example:</span>
                        {item.examples.map((ex, i) => (
                          <div key={i} className="text-xs space-y-0.5 group/sentence border-b border-dashed border-slate-100 last:border-0 pb-1 mt-1">
                            <div className="flex justify-between items-start gap-1">
                              <p 
                                className="font-bold text-slate-900 group-hover/sentence:text-brand-red cursor-pointer transition"
                                onClick={() => speakMandarin(ex.cn)}
                              >
                                {ex.cn}
                              </p>
                              <button 
                                onClick={() => speakMandarin(ex.cn)}
                                className="opacity-0 group-hover/sentence:opacity-100 p-0.5 bg-slate-100 hover:bg-slate-250 rounded text-slate-500 transition"
                                title="Hear example speech"
                              >
                                <Volume2 className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-500 font-mono italic">{ex.py}</p>
                            <p className="text-[10px] text-slate-400 leading-tight">{ex.en}</p>
                          </div>
                        ))}
                      </div>

                      {/* Add directly to smart revision card decks */}
                      <button
                        onClick={() => {
                          completeLesson(`hsk-save-vocab-${item.character}`, 10);
                          toggleSaveVocabulary(item.character);
                          alert(`Successfully added \"${item.character}\" into your target review deck!`);
                        }}
                        className="w-full text-center py-2 border border-dashed border-red-200 hover:bg-white text-red-700 font-bold rounded-xl text-[10px] tracking-wide transition cursor-pointer"
                      >
                        Add to SRS Spacing Flashcards
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side lessons quiz panel */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4 text-center">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-950">HSK Level {hskFilter} Grading Quiz</h3>
                <p className="text-xs text-slate-500 text-light max-w-xs mx-auto">
                  Complete standard character multiple-choice puzzles to claim certificates and receive XP rewards.
                </p>

                {!quizActive ? (
                  <button
                    id="btn-start-vocabulary-quiz"
                    onClick={() => {
                      setQuizActive(true);
                      setQuizStep(0);
                      setQuizScore(0);
                    }}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Start Vocabulary Grading Quiz
                  </button>
                ) : (
                  <div className="space-y-4 text-left border-t border-slate-100 pt-4">
                    <p className="text-[10px] font-mono text-amber-600 font-bold uppercase">Question {quizStep + 1} / 3</p>
                    <p className="font-bold text-slate-900 text-sm leading-normal">{mockQuizQuestions[quizStep].q}</p>
                    
                    <div className="space-y-2 pt-2">
                      {mockQuizQuestions[quizStep].options.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleAnswerQuiz(option)}
                          disabled={quizSelectedAnswer !== null}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition font-semibold block cursor-pointer ${
                            quizSelectedAnswer === option
                              ? option === mockQuizQuestions[quizStep].answer
                                ? "bg-green-50 border-green-500 text-green-800"
                                : "bg-red-50 border-red-500 text-red-800"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>

                    {quizSelectedAnswer !== null && (
                      <button
                        onClick={handleNextQuizStep}
                        className="w-full text-center py-2.5 bg-slate-900 text-white font-semibold rounded-xl text-xs mt-3 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Next Question
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SECTION 6: DAILY READING PRACTICE (Pinyin/Translate Toggle) */}
        {/* ---------------------------------------------------- */}
        {activeTab === "reading" && (
          <motion.div
            key="reading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Reading Board */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-6">
                
                {/* Header toggles */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded tracking-wide uppercase">Daily Challenge</span>
                    <h3 className="text-xl font-bold text-slate-950 mt-1">A Chinese friend's study plans</h3>
                  </div>

                  {/* Dual-toggle checkboxes */}
                  <div className="flex gap-4 items-center">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs">
                      <input 
                        type="checkbox" 
                        checked={showPinyinText} 
                        onChange={(e) => setShowPinyinText(e.target.checked)}
                        className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="font-semibold text-slate-700">Show Pinyin</span>
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs">
                      <input 
                        type="checkbox" 
                        checked={showTranslationText} 
                        onChange={(e) => setShowTranslationText(e.target.checked)}
                        className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="font-semibold text-slate-700">Show Translation</span>
                    </label>
                  </div>
                </div>

                {/* Chinese text block, displaying customized character layout */}
                <div className="bg-orange-50/10 border-2 border-orange-100 p-8 rounded-3xl space-y-8 relative overflow-hidden">
                  <span className="absolute top-1.5 right-2 font-mono text-[9px] uppercase tracking-widest text-orange-400">Word-Tap Dictionary System</span>
                  
                  {/* Words rendering */}
                  <div className="flex flex-wrap gap-x-5 gap-y-8 items-end leading-loose justify-center md:justify-start">
                    {readingParagraph.words.map((word, i) => {
                      if (!word.cn.trim()) return null;
                      return (
                        <div 
                          key={i} 
                          onClick={() => {
                            if (word.cn === "，" || word.cn === "。") return;
                            setTappedWord(word);
                            speakMandarin(word.cn);
                          }}
                          className="flex flex-col items-center group cursor-pointer"
                        >
                          {/* Pinyin layer */}
                          {showPinyinText && (
                            <span className="text-[11px] font-mono font-medium text-amber-700 leading-none mb-1.5 select-none h-4">
                              {word.py}
                            </span>
                          )}

                          {/* Character layer */}
                          <button className="text-3xl font-extrabold text-slate-950 hover:text-red-600 hover:scale-110 active:scale-95 transition font-sans border-b-2 border-slate-100 hover:border-red-400/80 pb-0.5">
                            {word.cn}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* English Translation Overlay */}
                  {showTranslationText && (
                    <motion.div 
                      className="pt-6 border-t border-slate-200 mt-6 space-y-1.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">English Translation:</span>
                      <p className="text-sm font-light leading-relaxed text-slate-600 italic">
                        "{readingParagraph.englishTranslation}"
                      </p>
                    </motion.div>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 italic">Tip: Tap on any individual word to listen to raw pronunciation and read matching definitions.</span>
                  <button
                    onClick={() => {
                      completeLesson("reading-daily-finished", 25);
                      alert("Daily reading checked! Completed and awarded 25 XP.");
                    }}
                    className="p-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition"
                  >
                    Complete Reading Task
                  </button>
                </div>
              </div>
            </div>

            {/* tapped word details popover */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-950 text-base flex items-center gap-2">
                  <Smile className="w-5 h-5 text-amber-500" />
                  Word-Tap Dictionary
                </h4>

                {!tappedWord ? (
                  <div className="text-center py-10 text-xs text-slate-400 italic border border-dashed rounded-2xl bg-slate-50/50">
                    Tap any character word inside the story to open real-time definitions.
                  </div>
                ) : (
                  <motion.div 
                    className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-center relative"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                  >
                    <button 
                      onClick={() => setTappedWord(null)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-slate-800 text-xs font-bold font-mono"
                    >
                      ✕
                    </button>

                    <div className="space-y-1.5">
                      <button
                        onClick={() => speakMandarin(tappedWord.cn)}
                        className="mx-auto p-1.5 bg-brand-light-red hover:bg-brand-light-red/90 text-brand-red rounded-lg transition mb-1.5 text-[10px] font-black flex items-center gap-1 hover:scale-105"
                        title="Vocalize Mandarin word pronunciation"
                      >
                        <Volume2 className="w-3.5 h-3.5 animate-pulse" /> Play Audio
                      </button>
                      <p className="text-5xl font-black text-slate-950 font-sans">{tappedWord.cn}</p>
                      <p className="text-sm font-mono font-medium text-amber-700">{tappedWord.py}</p>
                    </div>

                    <div className="bg-white p-3.5 border border-slate-100 rounded-xl text-left space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Meaning Definition:</span>
                      <p className="text-xs text-slate-800 font-bold leading-normal">{tappedWord.en}</p>
                    </div>

                    <button
                      onClick={() => toggleSaveVocabulary(tappedWord.cn)}
                      className="w-full py-2 bg-red-600 hover:bg-red-750 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition cursor-pointer"
                    >
                      {userProgress.savedVocabulary.includes(tappedWord.cn) ? "✓ Delete from Saved Vocabulary" : "+ Bookmarks to My dictionary"}
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
