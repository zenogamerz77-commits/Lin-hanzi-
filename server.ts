import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK Server-Side (Never expose API key to client)
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("⚠️ Warning: GEMINI_API_KEY environment variable is not defined. AI features will fallback gracefully.");
}

// ----------------------------------------------------
// server-side api routes first
// ----------------------------------------------------

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", aiEnabled: !!ai });
});

// Dictionary Lookups: Parse English/Chinese terms with Gemini intelligence
app.post("/api/gemini/dictionary", async (req, res) => {
  const { query } = req.body;
  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  if (!ai) {
    // Elegant fallback simulation
    return res.json({
      character: query,
      pinyin: "yào fāng (simulated)",
      meaning: `Translation of: "${query}" (Please configure your Gemini API Key in Settings > Secrets for accurate online dictionary search)`,
      hskLevel: 1,
      examples: [
        { cn: "我喜欢学中文。", py: "Wǒ xǐhuān xué Zhōngwén.", en: "I like learning Chinese." }
      ]
    });
  }

  try {
    const prompt = `Lookup the Chinese or English word "${query}". Provide:
    1. The exact Chinese simplified character representation (it can be multiple characters or words).
    2. Correct Pinyin with tone markers.
    3. Precise English meaning definitions.
    4. Suggested HSK difficulty level (integer between 1 and 6).
    5. Two clear, natural Chinese-English example sentences incorporating the word with Hanzi, Pinyin, and English translations.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional Chinese-English lexicographer. Give translation analysis strictly matching the requested JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            character: { type: Type.STRING, description: "Chinese simplified character(s)" },
            pinyin: { type: Type.STRING, description: "Pinyin representation with accent/tone marks" },
            meaning: { type: Type.STRING, description: "English translation definitions" },
            hskLevel: { type: Type.INTEGER, description: "HSK level estimate 1-6" },
            examples: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  cn: { type: Type.STRING, description: "Chinese Hanzi sentence" },
                  py: { type: Type.STRING, description: "Sentence Pinyin" },
                  en: { type: Type.STRING, description: "Sentence English translation" }
                },
                required: ["cn", "py", "en"]
              }
            }
          },
          required: ["character", "pinyin", "meaning", "hskLevel", "examples"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error) {
    console.error("Gemini dictionary search failed: ", error);
    res.status(500).json({ error: "AI search failed", details: String(error) });
  }
});

// Mandarin Speaking Tutor AI Chatbot
app.post("/api/gemini/chat", async (req, res) => {
  const { messages } = req.body; // Array of { role: 'user' | 'model', content: string }
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Conversational history array required" });
  }

  if (!ai) {
    return res.json({
      reply: "Hi! I am the HanziVerse speaking tutor. It seems your Gemini API key is not connected, but I am here in spirit! Let's practice saying 'Nǐ hǎo' (Hello) together."
    });
  }

  try {
    // Map client messages to Gemini contents structure
    const formattedContents = messages.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: `You are 'Master Chen', an encouraging, humorous, and highly qualified Mandarin Chinese language tutor.
        Help the user learn Chinese characters, Pinyin, grammar, and pronunciation.
        Keep your sentences short, simple, and friendly.
        Always include the Chinese characters, followed immediately by Pinyin in parentheses, and the English translation.
        Example format: 很好！(hěn hǎo! - Very good!)
        Encourage them to reply in Chinese or ask questions.`,
      }
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error("Gemini tutor chat failed: ", error);
    res.status(500).json({ error: "AI chat failed", details: String(error) });
  }
});

// lin AI talking tutor route
app.post("/api/gemini/lin", async (req, res) => {
  const { messages, scenario } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Conversational history array required" });
  }

  if (!ai) {
    return res.json({
      reply: "Hello! 我叫 Lin (Wǒ jiào Lin - I'm Lin)! It looks like your Gemini API key is not connected yet, so I am running offline! Don't worry, once you put your key in Settings, I'll be able to scold you in full real-time Chinese for your spelling mistakes!",
      isScolded: false
    });
  }

  try {
    const formattedContents = messages.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: `You are Lin (林), an interactive, super friendly, cute, and lively 22-year-old Mandarin Chinese language coach from Chengdu, Sichuan.
        You behave similarly to 'Sakura AI' but teach Chinese with English explanations.
        - TONALITY: You are sweet, energetic, supportive, and love using emojis (🌸, 💝, 🥰).
        - THE SCOLD RULE: If the user makes ANY grammatical mistakes, spelling errors, poor tone practices, wrong translations, or sounds awkward/impolite, you MUST immediately switch into a dramatic, funny 'loud older sister' or 'stern parent' who passionately scolds them in humorous drama-filled Chinese (e.g. using '哎呀！- Āiyā!', '笨蛋！- bèndàn!', '不对不对！- bù duì bù duì!'), lectures them with exaggerated shock, corrects the error with precise Hanzi-Pinyin-English translations, and then returns to being cheerful and supportive!
        - MESSAGE STRUCTURE: You must always structure your replies so that any Chinese characters you say are immediately followed by their Pinyin representation with tones in parentheses, and the English translation.
        Example format: 很好！(hěn hǎo! - Very good!)
        - RESPONSE SCHEMA: You must return a JSON object with two fields:
          1. "reply": Your spoken tutorial text message.
          2. "isScolded": A boolean flag indicating whether you scolded the user because of a mistake/awkward formulation. Set this to true ONLY if you had to correct a mistake, otherwise set to false.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING, description: "Your spoken Lin reply string in Chinese characters, followed immediately by Pinyin in parentheses and English translations." },
            isScolded: { type: Type.BOOLEAN, description: "True if the user made a mistake and you scolded them, otherwise false." }
          },
          required: ["reply", "isScolded"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error) {
    console.error("Gemini Lin chatter failed: ", error);
    res.status(500).json({ error: "AI companion failed", details: String(error) });
  }
});

// Premium Single-Speaker Text-to-Speech (TTS) using standard Gemini Audio Modality
app.post("/api/tts", async (req, res) => {
  const { text, voice = "Kore" } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Text field is required" });
  }

  if (!ai) {
    return res.status(400).json({ error: "AI TTS engine offline due to missing Gemini API key" });
  }

  try {
    const prompt = `Say clearly in standard Mandarin Chinese pronounciation with perfect tone accuracy: ${text}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice } // Korea, Puck, Zephyr, etc.
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({ audio: base64Audio });
    } else {
      res.status(500).json({ error: "No audio stream returned from Gemini engine" });
    }
  } catch (error) {
    console.error("Gemini TTS pronunciation failed: ", error);
    res.status(500).json({ error: "AI Pronunciation failure", details: String(error) });
  }
});

// ----------------------------------------------------
// UI integration: serve static assets or dev middleware
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 HanziVerse Full-stack engine running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
