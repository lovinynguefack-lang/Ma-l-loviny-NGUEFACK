// Shared TypeScript definitions for AfriLearn IA

export type Level = "Primaire" | "Collège" | "Lycée" | "Université" | "BTS" | "Concours" | "Professionnel";

export type Subject = "Mathématiques" | "Physique-Chimie" | "Français & Lettres" | "SVT (Biologie)" | "Histoire-Géographie" | "Informatique & Tech" | "Langues" | "Entrepreneuriat";

export interface Course {
  id: string;
  title: string;
  subject: Subject;
  level: Level;
  summary: string;
  chapters: string[];
  duration: string;
  isPremium: boolean;
  isDownloaded: boolean;
  content: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  subject: Subject;
  level: Level;
  questions: QuizQuestion[];
}

export interface LibraryItem {
  id: string;
  title: string;
  author: string;
  type: "PDF" | "Vidéo" | "Présentation";
  sizeOrDuration: string;
  subject: Subject;
  level: Level;
  downloadUrl: string;
  isDownloaded: boolean;
}

export interface PresetImageProblem {
  id: string;
  title: string;
  subject: string;
  previewUrl: string;
  description: string;
}

export interface Post {
  id: string;
  author: string;
  role: "Enseignant" | "Élève" | "Tuteur IA";
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  commentsCount: number;
  hasLiked?: boolean;
  attachmentName?: string;
  attachmentType?: string;
}

export interface RoadmapMilestone {
  month: number;
  title: string;
  phase: "MVP" | "Croissance" | "Expansion";
  objectives: string[];
  acquisitionGoal: string;
  status: "completed" | "current" | "upcoming";
}

export interface ScheduledSession {
  id: string;
  courseId: string;
  courseTitle: string;
  subject: string;
  level: string;
  time: number; // timestamp in ms
  triggered: boolean;
  dateTimeStr: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  courseId?: string;
  type: "info" | "success" | "warning";
}

