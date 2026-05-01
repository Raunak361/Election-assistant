"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { ElectionState, VoterProfile, getRecommendedSteps } from "@/lib/election-engine";
import mockData from "@/lib/mockData.json";

interface ElectionContextType {
  currentStepIndex: number;
  steps: string[];
  selectedState: ElectionState | null;
  profile: VoterProfile;
  setProfile: (profile: VoterProfile) => void;
  selectState: (stateCode: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
}

const defaultProfile: VoterProfile = {
  location: "",
  isSeniorCitizen: false,
  isPwD: false,
  isServiceVoter: false,
};

const ElectionContext = createContext<ElectionContextType | undefined>(undefined);

export function ElectionProvider({ children }: { children: ReactNode }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [profile, setProfile] = useState<VoterProfile>(defaultProfile);
  const [selectedState, setSelectedState] = useState<ElectionState | null>(null);

  const steps = getRecommendedSteps(profile);

  const selectState = (stateCode: string) => {
    const data = (mockData.states as Record<string, ElectionState>)[stateCode];
    if (data) {
      setSelectedState(data);
      setProfile({ ...profile, location: stateCode });
    }
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const goToStep = (index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index);
    }
  };

  return (
    <ElectionContext.Provider
      value={{
        currentStepIndex,
        steps,
        selectedState,
        profile,
        setProfile,
        selectState,
        nextStep,
        prevStep,
        goToStep,
      }}
    >
      {children}
    </ElectionContext.Provider>
  );
}

export function useElectionData() {
  const context = useContext(ElectionContext);
  if (context === undefined) {
    throw new Error("useElectionData must be used within an ElectionProvider");
  }
  return context;
}
