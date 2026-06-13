import {
  PinyinSyllable,
  StrokeCharacter,
  RadicalItem,
  VocabularyItem,
  BookItem,
  DramaItem,
  ForumPost,
} from "../types";

export const PINYIN_CHART_INITIALS = [
  "b", "p", "m", "f",
  "d", "t", "n", "l",
  "g", "k", "h",
  "j", "q", "x",
  "zh", "ch", "sh", "r",
  "z", "c", "s",
  "y", "w"
];

export const PINYIN_CHART_FINALS = [
  "a", "o", "e", "i", "u", "ü",
  "ai", "ei", "ui", "ao", "ou", "iu",
  "ie", "üe", "er", "an", "en", "in", "un"
];

export const PINYIN_SYLLABLES: PinyinSyllable[] = [
  {
    syllable: "ma",
    initial: "m",
    final: "a",
    tones: ["mā (Mother)", "má (Hemp)", "mǎ (Horse)", "mà (Scold)"],
    examples: [
      { character: "妈", pinyin: "mā", meaning: "Mother / Mom" },
      { character: "麻", pinyin: "má", meaning: "Hemp / Numb" },
      { character: "马", pinyin: "mǎ", meaning: "Horse" },
      { character: "骂", pinyin: "mà", meaning: "Scold / Abuse" },
    ],
  },
  {
    syllable: "ba",
    initial: "b",
    final: "a",
    tones: ["bā (Eight)", "bá (Pull up)", "bǎ (Handle / Target)", "bà (Dad)"],
    examples: [
      { character: "八", pinyin: "bā", meaning: "Eight" },
      { character: "拔", pinyin: "bá", meaning: "Pull out /拔" },
      { character: "把", pinyin: "bǎ", meaning: "Bunch / Particle to hold" },
      { character: "爸", pinyin: "bà", meaning: "Father / Dad" },
    ],
  },
  {
    syllable: "han",
    initial: "h",
    final: "an",
    tones: ["hān (Snore)", "hán (Cold / Dynasty)", "hǎn (Rare)", "hàn (Sweat / Chinese)"],
    examples: [
      { character: "鼾", pinyin: "hān", meaning: "Snore" },
      { character: "韩", pinyin: "hán", meaning: "Korea / Dynasty" },
      { character: "罕", pinyin: "hǎn", meaning: "Rare" },
      { character: "汉", pinyin: "hàn", meaning: "Chinese / Han ethnicity" },
    ],
  },
  {
    syllable: "yi",
    initial: "y",
    final: "i",
    tones: ["yī (One)", "yí (Move)", "yǐ (Chair / Already)", "yì (Art / Easy)"],
    examples: [
      { character: "一", pinyin: "yī", meaning: "One" },
      { character: "移", pinyin: "yí", meaning: "Move / Shift" },
      { character: "已", pinyin: "yǐ", meaning: "Already" },
      { character: "意", pinyin: "yì", meaning: "Meaning / Idea" },
    ],
  },
];

export const STROKES_TUTORIAL = [
  { name: "横 (héng)", desc: "Horizontal stroke, written left to right", symbol: "一" },
  { name: "竖 (shù)", desc: "Vertical stroke, written top to bottom", symbol: "丨" },
  { name: "撇 (piě)", desc: "Downward left-curving stroke", symbol: "丿" },
  { name: "捺 (nà)", desc: "Downward right-expanding stroke", symbol: "丶" },
  { name: "点 (diǎn)", desc: "A tiny dot pressed top-left to bottom-right", symbol: "丶" },
  { name: "折 (zhé)", desc: "Turning stroke, horizontal then vertical", symbol: "𠃍" },
  { name: "提 (tí)", desc: "Flicking stroke, bottom-left to top-right", symbol: "㇀" },
  { name: "钩 (gōu)", desc: "Hook stroke, appended onto others", symbol: "亅" }
];

