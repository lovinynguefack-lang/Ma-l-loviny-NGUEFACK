import React, { useState, useEffect } from "react";
import { Course, LibraryItem, Level, Subject, ScheduledSession } from "../types";
import { INITIAL_COURSES, INITIAL_LIBRARY_ITEMS, LEVELS, SUBJECTS } from "../data";
import { jsPDF } from "jspdf";
import { 
  BookOpen, 
  Search, 
  Download, 
  CheckCircle, 
  Lock, 
  Play, 
  FileText, 
  WifiOff, 
  Book, 
  Loader2,
  Bell,
  Calendar,
  Clock,
  Trash2,
  Plus,
  AlertCircle
} from "lucide-react";

interface CourseExplorerProps {
  isOffline: boolean;
  downloadedCourseIds: string[];
  downloadedLibraryIds: string[];
  onToggleDownloadCourse: (id: string) => void;
  onToggleDownloadLibrary: (id: string) => void;
  isPremiumUser: boolean;
  onActivatePremium: () => void;
  scheduledSessions: ScheduledSession[];
  onScheduleSession: (courseId: string, courseTitle: string, subject: string, level: string, delaySeconds: number) => void;
  onScheduleSessionCustom: (courseId: string, courseTitle: string, subject: string, level: string, timestamp: number) => void;
  onCancelSession: (id: string) => void;
  forceOpenCourseId: string | null;
  onClearForceOpenCourse: () => void;
}

