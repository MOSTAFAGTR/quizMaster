// src/models/quiz.model.ts

export interface MCQOption { // ADDED EXPORT
    id: string;
    text: string;
}

export interface Question { // ADDED EXPORT
    id: string;
    text: string;
    options: MCQOption[];
    correctOptionId: string; 
}

export interface Quiz { // ADDED EXPORT
    id: string;
    title: string;
    createdBy: string; 
    questions: Question[];
    createdAt: Date;
}

export const quizzesDB: Quiz[] = []; // ADDED EXPORT
