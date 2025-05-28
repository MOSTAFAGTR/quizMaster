import axiosInstance from './axiosInstance';
import { StudentAnswerInput, QuizAttemptResponse, AttemptSummaryResponse } from '../types';

export const AttemptService = {
    submitQuiz: async (quizId: string, answers: StudentAnswerInput[], token: string): Promise<QuizAttemptResponse> => {
        const response = await axiosInstance.post<QuizAttemptResponse>(`/quizzes/${quizId}/submit`, { answers }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
    getMyAttempts: async (token: string): Promise<AttemptSummaryResponse[]> => {
        const response = await axiosInstance.get<AttemptSummaryResponse[]>('/my-attempts', { // Direct path as per last backend server.ts
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};