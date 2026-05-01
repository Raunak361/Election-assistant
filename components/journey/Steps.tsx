"use client";

import { useElectionData } from "@/hooks/useElectionData";
import { Timeline } from "@/components/ui/Timeline";
import { IDChecker } from "@/components/ui/IDChecker";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

export function StatusCheck() {
  const { nextStep } = useElectionData();
  return (
    <div className="space-y-6 text-center">
      <h2 className="text-2xl font-bold">Check Voter Registration</h2>
      <p className="text-slate-500">Are you already registered to vote at your current address?</p>
      
      <div className="flex flex-col gap-3 mt-6">
        <button onClick={nextStep} className="p-4 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100 transition-colors">
          Yes, I'm registered
        </button>
        <button onClick={nextStep} className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-medium transition-colors">
          No, I need to register
        </button>
        <a href="https://voters.eci.gov.in/" target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-medium transition-colors flex items-center justify-center gap-2">
          Check my status online <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

export function DeadlineTracker() {
  const { selectedState, nextStep } = useElectionData();
  
  if (!selectedState) return null;

  const items = [
    {
      id: "reg",
      title: "Voter Registration Deadline",
      date: selectedState.registrationDeadline,
      description: "You must be registered by this date to participate in the upcoming election."
    },
    {
      id: "early",
      title: "Early Voting Starts",
      date: selectedState.earlyVotingStart,
      description: "Beat the crowds! You can cast your ballot starting on this day at designated locations."
    },
    {
      id: "day",
      title: "Election Day",
      date: selectedState.electionDay,
      description: "The final day to cast your ballot. Polls typically open early and close in the evening."
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Your Election Roadmap</h2>
      <p className="text-slate-500 text-center mb-6">Key dates for {selectedState.name}</p>
      
      <Timeline items={items} />
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={nextStep}
        className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
      >
        Continue
      </motion.button>
    </div>
  );
}

export function AbsenteeVoting() {
  const { selectedState, nextStep } = useElectionData();
  
  return (
    <div className="space-y-6 text-center">
      <h2 className="text-2xl font-bold">Postal Ballot Rules</h2>
      <p className="text-slate-500">Based on your profile, you might be eligible to vote via postal ballot.</p>
      
      <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-xl text-left border border-slate-200 dark:border-slate-800">
        <h3 className="font-semibold mb-2">Rules for {selectedState?.name}</h3>
        <p className="text-slate-700 dark:text-slate-300">{selectedState?.absenteeRules}</p>
      </div>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={nextStep}
        className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
      >
        I understand
      </motion.button>
    </div>
  );
}

export function IDRequirements() {
  const { nextStep } = useElectionData();
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">What to Bring</h2>
        <p className="text-slate-500 mt-2">Check if your ID is valid for voting in your state.</p>
      </div>
      
      <IDChecker />
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={nextStep}
        className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
      >
        Continue
      </motion.button>
    </div>
  );
}

export function PollingFinder() {
  return (
    <div className="space-y-6 text-center">
      <h2 className="text-2xl font-bold">Find Your Polling Place</h2>
      <p className="text-slate-500">You're all set! Now let's find where you need to go.</p>
      
      <div className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/50 mt-6 flex flex-col items-center justify-center">
        <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">Ready to Vote!</h3>
        <p className="text-slate-500 mb-6 max-w-sm">
          You've reviewed all requirements and dates. Enter your address on your state's official portal to find your exact polling location.
        </p>
        
        <a href="https://electoralsearch.eci.gov.in/" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 dark:shadow-none inline-flex items-center gap-2">
          Official Polling Locator <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
