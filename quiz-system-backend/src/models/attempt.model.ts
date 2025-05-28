import { MCQOption } from './quiz.model';

export interface StudentAnswer {
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

export interface QuizAttempt {
    id: string;
    quizId: string;
    quizTitle: string;
    studentId: string;
    studentEmail: string;
    answers: StudentAnswer[];
    score: number;
    totalQuestions: number;
    percentage: number;
    submittedAt: Date;
    detailedResults: AttemptQuestionResult[];
}

export const quizAttemptsDB: QuizAttempt[] = [];