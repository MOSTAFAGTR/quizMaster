// src/features/home/HomePage.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// import './HomePage.css'; // If you create specific CSS for it

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      if (user?.role === 'student') navigate('/student/dashboard');
      else if (user?.role === 'instructor') navigate('/instructor/dashboard');
      else navigate('/');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="home-page"> {/* These classes should be in App.css or HomePage.css */}
      <header className="hero-section">
        <div className="hero-content">
          <h1>Welcome to the Ultimate Quiz Platform!</h1>
          <p className="subtitle">Test your knowledge, create engaging quizzes, and track your progress.</p>
          <button onClick={handleGetStarted} className="cta-button">
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started Now'}
          </button>
        </div>
      </header>
      <section className="features-section">
        <h2>Why Choose Our Platform?</h2>
        <div className="features-grid">
          <div className="feature-card"><h3>Diverse Quizzes</h3><p>Explore a wide variety of quizzes.</p></div>
          <div className="feature-card"><h3>Create & Share</h3><p>Instructors can easily create custom quizzes.</p></div>
          <div className="feature-card"><h3>Track Performance</h3><p>Monitor your scores and identify areas for improvement.</p></div>
        </div>
      </section>
      <footer className="home-footer">
        <p>© {new Date().getFullYear()} QuizMaster Pro. All rights reserved.</p>
        <p><Link to="/privacy-policy">Privacy Policy</Link> | <Link to="/terms-of-service">Terms of Service</Link></p>
      </footer>
    </div>
  );
};
export default HomePage;    