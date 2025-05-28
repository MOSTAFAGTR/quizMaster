// src/components/auth/RegisterForm.tsx
import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../../services/auth.service';
import ErrorDisplay from '../common/ErrorDisplay';
import SuccessDisplay from '../common/SuccessDisplay';
import { UserRole } from '../../types'; // Correctly imports UserRole

import '../../AuthPages.css'; // Styles for auth pages (ensure this path is correct if AuthPages.css is in src/)
                               // If AuthPages.css is in src/styles/, path would be '../../styles/AuthPages.css'

const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student'); // Uses imported UserRole
  
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null); setError(null); setIsLoading(true);
    if (!email || !password || !confirmPassword) {
      setError("All fields are required."); setIsLoading(false); return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match."); setIsLoading(false); return;
    }
    if (password.length < 6) {
      setError("Password should be at least 6 characters long."); setIsLoading(false); return;
    }
    try {
      const authResponse = await AuthService.register({ email, password_plain: password, role });
      setMessage(authResponse.message || 'Registration successful! Please log in.');
      setEmail(''); setPassword(''); setConfirmPassword(''); setRole('student');
      setTimeout(() => navigate('/login'), 2000); 
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-form-card register-form-container">
        <div className="auth-form-icon">📝</div>
        <h2>Create Your Account</h2>
        <p className="auth-subtitle">Join QuizMaster and start your learning adventure!</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} placeholder="you@example.com"/>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} placeholder="Choose a strong password (min. 6 chars)"/>
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isLoading} placeholder="Re-enter your password"/>
          </div>
          <div className="form-group">
            <label htmlFor="role">I am a:</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value as UserRole)} disabled={isLoading} className="form-control">
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
            </select>
          </div>
          
          <ErrorDisplay message={error} />
          <SuccessDisplay message={message} />
          
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Create Account'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>Already have an account? <Link to="/login">Log in here</Link></p>
        </div>
      </div>
    </div>
  );
};
export default RegisterForm;