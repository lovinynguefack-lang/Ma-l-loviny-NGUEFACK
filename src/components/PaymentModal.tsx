import React, { useState } from "react";
import { 
  X, 
  Smartphone, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  ArrowRight, 
  Sparkles,
  Info,
  QrCode,
  Copy,
  Check
} from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  premiumPriceEuro?: number;
}

type PaymentMethod = "orange" | "mtn" | "neero" | "other";

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  onPaymentSuccess,
  premiumPriceEuro = 3.50
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("orange");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [neeroUsername, setNeeroUsername] = useState("");
  const [otherMethod, setOtherMethod] = useState("Wave");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Flow states
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  // Approximate CFA exchange rate (1 EUR = 655.957 XAF)
  const priceInCFA = Math.round(premiumPriceEuro * 656);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (selectedMethod === "orange" || selectedMethod === "mtn") {
      if (!phoneNumber.trim()) {
        setErrorMessage("Veuillez saisir le numéro de téléphone ayant effectué le paiement.");
        return;
      }
      if (!transactionId.trim()) {
        setErrorMessage("Veuillez saisir la référence de transaction reçue par SMS.");
        return;
      }
    } else if (selectedMethod === "neero") {
      if (!neeroUsername.trim()) {
        setErrorMessage("Veuillez saisir votre identifiant ou e-mail Neero.");
        return;
      }
    }

    setErrorMessage("");
    setStatus("processing");

    // Simulate payment validation backend check
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
        // Reset state
        setStatus("idle");
        setPhoneNumber("");
        setTransactionId("");
        setNeeroUsername("");
      }, 2500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-fade-in" id="payment-modal-container">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col relative animate-scale-up">
        
        {/* Header section */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-700 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white/90 transition-colors"
            id="close-payment-modal"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-md tracking-wider">
              Passerelle Sécurisée
            </span>
            <div className="flex items-center gap-1 text-amber-300 font-bold text-xs">
              <Sparkles className="h-3.5 w-3.5 fill-amber-300" />
              <span>Accès Premium Illimité</span>
            </div>
          </div>
          
          <h3 className="text-xl font-display font-bold">Activer l'abonnement AfriLearn IA</h3>
          <p className="text-xs text-blue-100/80 mt-1">
            Rejoignez des milliers d'élèves d'Afrique francophone et débloquez tous les cours, annales et l'assistance du Tuteur IA sans limite.
          </p>

          <div className="mt-4 bg-white/10 p-3.5 rounded-xl flex items-center justify-between">
            <span className="text-xs font-medium text-blue-50">Tarif unique mensuel :</span>
            <div className="text-right">
              <span className="text-lg font-bold font-mono">{premiumPriceEuro.toFixed(2)} €</span>
              <span className="text-xs text-blue-200 block">Soit env. <strong className="text-white font-mono">{priceInCFA.toLocaleString()} FCFA</strong></span>
            </div>
          </div>
        </div>

        {/* Success Flow Overlap */}
        {status === "success" && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 py-16 bg-white min-h-[400px]">
            <div className="h-16 w-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center animate-bounce shadow-xs">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h4 className="text-xl font-display font-bold text-gray-800">Paiement Validé avec Succès !</h4>
            <p className="text-xs text-gray-500 max-w-sm">
              Votre transaction a été identifiée et validée. Votre compte est désormais <strong className="text-blue-600">Premium</strong> ! Profitez des cours, évaluations et tuteur IA illimités.
            </p>
            <div className="text-xs font-semibold text-blue-600 animate-pulse pt-2">
              Redirection vers vos cours...
            </div>
          </div>
        )}

        {/* Processing / Spinner Overlap */}
        {status === "processing" && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 py-16 bg-white min-h-[400px]">
            <div className="h-12 w-12 text-blue-600 animate-spin">
              <Loader2 className="h-12 w-12" />
            </div>
            <h4 className="text-base font-semibold text-gray-800">Validation de la transaction en cours...</h4>
            <p className="text-xs text-gray-400 max-w-xs">
              Nous interrogeons les passerelles mobiles et Neero pour confirmer la réception de votre virement. Veuillez patienter quelques secondes.
            </p>
          </div>
        )}

        {/* Form and Selection Area */}
        {status === "idle" && (
          <form onSubmit={handleSubmitPayment} className="p-6 flex-1 flex flex-col gap-5 overflow-y-auto max-h-[500px]">
            
            {/* Method Choice */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Moyen de paiement préféré
              </label>
              
              <div className="grid grid-cols-2 gap-2.5">
                {/* Orange Money */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMethod("orange");
                    setErrorMessage("");
                  }}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    selectedMethod === "orange" 
                      ? "border-orange-500 bg-orange-50/40 ring-1 ring-orange-500" 
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="p-1.5 bg-orange-500 text-white rounded-lg shrink-0 text-xs font-bold">
                    OM
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-800">Orange Money</span>
                    <span className="text-[10px] text-gray-400">Réseau Orange</span>
                  </div>
                </button>

                {/* MTN Money */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMethod("mtn");
                    setErrorMessage("");
                  }}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    selectedMethod === "mtn" 
                      ? "border-amber-500 bg-amber-50/40 ring-1 ring-amber-500" 
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="p-1.5 bg-amber-500 text-slate-900 rounded-lg shrink-0 text-xs font-bold">
                    MTN
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-800">MTN MoMo</span>
                    <span className="text-[10px] text-gray-400">Réseau MTN</span>
                  </div>
                </button>

                {/* Neero */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMethod("neero");
                    setErrorMessage("");
                  }}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    selectedMethod === "neero" 
                      ? "border-teal-600 bg-teal-50/40 ring-1 ring-teal-500" 
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="p-1.5 bg-teal-600 text-white rounded-lg shrink-0 text-xs font-bold">
                    NR
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-800">Neero Link</span>
                    <span className="text-[10px] text-gray-400">Fintech Africaine</span>
                  </div>
                </button>

                {/* Other systems */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMethod("other");
                    setErrorMessage("");
                  }}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    selectedMethod === "other" 
                      ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-500" 
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="p-1.5 bg-blue-600 text-white rounded-lg shrink-0 text-xs">
                    <CreditCard className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-800">Autres cartes</span>
                    <span className="text-[10px] text-gray-400">Wave, Visa, Moov</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Dynamic Step-by-Step Payment Instructions */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-blue-500 shrink-0" />
                <span>Comment procéder au règlement ?</span>
              </h4>

              {selectedMethod === "orange" && (
                <div className="text-xs text-gray-600 space-y-2.5 font-sans">
                  <p>
                    Pour Orange Money, effectuez un transfert ou composez le menu de paiement vers notre compte de collecte officiel :
                  </p>
                  <div className="bg-white p-3 rounded-xl border border-orange-100 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-orange-500 font-bold block uppercase tracking-wider">Numéro Orange de collecte</span>
                      <strong className="text-base text-gray-800 font-mono">690 466 709</strong>
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleCopy("690466709", "Orange Number")}
                      className="flex items-center gap-1 text-[10px] bg-orange-50 hover:bg-orange-100 text-orange-700 px-2.5 py-1.5 rounded-lg font-semibold transition-all"
                    >
                      {copiedText === "Orange Number" ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span>Copié</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>
                  <ul className="list-decimal pl-4 space-y-1 text-[11px] text-gray-500">
                    <li>Envoyez le montant exact de <strong>{priceInCFA} FCFA</strong> (frais de retrait inclus par sécurité).</li>
                    <li>Conservez précieusement le SMS de confirmation d'Orange Money.</li>
                    <li>Renseignez le formulaire ci-dessous pour activer le Premium.</li>
                  </ul>
                </div>
              )}

              {selectedMethod === "mtn" && (
                <div className="text-xs text-gray-600 space-y-2.5 font-sans">
                  <p>
                    Pour MTN Mobile Money (MoMo), effectuez un virement direct ou composez le menu de paiement vers notre compte de collecte officiel :
                  </p>
                  <div className="bg-white p-3 rounded-xl border border-amber-200 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-amber-600 font-bold block uppercase tracking-wider">Numéro MTN de collecte</span>
                      <strong className="text-base text-gray-800 font-mono">682 317 823</strong>
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleCopy("682317823", "MTN Number")}
                      className="flex items-center gap-1 text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-800 px-2.5 py-1.5 rounded-lg font-semibold transition-all"
                    >
                      {copiedText === "MTN Number" ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span>Copié</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>
                  <ul className="list-decimal pl-4 space-y-1 text-[11px] text-gray-500">
                    <li>Envoyez le montant exact de <strong>{priceInCFA} FCFA</strong> au numéro MTN MoMo indiqué.</li>
                    <li>Récupérez la référence de transaction de 10-12 chiffres sur votre SMS MTN.</li>
                    <li>Indiquez votre numéro d'envoi et la référence ci-dessous.</li>
                  </ul>
                </div>
              )}

              {selectedMethod === "neero" && (
                <div className="text-xs text-gray-600 space-y-2.5 font-sans">
                  <p>
                    Paiement instantané par votre solde <strong>Neero Pay</strong> ou votre carte de débit virtuelle Neero :
                  </p>
                  <div className="bg-white p-3.5 rounded-xl border border-teal-100">
                    <p className="text-[11px] text-teal-800 font-medium">
                      🚀 Neero permet un paiement ultra-rapide sans frais et sans code complexe. Saisissez votre identifiant Neero pour envoyer une demande de débit d'un clic.
                    </p>
                  </div>
                </div>
              )}

              {selectedMethod === "other" && (
                <div className="text-xs text-gray-600 space-y-2 font-sans">
                  <div className="flex gap-2 items-center mb-2">
                    <span className="text-xs font-semibold text-slate-700">Moyen de paiement alternatif :</span>
                    <select 
                      className="p-1 rounded bg-white border border-gray-200 text-xs font-medium"
                      value={otherMethod}
                      onChange={(e) => setOtherMethod(e.target.value)}
                    >
                      <option value="Wave">Wave Côte d'Ivoire / Sénégal</option>
                      <option value="Moov">Moov Money (Flooz)</option>
                      <option value="Visa">Carte Visa / Mastercard</option>
                      <option value="Crypto">Neero Stablecoin (USDT)</option>
                    </select>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Pour {otherMethod}, veuillez utiliser le widget de redirection sécurisée qui s'ouvrira après avoir cliqué sur valider.
                  </p>
                </div>
              )}
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <p className="text-xs text-red-500 font-semibold bg-red-50 p-2.5 rounded-xl border border-red-100 flex items-center gap-1.5">
                ⚠️ {errorMessage}
              </p>
            )}

            {/* Form Fields based on selection */}
            {selectedMethod !== "neero" && selectedMethod !== "other" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 block">
                    Votre Numéro de Téléphone Payeur
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: +237 699 999 999"
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500 text-xs font-mono"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 block">
                    ID de la Transaction (reçu par SMS)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: TXN-58291048"
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500 text-xs font-mono"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>
              </div>
            )}

            {selectedMethod === "neero" && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 block">
                  Votre Identifiant ou E-mail Neero
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: @eleve_neero ou mon-email@domaine.com"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500 text-xs font-mono"
                  value={neeroUsername}
                  onChange={(e) => setNeeroUsername(e.target.value)}
                />
              </div>
            )}

            {selectedMethod === "other" && (
              <div className="space-y-1.5">
                <p className="text-[11px] text-gray-500 bg-blue-50 p-2 rounded-lg text-center">
                  Entrez vos coordonnées pour recevoir le lien de facturation {otherMethod}.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nom complet"
                    className="p-2.5 rounded-xl border border-gray-200 text-xs"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Téléphone ou e-mail"
                    className="p-2.5 rounded-xl border border-gray-200 text-xs"
                    required
                  />
                </div>
              </div>
            )}

            {/* Submit / Action Button */}
            <div className="pt-2 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
              >
                Annuler
              </button>

              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
              >
                <span>Confirmer et valider</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Footer trust badge */}
            <div className="border-t border-gray-100 pt-3 flex items-center justify-center gap-2 text-[10px] text-gray-400">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              <span>Chiffrement SSL 256 bits • Données de transaction protégées</span>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
