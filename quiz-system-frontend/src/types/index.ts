// src/types/index.ts

// Define and export UserRole first
export type UserRole = 'student' | 'instructor';

// User related types
export interface User {
    id: string;
    email: string;
    role: UserRole; // Now uses the exported UserRole type
}

export interface AuthResponseData {
    message: string;
    token?: string;
    user?: User;
}

// Quiz related types
export interface MCQOption {
    id: string;
    text: string;
}

export interface Question {
    id: string;
    text: string;
    options: MCQOption[];
    correctOptionId?: string; 
}

export interface QuizBase {
    id: string;
    title: string;
    createdBy?: string;
}

export interface QuizSummary extends QuizBase {
    questionCount: number;
}

export interface QuizDetail extends QuizBase {
    questions: Question[];
}

export interface StudentAnswerInput {
    questionId: string;
    selectedOptionId: string | null;
}

export interface AttemptQuestionResult {
    questionId: string;
    questionText: string;
    selectedOptionId: string | null;
    selectedOptionText?: string;
    correctOptionId: string;
    correctOptionText?: string;
    isCorrect: boolean;
    options: MCQOption[];
}

export interface QuizAttemptResponse {
    attemptId: string;
    quizId: string;
    quizTitle: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    detailedResults: AttemptQuestionResult[];
    submittedAt: string;
}

export interface AttemptSummaryResponse {
    attemptId: string;
    quizId: string;
    quizTitle: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    submittedAt: string;
}

// For ProfilePage (can be expanded)
export interface UserProfileDataPlaceholder {
  fullName: string;
  email: string;
  // Add other common fields if ProfilePage and other components use a base version
}