import React, { useState, useRef, useEffect } from "react";
import { Level, Subject } from "../types";
import { LEVELS, SUBJECTS } from "../data";
import { Send, Bot, User, Sparkles, AlertCircle, History, Trash2, Clock, Volume2, VolumeX, Square } from "lucide-react";

interface AIAssistantProps {
  isOffline: boolean;
}

export default function AIAssistant({ isOffline }: AIAssistantProps) {
  const [messages, setMessages] = useState<{ role: "user" | "model"; content: string }[]>([
    {
      role: "model",
      content: "Bonjour ! Je suis **AfriLearn IA**, ton tuteur d'excellence. Pose-moi n'importe quelle question sur tes cours, devoirs ou préparation aux examens, et je t'expliquerai de façon simple avec des exemples pratiques de chez nous. Que révises-tu aujourd'hui ?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [level, setLevel] = useState<Level>("Lycée");
  const [subject, setSubject] = useState<Subject>("Mathématiques");
  const [history, setHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("afrilearn_questions_history");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // TTS states
  const [currentlySpeakingIdx, setCurrentlySpeakingIdx] = useState<number | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1.0); // 1.0x, 1.2x, 1.5x etc.
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isOffline) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    // Save question to history
    setHistory((prev) => {
      const updated = [userMessage, ...prev.filter((q) => q !== userMessage)].slice(0, 15);
      try {
        localStorage.setItem("afrilearn_questions_history", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
          level,
          subject
        })
      });
      const data = await response.json();
      if (response.ok) {
        setMessages((prev) => [...prev, { role: "model", content: data.content }]);
      } else {
        setMessages((prev) => [...prev, { role: "model", content: `Désolé, j'ai rencontré un problème : ${data.error}` }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "model", content: "Une erreur de connexion au serveur s'est produite." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakMessage = (text: string, idx: number) => {
    if (!("speechSynthesis" in window)) {
      alert("La synthèse vocale n'est pas prise en charge par votre navigateur.");
      return;
    }

    if (currentlySpeakingIdx === idx) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingIdx(null);
      return;
    }

    // Stop any current reading
    window.speechSynthesis.cancel();

    // Strip markdown formatting for cleaner speech output
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, "$1") // Bold
      .replace(/\*(.*?)\*/g, "$1")     // Italic
      .replace(/`([^`]+)`/g, "$1")     // Inline code
      .replace(/^[\*\-]\s+/gm, "")     // Bullet items
      .replace(/^#+\s+/gm, "");        // Headers

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Pick appropriate voice
    const voices = window.speechSynthesis.getVoices();
    const frVoice = voices.find((v) => v.lang.startsWith("fr"));
    if (frVoice) {
      utterance.voice = frVoice;
    }
    utterance.lang = "fr-FR";
    utterance.rate = speechRate;

    utterance.onend = () => {
      setCurrentlySpeakingIdx(null);
    };

    utterance.onerror = () => {
      setCurrentlySpeakingIdx(null);
    };

    setCurrentlySpeakingIdx(idx);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentlySpeakingIdx(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-14rem)]" id="ai-assistant-root">
      {/* Sidebar Controls */}
      <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-gray-100 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Bot className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display font-semibold text-gray-800">Personnalisation</h3>
              <p className="text-xs text-gray-400">Adapte l'intelligence pédagogique</p>
            </div>
          </div>

          <div className="space-y-3 pt-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Niveau d'études</label>
              <select
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium focus:outline-hidden focus:border-blue-500 bg-white"
                value={level}
                onChange={(e) => setLevel(e.target.value as Level)}
                disabled={isOffline}
              >
                {LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Matière étudiée</label>
              <select
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium focus:outline-hidden focus:border-blue-500 bg-white"
                value={subject}
                onChange={(e) => setSubject(e.target.value as Subject)}
                disabled={isOffline}
              >
                {SUBJECTS.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Historique des Questions (Dropdown et Révision Continue) */}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  <span>Questions de révision</span>
                </label>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setHistory([]);
                      try {
                        localStorage.removeItem("afrilearn_questions_history");
                      } catch (e) {}
                    }}
                    className="text-[10px] text-red-500 hover:text-red-700 flex items-center gap-0.5 font-medium transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Effacer</span>
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-[10px] text-gray-400 italic bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-center">
                  Aucune question mémorisée. Posez-en une pour l'enregistrer !
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white cursor-pointer"
                    onChange={(e) => {
                      if (e.target.value) {
                        setInput(e.target.value);
                      }
                    }}
                    value=""
                  >
                    <option value="" disabled>Sélectionner une question passée...</option>
                    {history.map((q, idx) => (
                      <option key={idx} value={q}>
                        {q.length > 38 ? q.slice(0, 38) + "..." : q}
                      </option>
                    ))}
                  </select>

                  {/* Quick history preview nodes */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                      Accès rapide :
                    </span>
                    <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                      {history.slice(0, 3).map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setInput(q)}
                          className="w-full text-left p-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-100 rounded-lg text-[10px] text-gray-600 transition-all flex items-center gap-1.5 cursor-pointer truncate"
                          title={q}
                        >
                          <Clock className="h-3 w-3 text-blue-400 shrink-0" />
                          <span className="truncate">{q}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl space-y-2 border border-blue-100">
            <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> Pédagogie Contextuelle
            </h4>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              L'IA utilise des analogies ouest-africaines et centre-africaines pour clarifier les concepts complexes de mécanique, d'algèbre, de géographie, d'économie et de lettres.
            </p>
          </div>

          {/* Audio Speech Settings */}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
              <Volume2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <span>Options de Lecture Audio</span>
            </label>
            
            <div className="flex items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="space-y-0.5">
                <span className="text-[10px] text-gray-500 font-semibold block">Vitesse de lecture :</span>
                <div className="flex items-center gap-1">
                  {[0.8, 1.0, 1.2, 1.5].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setSpeechRate(rate)}
                      className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md transition-all ${
                        speechRate === rate
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

              {currentlySpeakingIdx !== null && (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 flex items-center justify-center transition-all cursor-pointer"
                  title="Arrêter la lecture audio"
                >
                  <Square className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {isOffline && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-red-700">
              <h5 className="font-semibold">Chat IA Désactivé</h5>
              <p className="text-[10px] opacity-90 mt-0.5">La communication en temps réel avec le tuteur IA requiert une connexion internet active.</p>
            </div>
          </div>
        )}
      </div>

      {/* Chat Windows */}
      <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 flex flex-col h-full overflow-hidden">
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[calc(100vh-23rem)]">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-[85%] ${
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-sm ${
                msg.role === "user" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
              }`}>
                {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div className={`p-4 rounded-2xl text-xs leading-relaxed font-sans space-y-1.5 relative group ${
                msg.role === "user" 
                  ? "bg-blue-600 text-white rounded-tr-none" 
                  : "bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100"
              }`}>
                {msg.role === "model" && (
                  <div className="absolute right-2 top-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => speakMessage(msg.content, idx)}
                      className={`p-1.5 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${
                        currentlySpeakingIdx === idx
                          ? "bg-blue-100 text-blue-700 animate-pulse"
                          : "hover:bg-gray-200 text-gray-500"
                      }`}
                      title={currentlySpeakingIdx === idx ? "Arrêter la lecture" : "Écouter l'explication (Synthèse Vocale)"}
                    >
                      {currentlySpeakingIdx === idx ? (
                        <VolumeX className="h-3.5 w-3.5" />
                      ) : (
                        <Volume2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                )}

                <div className={msg.role === "model" ? "pr-6" : ""}>
                  {msg.content.split("\n").map((line, i) => {
                    // Handle bullet points
                    if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
                      return (
                        <li key={i} className="ml-3 list-disc">
                          {line.replace(/^[\*\-]\s+/, "")}
                        </li>
                      );
                    }
                    return <p key={i}>{line}</p>;
                  })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 max-w-[85%] mr-auto items-center">
              <div className="h-8 w-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-sm shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 rounded-tl-none text-xs text-gray-500 flex items-center gap-2">
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                </span>
                AfriLearn IA est en train de rédiger son explication...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-gray-50/50 flex gap-2">
          <input
            type="text"
            className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-hidden focus:border-blue-500 disabled:opacity-50"
            placeholder={isOffline ? "Désactivé hors-ligne..." : "Ex. Explique-moi le théorème de Pythagore avec la construction d'une case ronde..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isOffline || isLoading}
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50 shrink-0"
            disabled={isOffline || isLoading || !input.trim()}
          >
            <Send className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Envoyer</span>
          </button>
        </form>
      </div>
    </div>
  );
}
