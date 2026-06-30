import React, { useState } from "react";
import { Quiz, QuizQuestion, Level, Subject } from "../types";
import { LEVELS, SUBJECTS } from "../data";
import { HelpCircle, RefreshCw, CheckCircle, XCircle, Sparkles, AlertCircle, Award, BookOpen, GraduationCap } from "lucide-react";

interface QuizGeneratorProps {
  isOffline: boolean;
}

export default function QuizGenerator({ isOffline }: QuizGeneratorProps) {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<Level>("Lycée");
  const [subject, setSubject] = useState<Subject>("Mathématiques");
  
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);

  const [isLoadingExercise, setIsLoadingExercise] = useState(false);
  const [exerciseHtml, setExerciseHtml] = useState("");

  const handleGenerateQuiz = async () => {
    if (!topic.trim() || isOffline) return;
    setIsLoadingQuiz(true);
    setQuiz(null);
    setSelectedAnswers({});
    setSubmittedQuiz(false);
    setExerciseHtml("");

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level, subject })
      });
      const data = await response.json();
      if (response.ok) {
        setQuiz({
          id: Math.random().toString(),
          title: data.title || `Évaluation sur ${topic}`,
          level,
          subject,
          questions: data.questions || []
        });
      } else {
        alert("Erreur de génération : " + data.error);
      }
    } catch (err) {
      alert("Impossible de se connecter au serveur de quiz.");
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const handleGenerateExercise = async () => {
    if (!topic.trim() || isOffline) return;
    setIsLoadingExercise(true);
    setExerciseHtml("");
    setQuiz(null);

    try {
      const response = await fetch("/api/generate-exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level, subject })
      });
      const data = await response.json();
      if (response.ok) {
        setExerciseHtml(data.content);
      } else {
        alert("Erreur de génération : " + data.error);
      }
    } catch (err) {
      alert("Impossible de se connecter au serveur d'exercices.");
    } finally {
      setIsLoadingExercise(false);
    }
  };

  const handleOptionSelect = (qIdx: number, optIdx: number) => {
    if (submittedQuiz) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="quiz-generator-root">
      {/* Configurator */}
      <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-gray-100 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display font-semibold text-gray-800">Générateur d'Évaluations</h3>
              <p className="text-xs text-gray-400 font-sans">Génère des quiz et exercices sur-mesure</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Thème précis à tester</label>
              <input
                type="text"
                placeholder="Ex : Fonctions trigonométriques, Guerre du Dahomey..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-blue-500 bg-white"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Niveau d'études</label>
              <select
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-blue-500 bg-white font-medium"
                value={level}
                onChange={(e) => setLevel(e.target.value as Level)}
              >
                {LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Matière</label>
              <select
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-blue-500 bg-white font-medium"
                value={subject}
                onChange={(e) => setSubject(e.target.value as Subject)}
              >
                {SUBJECTS.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={handleGenerateQuiz}
              disabled={isOffline || !topic.trim() || isLoadingQuiz || isLoadingExercise}
              className="px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              {isLoadingQuiz ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin" /> En cours...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" /> Créer un Quiz
                </>
              )}
            </button>

            <button
              onClick={handleGenerateExercise}
              disabled={isOffline || !topic.trim() || isLoadingQuiz || isLoadingExercise}
              className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              {isLoadingExercise ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin" /> En cours...
                </>
              ) : (
                <>
                  <BookOpen className="h-3.5 w-3.5" /> Créer TD Corrigé
                </>
              )}
            </button>
          </div>
        </div>

        {isOffline && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-2.5 mt-4">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-700">
              <h5 className="font-semibold">Mode hors-ligne</h5>
              <p className="text-[10px] opacity-90 mt-0.5">Le générateur d'évaluations nécessite d'être connecté pour concevoir de nouveaux exercices uniques.</p>
            </div>
          </div>
        )}
      </div>

      {/* Main interactive viewport */}
      <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-100 min-h-96">
        {isLoadingQuiz || isLoadingExercise ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-20">
            <div className="relative flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <Sparkles className="h-5 w-5 text-blue-500 absolute animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800">Conception pédagogique en cours...</h4>
              <p className="text-xs text-gray-400 max-w-xs mt-1">Notre tuteur d'IA formule des questions adaptées aux programmes d'Afrique francophone.</p>
            </div>
          </div>
        ) : quiz ? (
          /* Interactive Quiz Panel */
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{quiz.subject} • {quiz.level}</span>
                <h4 className="text-base font-display font-bold text-gray-800">{quiz.title}</h4>
              </div>
              <span className="text-[10px] px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-mono font-medium">
                4 Questions de QCM
              </span>
            </div>

            <div className="space-y-6">
              {quiz.questions.map((q, qIdx) => (
                <div key={qIdx} className="space-y-2">
                  <h5 className="text-xs font-semibold text-gray-700 flex gap-2">
                    <span className="text-blue-600 font-mono">Q{qIdx + 1}.</span> {q.question}
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[qIdx] === optIdx;
                      const isCorrect = optIdx === q.correctIndex;
                      
                      let btnStyle = "border-gray-200 hover:bg-gray-50 text-gray-700";
                      if (isSelected) {
                        btnStyle = "border-blue-500 bg-blue-50/50 text-blue-800";
                      }
                      if (submittedQuiz) {
                        if (isCorrect) {
                          btnStyle = "border-green-500 bg-green-50 text-green-800 font-medium";
                        } else if (isSelected && !isCorrect) {
                          btnStyle = "border-red-400 bg-red-50 text-red-800";
                        } else {
                          btnStyle = "border-gray-100 text-gray-400 opacity-60";
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleOptionSelect(qIdx, optIdx)}
                          className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
                          disabled={submittedQuiz}
                        >
                          <span>{opt}</span>
                          {submittedQuiz && isCorrect && <CheckCircle className="h-4 w-4 text-green-500 shrink-0 ml-2" />}
                          {submittedQuiz && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-500 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>

                  {submittedQuiz && (
                    <div className="p-3 bg-gray-50 rounded-lg text-[11px] text-gray-600 leading-relaxed border border-gray-100">
                      <span className="font-bold text-blue-700">Explication :</span> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-5">
              {!submittedQuiz ? (
                <button
                  onClick={() => setSubmittedQuiz(true)}
                  disabled={Object.keys(selectedAnswers).length < quiz.questions.length}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  Soumettre mes réponses
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-xl">
                      <Award className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">
                        Votre score : {calculateScore()} / 4
                      </h4>
                      <p className="text-[10px] text-gray-500">
                        {calculateScore() === 4 ? "Félicitations ! Un sans-faute d'excellence !" : "Continue à réviser avec notre tuteur d'IA !"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateQuiz}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
                  >
                    Essayer un autre quiz
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : exerciseHtml ? (
          /* Detailed TD Generator View */
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{subject} • {level}</span>
                <h4 className="text-base font-display font-bold text-gray-800">Sujet d'exercice corrigé par IA</h4>
              </div>
              <button
                onClick={handleGenerateExercise}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"
                title="Générer un autre exercice"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 max-h-[500px] overflow-y-auto space-y-4">
              <div className="text-xs leading-relaxed text-gray-700 space-y-3 font-sans">
                {exerciseHtml.split("\n\n").map((para, i) => {
                  if (para.startsWith("###") || para.startsWith("####")) {
                    return (
                      <h4 key={i} className="font-bold text-gray-800 mt-3 text-sm border-b border-gray-200 pb-1">
                        {para.replace(/###|####/g, "").trim()}
                      </h4>
                    );
                  }
                  if (para.startsWith("- **") || para.startsWith("* **")) {
                    return (
                      <div key={i} className="pl-3 border-l-2 border-blue-500 font-medium">
                        {para}
                      </div>
                    );
                  }
                  return <p key={i}>{para}</p>;
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Invitation state */
          <div className="h-72 flex flex-col items-center justify-center text-center text-gray-400 space-y-2 py-10">
            <HelpCircle className="h-10 w-10 text-gray-300" />
            <h4 className="text-xs font-semibold text-gray-600">Aucun exercice en cours</h4>
            <p className="text-xs max-w-xs">
              Saisissez un thème de cours à tester dans le volet de configuration de gauche (ex: discriminant, fractions, empires médiévaux, mobile money) et cliquez sur "Créer un Quiz" ou "Créer TD Corrigé".
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