export const STROKE_CHARACTERS: StrokeCharacter[] = [
  {
    character: "永",
    pinyin: "yǒng",
    meaning: "Forever / Eternity",
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
  },
  {
    character: "人",
    pinyin: "rén",
    meaning: "Person / Human",
    strokes: [
      "撇 (piě) - Curve from top-middle to bottom-left",
      "捺 (nà) - Slant from upper trunk to bottom-right"
    ],
    strokesCount: 2,
    radical: "人 (rén)"
  },
  {
    character: "口",
    pinyin: "kǒu",
    meaning: "Mouth / Opening",
    strokes: [
      "竖 (shù) - Left vertical wall",
      "横折 (héng-zhé) - Top ceiling and right wall",
      "横 (héng) - Bottom closing floor"
    ],
    strokesCount: 3,
    radical: "口 (kǒu)"
  },
  {
    character: "木",
    pinyin: "mù",
    meaning: "Wood / Tree",
    strokes: [
      "横 (héng) - Horizontal beam",
      "竖 (shù) - Vertical trunk down the middle",
      "撇 (piě) - Left branch diagonal",
      "捺 (nà) - Right branch diagonal"
    ],
    strokesCount: 4,
    radical: "木 (mù)"
  }
];

export const RADICALS_LIBRARY: RadicalItem[] = [
  {
    radical: "亻 (人)",
    pinyin: "rén",
    english: "Person radical",
    explanation: "Characters containing this radical are usually related to people, personhood, behaviors, or roles.",
    examples: [
      { character: "你", pinyin: "nǐ", meaning: "You" },
      { character: "他", pinyin: "tā", meaning: "He / Him" },
      { character: "们", pinyin: "men", meaning: "Pluralizer (we/they)" },
    ],
  },
  {
    radical: "氵 (水)",
    pinyin: "shuǐ",
    english: "Water radical",
    explanation: "Usually stands on the left side. Relates to water, rivers, liquids, oceans, and washing.",
    examples: [
      { character: "江", pinyin: "jiāng", meaning: "River" },
      { character: "海", pinyin: "hǎi", meaning: "Sea / Ocean" },
      { character: "洗", pinyin: "xǐ", meaning: "To wash" },
    ],
  },
  {
    radical: "女",
    pinyin: "nǚ",
    english: "Woman radical",
    explanation: "Represents woman, femininity, relatives, or names historically corresponding to women.",
    examples: [
      { character: "妈", pinyin: "mā", meaning: "Mother / Mom" },
      { character: "她", pinyin: "tā", meaning: "She / Her" },
      { character: "姐", pinyin: "jiě", meaning: "Older sister" },
    ],
  },
  {
    radical: "口",
    pinyin: "kǒu",
    english: "Mouth radical",
    explanation: "Associated with mouth activities (eating, speaking, singing) or represent a hollow opening.",
    examples: [
      { character: "吃", pinyin: "chī", meaning: "To eat" },
      { character: "唱", pinyin: "chàng", meaning: "To sing" },
      { character: "问", pinyin: "wèn", meaning: "To ask" },
    ],
  },
];

