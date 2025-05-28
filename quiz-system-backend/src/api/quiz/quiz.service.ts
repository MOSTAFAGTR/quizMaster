// src/api/quiz/quiz.service.ts
import { Quiz, Question, MCQOption, quizzesDB } from '../../models/quiz.model';
import { User } from '../../models/user.model'; 
import { v4 as uuidv4 } from 'uuid';

// Data Transfer Object for quizzes when fetched for taking/editing (omits sensitive info like correctOptionId directly on questions array)
export interface QuizForTakingDTO {
    id: string;
    title: string;
    questions: Array<{
        id: string;
        text: string;
        options: MCQOption[];
    }>;
}

interface CreateQuizData { title: string; createdByUserId: string; createdByUserEmail: string; }
interface AddQuestionData { quizId: string; text: string; options: Array<{ text: string }>; correctOptionIndex: number; requestingUserId: string; }
interface DeleteQuizData { quizId: string; requestingUserId: string; }
interface DeleteQuestionData { quizId: string; questionId: string; requestingUserId: string; }

interface ServiceResult<T = any> {
    success: boolean; message: string; data?: T; statusCode: number; error?: string; 
}

export const QuizService = {
    createQuiz: async (data: CreateQuizData): Promise<ServiceResult<Quiz>> => {
        const newQuiz: Quiz = {
            id: `quiz-${uuidv4()}`, title: data.title, createdBy: data.createdByUserId,
            questions: [], createdAt: new Date(),
        };
        quizzesDB.push(newQuiz);
        console.log(`QuizService: Quiz Created "${newQuiz.title}" by ${data.createdByUserEmail}`);
        return { success: true, message: "Quiz created successfully", data: newQuiz, statusCode: 201 };
    },
    addQuestionToQuiz: async (data: AddQuestionData): Promise<ServiceResult<Question>> => {
        const quiz = quizzesDB.find((q: Quiz) => q.id === data.quizId);
        if (!quiz) return { success: false, message: 'Quiz not found', statusCode: 404 };
        if (quiz.createdBy !== data.requestingUserId) return { success: false, message: 'Not authorized to add questions', statusCode: 403 };
        const questionOptions: MCQOption[] = data.options.map((opt: {text: string}) => ({ id: `opt-${uuidv4()}`, text: opt.text }));
        if (data.correctOptionIndex < 0 || data.correctOptionIndex >= questionOptions.length) {
            return { success: false, message: 'Invalid correct option index', statusCode: 400 };
        }
        const newQuestion: Question = {
            id: `q-${uuidv4()}`, text: data.text, options: questionOptions,
            correctOptionId: questionOptions[data.correctOptionIndex].id,
        };
        quiz.questions.push(newQuestion);
        console.log(`QuizService: Question Added to "${quiz.title}"`);
        return { success: true, message: "Question added successfully", data: newQuestion, statusCode: 201 };
    },
    getAllQuizzes: async (): Promise<ServiceResult<Partial<Quiz>[]>> => {
        const quizzesForList = quizzesDB.map((quiz: Quiz) => ({
            id: quiz.id, title: quiz.title, questionCount: quiz.questions.length, createdBy: quiz.createdBy,
        }));
        return { success: true, message: "Quizzes fetched successfully", data: quizzesForList, statusCode: 200 };
    },
    getQuizById: async (quizId: string): Promise<ServiceResult<QuizForTakingDTO>> => { // Return DTO
        const quiz = quizzesDB.find((q: Quiz) => q.id === quizId);
        if (!quiz) return { success: false, message: 'Quiz not found', statusCode: 404 };
        const quizForTaking: QuizForTakingDTO = {
            id: quiz.id, title: quiz.title,
            questions: quiz.questions.map((q_ques: Question) => ({ // q_ques is full Question from DB
                id: q_ques.id, text: q_ques.text,
                options: q_ques.options.map((opt: MCQOption) => ({ id: opt.id, text: opt.text })),
                // correctOptionId is intentionally omitted
            })),
        };
        return { success: true, message: "Quiz details fetched successfully", data: quizForTaking, statusCode: 200 };
    },
    deleteQuiz: async (data: DeleteQuizData): Promise<ServiceResult<{ quizId: string }>> => {
        const quizIndex = quizzesDB.findIndex((q: Quiz) => q.id === data.quizId);
        if (quizIndex === -1) return { success: false, message: 'Quiz not found for deletion', statusCode: 404 };
        if (quizzesDB[quizIndex].createdBy !== data.requestingUserId) return { success: false, message: 'Not authorized to delete quiz', statusCode: 403 };
        quizzesDB.splice(quizIndex, 1);
        return { success: true, message: 'Quiz deleted successfully', data: { quizId: data.quizId }, statusCode: 200 };
    },
    deleteQuestionFromQuiz: async (data: DeleteQuestionData): Promise<ServiceResult<{ quizId: string, questionId: string }>> => {
        const quiz = quizzesDB.find((q: Quiz) => q.id === data.quizId);
        if (!quiz) return { success: false, message: 'Quiz not found for question deletion', statusCode: 404 };
        if (quiz.createdBy !== data.requestingUserId) return { success: false, message: 'Not authorized to modify quiz', statusCode: 403 };
        const questionIndex = quiz.questions.findIndex((ques: Question) => ques.id === data.questionId);
        if (questionIndex === -1) return { success: false, message: 'Question not found in quiz', statusCode: 404 };
        quiz.questions.splice(questionIndex, 1);
        return { success: true, message: 'Question deleted successfully', data: { quizId: data.quizId, questionId: data.questionId }, statusCode: 200 };
    }
};