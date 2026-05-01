"use client";

import { ElectionProvider } from "@/hooks/useElectionData";
import { VotingJourney } from "@/components/journey/VotingJourney";
import { ChatBubble } from "@/components/ui/ChatBubble";

export default function Home() {
  return (
    <ElectionProvider>
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center py-12 px-4 sm:px-6 relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-indigo-900/10 dark:bg-indigo-900/20 rounded-b-[3rem] -z-10" />
        
        <div className="text-center mb-10 max-w-2xl">
          <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-full text-sm font-semibold tracking-wide mb-4 uppercase">
            Election 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Navigate Your Election Journey
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            A step-by-step guide tailored to your state and situation. Know your deadlines, requirements, and polling place.
          </p>
        </div>

        <VotingJourney />
        
        <ChatBubble />
      </main>
    </ElectionProvider>
  );
}
