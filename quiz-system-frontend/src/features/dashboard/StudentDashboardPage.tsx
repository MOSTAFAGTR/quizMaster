// src/features/dashboard/StudentDashboardPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { QuizService } from '../../services/quiz.service';
import { AttemptService } from '../../services/attempt.service';
import { QuizSummary, AttemptSummaryResponse as AttemptSummary } from '../../types'; // Use AttemptSummaryResponse as AttemptSummary
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import { CircleProgress } from '../../components/common/CircleProgress';
// import './Dashboard.css'; // If you create specific CSS

const StudentDashboardPage: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [availableQuizzes, setAvailableQuizzes] = useState<QuizSummary[]>([]);
  const [myAttempts, setMyAttempts] = useState<AttemptSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<{ averageScore: number; quizzesTakenCount: number }>({ averageScore: 0, quizzesTakenCount: 0 });

  const fetchDashboardData = useCallback(async () => {
    if (!token) { setIsLoading(false); setPageError("Not authenticated."); return; }
    setIsLoading(true); setPageError(null);
    try {
      const [quizResponse, attemptsData] = await Promise.all([
        QuizService.getAllQuizzes(token),
        user?.role === 'student' ? AttemptService.getMyAttempts(token) : Promise.resolve([])
      ]);
      setAvailableQuizzes(quizResponse);
      const attempts: AttemptSummary[] = attemptsData; // No need for Array.isArray if service returns correctly typed array
      setMyAttempts(attempts);
      if (user?.role === 'student' && attempts.length > 0) {
        const totalPercentageSum = attempts.reduce((sum, attempt) => sum + attempt.percentage, 0);
        const uniqueQuizzesTakenIds = new Set(attempts.map(attempt => attempt.quizId));
        setUserStats({
          averageScore: attempts.length > 0 ? Math.round(totalPercentageSum / attempts.length) : 0,
          quizzesTakenCount: uniqueQuizzesTakenIds.size,
        });
      } else {
        setUserStats({ averageScore: 0, quizzesTakenCount: 0 });
      }
    } catch (err: any) {
      console.error("[StudentDashboardPage] Fetch data error:", err);
      setPageError(err.response?.data?.message || err.message || "Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, [token, user]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const totalQuizzesAvailableForDisplay = availableQuizzes.length;
  const quizzesCompletedPercentage = totalQuizzesAvailableForDisplay > 0 ? (userStats.quizzesTakenCount / totalQuizzesAvailableForDisplay) * 100 : 0;
  const attemptedQuizIds = new Set(myAttempts.map(attempt => attempt.quizId));

  if (isLoading) return <LoadingSpinner message="Loading dashboard..." />;
  if (pageError) return <ErrorDisplay message={pageError} />;

  return (
    <div className="student-dashboard dashboard-container">
      <header className="dashboard-header"><h2>Welcome back, {user?.email.split('@')[0] || 'Student'}!</h2><p>Ready to test your knowledge?</p></header>
      <section className="dashboard-summary card-like-section">
        <div className="summary-cards-container">
          <div className="progress-card"><h4>Average Score</h4>
            <CircleProgress percentage={userStats.averageScore} circleId="sdAvgScoreCircle" textId="sdAvgScoreText" colorClassType="info" sqSize={90} strokeWidth={7}/>
            {myAttempts.length === 0 && <span>No attempts yet</span>}
          </div>
          <div className="progress-card"><h4>Quizzes Completed</h4>
            <CircleProgress percentage={quizzesCompletedPercentage} circleId="sdQuizzesCompletedCircle" textId="sdQuizzesCompletedText" colorClassType="success" displayText={`${userStats.quizzesTakenCount}/${totalQuizzesAvailableForDisplay}`} sqSize={90} strokeWidth={7}/>
            {totalQuizzesAvailableForDisplay === 0 && <span>No quizzes available</span>}
          </div>
        </div>
      </section>
      <section className="available-quizzes card-like-section">
        <h3>Choose Your Next Challenge</h3>
        {availableQuizzes.length === 0 ? <div className="empty-state"><p>No quizzes available.</p></div> : (
          <div className="quiz-grid">
            {availableQuizzes.map(quiz => {
              const hasAttempted = attemptedQuizIds.has(quiz.id);
              return (
                <div key={quiz.id} className={`quiz-card student-quiz-card ${hasAttempted ? 'attempted' : ''}`}>
                  <div className="quiz-card-content"><h4>{quiz.title}</h4><p>{quiz.questionCount}q</p>{hasAttempted && <span className="status-badge attempted-badge">Attempted</span>}</div>
                  <button onClick={() => navigate(`/quiz/take/${quiz.id}`)} className="cta-button-small" aria-label={`Quiz: ${quiz.title}`}>
                    {hasAttempted ? 'Take Again' : 'Start Quiz'}
                  </button>
                </div>);
            })}
          </div>
        )}
      </section>
      <section className="past-attempts-section card-like-section">
        <h3>Your Recent Activity</h3>
        {myAttempts.length === 0 ? <div className="empty-state"><p>No recent attempts.</p></div> : (
            <ul className="attempts-list">
                {myAttempts.slice(0, 3).map(attempt => (
                    <li key={attempt.attemptId} className="attempt-list-item">
                        <span className="attempt-quiz-title">{attempt.quizTitle}</span>
                        <span className="attempt-score">Score: {attempt.score}/{attempt.totalQuestions} ({attempt.percentage}%)</span>
                        <span className="attempt-date">{new Date(attempt.submittedAt).toLocaleDateString()}</span>
                    </li>
                ))}
                {myAttempts.length > 3 && <li className="attempt-list-item-more"><Link to="/profile/attempts">View all attempts...</Link></li>} {/* This route needs to be created */}
            </ul>
        )}
      </section>
    </div>
  );
};
export default StudentDashboardPage;