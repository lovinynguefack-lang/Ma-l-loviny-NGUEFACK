import React, { useState } from "react";
import { DollarSign, Users, Award, Percent, Building, RefreshCw, Smartphone, TrendingUp, Info } from "lucide-react";
import { ResponsiveContainer, AreaChart, XAxis, YAxis, Tooltip, Area, CartesianGrid } from "recharts";

export default function MonetizationSimulator() {
  const [premiumPrice, setPremiumPrice] = useState<number>(3.5); // Average sub in € per month
  const [conversionRate, setConversionRate] = useState<number>(2.5); // % of free users converting to premium
  const [adsRevenuePerK, setAdsRevenuePerK] = useState<number>(1.2); // € ad revenue per 1000 views/week
  const [b2bLicensesCount, setB2bLicensesCount] = useState<number>(12); // Number of partner universities/schools
  const [b2bAnnualPrice, setB2bAnnualPrice] = useState<number>(1500); // € average annual fee per institution

  // Calculation targets
  const targets = [
    { label: "1 000 € / semaine", amount: 1000 },
    { label: "5 000 € / semaine", amount: 5000 },
    { label: "10 000 € / semaine", amount: 10000 }
  ];

  // Calculated factors
  // Premium price per week per premium user
  const premiumPricePerWeek = premiumPrice / 4;
  // B2B weekly contribution
  const b2bWeeklyRevenue = (b2bLicensesCount * b2bAnnualPrice) / 52;

  // Let's calculate the required Active Weekly Users to reach a target:
  // Weekly Revenue = (ActiveUsers * conversionRate/100 * premiumPricePerWeek) + (ActiveUsers * (1 - conversionRate/100) * (adsRevenuePerK / 1000)) + B2BWeekly
  // Weekly Revenue - B2BWeekly = ActiveUsers * [ (conversionRate/100 * premiumPricePerWeek) + ((1 - conversionRate/100) * adsRevenuePerK / 1000) ]
  // ActiveUsers = (Weekly Revenue - B2BWeekly) / [ (conversionRate/100 * premiumPricePerWeek) + ((1 - conversionRate/100) * adsRevenuePerK / 1000) ]
  
  const calculateRequiredUsers = (targetWeekly: number) => {
    const remainingTarget = Math.max(0, targetWeekly - b2bWeeklyRevenue);
    const revenuePerUserPerWeek = 
      ((conversionRate / 100) * premiumPricePerWeek) + 
      (((100 - conversionRate) / 100) * (adsRevenuePerK / 1000));
    
    if (revenuePerUserPerWeek === 0) return 0;
    return Math.round(remainingTarget / revenuePerUserPerWeek);
  };

  // Generate chart data based on weekly active users (WAU) from 10k to 250k
  const chartData = [10000, 30000, 60000, 100000, 150000, 200000, 250000].map((wau) => {
    const premiumUsers = Math.round(wau * (conversionRate / 100));
    const freeUsers = wau - premiumUsers;
    const weeklyPremiumRevenue = premiumUsers * premiumPricePerWeek;
    const weeklyAdsRevenue = freeUsers * (adsRevenuePerK / 1000);
    const weeklyB2bRevenue = b2bWeeklyRevenue;
    const totalWeekly = Math.round(weeklyPremiumRevenue + weeklyAdsRevenue + weeklyB2bRevenue);
    
    return {
      wau: `${wau / 1000}k`,
      "Abonnements Premium": Math.round(weeklyPremiumRevenue),
      "Publicité Freemium": Math.round(weeklyAdsRevenue),
      "Licences Écoles B2B": Math.round(weeklyB2bRevenue),
      "Revenu Hebdomadaire Total": totalWeekly
    };
  });

  return (
    <div className="space-y-6" id="monetization-simulator-root">
      {/* Introduction */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <TrendingUp className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display font-semibold text-gray-800 text-lg">Modèle Économique Hybride & Simulateur Financier</h3>
            <p className="text-xs text-gray-400">Prévoyez la rentabilité d'AfriLearn IA selon vos paramètres d'acquisition</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed font-sans">
          Pour assurer une large inclusion en Afrique francophone tout en générant des revenus récurrents, nous combinons :
          un modèle <strong className="text-gray-700">Freemium</strong> financé par de la publicité légère, un abonnement <strong className="text-gray-700">Premium</strong> abordable (payable par MTN MoMo, Orange Money, Wave et Cartes bancaires), des abonnements collectifs <strong className="text-gray-700">B2B</strong> pour établissements d'excellence (écoles privées, universités), et une <strong className="text-gray-700">marketplace</strong> pour les documents de révision.
        </p>
      </div>

      {/* Calculator and Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders and Settings */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-gray-100 space-y-5">
          <h4 className="font-display font-semibold text-gray-800 text-xs uppercase tracking-wider border-b border-gray-50 pb-2">
            Paramètres Modifiables
          </h4>

          <div className="space-y-4">
            {/* Premium Pricing */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
                <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5 text-blue-500" /> Tarif Abonnement Premium</span>
                <span className="text-blue-600 font-mono">{premiumPrice.toFixed(2)} € / mois</span>
              </div>
              <input
                type="range"
                min="1.5"
                max="8.0"
                step="0.1"
                className="w-full accent-blue-600 cursor-pointer"
                value={premiumPrice}
                onChange={(e) => setPremiumPrice(parseFloat(e.target.value))}
              />
              <p className="text-[10px] text-gray-400">Prix mensuel d'appel via Mobile Money et Micro-paiements.</p>
            </div>

            {/* Conversion Rate */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
                <span className="flex items-center gap-1"><Percent className="h-3.5 w-3.5 text-blue-500" /> Taux de conversion Premium</span>
                <span className="text-blue-600 font-mono">{conversionRate.toFixed(1)} %</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10.0"
                step="0.1"
                className="w-full accent-blue-600 cursor-pointer"
                value={conversionRate}
                onChange={(e) => setConversionRate(parseFloat(e.target.value))}
              />
              <p className="text-[10px] text-gray-400">Pourcentage d'utilisateurs actifs mensuels s'abonnant au Premium.</p>
            </div>

            {/* Ads Revenue */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
                <span className="flex items-center gap-1"><Smartphone className="h-3.5 w-3.5 text-blue-500" /> CPM Publicitaire (Freemium)</span>
                <span className="text-blue-600 font-mono">{adsRevenuePerK.toFixed(2)} € / 1k vues/semaine</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.1"
                className="w-full accent-blue-600 cursor-pointer"
                value={adsRevenuePerK}
                onChange={(e) => setAdsRevenuePerK(parseFloat(e.target.value))}
              />
              <p className="text-[10px] text-gray-400">Revenus de régies publicitaires locales sur l'application gratuite.</p>
            </div>

            {/* B2B Licenses count */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
                <span className="flex items-center gap-1"><Building className="h-3.5 w-3.5 text-blue-500" /> Écoles & Universités B2B</span>
                <span className="text-blue-600 font-mono">{b2bLicensesCount} partenaires</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                className="w-full accent-blue-600 cursor-pointer"
                value={b2bLicensesCount}
                onChange={(e) => setB2bLicensesCount(parseInt(e.target.value))}
              />
            </div>

            {/* B2B annual price */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
                <span className="flex items-center gap-1"><Building className="h-3.5 w-3.5 text-blue-500" /> Licence Annuelle B2B</span>
                <span className="text-blue-600 font-mono">{b2bAnnualPrice} € / école</span>
              </div>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                className="w-full accent-blue-600 cursor-pointer"
                value={b2bAnnualPrice}
                onChange={(e) => setB2bAnnualPrice(parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <Info className="h-3 w-3 text-blue-500" /> Passerelles de Collecte Intégrées
            </h5>
            <p className="text-[10px] text-gray-600 leading-relaxed font-sans">
              La passerelle AfriLearn IA est connectée directement aux APIs et numéros de collecte agréés pour valider automatiquement les abonnements Premium :
            </p>
            <div className="space-y-1 pt-1">
              <div className="flex justify-between items-center text-[10px] bg-white p-2 rounded-lg border border-gray-200/50">
                <span className="font-semibold text-orange-600">Orange Money</span>
                <span className="font-mono text-gray-700 font-bold">690 466 709</span>
              </div>
              <div className="flex justify-between items-center text-[10px] bg-white p-2 rounded-lg border border-gray-200/50">
                <span className="font-semibold text-amber-600">MTN Mobile Money</span>
                <span className="font-mono text-gray-700 font-bold">682 317 823</span>
              </div>
              <div className="flex justify-between items-center text-[10px] bg-white p-2 rounded-lg border border-gray-200/50">
                <span className="font-semibold text-teal-600">Neero & autres (Wave, etc.)</span>
                <span className="text-gray-500 text-[9px] font-medium">Validations API</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Required Users Breakdown */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-gray-800 text-xs uppercase tracking-wider">
              Nombre d'utilisateurs hebdomadaires requis par palier de gains
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {targets.map((target, idx) => {
                const requiredUsers = calculateRequiredUsers(target.amount);
                return (
                  <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{target.label}</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-slate-800 font-mono">
                        {requiredUsers.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[9px] text-gray-400">Utilisateurs Actifs Hebdo (WAU)</p>
                    <div className="pt-2 border-t border-slate-200/50 flex justify-between text-[9px] text-slate-500 font-medium">
                      <span>Premium: {Math.round(requiredUsers * (conversionRate / 100)).toLocaleString()}</span>
                      <span>Pubs: {Math.round(requiredUsers * ((100 - conversionRate) / 100)).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Area Chart projection */}
          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-gray-700 flex items-center gap-1">
              Courbe de projection des revenus hebdomadaires (selon le volume WAU)
            </h5>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="wau" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "12px", border: "1px solid #f1f5f9" }} />
                  <Area
                    type="monotone"
                    dataKey="Revenu Hebdomadaire Total"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Abonnements Premium"
                    stroke="#f59e0b"
                    strokeWidth={1}
                    fill="none"
                  />
                  <Area
                    type="monotone"
                    dataKey="Publicité Freemium"
                    stroke="#10b981"
                    strokeWidth={1}
                    fill="none"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
