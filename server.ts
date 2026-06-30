import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for base64 images used in simulated OCR
app.use(express.json({ limit: "20mb" }));

// Initialize Gemini client with standard AI Studio telemetry headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper for generic Gemini calls
const runGemini = async (prompt: string, systemInstruction?: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined,
    });
    return response.text;
  } catch (error: any) {
    console.error("Gemini call failed:", error);
    throw error;
  }
};

// 1. General chat and tutoring assistant
app.post("/api/chat", async (req, res) => {
  const { messages, level, subject } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  try {
    const systemInstruction = `Tu es "AfriLearn IA", un enseignant et tuteur d'élite spécialisé dans le programme scolaire et universitaire d'Afrique francophone.
Niveau actuel de l'étudiant : ${level || "Général"}.
Matière : ${subject || "Toutes matières"}.
Tu dois expliquer de manière pédagogique, patiente, claire, et encourager l'étudiant en utilisant des exemples concrets du quotidien africain (ex. l'économie de marché avec les marchés de Dantokpa, Treichville ou Sandaga, le calcul des rendements agricoles, l'histoire des empires africains, ou la physique de la cuisson).
Réponds en français fluide avec une mise en page Markdown soignée.`;

    // Construct simple context prompt from history
    let prompt = "";
    messages.forEach((msg: any) => {
      prompt += `${msg.role === "user" ? "Élève" : "Tuteur"}: ${msg.content}\n\n`;
    });
    prompt += "Tuteur: ";

    const responseText = await runGemini(prompt, systemInstruction);
    res.json({ content: responseText });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to get response from Gemini" });
  }
});

// 2. Educational Topic Explanation Route
app.post("/api/explain", async (req, res) => {
  const { topic, level, subject, difficulty } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  try {
    const systemInstruction = `Tu es un professeur chevronné d'Afrique francophone. Tu expliques les cours avec brio.`;
    const prompt = `Génère une fiche de cours structurée et pédagogique en français sur le thème : "${topic}".
Niveau ciblé : ${level || "Lycée"}
Matière : ${subject || "Général"}
Niveau de vulgarisation / difficulté : ${difficulty || "Standard"} (choix : Simple / Standard / Approfondi)

Ta fiche de cours doit comporter :
1. Une introduction captivante avec une analogie tirée de la vie de tous les jours en Afrique.
2. L'explication claire des concepts clés.
3. Deux exemples d'application pratiques (un problème résolu pas à pas).
4. Un court résumé "À retenir" (Fiche de révision).

Utilise un formatage Markdown riche avec des listes, des formules mathématiques simples et du texte en gras pour guider la lecture.`;

    const responseText = await runGemini(prompt, systemInstruction);
    res.json({ content: responseText });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to generate explanation" });
  }
});

// 3. Automated Quiz Generator (returns strict JSON)
app.post("/api/generate-quiz", async (req, res) => {
  const { topic, level, subject } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Topic is required to generate quiz" });
  }

  try {
    const prompt = `Génère un quiz interactif d'évaluation de 4 questions à choix multiples (QCM) en français sur le sujet : "${topic}" adapté au niveau "${level || "Lycée"}" (Matière: ${subject || "Général"}).`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Tu es un concepteur pédagogique de quiz d'évaluation. Retourne UNIQUEMENT un objet JSON valide conforme au schéma spécifié.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Le titre général du quiz" },
            questions: {
              type: Type.ARRAY,
              description: "La liste des 4 questions du quiz",
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: "L'énoncé clair de la question" },
                  options: {
                    type: Type.ARRAY,
                    description: "Les 4 options de réponse possibles",
                    items: { type: Type.STRING }
                  },
                  correctIndex: { type: Type.INTEGER, description: "L'indice de la bonne réponse dans le tableau options (0, 1, 2 ou 3)" },
                  explanation: { type: Type.STRING, description: "L'explication détaillée de pourquoi cette réponse est correcte" }
                },
                required: ["question", "options", "correctIndex", "explanation"]
              }
            }
          },
          required: ["title", "questions"]
        }
      }
    });

    const quizData = JSON.parse(response.text || "{}");
    res.json(quizData);
  } catch (error: any) {
    console.error("Quiz generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate quiz JSON" });
  }
});

// 4. Exercise and Step-by-Step Problem Generator
app.post("/api/generate-exercise", async (req, res) => {
  const { topic, level, subject } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  try {
    const prompt = `Génère un exercice pratique corrigé en français sur : "${topic}".
Niveau académique : ${level || "Lycée"}
Matière : ${subject || "Général"}

Structure de l'exercice :
- Titre de l'exercice
- Énoncé détaillé du problème / de la situation pratique
- Questions (1, 2, 3)
- Corrigé détaillé étape par étape avec des conseils méthodologiques clairs et des explications mathématiques ou conceptuelles détaillées.`;

    const responseText = await runGemini(prompt, "Tu es un examinateur officiel de concours et d'examens d'État.");
    res.json({ content: responseText });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to generate exercise" });
  }
});

