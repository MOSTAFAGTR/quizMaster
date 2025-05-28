// src/features/dashboard/InstructorDashboardPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { QuizService } from '../../services/quiz.service';
import { QuizSummary } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import SuccessDisplay from '../../components/common/SuccessDisplay';
// import './Dashboard.css'; // If you create specific CSS

const InstructorDashboardPage: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [myQuizzes, setMyQuizzes] = useState<QuizSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const fetchMyQuizzes = useCallback(async () => {
    if (!token || !user) { setIsLoading(false); setPageError("Auth details missing."); return; }
    setIsLoading(true); setPageError(null);
    try {
      const allQuizzes = await QuizService.getAllQuizzes(token);
      const filtered = allQuizzes.filter((quiz) => quiz.createdBy === user.id);
      setMyQuizzes(filtered);
    } catch (err:any) { console.error("Failed to fetch instructor quizzes", err); setPageError(err.response?.data?.message || err.message || "Failed to load quizzes."); } 
    finally { setIsLoading(false); }
  }, [token, user]);

  useEffect(() => { fetchMyQuizzes(); }, [fetchMyQuizzes]);

  const handleDeleteQuiz = async (quizId: string, quizTitle: string) => {
    if (!window.confirm(`Delete quiz: "${quizTitle || 'this quiz'}"?`)) return;
    setActionFeedback(null);
    try {
      if (!token) { setActionFeedback({type: 'error', message: "Not authenticated."}); return; }
      await QuizService.deleteQuiz(quizId, token);
      setActionFeedback({type: 'success', message: `Quiz "${quizTitle}" deleted.`});
      setTimeout(() => { fetchMyQuizzes(); setActionFeedback(null); }, 1500); 
    } catch (err: any) {
      console.error("Failed to delete quiz:", err);
      setActionFeedback({type: 'error', message: err.response?.data?.message || err.message || 'Delete failed.'});
    }
  };

  if (isLoading && myQuizzes.length === 0) return <LoadingSpinner message="Loading your quizzes..." />;
  if (pageError && myQuizzes.length === 0) return <ErrorDisplay message={pageError} />;

  return (
    <div className="dashboard-container instructor-dashboard">
      <header className="dashboard-header"><h2>Instructor Dashboard</h2><Link to="/instructor/quiz/create" className="cta-button header-cta">+ Create New Quiz</Link></header>
      {actionFeedback?.type === 'success' && <SuccessDisplay message={actionFeedback.message} />}
      {actionFeedback?.type === 'error' && <ErrorDisplay message={actionFeedback.message} />}
      {pageError && <ErrorDisplay message={pageError} />}
      <section className="my-quizzes-section card-like-section">
        <h3>Your Quizzes ({myQuizzes.length})</h3>
        {myQuizzes.length === 0 && !isLoading ? <div className="empty-state"><p>No quizzes created yet.</p></div> : (
          <div className="quiz-grid">
            {myQuizzes.map(quiz => (
              <div key={quiz.id} className="quiz-card instructor-quiz-card">
                <div className="quiz-card-content"><h4>{quiz.title}</h4><p>{quiz.questionCount}q</p></div>
                <div className="quiz-card-actions">
                  <button onClick={() => navigate(`/instructor/quiz/${quiz.id}/edit`)} className="btn-dashboard-action edit">Manage</button>
                  <button onClick={() => handleDeleteQuiz(quiz.id, quiz.title)} className="btn-dashboard-action delete">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
export default InstructorDashboardPage;