import React, { useState } from "react";
import { ROADMAP_MILESTONES, MARKETING_CHANNELS } from "../data";
import { RoadmapMilestone } from "../types";
import { Calendar, Users, Target, Rocket, Smartphone, MessageCircle, Heart, Award } from "lucide-react";

export default function MarketingRoadmap() {
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>(ROADMAP_MILESTONES);

  return (
    <div className="space-y-8" id="marketing-roadmap-root">
      {/* Marketing Strategies Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Target className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display font-semibold text-gray-800 text-lg">Stratégie d'Acquisition Client (Marketing GTM)</h3>
            <p className="text-xs text-gray-400">Plan d'action d'acquisition organique et payant ciblé sur 12 mois</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MARKETING_CHANNELS.map((channel, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="text-2xl">{channel.icon}</span>
                  <h4 className="font-display font-semibold text-gray-800 text-sm">{channel.name}</h4>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed font-sans">{channel.description}</p>
                
                <div className="mt-3 pt-3 border-t border-gray-50 space-y-1">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Rôle Clé</span>
                  <p className="text-[10px] text-gray-500 font-sans">{channel.role}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-50 bg-gray-50 -mx-5 -mb-5 p-4 rounded-b-2xl">
                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest block mb-0.5">Tactique</span>
                <p className="text-[10px] text-gray-700 font-medium font-sans">{channel.strategy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive 12-Month Roadmap Timeline */}
      <div className="space-y-6 pt-2">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <Calendar className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display font-semibold text-gray-800 text-lg">Plan de Développement & Roadmap (12 Mois)</h3>
            <p className="text-xs text-gray-400">Chronologie de l'exécution technique et de la croissance d'utilisateurs</p>
          </div>
        </div>

        <div className="relative border-l border-gray-100 ml-4 pl-6 space-y-8">
          {milestones.map((milestone, idx) => {
            const isCompleted = milestone.status === "completed";
            const isCurrent = milestone.status === "current";

            return (
              <div key={idx} className="relative">
                {/* Visual marker */}
                <span className={`absolute -left-10 top-0 h-8 w-8 rounded-full border-4 border-white flex items-center justify-center text-xs font-bold ${
                  isCompleted 
                    ? "bg-green-500 text-white" 
                    : isCurrent 
                    ? "bg-blue-600 text-white animate-pulse" 
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {milestone.month}
                </span>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                        milestone.phase === "MVP" 
                          ? "bg-blue-50 text-blue-700" 
                          : milestone.phase === "Croissance" 
                          ? "bg-purple-50 text-purple-700" 
                          : "bg-amber-50 text-amber-700"
                      }`}>
                        Phase {milestone.phase}
                      </span>
                      <h4 className="font-display font-bold text-gray-800 text-sm">
                        Mois {milestone.month} : {milestone.title}
                      </h4>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                      isCompleted 
                        ? "bg-green-50 text-green-700" 
                        : isCurrent 
                        ? "bg-blue-50 text-blue-700" 
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {isCompleted ? "Lancé" : isCurrent ? "En cours de dev" : "Planifié"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Objectifs de Développement</span>
                      <ul className="space-y-1.5">
                        {milestone.objectives.map((obj, oIdx) => (
                          <li key={oIdx} className="text-xs text-gray-600 flex items-start gap-2">
                            <span className="text-blue-500 font-bold mt-0.5">✓</span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Objectif d'acquisition</span>
                        <p className="text-sm font-display font-bold text-slate-700 mt-1 flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          {milestone.acquisitionGoal}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/50 flex items-center gap-1.5 text-[10px] text-slate-500">
                        <Target className="h-3.5 w-3.5 text-slate-400" />
                        <span>Indicateur clé de succès (KPI)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
