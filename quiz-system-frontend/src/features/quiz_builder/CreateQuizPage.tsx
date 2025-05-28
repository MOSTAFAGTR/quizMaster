// src/features/quiz_builder/CreateQuizPage.tsx
import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { QuizService } from '../../services/quiz.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import SuccessDisplay from '../../components/common/SuccessDisplay';
// Ensure FormPage.css styles are available globally or imported
// import '../../pages/FormPage.css'; 

const CreateQuizPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null); setMessage(null); setIsLoading(true);
    if (!title.trim()) { setError('Quiz title is required.'); setIsLoading(false); return; }
    if (!token) { setError('Authentication error.'); setIsLoading(false); return; }
    try {
      const newQuiz = await QuizService.createQuiz({ title }, token);
      setMessage(`Quiz "${newQuiz.title}" created! Redirecting to add questions...`);
      setTimeout(() => { navigate(`/instructor/quiz/${newQuiz.id}/edit`); }, 1500);
    } catch (err: any) {
      console.error('Create quiz error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create quiz.');
    } finally { setIsLoading(false); }
  };

  if (isLoading) return <LoadingSpinner message="Creating quiz..." />

  return (
    <div className="form-page-container">
      <div className="form-container">
        <h2>Create New Quiz</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="quizTitle">Quiz Title:</label>
            <input type="text" id="quizTitle" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title" required disabled={isLoading} />
          </div>
          <ErrorDisplay message={error} />
          <SuccessDisplay message={message} />
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Quiz & Add Questions'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default CreateQuizPage;