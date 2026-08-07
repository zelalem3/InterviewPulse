export type InterviewStatus =
  | "idle"
  | "reading"
  | "recording"
  | "paused"
  | "finished";

export interface InterviewQuestion {
  id: number;
  question: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  expectedTime: number;
}

export interface InterviewAnswer {
  questionId: number;
  transcript: string;
  video?: Blob;
  duration: number;
}

export interface InterviewState {
  currentQuestion: number;
  status: InterviewStatus;
  answers: InterviewAnswer[];
  transcript: string;
  remainingTime: number;
  recording: boolean;
  speaking: boolean;
}