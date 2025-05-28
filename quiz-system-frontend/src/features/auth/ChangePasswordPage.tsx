// src/features/auth/ChangePasswordPage.tsx
import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthService } from '../../services/auth.service';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import SuccessDisplay from '../../components/common/SuccessDisplay';
// import { UserRole } from '../../types'; // UserRole is not directly used in this component's logic

import '../../AuthPages.css'; // Styles for auth pages (ensure this path is correct)

const ChangePasswordPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null); setMessage(null); setIsLoading(true);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError("All password fields are required."); setIsLoading(false); return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match."); setIsLoading(false); return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long."); setIsLoading(false); return;
    }
    if (newPassword === currentPassword && currentPassword.length > 0) {
      setError("New password cannot be the same as the current password."); setIsLoading(false); return;
    }
    if (!token) {
      setError("Authentication error. Please log in again."); setIsLoading(false); return;
    }

    try {
      const response = await AuthService.changePassword(
        { currentPassword_plain: currentPassword, newPassword_plain: newPassword },
        token
      );
      setMessage(response.message || "Password changed successfully!");
      setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('');
      setTimeout(() => {
        logout(); 
        navigate('/login', { state: { message: "Password changed successfully. Please log in with your new password." }});
      }, 2000);
    } catch (err: any) {
      console.error('Change password error:', err);
      setError(err.response?.data?.message || err.message || "Failed to change password. Please check your current password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-form-card change-password-form-card">
        <div className="change-password-icon">🔑</div>
        <h2>Reset Password</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required disabled={isLoading} placeholder="Enter your current password"/>
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={isLoading} placeholder="Enter new password (min. 6 chars)"/>
          </div>
          <div className="form-group">
            <label htmlFor="confirmNewPassword">Confirm New Password</label>
            <input type="password" id="confirmNewPassword" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required disabled={isLoading} placeholder="Re-enter your new password"/>
          </div>

          <ErrorDisplay message={error} />
          <SuccessDisplay message={message} />

          <div className="change-password-actions">
            <button type="button" onClick={() => navigate(-1)} className="btn-cancel" disabled={isLoading}>Cancel</button>
            <button type="submit" className="btn-continue" disabled={isLoading}>{isLoading ? 'Updating...' : 'Continue'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ChangePasswordPage;