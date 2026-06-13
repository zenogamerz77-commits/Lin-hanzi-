import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProgress, ForumPost, FlashcardItem } from "../types";
import { auth, db, handleFirestoreError, OperationType, isUsingMockKeys } from "../lib/firebase";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, User } from "firebase/auth";
import { doc, getDoc, setDoc, collection, onSnapshot, query } from "firebase/firestore";
import { INITIAL_FORUMS } from "../data/mockData";
import { playXpSound, playLevelUpSound } from "../utils/soundEffects";

interface AppContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  userProgress: UserProgress;
  setUserProgress: React.Dispatch<React.SetStateAction<UserProgress>>;
  signInWithGoogle: () => Promise<void>;
  simulateEmailSignIn: (email: string, name: string) => void;
  signOut: () => Promise<void>;
  completeLesson: (lessonId: string, xpEarned?: number) => Promise<void>;
  saveBook: (bookId: string) => Promise<void>;
  addVocabularyToSrs: (character: string, pinyin: string, meaning: string, hskLevel: number) => Promise<void>;
  recordSrsReview: (cardId: string, rating: "again" | "good" | "easy") => Promise<void>;
  completeQuiz: (quizId: string, score: number, xpEarned: number) => Promise<void>;
  toggleSaveVocabulary: (char: string) => Promise<void>;
  srsCards: FlashcardItem[];
  forumPosts: ForumPost[];
  addForumPost: (title: string, category: string, content: string) => Promise<void>;
  addForumReply: (postId: string, content: string) => Promise<void>;
  toggleLikePost: (postId: string) => Promise<void>;
  loading: boolean;
  updateUserGoals: (goals: Partial<UserProgress>) => Promise<void>;
  xpNotification: { xp: number; reason: string } | null;
  clearXpNotification: () => void;
  levelUpLevel: number | null;
  clearLevelUpLevel: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getDefaultProgress = (uid = "guest", email: string | null = null, name: string | null = null): UserProgress => ({
  userId: uid,
  email: email,
  displayName: name || "Learner Journey",
  photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`,
  xp: 15,
  level: 1,
  streak: 2,
  lastActiveDate: new Date().toISOString().split("T")[0],
  streakHistory: [
    new Date(Date.now() - 86400000).toISOString().split("T")[0],
    new Date().toISOString().split("T")[0]
  ],
  completedLessons: ["pinyin-1"],
  savedBooks: ["book-1"],
  watchHistory: ["drama-1"],
  completedQuizzes: {},
  savedVocabulary: ["你好", "谢谢"],
  learningGoal: "medium",
  onboarded: false,
  hskTargetLevel: 1
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<string>("Landing");
  const [user, setUser] = useState<User | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>(getDefaultProgress());
  const [srsCards, setSrsCards] = useState<FlashcardItem[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>(INITIAL_FORUMS);
  const [loading, setLoading] = useState<boolean>(true);

  // New gamified state flags
  const [xpNotification, setXpNotification] = useState<{ xp: number; reason: string } | null>(null);
  const [levelUpLevel, setLevelUpLevel] = useState<number | null>(null);

  const clearXpNotification = () => setXpNotification(null);
  const clearLevelUpLevel = () => setLevelUpLevel(null);

  const setActiveTab = (tab: string) => {
    if (tab === "Drama" || tab === "Dramas") {
      // Viki external immersion redirect
      try {
        window.open("https://www.viki.com", "_blank");
      } catch (e) {
        console.warn("Popup windows blocked by sandboxing.", e);
      }
      try {
        window.top.location.href = "https://www.viki.com";
      } catch (e) {
        window.location.href = "https://www.viki.com";
      }
      return;
    }
    setActiveTabState(tab);
  };

  // Synchronize dynamic lists and states
  useEffect(() => {
    // Load local fallback SRS state
    const savedSrs = localStorage.getItem("hanziverse_srs");
    if (savedSrs) {
      setSrsCards(JSON.parse(savedSrs));
    } else {
      // Seed initial cards
      const initialCards: FlashcardItem[] = [
        {
          id: "srs-1",
          character: "你好",
          pinyin: "nǐ hǎo",
          meaning: "Hello",
          exampleSentence: "王经理，您好！",
          exampleSentencePy: "Wáng jīnglǐ, nín hǎo!",
          exampleSentenceEn: "Greetings Manager Wang!",
          hskLevel: 1,
          nextReviewDate: new Date().toISOString(),
          interval: 1,
          easeFactor: 2.5,
          successCount: 1
        },
        {
          id: "srs-2",
          character: "谢谢",
          pinyin: "xièxie",
          meaning: "Thank you",
          exampleSentence: "谢谢你的帮助。",
          exampleSentencePy: "Xièxie nǐ de bāngzhù.",
          exampleSentenceEn: "Thank you for your assistance.",
          hskLevel: 1,
          nextReviewDate: new Date().toISOString(),
          interval: 1,
          easeFactor: 2.5,
          successCount: 1
        }
      ];
      setSrsCards(initialCards);
      localStorage.setItem("hanziverse_srs", JSON.stringify(initialCards));
    }

    const savedPosts = localStorage.getItem("hanziverse_forums");
    if (savedPosts) {
      setForumPosts(JSON.parse(savedPosts));
    }
  }, []);

  // Save changes to local fallback persistence
  useEffect(() => {
    if (srsCards.length > 0) {
      localStorage.setItem("hanziverse_srs", JSON.stringify(srsCards));
    }
  }, [srsCards]);

  useEffect(() => {
    localStorage.setItem("hanziverse_forums", JSON.stringify(forumPosts));
  }, [forumPosts]);

  // Firebase Auth Observer
  useEffect(() => {
    setLoading(true);
    let unsubscribeForum = () => {};

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await loadUserData(firebaseUser.uid, firebaseUser.email, firebaseUser.displayName);

        // Listen to Firestore Forums in real-time
        if (!isUsingMockKeys) {
          const forumQuery = query(collection(db, "forumPosts"));
          unsubscribeForum = onSnapshot(forumQuery, (snapshot) => {
            const posts: ForumPost[] = [];
            snapshot.forEach((docSnap) => {
              posts.push(docSnap.data() as ForumPost);
            });
            if (posts.length > 0) {
              posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              setForumPosts(posts);
            } else {
              // Seed forum posts to Firestore if empty
              INITIAL_FORUMS.forEach(async (post) => {
                try {
                  await setDoc(doc(db, "forumPosts", post.id), post);
                } catch (err) {
                  // Ignore seeding errors
                }
              });
            }
          }, (error) => {
            handleFirestoreError(error, OperationType.GET, "forumPosts");
          });
        }

        // Direct transition away from landing if they are signed in and onboarded
        setActiveTab("Dashboard");
      } else {
        setUser(null);
        unsubscribeForum();
        // Try local storage guest profile
        const localProg = localStorage.getItem("hanziverse_progress_guest");
        if (localProg) {
          setUserProgress(JSON.parse(localProg));
        } else {
          setUserProgress(getDefaultProgress());
        }
      }
      setLoading(false);
    });
    return () => {
      unsubscribe();
      unsubscribeForum();
    };
  }, []);

  const loadUserData = async (uid: string, email: string | null, name: string | null) => {
    if (isUsingMockKeys) {
      const localProgData = localStorage.getItem(`hanziverse_progress_${uid}`);
      if (localProgData) {
        setUserProgress(JSON.parse(localProgData));
      } else {
        const initial = getDefaultProgress(uid, email, name);
        setUserProgress(initial);
        localStorage.setItem(`hanziverse_progress_${uid}`, JSON.stringify(initial));
      }
      return;
    }

    try {
      const docRef = doc(db, "userProgress", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProgress(docSnap.data() as UserProgress);
      } else {
        const initialProgress = getDefaultProgress(uid, email, name);
        await setDoc(docRef, initialProgress);
        setUserProgress(initialProgress);
      }
    } catch (error) {
      console.warn("Firestore error reading user progress, falling back to localStorage", error);
      // fallback
      const localProgData = localStorage.getItem(`hanziverse_progress_${uid}`);
      if (localProgData) {
        setUserProgress(JSON.parse(localProgData));
      } else {
        const initial = getDefaultProgress(uid, email, name);
        setUserProgress(initial);
        localStorage.setItem(`hanziverse_progress_${uid}`, JSON.stringify(initial));
      }
    }
  };

  const syncProgress = async (newProgress: UserProgress) => {
    setUserProgress(newProgress);
    const uid = newProgress.userId || "guest";
    localStorage.setItem(`hanziverse_progress_${uid}`, JSON.stringify(newProgress));

    if (!isUsingMockKeys && user) {
      try {
        await setDoc(doc(db, "userProgress", user.uid), newProgress);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `userProgress/${user.uid}`);
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Popup Auth failed, using local simulation account instead:", error);
      simulateEmailSignIn("student@hanziverse.com", "Sovereign Learner");
    }
  };

  const simulateEmailSignIn = (email: string, name: string) => {
    const simulatedUid = "simulated_" + Math.random().toString(36).substring(2, 9);
    const simulatedAuthData = {
      uid: simulatedUid,
      email,
      displayName: name,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${simulatedUid}`
    };
    // Update local state guest mock
    const initial = getDefaultProgress(simulatedUid, email, name);
    setUserProgress(initial);
    localStorage.setItem(`hanziverse_progress_${simulatedUid}`, JSON.stringify(initial));
    
    // Set a dummy user to let the UI feel authenticated
    setUser(simulatedAuthData as any);
    setActiveTab("Dashboard");
  };

  const signOut = async () => {
    if (!isUsingMockKeys && user && !user.uid.includes("simulated_")) {
      try {
        await firebaseSignOut(auth);
      } catch (error) {
        console.error("Firebase SignOut error: ", error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setActiveTab("Landing");
    setUserProgress(getDefaultProgress("guest", null, null));
  };

  const completeLesson = async (lessonId: string, xpEarned = 25) => {
    const alreadyCompleted = userProgress.completedLessons.includes(lessonId);
    
    // Calculate streak adjustments
    const todayStr = new Date().toISOString().split("T")[0];
    const newStreakHistory = [...userProgress.streakHistory];
    let newStreak = userProgress.streak;

    if (!newStreakHistory.includes(todayStr)) {
      newStreakHistory.push(todayStr);
      // If active yesterday, increment streak, else reset/keep
      const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      if (newStreakHistory.includes(yesterdayStr) || newStreak === 0) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    const currentXp = userProgress.xp + xpEarned;
    const currentLevel = Math.floor(currentXp / 100) + 1;
    const isLevelUp = currentLevel > userProgress.level;

    if (isLevelUp) {
      playLevelUpSound();
      setLevelUpLevel(currentLevel);
    } else {
      playXpSound();
      // Beautified human-readable description for notification
      const cleanReason = lessonId
        .replace(/-/g, " ")
        .replace("finished", "Completed")
        .replace("finished", "Done")
        .replace("visit", "Action")
        .replace("listen", "Listening")
        .toUpperCase();
      setXpNotification({ xp: xpEarned, reason: `Mastered Drill: ${cleanReason}` });
    }

    const updated = {
      ...userProgress,
      xp: currentXp,
      level: currentLevel,
      completedLessons: alreadyCompleted 
        ? userProgress.completedLessons 
        : [...userProgress.completedLessons, lessonId],
      streak: newStreak,
      streakHistory: newStreakHistory,
      lastActiveDate: todayStr
    };

    await syncProgress(updated);
  };

  const saveBook = async (bookId: string) => {
    const isSaved = userProgress.savedBooks.includes(bookId);
    const updatedBooks = isSaved
      ? userProgress.savedBooks.filter((id) => id !== bookId)
      : [...userProgress.savedBooks, bookId];

    const updated = {
      ...userProgress,
      savedBooks: updatedBooks
    };
    await syncProgress(updated);
  };

  const toggleSaveVocabulary = async (char: string) => {
    const isSaved = userProgress.savedVocabulary.includes(char);
    const updatedVocab = isSaved
      ? userProgress.savedVocabulary.filter((c) => c !== char)
      : [...userProgress.savedVocabulary, char];

    const updated = {
      ...userProgress,
      savedVocabulary: updatedVocab
    };
    await syncProgress(updated);
  };

  const completeQuiz = async (quizId: string, score: number, xpEarned: number) => {
    const updatedQuizzes = { ...userProgress.completedQuizzes, [quizId]: score };
    const currentXp = userProgress.xp + xpEarned;
    const currentLevel = Math.floor(currentXp / 100) + 1;
    const isLevelUp = currentLevel > userProgress.level;

    if (isLevelUp) {
      playLevelUpSound();
      setLevelUpLevel(currentLevel);
    } else {
      playXpSound();
      setXpNotification({ xp: xpEarned, reason: `Quiz Mastered with ${score}%!` });
    }

    const updated = {
      ...userProgress,
      xp: currentXp,
      level: currentLevel,
      completedQuizzes: updatedQuizzes
    };
    await syncProgress(updated);
  };

  // Spaced Repetition (SRS) Methods
  const addVocabularyToSrs = async (character: string, pinyin: string, meaning: string, hskLevel: number) => {
    // Check if duplicate
    const exists = srsCards.some((card) => card.character === character);
    if (exists) return;

    const newCard: FlashcardItem = {
      id: `srs-${Math.random().toString(36).substring(2, 9)}`,
      character,
      pinyin,
      meaning,
      exampleSentence: `我喜欢学：${character}`,
      exampleSentencePy: `Wǒ xǐhuān xué: ${character}`,
      exampleSentenceEn: `I like learning: ${meaning}`,
      hskLevel,
      nextReviewDate: new Date().toISOString(),
      interval: 1,
      easeFactor: 2.5,
      successCount: 0
    };

    setSrsCards((prev) => [...prev, newCard]);
  };

  const recordSrsReview = async (cardId: string, rating: "again" | "good" | "easy") => {
    setSrsCards((prev) =>
      prev.map((card) => {
        if (card.id !== cardId) return card;

        let { interval, easeFactor, successCount } = card;
        if (rating === "again") {
          interval = 1;
          easeFactor = Math.max(1.3, easeFactor - 0.2);
          successCount = 0;
        } else if (rating === "good") {
          successCount += 1;
          interval = successCount === 1 ? 1 : successCount === 2 ? 3 : Math.ceil(interval * easeFactor);
        } else {
          // easy
          successCount += 1;
          easeFactor += 0.15;
          interval = Math.ceil(interval * easeFactor * 1.5);
        }

        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + interval);

        return {
          ...card,
          interval,
          easeFactor,
          successCount,
          nextReviewDate: nextDate.toISOString()
        };
      })
    );

    // Reward XP for reviewing
    const xpReward = 15;
    const currentXp = userProgress.xp + xpReward;
    const currentLevel = Math.floor(currentXp / 100) + 1;
    const isLevelUp = currentLevel > userProgress.level;

    if (isLevelUp) {
      playLevelUpSound();
      setLevelUpLevel(currentLevel);
    } else {
      playXpSound();
      setXpNotification({ xp: xpReward, reason: "Completed Spaced Repetition Review!" });
    }

    await syncProgress({
      ...userProgress,
      xp: currentXp,
      level: currentLevel
    });
  };

  // Forum System
  const addForumPost = async (title: string, category: string, content: string) => {
    const newPost: ForumPost = {
      id: `post-${Math.random().toString(36).substring(2, 9)}`,
      title,
      author: userProgress.displayName || "Sovereign Scholar",
      avatar: userProgress.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProgress.userId}`,
      content,
      category: category as any,
      likes: 0,
      likedBy: [],
      replies: [],
      createdAt: new Date().toISOString()
    };
    setForumPosts((prev) => [newPost, ...prev]);

    if (!isUsingMockKeys && user) {
      try {
        await setDoc(doc(db, "forumPosts", newPost.id), newPost);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `forumPosts/${newPost.id}`);
      }
    }
  };

  const addForumReply = async (postId: string, content: string) => {
    let targetPost: ForumPost | null = null;
    const updatedPosts = forumPosts.map((post) => {
      if (post.id !== postId) return post;
      const newReply = {
        id: `rep-${Math.random().toString(36).substring(2, 9)}`,
        author: userProgress.displayName || "Co-Learner",
        avatar: userProgress.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProgress.userId}`,
        content,
        createdAt: new Date().toISOString()
      };
      targetPost = {
        ...post,
        replies: [...post.replies, newReply]
      };
      return targetPost;
    });

    setForumPosts(updatedPosts);

    if (!isUsingMockKeys && user && targetPost) {
      try {
        await setDoc(doc(db, "forumPosts", postId), targetPost);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `forumPosts/${postId}`);
      }
    }
  };

  const toggleLikePost = async (postId: string) => {
    const uid = userProgress.userId;
    let targetPost: ForumPost | null = null;
    const updatedPosts = forumPosts.map((post) => {
      if (post.id !== postId) return post;
      const exists = post.likedBy.includes(uid);
      let newLikedBy = [...post.likedBy];
      let newLikes = post.likes;

      if (exists) {
        newLikedBy = newLikedBy.filter((id) => id !== uid);
        newLikes = Math.max(0, newLikes - 1);
      } else {
        newLikedBy.push(uid);
        newLikes += 1;
      }

      targetPost = {
        ...post,
        likes: newLikes,
        likedBy: newLikedBy
      };
      return targetPost;
    });

    setForumPosts(updatedPosts);

    if (!isUsingMockKeys && user && targetPost) {
      try {
        await setDoc(doc(db, "forumPosts", postId), targetPost);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `forumPosts/${postId}`);
      }
    }
  };

  const updateUserGoals = async (goals: Partial<UserProgress>) => {
    const updated = {
      ...userProgress,
      ...goals
    };
    await syncProgress(updated);
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        user,
        userProgress,
        setUserProgress,
        signInWithGoogle,
        simulateEmailSignIn,
        signOut,
        completeLesson,
        saveBook,
        addVocabularyToSrs,
        recordSrsReview,
        completeQuiz,
        toggleSaveVocabulary,
        srsCards,
        forumPosts,
        addForumPost,
        addForumReply,
        toggleLikePost,
        loading,
        updateUserGoals,
        xpNotification,
        clearXpNotification,
        levelUpLevel,
        clearLevelUpLevel
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside an AppProvider");
  return context;
};
