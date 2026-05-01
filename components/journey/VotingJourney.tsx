"use client";

import { useElectionData } from "@/hooks/useElectionData";
import { motion, AnimatePresence } from "framer-motion";
import { LocationSelection } from "./LocationSelection";
import { StatusCheck, DeadlineTracker, AbsenteeVoting, IDRequirements, PollingFinder } from "./Steps";
import { ChevronLeft } from "lucide-react";

const stepComponents: Record<string, React.FC> = {
  LocationSelection,
  StatusCheck,
  DeadlineTracker,
  AbsenteeVoting,
  IDRequirements,
  PollingFinder,
};

export function VotingJourney() {
  const { currentStepIndex, steps, prevStep } = useElectionData();

  const currentStepName = steps[currentStepIndex];
  const CurrentStepComponent = stepComponents[currentStepName];

  return (
    <div className="w-full max-w-xl mx-auto bg-white dark:bg-[#0F172A] rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden relative min-h-[500px] flex flex-col">
      {/* Progress Bar & Header */}
      <div className="p-6 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10 relative bg-white dark:bg-[#0F172A]">
        <button 
          onClick={prevStep}
          disabled={currentStepIndex === 0}
          className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${currentStepIndex === 0 ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <ChevronLeft className="h-5 w-5 text-slate-500" />
        </button>
        
        <div className="flex gap-1.5 flex-1 justify-center px-4">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx < currentStepIndex ? "bg-indigo-600 w-full" : 
                idx === currentStepIndex ? "bg-indigo-500 w-full" : "bg-slate-200 dark:bg-slate-800 w-4"
              }`} 
            />
          ))}
        </div>
        
        <div className="w-9" /> {/* Spacer for balance */}
      </div>

      {/* Step Content */}
      <div className="flex-1 relative overflow-hidden p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepName}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-full"
          >
            {CurrentStepComponent ? <CurrentStepComponent /> : <div>Step not found</div>}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
