"use client";

import { useElectionData } from "@/hooks/useElectionData";
import mockData from "@/lib/mockData.json";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

export function LocationSelection() {
  const { selectState, selectedState, profile, setProfile, nextStep } = useElectionData();
  const states = Object.values(mockData.states);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Which State/UT are you voting in?</h2>
        <p className="text-slate-500 mt-2">Select your state to get personalized requirements.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {states.map((state) => (
          <motion.button
            key={state.stateCode}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(50);
              selectState(state.stateCode);
            }}
            className={`p-4 rounded-xl border flex items-center gap-3 transition-colors ${
              selectedState?.stateCode === state.stateCode
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
            }`}
          >
            <MapPin className={`h-5 w-5 ${selectedState?.stateCode === state.stateCode ? "text-indigo-500" : "text-slate-400"}`} />
            <span className="font-medium">{state.name}</span>
          </motion.button>
        ))}
      </div>

      {selectedState && (
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white">Tell us about yourself</h3>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.isSeniorCitizen}
                onChange={(e) => setProfile({ ...profile, isSeniorCitizen: e.target.checked })}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">I am a Senior Citizen (85+ years)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.isPwD}
                onChange={(e) => setProfile({ ...profile, isPwD: e.target.checked })}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">I am a Person with Disability (PwD)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.isServiceVoter}
                onChange={(e) => setProfile({ ...profile, isServiceVoter: e.target.checked })}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">I am a Service Voter (Armed Forces/Paramilitary)</span>
            </label>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={nextStep}
            className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            Continue
          </motion.button>
        </div>
      )}
    </div>
  );
}
