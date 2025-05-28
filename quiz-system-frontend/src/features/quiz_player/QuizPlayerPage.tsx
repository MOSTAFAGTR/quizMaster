    // src/features/quiz_player/QuizPlayerPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { QuizService } from '../../services/quiz.service';
import { AttemptService } from '../../services/attempt.service';
import { QuizDetail as PlayerQuizData, Question as PlayerQuestion, MCQOption as PlayerMCQOption, StudentAnswerInput, QuizAttemptResponse } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorDisplay from '../../components/common/ErrorDisplay';
// import '../../pages/QuizPlayerPage.css';

interface StudentAnswersType { [questionId: string]: string; }

const QuizPlayerPage: React.FC = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const { token } = useAuth();
    const navigate = useNavigate();
    const [quizData, setQuizData] = useState<PlayerQuizData | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [studentAnswers, setStudentAnswers] = useState<StudentAnswersType>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quizResult, setQuizResult] = useState<QuizAttemptResponse | null>(null);

    useEffect(() => {
        const fetchQuiz = async () => {
            if (!token || !quizId) { setError("Data missing or not authenticated."); setIsLoading(false); return; }
            setIsLoading(true); setError(null);
            try {
                const data = await QuizService.getQuizById(quizId, token);
                if (data && data.questions && data.questions.length > 0) setQuizData(data);
                else { setError("Quiz has no questions or could not be loaded."); setQuizData(null); }
            } catch (err:any) { console.error("Fetch quiz error:", err); setError(err.response?.data?.message || err.message || "Failed to load quiz."); }
            finally { setIsLoading(false); }
        };
        fetchQuiz();
    }, [quizId, token]);

    const handleOptionSelect = (questionId: string, optionId: string) => setStudentAnswers(prev => ({...prev, [questionId]: optionId}));
    const goToNextQuestion = () => { if (quizData && currentQuestionIndex < quizData.questions.length - 1) setCurrentQuestionIndex(prev => prev + 1); };
    const goToPreviousQuestion = () => { if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1); };

    const handleSubmitQuiz = async () => {
        if (!quizData || !quizId || !token) { setError("Cannot submit: data missing."); return; }
        setIsSubmitting(true); setError(null);
        const answersToSubmit: StudentAnswerInput[] = Object.entries(studentAnswers).map(([questionId, selectedOptionId]) => ({ questionId, selectedOptionId }));
        // Ensure all questions from quizData are included, even if not answered
        quizData.questions.forEach(q => {
            if (!answersToSubmit.find(a => a.questionId === q.id)) {
                answersToSubmit.push({ questionId: q.id, selectedOptionId: null });
            }
        });
        try {
            const result = await AttemptService.submitQuiz(quizId, answersToSubmit, token);
            setQuizResult(result);
        } catch (err:any) { console.error("Submit quiz error:", err); setError(err.response?.data?.message || err.message || "Failed to submit quiz.");
        } finally { setIsSubmitting(false); }
    };

    if (isLoading) return <LoadingSpinner message="Loading quiz..." />;
    if (error && !quizData) return <div className="form-page-container"><ErrorDisplay message={error} /><button onClick={() => navigate('/student/dashboard')}>Back</button></div>;
    if (!quizData || quizData.questions.length === 0) return <div className="form-page-container"><ErrorDisplay message="Quiz unavailable or no questions." /><button onClick={() => navigate('/student/dashboard')}>Back</button></div>;

    if (quizResult) { /* ... Results display JSX from previous full App.tsx ... */ 
        return (
            <div className="quiz-player-container quiz-results-container">
                <div className="quiz-header"><h1>Results: {quizResult.quizTitle}</h1><h2>Score: {quizResult.score}/{quizResult.totalQuestions} ({quizResult.percentage}%)</h2></div>
                <div className="detailed-results"><h3>Detailed Breakdown:</h3>
                    {quizResult.detailedResults.map((result, index) => (
                        <div key={result.questionId} className={`result-item ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                            <h4>Q{index + 1}: {result.questionText}</h4>
                            <p>Your answer: <span className="answer-text">{result.selectedOptionText || "Not Answered"}</span> {result.isCorrect ? <span className="status-badge correct-badge">Correct</span> : <span className="status-badge incorrect-badge">Incorrect</span>}</p>
                            {!result.isCorrect && (<p>Correct answer: <span className="answer-text">{result.correctOptionText}</span></p>)}
                            <ul className="options-review-list">{result.options.map(opt => (<li key={opt.id} className={`${opt.id === result.selectedOptionId ? 'selected-by-student' : ''} ${opt.id === result.correctOptionId ? 'actual-correct' : ''}`}>{opt.text}{opt.id === result.selectedOptionId && !result.isCorrect && " (Your choice)"}{opt.id === result.correctOptionId && " (Correct Answer)"}</li>))}</ul>
                        </div>))}
                </div>
                <button onClick={() => navigate('/student/dashboard')} className="nav-button" style={{marginTop: '20px'}}>Back to Dashboard</button>
            </div>);
    }

    const currentQuestion = quizData.questions[currentQuestionIndex];
    const totalQuestions = quizData.questions.length;
    const selectedOptionForCurrentQuestion = studentAnswers[currentQuestion.id];

    return ( /* ... Quiz Player JSX from previous full App.tsx ... */ 
        <div className="quiz-player-container">
            <div className="quiz-header"><h1>{quizData.title}</h1><p className="quiz-progress">Question {currentQuestionIndex + 1} of {totalQuestions}</p></div>
            {error && <ErrorDisplay message={error} />}
            <div className="question-card"><h2 className="question-text">{currentQuestionIndex + 1}. {currentQuestion.text}</h2>
                <ul className="options-list">{currentQuestion.options.map(option => (<li key={option.id} className="option-item"><label className={`option-label ${selectedOptionForCurrentQuestion === option.id ? 'selected' : ''}`}><input type="radio" name={`question-${currentQuestion.id}`} value={option.id} checked={selectedOptionForCurrentQuestion === option.id} onChange={() => handleOptionSelect(currentQuestion.id, option.id)} className="option-radio" disabled={isSubmitting}/><span className="option-text">{option.text}</span></label></li>))}</ul>
            </div>
            <div className="navigation-buttons">
                <button onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0 || isSubmitting} className="nav-button prev-button">Previous</button>
                {currentQuestionIndex < totalQuestions - 1 ? <button onClick={goToNextQuestion} className="nav-button next-button" disabled={isSubmitting}>Next</button>
                : <button onClick={handleSubmitQuiz} className="nav-button submit-button" disabled={isSubmitting || Object.keys(studentAnswers).length === 0}>{isSubmitting ? 'Submitting...' : 'Submit Quiz'}</button>}
            </div>
        </div>);
};
export default QuizPlayerPage;