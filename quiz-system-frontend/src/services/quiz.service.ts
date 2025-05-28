import axiosInstance from './axiosInstance';
import { QuizSummary, QuizDetail, Question } from '../types';

interface CreateQuizPayload { title: string; }
interface AddQuestionPayload { text: string; options: Array<{ text: string }>; correctOptionIndex: number; }

const API_URL_QUIZZES = '/quizzes';

export const QuizService = {
    getAllQuizzes: async (token: string): Promise<QuizSummary[]> => {
        const response = await axiosInstance.get<QuizSummary[]>(API_URL_QUIZZES, { headers: { Authorization: `Bearer ${token}` } });
        return response.data;
    },
    getQuizById: async (quizId: string, token: string): Promise<QuizDetail> => {
        const response = await axiosInstance.get<QuizDetail>(`${API_URL_QUIZZES}/${quizId}`, { headers: { Authorization: `Bearer ${token}` } });
        return response.data;
    },
    createQuiz: async (payload: CreateQuizPayload, token: string): Promise<QuizDetail> => {
        const response = await axiosInstance.post<QuizDetail>(API_URL_QUIZZES, payload, { headers: { Authorization: `Bearer ${token}` } });
        return response.data;
    },
    addQuestionToQuiz: async (quizId: string, payload: AddQuestionPayload, token: string): Promise<Question> => {
        const response = await axiosInstance.post<Question>(`${API_URL_QUIZZES}/${quizId}/questions`, payload, { headers: { Authorization: `Bearer ${token}` } });
        return response.data;
    },
    deleteQuiz: async (quizId: string, token: string): Promise<{ message: string; quizId: string }> => {
        const response = await axiosInstance.delete<{ message: string; quizId: string }>(`${API_URL_QUIZZES}/${quizId}`, { headers: { Authorization: `Bearer ${token}` } });
        return response.data;
    },
    deleteQuestionFromQuiz: async (quizId: string, questionId: string, token: string): Promise<{ message: string; quizId: string; questionId: string }> => {
        const response = await axiosInstance.delete<{ message: string; quizId: string; questionId: string }>(`${API_URL_QUIZZES}/${quizId}/questions/${questionId}`, { headers: { Authorization: `Bearer ${token}` } });
        return response.data;
    }
};