// 5. Intelligent OCR Simulator (solves custom equations or uploaded image simulation)
app.post("/api/explain-ocr", async (req, res) => {
  const { imageBase64, imageType, presetId } = req.body;

  try {
    let part: any;
    let description = "";

    if (presetId) {
      // User picked a gorgeous preset equation/problem for quick testing
      if (presetId === "math") {
        description = "Une photo floue d'une équation quadratique : 2x² - 5x + 3 = 0. Résous-la avec delta et explique les étapes.";
        part = { text: `Résous cette équation trouvée sur cette image : 2x² - 5x + 3 = 0. Explique l'utilisation de discriminant Delta, calcule les racines réelles pas à pas en français.` };
      } else if (presetId === "physics") {
        description = "Un schéma d'une force de frottement sur un plan incliné en mécanique Newtonienne.";
        part = { text: `Explique et résous ce problème de physique sur plan incliné : Un solide de masse m = 5kg glisse sur un plan incliné de alpha = 30° avec frottements f = 2N. Calcule l'accélération du solide.` };
      } else {
        description = "Formule chimique équilibrée de la photosynthèse.";
        part = { text: `Explique la réaction chimique de la photosynthèse : 6 CO2 + 6 H2O + lumière -> C6H12O6 + 6 O2. Explique le rôle de chaque composant.` };
      }
    } else if (imageBase64) {
      // User actually simulated an image upload/snapshot
      // Strip off data url prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      part = {
        inlineData: {
          mimeType: imageType || "image/png",
          data: cleanBase64,
        },
      };
    } else {
      return res.status(400).json({ error: "Either imageBase64 or presetId is required" });
    }

    const systemInstruction = "Tu es un lecteur d'images et tuteur scientifique d'IA. Tu identifies les textes mathématiques, physiques ou chimiques écrits à la main ou imprimés, puis tu fournis une correction magique, complète et structurée.";
    const mainPrompt = imageBase64 
      ? "Analyse cette image d'exercice. Identifie l'énoncé, décris le problème trouvé, puis propose sa résolution complète étape par étape en français."
      : part.text;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: imageBase64 ? { parts: [part, { text: mainPrompt }] } : mainPrompt,
      config: { systemInstruction },
    });

    res.json({
      recognizedText: imageBase64 ? "Équation/Exercice détecté sur l'image envoyée" : description,
      solution: response.text,
    });
  } catch (error: any) {
    console.error("OCR simulation failed:", error);
    res.status(500).json({ error: error.message || "Failed to analyze image with Gemini" });
  }
});

// 6. Automatic notes summarizer and flashcard compiler
app.post("/api/summarize-doc", async (req, res) => {
  const { textContent, level, subject } = req.body;
  if (!textContent) {
    return res.status(400).json({ error: "Text content is required to summarize" });
  }

  try {
    const prompt = `Synthétise les notes de cours suivantes pour un élève de niveau "${level || "Lycée"}" (Matière: ${subject || "Général"}).
Notes de cours fournies :
"""
${textContent}
"""`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Tu es un expert en méthodes de révision active (Spaced Repetition, méthode de Feyman). Tu crées des résumés magnifiques et ultra synthétiques accompagnés de cartes mémoire (flashcards). Retourne la réponse uniquement sous format JSON structuré.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Le résumé global structuré en français (en Markdown)" },
            keyTakeaways: {
              type: Type.ARRAY,
              description: "Les 3 points capitaux à mémoriser absolument",
              items: { type: Type.STRING }
            },
            flashcards: {
              type: Type.ARRAY,
              description: "Un ensemble de 4 flashcards de révision active (Question/Réponse)",
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: "La question sur une notion clé" },
                  answer: { type: Type.STRING, description: "La réponse concise et exacte à mémoriser" }
                },
                required: ["question", "answer"]
              }
            }
          },
          required: ["summary", "keyTakeaways", "flashcards"]
        }
      }
    });

    const summaryData = JSON.parse(response.text || "{}");
    res.json(summaryData);
  } catch (error: any) {
    console.error("Summarization error:", error);
    res.status(500).json({ error: error.message || "Failed to summarize text" });
  }
});

// 7. Mini-dictionary word definition lookup
app.post("/api/dictionary", async (req, res) => {
  const { word, level, subject } = req.body;
  if (!word || typeof word !== "string") {
    return res.status(400).json({ error: "Un mot ou une expression est requis." });
  }

  try {
    const systemInstruction = `Tu es un dictionnaire encyclopédique et pédagogique d'élite pour les élèves d'Afrique francophone.`;
    const prompt = `Donne une définition courte, ultra-pédagogique et claire en français du mot ou de l'expression : "${word.trim()}".
Niveau de l'élève : ${level || "Général"}.
Matière / Contexte : ${subject || "Général"}.

Ta réponse doit comporter :
1. Une définition simple d'une ou deux phrases compréhensible par un élève.
2. Un exemple concret d'utilisation lié à son programme scolaire ou à la vie courante en Afrique francophone.
Reste très concis (maximum 80 mots au total).`;

    const responseText = await runGemini(prompt, systemInstruction);
    res.json({ definition: responseText });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Impossible de récupérer la définition." });
  }
});

// Serve frontend assets in development and production
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
    console.log(`AfriLearn IA server running at http://localhost:${PORT}`);
  });
}

startServer();
