import { quizzesDB } from '../../models/quiz.model';
import { QuizAttempt, StudentAnswer, AttemptQuestionResult, quizAttemptsDB } from '../../models/attempt.model';
import { v4 as uuidv4 } from 'uuid';

interface SubmitAttemptServiceData {
    quizId: string;
    studentId: string;
    studentEmail: string;
    answers: StudentAnswer[];
}

interface ServiceResult<T = any> {
    success: boolean; message: string; data?: T; statusCode: number;
}

export const AttemptService = {
    submitQuizAttempt: async (data: SubmitAttemptServiceData): Promise<ServiceResult<QuizAttempt>> => {
        const quiz = quizzesDB.find(q => q.id === data.quizId);
        if (!quiz) {
            return { success: false, message: 'Quiz not found for submission', statusCode: 404 };
        }
        if (!quiz.questions || quiz.questions.length === 0) {
            return { success: false, message: 'This quiz has no questions', statusCode: 400 };
        }

        let score = 0;
        const totalQuestions = quiz.questions.length;
        const detailedResults: AttemptQuestionResult[] = [];

        for (const question of quiz.questions) {
            const studentAnswerForQuestion = data.answers.find(sa => sa.questionId === question.id);
            const selectedOptionId = studentAnswerForQuestion ? studentAnswerForQuestion.selectedOptionId : null;
            let isCorrect = false;
            let selectedOptionText = 'Not Answered';
            
            if (selectedOptionId) {
                isCorrect = question.correctOptionId === selectedOptionId;
                if (isCorrect) score++;
                const foundSelectedOption = question.options.find(opt => opt.id === selectedOptionId);
                if (foundSelectedOption) selectedOptionText = foundSelectedOption.text;
                else if(selectedOptionId) selectedOptionText = 'Invalid option selection'; // Should ideally not happen if frontend sends valid IDs
            }

            const correctOption = question.options.find(opt => opt.id === question.correctOptionId);

            detailedResults.push({
                questionId: question.id, questionText: question.text,
                selectedOptionId, selectedOptionText,
                correctOptionId: question.correctOptionId,
                correctOptionText: correctOption ? correctOption.text : 'N/A - Correct Option data missing',
                isCorrect, options: question.options,
            });
        }
        
        const attemptId = `attempt-${uuidv4()}`;
        const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

        const newAttempt: QuizAttempt = {
            id: attemptId, quizId: quiz.id, quizTitle: quiz.title,
            studentId: data.studentId, studentEmail: data.studentEmail,
            answers: data.answers, score, totalQuestions, percentage,
            submittedAt: new Date(), detailedResults,
        };
        quizAttemptsDB.push(newAttempt);
        return { success: true, message: "Quiz submitted successfully", data: newAttempt, statusCode: 200 };
    },

    getAttemptsByStudentId: async (studentId: string): Promise<ServiceResult<Partial<QuizAttempt>[]>> => {
        const studentAttempts = quizAttemptsDB.filter(attempt => attempt.studentId === studentId);
        const attemptsSummary = studentAttempts.map(att => ({
            attemptId: att.id, quizId: att.quizId, quizTitle: att.quizTitle,
            score: att.score, totalQuestions: att.totalQuestions,
            percentage: att.percentage, submittedAt: att.submittedAt
        }));
        return { success: true, message: "Attempts fetched successfully", data: attemptsSummary, statusCode: 200 };
    }
};