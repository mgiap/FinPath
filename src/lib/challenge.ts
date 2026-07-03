export type ChallengeQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
};

export type ChallengeData = {
  questions: ChallengeQuestion[];
};