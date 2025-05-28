// src/server.ts
console.log("<<<< server.ts (Refactor v3 - All Modules) - START >>>>");
import express, { Express as ExpressApp, Request, Response, NextFunction } from 'express';
import cors = require('cors');

import authRouterV1 from './api/auth/auth.routes';
import quizRouterV1 from './api/quiz/quiz.routes';
// Import both routers from the new attempt routes file
import { attemptRouterV1, userAttemptsRouterV1 } from './api/attempt/attempt.routes'; 

const app: ExpressApp = express();
const PORT = process.env.PORT || 5001;

// Global logger, cors, express.json as before
app.use((req: Request, res: Response, next: NextFunction) => { 
    const startTime = Date.now(); console.log(`\n[${new Date().toISOString()}] REQ: ${req.method} ${req.originalUrl}`);
    res.on('finish', () => { console.log(`[${new Date().toISOString()}] RES: ${req.method} ${req.originalUrl} - ${res.statusCode} (${Date.now() - startTime}ms)`); });
    next();
});
app.use(cors()); app.use(express.json()); app.use(express.urlencoded({ extended: true }));
app.get('/', (req: Request, res: Response) => { res.send('Structured Quiz System Backend is Running!'); });

// API Routes
app.use('/api/auth', authRouterV1);
app.use('/api/quizzes', quizRouterV1); 
// Mount the submit part of attemptRouter under /api/quizzes
app.use('/api/quizzes', attemptRouterV1); // For POST /api/quizzes/:quizId/submit

// Mount userAttemptsRouter directly under /api for GET /api/my-attempts
app.use('/api', userAttemptsRouterV1); 

// API 404 Fallback, Global Error Handler, Non-API 404 Fallback as before
app.use('/api', (req: Request,res: Response,next: NextFunction) => { 
    console.log(`API 404 --- ${req.method} ${req.originalUrl}`);
    res.status(404).json({message: `API Route Not Found: ${req.method} ${req.originalUrl}`}); 
});
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(`GLOBAL ERROR: ${err.message}`, err.stack ? `\n${err.stack.substring(0,500)}` : '');
    if(res.headersSent){return next(err);}
    res.status(500).json({message:'Internal Server Error', error:process.env.NODE_ENV === 'development' ? err.message : undefined});
});
app.use((req: Request,res: Response) => { 
    console.log(`NON-API 404 --- ${req.method} ${req.originalUrl}`);
    res.status(404).send(`Resource Not Found: ${req.originalUrl}`);
});

app.listen(PORT, () => {
    console.log(`Structured Backend (All Core Modules Refactored v1) running on http://localhost:${PORT}`);
});