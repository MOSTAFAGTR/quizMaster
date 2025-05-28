// src/App.tsx
import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';

// Import Feature/Page Components from their new locations
import HomePage from './features/home/HomePage';
import InstructorDashboardPage from './features/dashboard/InstructorDashboardPage';
import StudentDashboardPage from './features/dashboard/StudentDashboardPage';
import ProfilePage from './features/profile/ProfilePage';
import CreateQuizPage from './features/quiz_builder/CreateQuizPage';
import EditQuizPage from './features/quiz_builder/EditQuizPage';
import QuizPlayerPage from './features/quiz_player/QuizPlayerPage';
import ChangePasswordPage from './features/auth/ChangePasswordPage';

// Import Auth UI Components
import RegisterForm from './components/auth/RegisterForm';
import LoginForm from './components/auth/LoginForm';

// Import Common Components
import ProtectedRoute from './components/common/ProtectedRoute';

// Import Auth Context
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="App">
      <nav className="app-nav">
        <div className="nav-left">
          <Link to="/" className="nav-brand">QuizMaster</Link>
          <Link to="/" className="nav-link">Home</Link>
          {isAuthenticated && user?.role === 'instructor' && (<Link to="/instructor/dashboard" className="nav-link">Instructor Panel</Link>)}
          {isAuthenticated && user?.role === 'student' && (<Link to="/student/dashboard" className="nav-link">Student Panel</Link>)}
          {isAuthenticated && (<Link to="/profile" className="nav-link">Profile</Link>)}
        </div>
        <div className="nav-right">
          {isAuthenticated && user ? (<><span className="nav-user-greeting">Hello, {user.email.split('@')[0]}!</span><button onClick={handleLogout} className="logout-button nav-button">Logout</button></>)
            : (<><Link to="/register" className="nav-link">Register</Link><Link to="/login" className="nav-button nav-button-primary">Login</Link></>)}
        </div>
      </nav>

      <main className="app-main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/privacy-policy" element={<div className="static-page"><h1>Privacy Policy</h1><p>Details...</p></div>} />
          <Route path="/terms-of-service" element={<div className="static-page"><h1>Terms of Service</h1><p>Details...</p></div>} />
          
          <Route element={<ProtectedRoute allowedRoles={['instructor']} />}>
            <Route path="/instructor/dashboard" element={<InstructorDashboardPage />} />
            <Route path="/instructor/quiz/create" element={<CreateQuizPage />} />
            <Route path="/instructor/quiz/:quizId/edit" element={<EditQuizPage />} />
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student/dashboard" element={<StudentDashboardPage />} />
            <Route path="/quiz/take/:quizId" element={<QuizPlayerPage />} />
          </Route>
          
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/change-password" element={<ChangePasswordPage />} />
          </Route> 
          
          <Route path="*" element={<div className="static-page"><h1>404</h1><p>Page Not Found.</p></div>} />
        </Routes>
      </main>
    </div>
  );
}
export default App;