import express from 'express';
import { QuizController } from './quiz.controller';
import { protect, authorizeInstructor } from '../../middleware/auth.middleware';

const quizRouterV1 = express.Router();
quizRouterV1.post('/', protect, authorizeInstructor, QuizController.create);
quizRouterV1.post('/:quizId/questions', protect, authorizeInstructor, QuizController.addQuestion);
quizRouterV1.get('/', protect, QuizController.getAll);
quizRouterV1.get('/:quizId', protect, QuizController.getById);
quizRouterV1.delete('/:quizId', protect, authorizeInstructor, QuizController.deleteQuiz);
quizRouterV1.delete('/:quizId/questions/:questionId', protect, authorizeInstructor, QuizController.deleteQuestion);
export default quizRouterV1;