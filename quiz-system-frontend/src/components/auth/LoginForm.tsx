// src/components/auth/LoginForm.tsx
import React, { useState, FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthService } from '../../services/auth.service';
import ErrorDisplay from '../common/ErrorDisplay'; // Assuming this is in common
// import SuccessDisplay from '../common/SuccessDisplay'; // Login success leads to redirect

import '../../AuthPages.css'; // Styles for auth pages

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/"; // Redirect to intended page or home

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null); 
    setIsLoading(true);

    if (!email || !password) {
        setError("Email and password are required.");
        setIsLoading(false);
        return;
    }

    try {
      const authResponse = await AuthService.login({ 
        email, 
        password_plain: password 
      });
      
      if (authResponse.token && authResponse.user) {
        login(authResponse.token, authResponse.user);
        navigate(from, { replace: true }); // Navigate to previous page or home
      } else {
        // This path might not be hit if AuthService throws an error for non-2xx responses
        setError(authResponse.message || 'Login failed: Unknown server response.');
      }
    } catch (err: any) {
      console.error('Login form submission error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-form-card login-form-container">
        <div className="auth-form-icon">🔑</div>
        <h2>Welcome Back!</h2>
        <p className="auth-subtitle">Log in to continue your quiz journey.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              placeholder="you@example.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Enter your password"
            />
          </div>
          
          <ErrorDisplay message={error} />
          
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>Don't have an account? <Link to="/register">Sign up here</Link></p>
          {/* <p><Link to="/forgot-password">Forgot password?</Link></p> */}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;