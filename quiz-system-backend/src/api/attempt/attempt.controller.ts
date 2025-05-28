import { Response, NextFunction } from 'express';
import { AttemptService } from './attempt.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { StudentAnswer } from '../../models/attempt.model';

export const AttemptController = {
    submitAttempt: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { quizId } = req.params; // Comes from /api/quizzes/:quizId/submit
            const { answers } = req.body as { answers: StudentAnswer[] };

            if (!req.user || !req.user.userId || req.user.role !== 'student') {
                res.status(403).json({ message: 'Only authenticated students can submit quizzes' }); return;
            }
            if (!answers || !Array.isArray(answers)) {
                res.status(400).json({ message: 'Invalid answers format' }); return;
            }
            if (!quizId) {
                res.status(400).json({ message: 'Quiz ID is required in path' }); return;
            }

            const result = await AttemptService.submitQuizAttempt({
                quizId,
                studentId: req.user.userId,
                studentEmail: req.user.email,
                answers
            });
            res.status(result.statusCode).json(result.success ? result.data : { message: result.message });
        } catch (error) {
            next(error);
        }
    },

    getMyAttempts: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user || !req.user.userId || req.user.role !== 'student') {
                res.status(403).json({ message: 'Only authenticated students can view their attempts' }); return;
            }
            const result = await AttemptService.getAttemptsByStudentId(req.user.userId);
            res.status(result.statusCode).json(result.success ? result.data : { message: result.message });
        } catch (error) {
            next(error);
        }
    }
};