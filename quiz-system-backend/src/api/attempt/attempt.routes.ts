import express from 'express';
import { AttemptController } from './attempt.controller';
import { protect } from '../../middleware/auth.middleware';

const attemptRouterV1 = express.Router({ mergeParams: true }); // Enable mergeParams for nested routes like /quizzes/:quizId/submit

// This router will be mounted under /api/quizzes for the submit functionality
// e.g., POST /api/quizzes/:quizId/submit
attemptRouterV1.post('/:quizId/submit', protect, AttemptController.submitAttempt);


// A separate router for top-level user-specific attempt actions
const userAttemptsRouterV1 = express.Router();

// e.g., GET /api/my-attempts
userAttemptsRouterV1.get('/my-attempts', protect, AttemptController.getMyAttempts);


export { attemptRouterV1, userAttemptsRouterV1 }; // Export both