export default function CourseExplorer({
  isOffline,
  downloadedCourseIds,
  downloadedLibraryIds,
  onToggleDownloadCourse,
  onToggleDownloadLibrary,
  isPremiumUser,
  onActivatePremium,
  scheduledSessions,
  onScheduleSession,
  onScheduleSessionCustom,
  onCancelSession,
  forceOpenCourseId,
  onClearForceOpenCourse
}: CourseExplorerProps) {
  const [selectedLevel, setSelectedLevel] = useState<Level | "Tous">("Tous");
  const [selectedSubject, setSelectedSubject] = useState<Subject | "Tous">("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [aiExplanation, setAiExplanation] = useState("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState<"Simple" | "Standard" | "Approfondi">("Standard");

  // Planner states
  const [plannerCourseId, setPlannerCourseId] = useState("");
  const [plannerDelayType, setPlannerDelayType] = useState<"seconds" | "custom">("seconds");
  const [plannerDelaySeconds, setPlannerDelaySeconds] = useState("10");
  const [plannerDateTime, setPlannerDateTime] = useState("");

  // Synchronize with parent's force-open triggers (from toaster actions)
  useEffect(() => {
    if (forceOpenCourseId) {
      const course = INITIAL_COURSES.find(c => c.id === forceOpenCourseId);
      if (course) {
        setActiveCourse(course);
        setAiExplanation("");
      }
      onClearForceOpenCourse();
    }
  }, [forceOpenCourseId, onClearForceOpenCourse]);


  // Mini-dictionary state
  const [selectedWord, setSelectedWord] = useState("");
  const [wordDefinition, setWordDefinition] = useState("");
  const [isLoadingWord, setIsLoadingWord] = useState(false);
  const [dictionaryHistory, setDictionaryHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("afrilearn_dictionary_history");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const handleWordClick = async (word: string) => {
    const clean = word.trim().replace(/^[.,\/#!$%\^&\*;:{}=\-_`~()?"']+|[.,\/#!$%\^&\*;:{}=\-_`~()?"']+$/g, "");
    if (!clean || clean.length < 2) return;
    
    setSelectedWord(clean);
    setIsLoadingWord(true);
    setWordDefinition("");

    // Add to history and save
    setDictionaryHistory(prev => {
      const updated = [clean, ...prev.filter(w => w !== clean)].slice(0, 10);
      try {
        localStorage.setItem("afrilearn_dictionary_history", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (isOffline) {
      setTimeout(() => {
        setWordDefinition(`[Mode Hors-ligne] Définition de "${clean}" : Pour obtenir une explication approfondie basée sur l'IA, veuillez désactiver le mode hors-ligne.\n\nExemple : L'élève étudie la notion de "${clean}".`);
        setIsLoadingWord(false);
      }, 400);
      return;
    }

    try {
      const response = await fetch("/api/dictionary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: clean,
          level: selectedLevel !== "Tous" ? selectedLevel : activeCourse?.level,
          subject: selectedSubject !== "Tous" ? selectedSubject : activeCourse?.subject
        })
      });
      const data = await response.json();
      if (response.ok) {
        setWordDefinition(data.definition);
      } else {
        setWordDefinition(`Une erreur est survenue lors de la recherche de définition : ${data.error}`);
      }
    } catch (err) {
      setWordDefinition("Impossible de se connecter au service de dictionnaire.");
    } finally {
      setIsLoadingWord(false);
    }
  };

  const renderClickableText = (text: string) => {
    // split keeping whitespace so we don't collapse formatting
    const words = text.split(/(\s+)/);
    return words.map((chunk, idx) => {
      if (/^\s+$/.test(chunk)) {
        return <span key={idx}>{chunk}</span>;
      }
      // Remove any trailing or leading punctuation for lookup
      const cleanWord = chunk.replace(/^[.,\/#!$%\^&\*;:{}=\-_`~()?"']+|[.,\/#!$%\^&\*;:{}=\-_`~()?"']+$/g, "");
      if (!cleanWord || cleanWord.length < 2) {
        return <span key={idx}>{chunk}</span>;
      }
      return (
        <span
          key={idx}
          onClick={() => handleWordClick(cleanWord)}
          className="hover:bg-blue-100 hover:text-blue-800 rounded-sm cursor-pointer transition-all duration-150 px-0.5 border-b border-dashed border-gray-300 hover:border-solid hover:border-blue-500 font-sans"
          title={`Cliquez pour définir "${cleanWord}"`}
        >
          {chunk}
        </span>
      );
    });
  };

  // Filter courses based on offline status, selected level, subject, and search query
  const filteredCourses = INITIAL_COURSES.filter(course => {
    if (isOffline && !downloadedCourseIds.includes(course.id)) {
      return false;
    }
    const matchesLevel = selectedLevel === "Tous" || course.level === selectedLevel;
    const matchesSubject = selectedSubject === "Tous" || course.subject === selectedSubject;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSubject && matchesSearch;
  });

  const filteredLibrary = INITIAL_LIBRARY_ITEMS.filter(item => {
    if (isOffline && !downloadedLibraryIds.includes(item.id)) {
      return false;
    }
    const matchesLevel = selectedLevel === "Tous" || item.level === selectedLevel;
    const matchesSubject = selectedSubject === "Tous" || item.subject === selectedSubject;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSubject && matchesSearch;
  });

  const handleExplainWithAI = async (course: Course) => {
    if (isOffline) return;
    setIsLoadingAi(true);
    setAiExplanation("");
    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: course.title,
          level: course.level,
          subject: course.subject,
          difficulty: aiDifficulty
        })
      });
      const data = await response.json();
      if (response.ok) {
        setAiExplanation(data.content);
      } else {
        setAiExplanation(`Une erreur est survenue : ${data.error}`);
      }
    } catch (err) {
      setAiExplanation("Impossible de se connecter au serveur de tutorat IA.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleExportPDF = () => {
    if (!activeCourse || !aiExplanation) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const maxLineWidth = pageWidth - margin * 2;

      // Header Banner
      doc.setFillColor(37, 99, 235); // Blue-600
      doc.rect(0, 0, pageWidth, 26, "F");

      // App Title & Tagline
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("AFRILEARN - TUTEUR INTELLIGENT IA", margin, 17);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Education Interactive & Revision Hors-ligne", pageWidth - margin - 65, 17);

      // Reset text
      doc.setTextColor(31, 41, 55);

      // Meta Information
      let currentY = 40;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      const splitTitle = doc.splitTextToSize(activeCourse.title, maxLineWidth);
      doc.text(splitTitle, margin, currentY);
      currentY += (splitTitle.length * 8) + 4;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(75, 85, 99);
      doc.text(`Matiere : ${activeCourse.subject}  |  Niveau : ${activeCourse.level}`, margin, currentY);
      currentY += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(156, 163, 175);
      doc.text(`Genere le : ${new Date().toLocaleDateString("fr-FR")} | Niveau d'explication : ${aiDifficulty}`, margin, currentY);
      currentY += 8;

      // Divider line
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.5);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 12;

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(37, 99, 235);
      doc.text("EXPLICATION ET RESUME GENERE PAR L'IA", margin, currentY);
      currentY += 10;

      // Content paragraph rendering
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(31, 41, 55);

      // Split text on paragraphs first to preserve spacing
      const paragraphs = aiExplanation.split("\n");
      
      paragraphs.forEach((pText) => {
        const cleanPara = pText.trim();
        if (!cleanPara) {
          currentY += 4; // double space for empty paragraphs
          return;
        }

        const lines = doc.splitTextToSize(cleanPara, maxLineWidth);
        lines.forEach((line: string) => {
          if (currentY + 7 > pageHeight - margin) {
            doc.addPage();
            currentY = margin + 12;

            // Mini page header
            doc.setFont("helvetica", "italic");
            doc.setFontSize(9);
            doc.setTextColor(156, 163, 175);
            doc.text(`AfriLearn - Explication IA: ${activeCourse.title}`, margin, margin);
            doc.line(margin, margin + 2, pageWidth - margin, margin + 2);
            currentY += 8;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10.5);
            doc.setTextColor(31, 41, 55);
          }
          doc.text(line, margin, currentY);
          currentY += 6;
        });
        currentY += 3; // small break between paragraphs
      });

      // Footer
      currentY += 10;
      if (currentY + 15 > pageHeight - margin) {
        doc.addPage();
        currentY = margin + 15;
      }
      doc.setDrawColor(229, 231, 235);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 8;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(156, 163, 175);
      doc.text("Document pedagogique officiel AfriLearn pour etudes et revisions hors-ligne.", margin, currentY);

      // Save PDF
      const safeTitle = activeCourse.title.toLowerCase().replace(/[^a-z0-9]/g, "_");
      doc.save(`afrilearn_explication_ia_${safeTitle}.pdf`);
    } catch (error) {
      console.error("Erreur d'exportation PDF:", error);
      alert("Une erreur est survenue lors de la generation du PDF.");
    }
  };

  const handleExportCoursePDF = (course: Course) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const maxLineWidth = pageWidth - margin * 2;

      // Header Banner
      doc.setFillColor(13, 148, 136); // Teal-600
      doc.rect(0, 0, pageWidth, 26, "F");

      // App Title & Tagline
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("AFRILEARN - LECON COMPLETE", margin, 17);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Revision et Autonomie Scolaire", pageWidth - margin - 55, 17);

      // Reset text
      doc.setTextColor(31, 41, 55);

      // Meta Information
      let currentY = 40;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      const splitTitle = doc.splitTextToSize(course.title, maxLineWidth);
      doc.text(splitTitle, margin, currentY);
      currentY += (splitTitle.length * 8) + 4;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(75, 85, 99);
      doc.text(`Matiere : ${course.subject}  |  Niveau : ${course.level}  |  Duree estimee : ${course.duration}`, margin, currentY);
      currentY += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(156, 163, 175);
      doc.text(`Genere le : ${new Date().toLocaleDateString("fr-FR")} | Contenu original`, margin, currentY);
      currentY += 8;

      // Divider line
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.5);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 12;

      // Chapters / Table of contents
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(13, 148, 136);
      doc.text("PLAN DU COURS", margin, currentY);
      currentY += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      course.chapters.forEach((chapter, index) => {
        doc.text(`${index + 1}. ${chapter}`, margin + 5, currentY);
        currentY += 6;
      });
      currentY += 8;

      // Content section heading
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(13, 148, 136);
      doc.text("CONTENU DU COURS", margin, currentY);
      currentY += 8;

      // Split text on paragraphs first to preserve spacing
      const paragraphs = course.content.split("\n\n");
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(31, 41, 55);

      paragraphs.forEach((pText) => {
        const cleanPara = pText.trim();
        if (!cleanPara) {
          currentY += 4;
          return;
        }

        // Determine if this is a heading or bullet point
        let isHeader = false;
        let isBullet = false;
        let displayPara = cleanPara;

        if (cleanPara.startsWith("###")) {
          isHeader = true;
          displayPara = cleanPara.replace("### ", "").trim();
        } else if (cleanPara.startsWith("* **") || cleanPara.startsWith("- ") || cleanPara.startsWith("* ")) {
          isBullet = true;
          displayPara = cleanPara.replace(/^\* \*\*|^\- |^\* /, "• ").trim();
        }

        if (isHeader) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(13, 148, 136);
        } else if (isBullet) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10.5);
          doc.setTextColor(31, 41, 55);
        } else {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10.5);
          doc.setTextColor(31, 41, 55);
        }

        const lines = doc.splitTextToSize(displayPara, maxLineWidth - (isBullet ? 5 : 0));
        lines.forEach((line: string) => {
          if (currentY + 7 > pageHeight - margin) {
            doc.addPage();
            currentY = margin + 12;

            // Mini page header
            doc.setFont("helvetica", "italic");
            doc.setFontSize(9);
            doc.setTextColor(156, 163, 175);
            doc.text(`AfriLearn - Cours de ${course.subject}: ${course.title}`, margin, margin);
            doc.line(margin, margin + 2, pageWidth - margin, margin + 2);
            currentY += 8;

            if (isHeader) {
              doc.setFont("helvetica", "bold");
              doc.setFontSize(11);
              doc.setTextColor(13, 148, 136);
            } else {
              doc.setFont("helvetica", "normal");
              doc.setFontSize(10.5);
              doc.setTextColor(31, 41, 55);
            }
          }
          
          doc.text(line, margin + (isBullet ? 5 : 0), currentY);
          currentY += 6;
        });
        currentY += 4; // small break between paragraphs
      });

      // Footer
      currentY += 10;
      if (currentY + 15 > pageHeight - margin) {
        doc.addPage();
        currentY = margin + 15;
      }
      doc.setDrawColor(229, 231, 235);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 8;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(156, 163, 175);
      doc.text("Document pedagogique officiel AfriLearn pour etudes et revisions hors-ligne.", margin, currentY);

      // Save PDF
      const safeTitle = course.title.toLowerCase().replace(/[^a-z0-9]/g, "_");
      doc.save(`afrilearn_cours_${safeTitle}.pdf`);
    } catch (error) {
      console.error("Erreur d'exportation PDF:", error);
      alert("Une erreur est survenue lors de la generation du PDF.");
    }
  };

  return (
    <div className="space-y-6" id="course-explorer-root">
      {/* Search and Filters panel */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un cours, un enseignant, une annale..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500 text-sm font-sans"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Niveau :</span>
            <select
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as any)}
            >
              <option value="Tous">Tous les niveaux</option>
              {LEVELS.map(lvl => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>

            <span className="text-xs font-medium text-gray-500 whitespace-nowrap ml-2">Matière :</span>
            <select
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium focus:outline-hidden focus:border-blue-500 bg-white"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value as any)}
            >
              <option value="Tous">Toutes matières</option>
              {SUBJECTS.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isOffline && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3">
          <WifiOff className="h-5 w-5 text-amber-600" />
          <div>
            <h4 className="text-sm font-semibold text-amber-800">Mode Hors-ligne Actif</h4>
            <p className="text-xs text-amber-700">Seuls les cours et documents préalablement téléchargés dans votre cache local sont accessibles.</p>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Course List */}
        <div className="lg:col-span-7 space-y-6">
          {/* Planificateur de Révision IA Card */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Calendar className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-gray-950">Planificateur de Révision & Rappels</h3>
                  <p className="text-[11px] text-gray-500">Fixez des objectifs d'apprentissage et recevez des alertes locales</p>
                </div>
              </div>
              {scheduledSessions.filter(s => !s.triggered).length > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 animate-pulse">
                  <Bell className="h-3 w-3" />
                  {scheduledSessions.filter(s => !s.triggered).length} active(s)
                </span>
              )}
            </div>

            {/* Quick Scheduling Form */}
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3.5">
              <h4 className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5 text-blue-600" /> Planifier un nouveau rappel
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Course select dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Leçon à réviser</label>
                  <select
                    className="w-full p-2 bg-white rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-blue-500"
                    value={plannerCourseId}
                    onChange={(e) => setPlannerCourseId(e.target.value)}
                  >
                    <option value="">-- Choisir une leçon --</option>
                    {INITIAL_COURSES.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.subject}] {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Delay or Date choice */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Quand réviser ?</label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPlannerDelayType("seconds")}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                        plannerDelayType === "seconds"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      Délai court (Test)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlannerDelayType("custom")}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                        plannerDelayType === "custom"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      Date & Heure
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-0.5">
                {/* Conditional input based on type */}
                {plannerDelayType === "seconds" ? (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Rappel dans...</label>
                    <select
                      className="w-full p-2 bg-white rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-blue-500"
                      value={plannerDelaySeconds}
                      onChange={(e) => setPlannerDelaySeconds(e.target.value)}
                    >
                      <option value="10">10 secondes (Idéal pour tester ! 🚀)</option>
                      <option value="30">30 secondes ⏱️</option>
                      <option value="60">1 minute ⏰</option>
                      <option value="300">5 minutes ☕</option>
                      <option value="1800">30 minutes 📚</option>
                      <option value="3600">1 heure 📖</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Choisir date et heure</label>
                    <input
                      type="datetime-local"
                      className="w-full p-2 bg-white rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-blue-500"
                      value={plannerDateTime}
                      onChange={(e) => setPlannerDateTime(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!plannerCourseId) return;
                      const course = INITIAL_COURSES.find(c => c.id === plannerCourseId);
                      if (!course) return;

                      if (plannerDelayType === "seconds") {
                        const secs = parseInt(plannerDelaySeconds, 10) || 10;
                        onScheduleSession(course.id, course.title, course.subject, course.level, secs);
                      } else {
                        if (!plannerDateTime) return;
                        const timestamp = new Date(plannerDateTime).getTime();
                        if (isNaN(timestamp) || timestamp <= Date.now()) {
                          alert("Veuillez choisir une date et heure future.");
                          return;
                        }
                        onScheduleSessionCustom(course.id, course.title, course.subject, course.level, timestamp);
                      }
                      // Reset form
                      setPlannerCourseId("");
                      setPlannerDateTime("");
                    }}
                    disabled={!plannerCourseId || (plannerDelayType === "custom" && !plannerDateTime)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Bell className="h-4 w-4" />
                    <span>Programmer la révision</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Scheduled Sessions List */}
            <div className="space-y-2">
              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mes rappels actifs ({scheduledSessions.length})</h5>
              
              {scheduledSessions.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-2.5 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-100">
                  Aucun rappel de révision programmé. Choisissez un cours ci-dessus pour planifier votre première session !
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                  {scheduledSessions.map((session) => {
                    const isDue = session.time <= Date.now();
                    return (
                      <div
                        key={session.id}
                        className={`p-3 rounded-xl border transition-all flex justify-between items-start gap-2 ${
                          isDue 
                            ? "bg-gray-50 border-gray-150 opacity-70" 
                            : "bg-white border-blue-50 hover:border-blue-150"
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[8px] font-bold rounded">
                              {session.subject}
                            </span>
                            <span className="text-[9px] text-gray-400 font-medium">
                              {session.level}
                            </span>
                          </div>
                          <h6 className="text-xs font-semibold text-gray-800 truncate" title={session.courseTitle}>
                            {session.courseTitle}
                          </h6>
                          <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <Clock className="h-3 w-3 text-blue-500" />
                            <span className="font-medium text-gray-600 truncate">{session.dateTimeStr}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                            session.triggered 
                              ? "bg-green-50 text-green-700" 
                              : "bg-amber-50 text-amber-700 animate-pulse"
                          }`}>
                            {session.triggered ? "✓ Fait" : "⏳ Actif"}
                          </span>
                          
                          <button
                            onClick={() => onCancelSession(session.id)}
                            className="text-gray-400 hover:text-red-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            title="Annuler ce rappel"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-display font-semibold text-gray-800">
              Cours & Exercices Corrigés ({filteredCourses.length})
            </h3>
            {isOffline && (
              <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                Hors-ligne sécurisé
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredCourses.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center text-gray-500 text-sm">
                Aucun cours ne correspond à vos filtres en ce moment.
              </div>
            ) : (
              filteredCourses.map((course) => {
                const isDownloaded = downloadedCourseIds.includes(course.id);
                const requirePremiumLock = course.isPremium && !isPremiumUser;

                return (
                  <div
                    key={course.id}
                    className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all shadow-xs flex flex-col justify-between group glow-card"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-semibold uppercase tracking-wider">
                          {course.subject}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">{course.duration}</span>
                      </div>

                      <h4 className="text-base font-display font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {course.summary}
                      </p>

                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                          {course.level}
                        </span>
                        {course.isPremium && (
                          <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-medium flex items-center gap-1">
                            <Lock className="h-3 w-3" /> Premium
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50">
                      <button
                        onClick={() => {
                          if (requirePremiumLock) {
                            onActivatePremium();
                          } else {
                            setActiveCourse(course);
                            setAiExplanation("");
                          }
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                          requirePremiumLock
                            ? "bg-amber-500 text-white hover:bg-amber-600"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {requirePremiumLock ? "S'abonner pour Débloquer" : "Ouvrir la leçon"}
                      </button>

                      <button
                        onClick={() => onToggleDownloadCourse(course.id)}
                        className={`p-2 rounded-xl border transition-all ${
                          isDownloaded
                            ? "border-green-200 bg-green-50 text-green-600"
                            : "border-gray-200 hover:bg-gray-50 text-gray-400"
                        }`}
                        title={isDownloaded ? "Téléchargé" : "Télécharger pour le mode hors-ligne"}
                      >
                        {isDownloaded ? <CheckCircle className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Library PDF/Video list */}
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-display font-semibold text-gray-800">
              Bibliothèque Numérique (Annales, Vidéos, PDF)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLibrary.map((item) => {
                const isLibDownloaded = downloadedLibraryIds.includes(item.id);
                return (
                  <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 flex gap-3">
                    <div className="p-3 bg-gray-50 rounded-xl h-11 w-11 flex items-center justify-center shrink-0">
                      {item.type === "Vidéo" ? (
                        <Play className="h-5 w-5 text-red-500" />
                      ) : (
                        <FileText className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-semibold text-gray-800 truncate" title={item.title}>
                        {item.title}
                      </h5>
                      <p className="text-xs text-gray-500 truncate">{item.author}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-gray-400 font-mono">{item.sizeOrDuration}</span>
                        <button
                          onClick={() => onToggleDownloadLibrary(item.id)}
                          className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md transition-all ${
                            isLibDownloaded
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {isLibDownloaded ? (
                            <>
                              <CheckCircle className="h-3 w-3" /> Dispo hors-ligne
                            </>
                          ) : (
                            <>
                              <Download className="h-3 w-3" /> Télécharger
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Course Reader & AI Explainer Pane */}
        <div className="lg:col-span-5">
          {activeCourse ? (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                    {activeCourse.level} • {activeCourse.subject}
                  </span>
                  <h3 className="text-xl font-display font-bold text-gray-800 mt-2">
                    {activeCourse.title}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setActiveCourse(null);
                    setAiExplanation("");
                  }}
                  className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Table of contents / chapters */}
              <div>
                <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Plan du Chapitre
                </h5>
                <ul className="space-y-1.5">
                  {activeCourse.chapters.map((chap, idx) => (
                    <li key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                      {chap}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick Scheduler inside the active course reader */}
              <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-50/50 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                    <Clock className="h-4 w-4" />
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-gray-950">
                      Rappel de révision rapide
                    </h5>
                    <p className="text-[10px] text-gray-500">
                      Planifier une alerte de révision pour cette leçon
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    onClick={() => onScheduleSession(activeCourse.id, activeCourse.title, activeCourse.subject, activeCourse.level, 10)}
                    className="px-2.5 py-1.5 bg-white hover:bg-blue-50 border border-gray-150 text-[10px] font-bold text-gray-700 hover:text-blue-700 rounded-lg shadow-2xs transition-all cursor-pointer"
                  >
                    🚀 Dans 10s (Test)
                  </button>
                  <button
                    onClick={() => onScheduleSession(activeCourse.id, activeCourse.title, activeCourse.subject, activeCourse.level, 60)}
                    className="px-2.5 py-1.5 bg-white hover:bg-blue-50 border border-gray-150 text-[10px] font-bold text-gray-700 hover:text-blue-700 rounded-lg shadow-2xs transition-all cursor-pointer"
                  >
                    ⏱️ Dans 1 min
                  </button>
                  <button
                    onClick={() => onScheduleSession(activeCourse.id, activeCourse.title, activeCourse.subject, activeCourse.level, 1800)}
                    className="px-2.5 py-1.5 bg-white hover:bg-blue-50 border border-gray-150 text-[10px] font-bold text-gray-700 hover:text-blue-700 rounded-lg shadow-2xs transition-all cursor-pointer"
                  >
                    ☕ Dans 30 min
                  </button>
                  <button
                    onClick={() => {
                      // Pre-fill the left side planner and scroll to it
                      setPlannerCourseId(activeCourse.id);
                      setPlannerDelayType("custom");
                      const plannerRoot = document.getElementById("course-explorer-root");
                      if (plannerRoot) {
                        plannerRoot.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg shadow-2xs transition-all flex items-center gap-1 cursor-pointer ml-auto"
                  >
                    <Calendar className="h-3.5 w-3.5" /> Autre date...
                  </button>
                </div>
              </div>

              {/* Text content */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1">
                    💡 Astuce : Cliquez sur un mot pour le dictionnaire
                  </span>
                  <button
                    onClick={() => handleExportCoursePDF(activeCourse)}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer border border-slate-200"
                    title="Telecharger le cours complet en PDF"
                  >
                    <FileText className="h-3 w-3 text-teal-600" /> PDF Cours
                  </button>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl max-h-60 overflow-y-auto text-xs leading-relaxed text-gray-700 space-y-2 font-sans border border-gray-100 select-text">
                  {activeCourse.content.split("\n\n").map((para, i) => {
                    if (para.startsWith("###")) {
                      return <h4 key={i} className="font-bold text-gray-800 mt-2 text-sm">{para.replace("### ", "")}</h4>;
                    }
                    if (para.startsWith("* **")) {
                      return <p key={i} className="pl-2 border-l-2 border-blue-400 font-medium">{renderClickableText(para)}</p>;
                    }
                    return <p key={i}>{renderClickableText(para)}</p>;
                  })}
                </div>
              </div>

              {/* Mini-Dictionnaire de Poche IA */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                      <Book className="h-4 w-4" />
                    </span>
                    <div>
                      <h5 className="text-sm font-semibold text-gray-800">
                        Dictionnaire de Poche IA
                      </h5>
                      <p className="text-[10px] text-gray-400">
                        Cliquez sur un mot du cours ou cherchez-en un manuellement
                      </p>
                    </div>
                  </div>
                  {selectedWord && (
                    <button
                      onClick={() => {
                        setSelectedWord("");
                        setWordDefinition("");
                      }}
                      className="text-[10px] text-gray-400 hover:text-gray-600 font-semibold"
                    >
                      Effacer
                    </button>
                  )}
                </div>

                {/* Search input for dictionary */}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Saisir un mot à définir..."
                    className="flex-1 p-2 bg-white rounded-lg border border-gray-200 text-xs focus:outline-hidden focus:border-blue-500"
                    value={selectedWord}
                    onChange={(e) => setSelectedWord(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleWordClick(selectedWord);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleWordClick(selectedWord)}
                    className="px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                    disabled={!selectedWord.trim() || isLoadingWord}
                  >
                    Définir
                  </button>
                </div>

                {/* Definition result or prompt */}
                {isLoadingWord ? (
                  <div className="flex items-center justify-center py-4 gap-2 text-xs text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Définition par l'IA en cours...</span>
                  </div>
                ) : wordDefinition ? (
                  <div className="bg-white p-3.5 rounded-xl border border-blue-50 space-y-2">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                      <span className="text-xs font-bold text-blue-600 font-sans">
                        Définition de <span className="text-gray-800 underline font-mono">{selectedWord}</span> :
                      </span>
                      {isOffline && (
                        <span className="text-[8px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-sm font-bold uppercase">
                          Hors-ligne
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed font-sans whitespace-pre-wrap">
                      {wordDefinition}
                    </p>
                  </div>
                ) : selectedWord ? (
                  <p className="text-[10px] text-gray-400 italic text-center">
                    Appuyez sur "Définir" ou "Entrée" pour obtenir l'explication de l'IA pour "{selectedWord}".
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {dictionaryHistory.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                          Historique :
                        </span>
                        {dictionaryHistory.map((hWord, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleWordClick(hWord)}
                            className="px-2 py-0.5 bg-white hover:bg-blue-50 text-gray-600 hover:text-blue-700 text-[10px] rounded-md border border-gray-100 font-medium transition-all"
                          >
                            {hWord}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="text-[10px] text-gray-400 text-center italic">
                      Astuce : Cliquez sur n'importe quel mot souligné du cours ci-dessus.
                    </p>
                  </div>
                )}
              </div>

              {/* AI Tutor Option inside Reader */}
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🤖</span>
                  <div>
                    <h5 className="text-sm font-semibold text-blue-900">
                      Tuteur IA : Expliquer le cours différemment
                    </h5>
                    <p className="text-[11px] text-blue-700">
                      Notre IA ré-explique le cours selon vos besoins de compréhension.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-500">Niveau d'explication :</span>
                    {(["Simple", "Standard", "Approfondi"] as const).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setAiDifficulty(diff)}
                        className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                          aiDifficulty === diff
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-600 border border-gray-200"
                        }`}
                        disabled={isOffline}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handleExplainWithAI(activeCourse)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-semibold shadow-xs disabled:opacity-50"
                    disabled={isOffline || isLoadingAi}
                  >
                    {isLoadingAi ? "Explication en cours..." : "Expliquer avec l'IA"}
                  </button>
                </div>

                {isOffline && (
                  <p className="text-[10px] text-red-500 font-medium">
                    ⚠️ L'explication IA nécessite d'être connecté à Internet (Désactivez le mode hors-ligne).
                  </p>
                )}

                {aiExplanation && (
                  <div className="bg-white p-4 rounded-xl border border-blue-100 max-h-56 overflow-y-auto text-xs text-gray-700 leading-relaxed font-sans space-y-2 mt-2">
                    <div className="font-semibold text-blue-800 text-xs border-b border-blue-50 pb-1.5 flex items-center justify-between">
                      <span>Explication IA ({aiDifficulty}) :</span>
                      <button
                        onClick={handleExportPDF}
                        className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md border border-blue-200 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="Telecharger ce resume IA au format PDF"
                      >
                        <FileText className="h-3 w-3 text-blue-600" /> Exporter PDF
                      </button>
                    </div>
                    {aiExplanation.split("\n").map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-8 rounded-3xl border-2 border-dashed border-gray-200 text-center text-gray-500 space-y-2 sticky top-6">
              <BookOpen className="h-10 w-10 text-gray-300 mx-auto" />
              <h4 className="text-sm font-semibold text-gray-700">Lecteur et Tuteur IA</h4>
              <p className="text-xs max-w-xs mx-auto">
                Sélectionnez une leçon ou un exercice corrigé à gauche pour ouvrir l'espace de révision interactif assisté par intelligence artificielle.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
