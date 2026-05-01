export interface ElectionState {
  stateCode: string;
  name: string;
  registrationDeadline: string;
  earlyVotingStart: string;
  electionDay: string;
  absenteeRules: string;
  requiredID: string[];
}

export interface VoterProfile {
  location: string;
  isSeniorCitizen: boolean;
  isPwD: boolean;
  isServiceVoter: boolean;
}

export function getRecommendedSteps(profile: VoterProfile): string[] {
  const steps = ["LocationSelection", "StatusCheck", "DeadlineTracker", "IDRequirements", "PollingFinder"];
  
  if (profile.isSeniorCitizen || profile.isPwD || profile.isServiceVoter) {
    // Inject Postal Ballot step
    return ["LocationSelection", "StatusCheck", "DeadlineTracker", "AbsenteeVoting", "IDRequirements", "PollingFinder"];
  }

  return steps;
}

export function isDeadlinePassed(deadlineISO: string): boolean {
  if (!deadlineISO) return false;
  const deadline = new Date(deadlineISO);
  const now = new Date();
  return now > deadline;
}
