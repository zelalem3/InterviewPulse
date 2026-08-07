import type { InterviewQuestion } from "../types/interview";

const questions: InterviewQuestion[] = [
  {
    id: 1,
    category: "Backend",
    difficulty: "Medium",
    expectedTime: 120,
    question:
      "Tell me about a time you optimized a slow backend API under pressure."
  },
  {
    id: 2,
    category: "React",
    difficulty: "Hard",
    expectedTime: 180,
    question:
      "How would you prevent unnecessary renders in a large React application?"
  },
  {
    id: 3,
    category: "Database",
    difficulty: "Hard",
    expectedTime: 180,
    question:
      "Design a scalable database schema for a real-time chat application."
  }
];

export default questions;