export const HSK_VOCABULARY: VocabularyItem[] = [
  // HSK 1
  {
    character: "你好",
    pinyin: "nǐ hǎo",
    meaning: "Hello / Hi",
    hskLevel: 1,
    examples: [
      { cn: "你好！很高兴认识你。", py: "Nǐ hǎo! Hěn gāoxìng rènshí nǐ.", en: "Hello! Nice to meet you." },
    ],
  },
  {
    character: "谢谢",
    pinyin: "xièxie",
    meaning: "Thank you / Thanks",
    hskLevel: 1,
    examples: [
      { cn: "谢谢你的帮助。", py: "Xièxie nǐ de bāngzhù.", en: "Thank you for your help." },
    ],
  },
  {
    character: "中国",
    pinyin: "Zhōngguó",
    meaning: "China",
    hskLevel: 1,
    examples: [
      { cn: "我是中国人。", py: "Wǒ shì Zhōngguó rén.", en: "I am Chinese." },
    ],
  },
  // HSK 2
  {
    character: "咖啡",
    pinyin: "kāfēi",
    meaning: "Coffee",
    hskLevel: 2,
    examples: [
      { cn: "你喜欢喝咖啡吗？", py: "Nǐ xǐhuān hē kāfēi ma?", en: "Do you like drinking coffee?" },
    ],
  },
  {
    character: "汉语",
    pinyin: "Hànyǔ",
    meaning: "Chinese language (Mandarin)",
    hskLevel: 2,
    examples: [
      { cn: "我的汉语每天都在进步。", py: "Wǒ de Hànyǔ měitiān dōu zài jìnbù.", en: "My Chinese is improving every day." },
    ],
  },
  // HSK 3
  {
    character: "简单",
    pinyin: "jiǎndān",
    meaning: "Simple / Easy",
    hskLevel: 3,
    examples: [
      { cn: "这个问题其实很简单。", py: "Zhège wèntí qíshí hěn jiǎndān.", en: "This question is actually very simple." },
    ],
  },
  {
    character: "打算",
    pinyin: "dǎsuàn",
    meaning: "To plan / Plan",
    hskLevel: 3,
    examples: [
      { cn: "你暑假有什么打算？", py: "Nǐ shǔjià yǒu shénme dǎsuàn?", en: "What are your plans for summer vacation?" },
    ],
  },
  // HSK 4
  {
    character: "积极",
    pinyin: "jījí",
    meaning: "Active / Positive / Energetic",
    hskLevel: 4,
    examples: [
      { cn: "我们应该采取积极的态度。", py: "Wǒmen yīnggāi cǎiqǔ jījí de tàidù.", en: "We should adopt a positive attitude." },
    ],
  },
];

export const WATCH_READ_LIBRARY: BookItem[] = [
  {
    id: "book-1",
    title: "My Cozy Family",
    cover: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=300&q=80",
    hskLevel: 1,
    category: "story",
    author: "Li Wei",
    description: "An easy HSK 1 story introduce immediate relationships, pets, and greetings with simple vocabulary.",
    pages: [
      { cn: "我家有三口人：爸爸、妈妈和我。", py: "Wǒ jiā yǒu sān kǒu rén: bàba, māma hé wǒ.", en: "My family has three people: dad, mom, and me." },
      { cn: "我们喜欢在星期天看电视。", py: "Wǒmen xǐhuān zài xīngqītiān kàn diànshì.", en: "We like to watch TV on Sundays." },
      { cn: "我有一只可爱的小猫，它叫毛毛。", py: "Wǒ yǒu yī zhī kě'ài de xiǎomāo, tā jiào Máomáo.", en: "I have a cute kitty named Maomao." },
    ],
  },
  {
    id: "book-2",
    title: "The Monkey King's Trick",
    cover: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80",
    hskLevel: 2,
    category: "comic",
    author: "Classic Adaptations",
    description: "Learn Mandarin characters and actions with the funny Monkey King as he eats the peach of immortality.",
    pages: [
      { cn: "孙悟空看见了仙桃，心里很高兴。", py: "Sūn Wùkōng kànjiàn le xiāntáo, xīnlǐ hěn gāoxìng.", en: "Sun Wukong saw the peaches of immortality, and his heart leaped with joy." },
      { cn: "他说：‘我要把所有的仙桃都吃掉！’", py: "Tā shuō: 'Wǒ yào bǎ suǒyǒu de xiāntáo dōu chī diào!'", en: "He said: 'I'm going to eat every single peach of immortality!'" },
      { cn: "于是，他一口气吃了十个大桃子。", py: "Yúshì, tā yī kǒuqì chī le shí gè dà táozi.", en: "So, he ate ten big peaches in one breath!" },
    ],
  },
  {
    id: "book-3",
    title: "A Tea Cup Confession",
    cover: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=300&q=80",
    hskLevel: 3,
    category: "short",
    author: "Xiao Qing",
    description: "A touching urban romance vignette set in modern Chengdu tea culture suited for HSK 3 and upwards.",
    pages: [
      { cn: "我们在绿茶馆遇到了对方。", py: "Wǒmen zài lǜ chág uǎn yù dào le duìfāng.", en: "We crossed paths with each other in the green teahouse." },
      { cn: "她点了一杯竹叶青，笑得很甜。", py: "Tā diǎn le yī bēi zhúyèqīng, xiào de hěn tián.", en: "She ordered a cup of Zhuyeqing green tea and smiled sweetly." },
      { cn: "这一刻，我决定要和她做一辈子的朋友。", py: "Zhè yīkè, wǒ juédìng yào hé tā zuò yī bèizi de péngyǒu.", en: "At this exact moment, I decided to be friends with her for a lifetime." },
    ],
  },
];

