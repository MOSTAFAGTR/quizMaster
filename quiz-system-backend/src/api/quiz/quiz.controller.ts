import { Response, NextFunction } from 'express';
import { QuizService } from './quiz.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export const QuizController = {
    create: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => { /* ... same as before ... */ 
        try {
            const { title } = req.body;
            if (!title) { res.status(400).json({ message: 'Title required' }); return; }
            if (!req.user) { res.status(401).json({ message: 'User not authenticated' }); return; }
            const result = await QuizService.createQuiz({ title, createdByUserId: req.user.userId, createdByUserEmail: req.user.email });
            res.status(result.statusCode).json(result.success ? result.data : { message: result.message });
        } catch (error) { next(error); }
    },
    addQuestion: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => { /* ... same as before ... */
        try {
            const { quizId } = req.params; const { text, options, correctOptionIndex } = req.body;
            if (!text || !options || !Array.isArray(options) || options.length < 2 || options.length > 4 || correctOptionIndex === undefined || correctOptionIndex < 0 || correctOptionIndex >= options.length) {
                res.status(400).json({ message: 'Invalid question data' }); return;
            }
            for(const opt of options){ if(!opt.text || typeof opt.text !== 'string' || opt.text.trim() === ''){ res.status(400).json({ message: 'Option text invalid'}); return;}}
            if (!req.user) { res.status(401).json({ message: 'User not authenticated' }); return; }
            const result = await QuizService.addQuestionToQuiz({ quizId, text, options, correctOptionIndex, requestingUserId: req.user.userId });
            res.status(result.statusCode).json(result.success ? result.data : { message: result.message });
        } catch (error) { next(error); }
    },
    getAll: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => { /* ... same as before ... */
        try { const result = await QuizService.getAllQuizzes(); res.status(result.statusCode).json(result.success ? result.data : { message: result.message }); } catch (error) { next(error); }
    },
    getById: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => { /* ... same as before ... */
        try { const { quizId } = req.params; const result = await QuizService.getQuizById(quizId); res.status(result.statusCode).json(result.success ? result.data : { message: result.message }); } catch (error) { next(error); }
    },
    deleteQuiz: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => { /* ... same as before ... */
        try {
            const { quizId } = req.params; if (!req.user) { res.status(401).json({ message: 'User not authenticated' }); return; }
            const result = await QuizService.deleteQuiz({ quizId, requestingUserId: req.user.userId });
            res.status(result.statusCode).json({ message: result.message, data: result.data });
        } catch (error) { next(error); }
    },
    deleteQuestion: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => { /* ... same as before ... */
        try {
            const { quizId, questionId } = req.params; if (!req.user) { res.status(401).json({ message: 'User not authenticated' }); return; }
            const result = await QuizService.deleteQuestionFromQuiz({ quizId, questionId, requestingUserId: req.user.userId });
            res.status(result.statusCode).json({ message: result.message, data: result.data });
        } catch (error) { next(error); }
    }
};