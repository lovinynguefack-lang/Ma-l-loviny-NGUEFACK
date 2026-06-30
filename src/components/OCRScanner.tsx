import React, { useState } from "react";
import { PRESET_IMAGE_PROBLEMS } from "../data";
import { Camera, Image as ImageIcon, Sparkles, AlertCircle, RefreshCw, FileText, CheckCircle } from "lucide-react";

interface OCRScannerProps {
  isOffline: boolean;
}

export default function OCRScanner({ isOffline }: OCRScannerProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState("");
  const [solution, setSolution] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"preset" | "upload">("preset");

  const handleSolve = async (presetId: string | null, customBase64: string | null) => {
    if (isOffline) return;
    setIsLoading(true);
    setOcrText("");
    setSolution("");

    try {
      const payload: any = {};
      if (presetId) {
        payload.presetId = presetId;
      } else if (customBase64) {
        payload.imageBase64 = customBase64;
        payload.imageType = "image/png";
      } else {
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/explain-ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (response.ok) {
        setOcrText(data.recognizedText || "Formule mathématique extraite par OCR");
        setSolution(data.solution);
      } else {
        setSolution(`Erreur d'analyse d'image : ${data.error}`);
      }
    } catch (err) {
      setSolution("Erreur lors de la communication avec le serveur d'analyse optique d'IA.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setUploadedImage(base64);
        setSelectedPreset(null);
        handleSolve(null, base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="ocr-scanner-root">
      {/* Visual Workspace */}
      <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-gray-100 space-y-5">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Camera className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display font-semibold text-gray-800">Scanner d'Exercices (OCR)</h3>
            <p className="text-xs text-gray-400">Prends en photo un devoir pour obtenir l'explication d'IA</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => {
              setActiveTab("preset");
              setUploadedImage(null);
              setOcrText("");
              setSolution("");
            }}
            className={`flex-1 pb-2.5 text-xs font-semibold text-center border-b-2 transition-all ${
              activeTab === "preset"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Sujets de Démo
          </button>
          <button
            onClick={() => {
              setActiveTab("upload");
              setSelectedPreset(null);
              setOcrText("");
              setSolution("");
            }}
            className={`flex-1 pb-2.5 text-xs font-semibold text-center border-b-2 transition-all ${
              activeTab === "upload"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Importer un Exercice
          </button>
        </div>

        {activeTab === "preset" ? (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">Sélectionne un cas d'étude pour tester la reconnaissance instantanée :</p>
            <div className="grid grid-cols-1 gap-3">
              {PRESET_IMAGE_PROBLEMS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedPreset(preset.id);
                    setUploadedImage(null);
                    handleSolve(preset.id, null);
                  }}
                  disabled={isOffline || isLoading}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    selectedPreset === preset.id
                      ? "border-blue-500 bg-blue-50/50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <img
                    src={preset.previewUrl}
                    alt={preset.title}
                    className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-gray-800">{preset.title}</h4>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">{preset.description}</p>
                    <span className="inline-block text-[9px] mt-1 text-blue-600 font-mono font-medium">
                      {preset.subject}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-gray-500">Glisse une capture d'écran, une photo ou utilise l'appareil de ton téléphone :</p>
            
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-400 transition-all bg-gray-50/50 relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isOffline || isLoading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <ImageIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <h4 className="text-xs font-semibold text-gray-700">Sélectionner ou Glisser l'image</h4>
              <p className="text-[10px] text-gray-400 mt-1">PNG, JPG ou JPEG jusqu'à 10 Mo</p>
            </div>

            {uploadedImage && (
              <div className="border border-gray-100 rounded-xl p-3 bg-gray-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" /> Image importée
                  </span>
                  <button
                    onClick={() => {
                      setUploadedImage(null);
                      setSolution("");
                      setOcrText("");
                    }}
                    className="text-[10px] text-red-500 font-medium hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
                <img
                  src={uploadedImage}
                  alt="Uploaded preview"
                  className="max-h-48 rounded-lg object-contain mx-auto border bg-white"
                />
              </div>
            )}
          </div>
        )}

        {isOffline && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-700">
              <h5 className="font-semibold">OCR indisponible hors-ligne</h5>
              <p className="text-[10px] opacity-90 mt-0.5">L'analyse d'image et le calcul mathématique intelligent s'effectuent sur nos serveurs de calcul IA.</p>
            </div>
          </div>
        )}
      </div>

      {/* AI Correction & Resolution Workspace */}
      <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <h3 className="font-display font-semibold text-gray-800">Analyse & Résolution IA</h3>
            {isLoading && (
              <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Lecture de l'image...
              </div>
            )}
          </div>

          {!ocrText && !solution && !isLoading ? (
            <div className="h-72 flex flex-col items-center justify-center text-center text-gray-400 space-y-2 bg-gray-50/50 rounded-xl border border-dashed border-gray-100">
              <FileText className="h-10 w-10 text-gray-300" />
              <h4 className="text-xs font-semibold text-gray-600">En attente d'exercice</h4>
              <p className="text-[11px] max-w-xs px-4">
                Sélectionnez l'un des sujets de démo ou importez une photo d'équation pour lancer l'OCR et le solveur de devoirs magique.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {ocrText && (
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Texte reconnu par OCR
                  </h4>
                  <p className="text-xs text-gray-700 font-mono">{ocrText}</p>
                </div>
              )}

              {solution && (
                <div className="bg-blue-50/20 p-5 rounded-xl border border-blue-100/60 max-h-96 overflow-y-auto space-y-3">
                  <div className="flex items-center justify-between border-b border-blue-50 pb-2">
                    <span className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" /> Correction Détaillée d'IA
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">Gemini 3.5 Flash</span>
                  </div>
                  
                  <div className="text-xs leading-relaxed text-gray-700 space-y-2.5 font-sans">
                    {solution.split("\n\n").map((para, idx) => {
                      if (para.startsWith("###") || para.startsWith("####")) {
                        return (
                          <h4 key={idx} className="font-bold text-gray-800 mt-3 text-xs border-b border-gray-100 pb-1 uppercase tracking-wider">
                            {para.replace(/###|####/g, "").trim()}
                          </h4>
                        );
                      }
                      if (para.startsWith("* **")) {
                        return (
                          <p key={idx} className="pl-2 border-l-2 border-blue-400 font-medium">
                            {para}
                          </p>
                        );
                      }
                      return <p key={idx}>{para}</p>;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-[10px] text-gray-400 border-t border-gray-50 pt-4 mt-6">
          ⚠️ Notre OCR supporte la lecture de l'écriture manuscrite et imprimée. Les modèles physiques et mathématiques sont optimisés pour les programmes d'Afrique francophone (Bac A, B, C, D, G, BTS et Grandes Écoles).
        </div>
      </div>
    </div>
  );
}
