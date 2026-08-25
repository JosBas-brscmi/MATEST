export interface CandidateInfo {
  fullName: string;
  school: string;
  course: string;
  email: string;
  phone: string;
}
 
export interface TestResult {
  candidateInfo: CandidateInfo;
  testKey: string;
  submittedAtISO: string;
  score: {
    correct: number;
    total: number;
    percent: number;
  };
  answers: number[];
  autoSubmitted: boolean;
}
