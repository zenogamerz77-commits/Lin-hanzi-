/**
 * A highly reliable, responsive web speech synthesis helper for standard Chinese Mandarin (zh-CN) pronunciation.
 * Works seamlessly across both desktop and mobile viewports with rate limiting and automated cancellation to prevent queue overlap.
 */
export const speakMandarin = (text: string) => {
  if (!text) return;
  
  if ("speechSynthesis" in window) {
    try {
      // Cancel any ongoing pronunciation queues to feel snappy and instant
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      
      // Slightly relaxed speed (0.8x) is the industry standard for learning platforms (e.g. Super Chinese/Duolingo)
      utterance.rate = 0.82;
      utterance.pitch = 1.0;
      
      // Auto-identify proper Mandarin voices on the host operating system
      const voices = window.speechSynthesis.getVoices();
      const mandarinVoice = voices.find(
        (voice) => voice.lang.startsWith("zh-") || voice.lang.startsWith("ZH_") || voice.lang.includes("Mandarin")
      );
      if (mandarinVoice) {
        utterance.voice = mandarinVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.warn("Local TTS Vocalizer experienced a speech error:", error);
    }
  } else {
    console.warn("Speech Synthesis API is not fully configured or supported in this host browser frame.");
  }
};
