// src/features/quiz_builder/EditQuizPage.tsx
import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { QuizService } from '../../services/quiz.service';
import { QuizDetail as QuizDataFE, Question as QuestionFE } from '../../types'; // Using global types
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import SuccessDisplay from '../../components/common/SuccessDisplay';
// import '../../pages/FormPage.css'; 
// import '../../pages/EditQuizPage.css'; 

const EditQuizPage: React.FC = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const { token } = useAuth();
    const navigate = useNavigate();

    const [quizTitle, setQuizTitle] = useState<string>('');
    const [existingQuestions, setExistingQuestions] = useState<QuestionFE[]>([]);
    const [questionText, setQuestionText] = useState('');
    const [options, setOptions] = useState<Array<{ text: string }>>([{ text: '' }, { text: '' }, { text: '' }, { text: '' }]);
    const [correctOptionIndex, setCorrectOptionIndex] = useState<string>('0');
    const [isLoadingQuiz, setIsLoadingQuiz] = useState(true);
    const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    const fetchQuizDetails = useCallback(async () => {
        if (!token || !quizId) { setIsLoadingQuiz(false); return; }
        setIsLoadingQuiz(true); setActionError(null);
        try {
            const quizData = await QuizService.getQuizById(quizId, token);
            setQuizTitle(quizData.title);
            setExistingQuestions(quizData.questions || []);
        } catch (err: any) {
            console.error("Failed to fetch quiz details", err);
            setActionError(err.response?.data?.message || err.message || "Failed to load quiz details.");
        } finally { setIsLoadingQuiz(false); }
    }, [quizId, token]);

    useEffect(() => { fetchQuizDetails(); }, [fetchQuizDetails]);

    const handleOptionChange = (index: number, value: string) => { const newOptions = [...options]; newOptions[index].text = value; setOptions(newOptions); };

    const handleAddQuestionSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setActionError(null); setActionMessage(null); setIsSubmittingQuestion(true);
        const validOptions = options.filter(opt => opt.text.trim() !== '');
        if (questionText.trim() === '' || validOptions.length < 2) { setActionError('Question & at least 2 options required.'); setIsSubmittingQuestion(false); return; }
        if (parseInt(correctOptionIndex) >= validOptions.length || parseInt(correctOptionIndex) < 0) { setActionError('Invalid correct option.'); setIsSubmittingQuestion(false); return; }
        if (!token || !quizId) { setActionError('Auth or Quiz ID missing.'); setIsSubmittingQuestion(false); return; }
        try {
            await QuizService.addQuestionToQuiz(quizId, { text: questionText, options: validOptions, correctOptionIndex: parseInt(correctOptionIndex) }, token);
            setActionMessage('Question added!');
            setQuestionText(''); setOptions([{ text: '' }, { text: '' }, { text: '' }, { text: '' }]); setCorrectOptionIndex('0');
            fetchQuizDetails(); 
        } catch (err: any) { console.error('Add question error:', err); setActionError(err.response?.data?.message || err.message || 'Failed to add question.');
        } finally { setIsSubmittingQuestion(false); }
    };

    const handleDeleteQuestion = async (questionIdToDelete: string | undefined, questionTextToDelete: string) => {
        if (!questionIdToDelete || !quizId || !token) { setActionError("Cannot delete: data missing."); return; }
        if (!window.confirm(`Delete question: "${questionTextToDelete}"?`)) return;
        setActionError(null); setActionMessage(null);
        try {
            await QuizService.deleteQuestionFromQuiz(quizId, questionIdToDelete, token);
            setActionMessage(`Question deleted.`);
            fetchQuizDetails();
        } catch (err: any) { console.error("Failed to delete question", err); setActionError(err.response?.data?.message || err.message || 'Failed to delete question.');}
    };
    
    if (isLoadingQuiz) return <LoadingSpinner message="Loading quiz details..." />;
    if (actionError && !quizTitle && !isLoadingQuiz) return <ErrorDisplay message={actionError} />; // If initial load failed

    return (
        <div className="edit-quiz-page form-page-container">
            <div className="form-container edit-quiz-form-container">
                <button onClick={() => navigate('/instructor/dashboard')} className="back-button">← Dashboard</button>
                <h2>Edit Quiz: {quizTitle || '...'}</h2>
                <section className="add-question-section">
                    <h3>Add New MCQ</h3>
                    <form onSubmit={handleAddQuestionSubmit}>
                        <div className="form-group"><label htmlFor="questionText">Question Text:</label><textarea id="questionText" value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="Enter question" required rows={3} disabled={isSubmittingQuestion}/></div>
                        {options.map((option, index) => (
                            <div className="form-group option-group" key={index}><label htmlFor={`option${index + 1}`}>Opt {index + 1}:</label><input type="text" id={`option${index + 1}`} value={option.text} onChange={(e) => handleOptionChange(index, e.target.value)} placeholder={`Option ${index + 1}`} disabled={isSubmittingQuestion}/></div>
                        ))}
                        <div className="form-group"><label htmlFor="correctOption">Correct Answer:</label><select id="correctOption" value={correctOptionIndex} onChange={(e) => setCorrectOptionIndex(e.target.value)} disabled={isSubmittingQuestion || options.filter(opt => opt.text.trim() !== '').length < 2}>
                            {options.filter(opt => opt.text.trim() !== '').map((option, index) => (<option key={index} value={index}>Opt {index + 1} ({option.text.substring(0,20)}{option.text.length > 20 ? '...' : ''})</option>))}
                        </select></div>
                        {isSubmittingQuestion && <p className="loading-message-inline">Adding...</p>}
                        {!isSubmittingQuestion && actionMessage && <SuccessDisplay message={actionMessage} />}
                        {!isSubmittingQuestion && actionError && <ErrorDisplay message={actionError} />}
                        <button type="submit" className="submit-button" disabled={isSubmittingQuestion}>{isSubmittingQuestion ? 'Adding...' : 'Add Question'}</button>
                    </form>
                </section>
                <section className="existing-questions-section">
                    <h3>Existing Questions ({existingQuestions.length})</h3>
                    {existingQuestions.length === 0 ? <p>No questions yet.</p> : (
                        <ul className="questions-list">
                            {existingQuestions.map((q, index) => (
                                <li key={q.id || index} className="question-item existing-question-item">
                                    <div className="question-item-content"><p><strong>Q{index + 1}:</strong> {q.text}</p>
                                        <ul>{q.options.map((opt, optIndex) => (<li key={opt.id || `${q.id}-opt-${optIndex}`}>{opt.text}</li>))}</ul>
                                    </div>
                                    <div className="question-item-actions">
                                        <button className="delete-question-btn" onClick={() => handleDeleteQuestion(q.id, q.text)}>Delete</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
};
export default EditQuizPage;