export const DRAMA_LIST: DramaItem[] = [
  {
    id: "drama-1",
    title: "Go Ahead (以家人之名)",
    cover: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=300&q=80",
    hskLevel: 2,
    category: "Romance",
    vikiEmbedUrl: "https://www.viki.com/player/viki/1171801v",
    description: "An emotional contemporary family drama following three kids who form an unorthodox family unit.",
    vikiUrl: "https://www.viki.com/tv/36770c-go-ahead",
    scenes: [
      { time: "01:25", cn: "你为什么不吃饭？", py: "Nǐ wèishénme bù chīfàn?", en: "Why aren't you eating your food?" },
      { time: "02:40", cn: "我不饿，我想出去散步。", py: "Wǒ bù è, wǒ xiǎng chūqù sànbù.", en: "I am not hungry, I want to go out for a walk." },
      { time: "04:10", cn: "我们永远都是一家人。", py: "Wǒmen yǒngyuǎn dōu shì yī jiā rén.", en: "We will always and forever be one family." },
    ],
  },
  {
    id: "drama-2",
    title: "General's Lady (将军家的小娘子)",
    cover: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
    hskLevel: 3,
    category: "Historical",
    vikiEmbedUrl: "https://www.viki.com/player/viki/1173995v",
    description: "An adorable historical comedy about an arranged marriage between a noblewoman and a formidable general.",
    vikiUrl: "https://www.viki.com/tv/37278c-generals-lady",
    scenes: [
      { time: "05:10", cn: "拜见将军大人！", py: "Bàijiàn jiāngjūn dàrén!", en: "Greetings, Lord General!" },
      { time: "06:35", cn: "夫人请起，无需多礼。", py: "Fūrén qǐng qǐ, wúxū duō lǐ.", en: "Wife please rise, there is no need for undue formalities." },
    ],
  },
];

export const INITIAL_FORUMS: ForumPost[] = [
  {
    id: "post-1",
    title: "Struggling with the 3rd Tone change rule! Help!",
    author: "WanderlustMandarin",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Wanderlust",
    content: "When two 3rd tones appear together, does the first one always change to a 2nd tone? For instance, in 'nǐ hǎo', is the actual spoken tone sequence 2nd tone + 3rd tone? Or does the spelling change too?",
    category: "Pinyin",
    likes: 8,
    likedBy: [],
    replies: [
      {
        id: "rep-1",
        author: "TutorXian",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Xian",
        content: "Yes! That is exactly correct. When two third tones meet, the first is pronounced as a second tone to preserve breath flow. The Pinyin spelling on paper typically stays 'nǐ hǎo' (retaining the 3rd tone labels), but you speak it like 'ní hǎo'.",
        createdAt: "2026-06-12T10:00:00Z",
      },
    ],
    createdAt: "2026-06-12T09:30:00Z",
  },
  {
    id: "post-2",
    title: "Best shows on Viki to learn conversational Chinese?",
    author: "C_Drama_Queen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Queen",
    content: "I started watching 'Go Ahead' recently. The family dynamics are so warm, and they talk using super practical daily life phrases. Any other great shows on Rakuten Viki that are good for HSK 2 or 3 vocabulary learning?",
    category: "Dramas",
    likes: 12,
    likedBy: [],
    replies: [
      {
        id: "rep-2",
        author: "BeijingAlex",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        content: "I highly recommend 'Meet Yourself'! It is filmed in Yunnan and has gorgeous scenery plus very calm, clean dialogues. Really helpful for slow conversation practice.",
        createdAt: "2026-06-13T01:00:00Z",
      },
    ],
    createdAt: "2026-06-12T23:45:00Z",
  },
];
