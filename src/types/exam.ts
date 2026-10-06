export type Category = 'Java' | 'Data Structures' | 'Python' | 'General Knowledge';

export interface Question {
  id: string;
  category: Category;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswerIndex: number; // 0-3
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface StudentProfile {
  name: string;
  rollNumber: string;
  email?: string;
  selectedCategory: Category | 'All';
  examStartTime?: number;
}

export interface ExamAnswer {
  questionId: string;
  selectedOptionIndex: number | null; // null if skipped
  isMarkedForReview: boolean;
  timeSpentSeconds?: number;
}

export interface ExamSubmission {
  id: string;
  studentName: string;
  rollNumber: string;
  category: Category | 'All';
  totalQuestions: number;
  attempted: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  score: number;
  percentage: number;
  isPassed: boolean;
  timeTakenSeconds: number;
  allocatedTimeSeconds: number;
  submittedAt: string;
  answers: {
    questionId: string;
    questionText: string;
    category: Category;
    options: string[];
    userAnswerIndex: number | null;
    correctAnswerIndex: number;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export interface ExamConfig {
  timeLimitMinutes: number; // e.g. 15 minutes
  passingPercentage: number; // e.g. 50%
  questionsPerExam: number; // e.g. 20
  shuffleQuestions: boolean;
  allowReviewAfterSubmission: boolean;
}
