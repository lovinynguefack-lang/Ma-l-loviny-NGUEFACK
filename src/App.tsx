import React, { useState, useEffect } from "react";
import CourseExplorer from "./components/CourseExplorer";
import AIAssistant from "./components/AIAssistant";
import OCRScanner from "./components/OCRScanner";
import QuizGenerator from "./components/QuizGenerator";
import CollaborativeForum from "./components/CollaborativeForum";
import MonetizationSimulator from "./components/MonetizationSimulator";
import MarketingRoadmap from "./components/MarketingRoadmap";
import PaymentModal from "./components/PaymentModal";
import { ScheduledSession, ToastMessage } from "./types";
import { motion, AnimatePresence } from "motion/react";

import { 
  BookOpen, 
  MessageSquare, 
  Camera, 
  GraduationCap, 
  Users, 
  TrendingUp, 
  Calendar, 
  Wifi, 
  WifiOff, 
  Sparkles, 
  Award,
  Crown,
  Bell,
  BellRing,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

// Web Audio API custom high-quality EdTech chime for reminders
const playChimeSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    // Play warm dual-tone chime
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, now); // C5
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(659.25, now + 0.12); // E5
    gain2.gain.setValueAtTime(0.12, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);
  } catch (e) {
    console.warn("Audio Context error or autoplay blocked", e);
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<"courses" | "chat" | "ocr" | "quiz" | "forum" | "monetization" | "roadmap">("courses");
  const [isOffline, setIsOffline] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  // Offline cached files state
  const [downloadedCourseIds, setDownloadedCourseIds] = useState<string[]>(["c1", "c3"]);
  const [downloadedLibraryIds, setDownloadedLibraryIds] = useState<string[]>(["lib1", "lib4"]);

  // Local notifications & scheduled sessions state
  const [scheduledSessions, setScheduledSessions] = useState<ScheduledSession[]>(() => {
    try {
      const saved = localStorage.getItem("afrilearn_scheduled_sessions");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [forceOpenCourseId, setForceOpenCourseId] = useState<string | null>(null);

  // Interval check to fire notifications
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      let changed = false;
      
      const updated = scheduledSessions.map((session) => {
        if (!session.triggered && session.time <= now) {
          // Trigger the reminder!
          playChimeSound();
          addToast(
            "⏰ Heure de votre révision !",
            `C'est le moment d'étudier : "${session.courseTitle}" (${session.subject} • ${session.level}).`,
            "warning",
            session.courseId
          );
          changed = true;
          return { ...session, triggered: true };
        }
        return session;
      });

      if (changed) {
        setScheduledSessions(updated);
        try {
          localStorage.setItem("afrilearn_scheduled_sessions", JSON.stringify(updated));
        } catch (e) {}
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [scheduledSessions]);

  const addToast = (title: string, description: string, type: ToastMessage["type"] = "info", courseId?: string) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      description,
      type,
      courseId
    };
    setToasts((prev) => [...prev, newToast]);
    
    // Auto-remove toasts after 10 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 10000);
  };

  const scheduleSession = (courseId: string, courseTitle: string, subject: string, level: string, delaySeconds: number) => {
    const triggerTime = Date.now() + delaySeconds * 1000;
    const dateObj = new Date(triggerTime);
    const timeStr = dateObj.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    
    const newSession: ScheduledSession = {
      id: Math.random().toString(36).substring(2, 9),
      courseId,
      courseTitle,
      subject,
      level,
      time: triggerTime,
      triggered: false,
      dateTimeStr: `Dans ${delaySeconds}s (à ${timeStr})`
    };

    const updated = [...scheduledSessions, newSession];
    setScheduledSessions(updated);
    try {
      localStorage.setItem("afrilearn_scheduled_sessions", JSON.stringify(updated));
    } catch (e) {}

    addToast(
      "📅 Session de révision planifiée !",
      `Rappel programmé pour "${courseTitle}" dans ${delaySeconds} secondes.`,
      "success"
    );
  };

  const scheduleSessionCustom = (courseId: string, courseTitle: string, subject: string, level: string, timestamp: number) => {
    const dateObj = new Date(timestamp);
    const dateStr = dateObj.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    const timeStr = dateObj.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    
    const newSession: ScheduledSession = {
      id: Math.random().toString(36).substring(2, 9),
      courseId,
      courseTitle,
      subject,
      level,
      time: timestamp,
      triggered: false,
      dateTimeStr: `${dateStr} à ${timeStr}`
    };

    const updated = [...scheduledSessions, newSession];
    setScheduledSessions(updated);
    try {
      localStorage.setItem("afrilearn_scheduled_sessions", JSON.stringify(updated));
    } catch (e) {}

    addToast(
      "📅 Session de révision planifiée !",
      `Rappel programmé pour le ${dateStr} à ${timeStr} ("${courseTitle}").`,
      "success"
    );
  };

  const cancelSession = (id: string) => {
    const updated = scheduledSessions.filter((s) => s.id !== id);
    setScheduledSessions(updated);
    try {
      localStorage.setItem("afrilearn_scheduled_sessions", JSON.stringify(updated));
    } catch (e) {}
    addToast("🗑️ Planification annulée", "La session a été retirée de votre calendrier.", "info");
  };

  const handleToggleDownloadCourse = (id: string) => {
    setDownloadedCourseIds((prev) => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleDownloadLibrary = (id: string) => {
    setDownloadedLibraryIds((prev) => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };


  return (
    <div className="min-h-screen bg-slate-50/50 text-gray-800 flex flex-col font-sans" id="app-container">
      {/* Dynamic Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2.5 rounded-2xl shadow-md shadow-blue-500/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-display font-bold text-gray-900 tracking-tight">
                  AfriLearn IA
                </h1>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  V2.0 EdTech
                </span>
              </div>
              <p className="text-xs text-gray-400 font-sans">
                La plateforme éducative intelligente tout-en-un d'Afrique francophone
              </p>
            </div>
          </div>

          {/* Quick simulation controls */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {/* Real Subscription trigger */}
            <button
              onClick={() => {
                if (isPremiumUser) {
                  setIsPremiumUser(false);
                } else {
                  setIsPaymentModalOpen(true);
                }
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all ${
                isPremiumUser 
                  ? "bg-green-600 text-white" 
                  : "bg-amber-500 hover:bg-amber-600 text-white"
              }`}
              title={isPremiumUser ? "Cliquez pour résilier / simuler un retour au mode gratuit" : "S'abonner via Orange Money, MTN Money ou Neero"}
            >
              <Crown className="h-4 w-4" />
              {isPremiumUser ? "Abonnement Premium Actif (Orange/MTN/Neero)" : "S'abonner (OM / MTN / Neero)"}
            </button>

            {/* Quick Toggle Bypass */}
            {!isPremiumUser && (
              <button
                onClick={() => setIsPremiumUser(true)}
                className="px-2.5 py-2 text-[10px] text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium"
                title="Débloquer instantanément pour test sans passer par le formulaire de paiement"
              >
                Bypass rapide
              </button>
            )}

            {/* Offline Simulation Toggle */}
            <button
              onClick={() => setIsOffline(!isOffline)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all ${
                isOffline 
                  ? "bg-red-500 text-white" 
                  : "bg-green-50 hover:bg-green-100 text-green-700 border border-green-200"
              }`}
              title="Permet de tester l'accès au cache local hors-ligne"
            >
              {isOffline ? (
                <>
                  <WifiOff className="h-4 w-4 animate-pulse" />
                  <span>Mode Hors-ligne Actif</span>
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4" />
                  <span>Mode En Ligne (Simulé)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col gap-6">
        {/* Navigation Tabs */}
        <div className="bg-white p-1.5 rounded-2xl border border-gray-100 shadow-xs flex items-center overflow-x-auto scrollbar-none gap-1">
          <button
            onClick={() => setActiveTab("courses")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "courses"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Cours & Bibliothèque</span>
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "chat"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Assistant IA (Tuteur)</span>
          </button>

          <button
            onClick={() => setActiveTab("ocr")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "ocr"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>Scanner Devoir (OCR)</span>
          </button>

          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "quiz"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Quiz & Évaluations</span>
          </button>

          <button
            onClick={() => setActiveTab("forum")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "forum"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Espace Communauté</span>
          </button>

          <button
            onClick={() => setActiveTab("monetization")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "monetization"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Simulateur de Gains</span>
          </button>

          <button
            onClick={() => setActiveTab("roadmap")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "roadmap"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>GTM & Roadmap</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1">
          {activeTab === "courses" && (
            <CourseExplorer
              isOffline={isOffline}
              downloadedCourseIds={downloadedCourseIds}
              downloadedLibraryIds={downloadedLibraryIds}
              onToggleDownloadCourse={handleToggleDownloadCourse}
              onToggleDownloadLibrary={handleToggleDownloadLibrary}
              isPremiumUser={isPremiumUser}
              onActivatePremium={() => setIsPaymentModalOpen(true)}
              scheduledSessions={scheduledSessions}
              onScheduleSession={scheduleSession}
              onScheduleSessionCustom={scheduleSessionCustom}
              onCancelSession={cancelSession}
              forceOpenCourseId={forceOpenCourseId}
              onClearForceOpenCourse={() => setForceOpenCourseId(null)}
            />
          )}

          {activeTab === "chat" && (
            <AIAssistant isOffline={isOffline} />
          )}

          {activeTab === "ocr" && (
            <OCRScanner isOffline={isOffline} />
          )}

          {activeTab === "quiz" && (
            <QuizGenerator isOffline={isOffline} />
          )}

          {activeTab === "forum" && (
            <CollaborativeForum isPremiumUser={isPremiumUser} />
          )}

          {activeTab === "monetization" && (
            <MonetizationSimulator />
          )}

          {activeTab === "roadmap" && (
            <MarketingRoadmap />
          )}
        </div>
      </main>

      {/* Local Toast Notifications Container (Framer Motion Animated) */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 40, scale: 0.93 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88, y: -20, transition: { duration: 0.18 } }}
              className="pointer-events-auto bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-100 flex gap-3.5 relative overflow-hidden group/toast"
              id={`toast-${toast.id}`}
            >
              {/* Type indicator border accent */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                toast.type === "success" ? "bg-green-500" :
                toast.type === "warning" ? "bg-amber-500" : "bg-blue-500"
              }`} />
              
              <div className="shrink-0 mt-0.5">
                {toast.type === "success" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                {toast.type === "warning" && <BellRing className="h-5 w-5 text-amber-500 animate-pulse" />}
                {toast.type === "info" && <Bell className="h-5 w-5 text-blue-500" />}
              </div>

              <div className="flex-1 min-w-0 pr-4">
                <h4 className="text-xs font-bold text-gray-900 leading-tight">
                  {toast.title}
                </h4>
                <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                  {toast.description}
                </p>

                {toast.courseId && (
                  <button
                    onClick={() => {
                      setActiveTab("courses");
                      setForceOpenCourseId(toast.courseId || null);
                      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
                    }}
                    className="mt-2.5 text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded-lg flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                  >
                    <span>Ouvrir la leçon 📖</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Payment Gateway Modal */}
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        onPaymentSuccess={() => setIsPremiumUser(true)} 
      />

      {/* Footer / Pitch section */}
      <footer className="bg-white border-t border-gray-100 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© 2026 AfriLearn IA EdTech Inc. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5 text-blue-500" /> Lauréat de l'Innovation Africaine d'Avenir</span>
            <span>•</span>
            <span>Version de Démonstration Mobile & Web</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
