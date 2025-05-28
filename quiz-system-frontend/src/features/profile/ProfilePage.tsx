// src/pages/ProfilePage.tsx
import React, { useState, useEffect, ChangeEvent, FormEvent, useCallback } from 'react';
import { Link } from 'react-router-dom';
// Update the import path below if AuthContext is located elsewhere, e.g.:
import { useAuth } from '../../context/AuthContext';
// Update the import path below to the correct location of CircleProgress
import { CircleProgress } from '../../components/common/CircleProgress'; // Import modular CircleProgress
import axios from 'axios';
import './ProfilePage.css'; // Your existing ProfilePage.css

// Interfaces
interface UserProfileData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  profilePictureUrl?: string;
}

interface AttemptSummary {
  attemptId: string; quizId: string; quizTitle: string; score: number;
  totalQuestions: number; percentage: number; submittedAt: string; 
}

interface ProfileQuizStats {
  quizzesTakenCount: number;
  averageScore: number;
  totalQuizzesAvailableSystemWide: number;
}

// Reusable Loading and Error Components (can be moved to common)
const LoadingSpinnerMini: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
  <div className="loading-spinner-inline"><div className="loading-spinner-small"></div> <p>{message}</p></div>
);
const ErrorDisplayMini: React.FC<{ message: string | null }> = ({ message }) => message ? <p className="error-message-inline">{message}</p> : null;


const ProfilePage: React.FC = () => {
  const { user: authUser, token } = useAuth();

  const [profileData, setProfileData] = useState<UserProfileData>({
    fullName: '', email: '', phone: '(000) 000-0000', location: 'Not Set',
    bio: 'Loading bio...',
    profilePictureUrl: 'https://t4.ftcdn.net/jpg/02/45/56/35/360_F_245563558_XH9Pe5LJI2kr7VQuzQKAjAbz9PAyejG1.jpg',
  });

  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [editablePersonalInfo, setEditablePersonalInfo] = useState<Partial<UserProfileData>>({});
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editableBio, setEditableBio] = useState('');
  
  const [quizStats, setQuizStats] = useState<ProfileQuizStats>({
    quizzesTakenCount: 0, averageScore: 0, totalQuizzesAvailableSystemWide: 0,
  });

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string|null>(null); // Specific error for stats section

  const [profileCompletion, setProfileCompletion] = useState(0);
  const targetProfileCompletion = 60; // Example

  // Initial data load for profile (mocked) and student stats (API)
  const loadInitialData = useCallback(async () => {
    if (!authUser || !token) {
      setIsLoadingProfile(false); setIsLoadingStats(false); return;
    }

    setIsLoadingProfile(true);
    setProfileData({ // Initialize with authUser data then allow user to edit/fetch more
      fullName: authUser.email.split('@')[0] || 'User',
      email: authUser.email,
      phone: '(123) 456-7890', // Placeholder, fetch from API later
      location: 'California',    // Placeholder
      bio: `Default bio for ${authUser.email.split('@')[0]}. Please update!`,
      profilePictureUrl: 'https://t4.ftcdn.net/jpg/02/45/56/35/360_F_245563558_XH9Pe5LJI2kr7VQuzQKAjAbz9PAyejG1.jpg',
    });
    // TODO: Actual API call GET /api/users/me/profile to fetch detailed profile
    setIsLoadingProfile(false);

    if (authUser.role === 'student') {
      setIsLoadingStats(true); setStatsError(null);
      try {
        const [attemptsResponse, allQuizzesResponse] = await Promise.all([
          axios.get('http://localhost:5001/api/my-attempts', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5001/api/quizzes', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const attempts: AttemptSummary[] = Array.isArray(attemptsResponse.data) ? attemptsResponse.data : [];
        const totalSystemQuizzes = Array.isArray(allQuizzesResponse.data) ? allQuizzesResponse.data.length : 0;
        if (attempts.length > 0) {
          const totalPercentageSum = attempts.reduce((sum, attempt) => sum + attempt.percentage, 0);
          const uniqueQuizzesTakenIds = new Set(attempts.map(attempt => attempt.quizId));
          setQuizStats({
            averageScore: Math.round(totalPercentageSum / attempts.length),
            quizzesTakenCount: uniqueQuizzesTakenIds.size,
            totalQuizzesAvailableSystemWide: totalSystemQuizzes
          });
        } else {
          setQuizStats({ averageScore: 0, quizzesTakenCount: 0, totalQuizzesAvailableSystemWide: totalSystemQuizzes });
        }
      } catch (err) {
        console.error("ProfilePage: Failed to fetch quiz stats", err);
        setStatsError("Could not load quiz performance.");
        setQuizStats({ averageScore: 0, quizzesTakenCount: 0, totalQuizzesAvailableSystemWide: 0 });
      } finally {
        setIsLoadingStats(false);
      }
    } else {
      setIsLoadingStats(false); // Not a student
    }
  }, [authUser, token]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => { // Profile completion animation
    let currentCompletion = 0;
    const interval = setInterval(() => {
      if (currentCompletion < targetProfileCompletion) {
        currentCompletion += 5;
        setProfileCompletion(Math.min(currentCompletion, targetProfileCompletion));
      } else { clearInterval(interval); }
    }, 100);
    return () => clearInterval(interval);
  }, [targetProfileCompletion]);

  const handlePersonalInfoChange = (e: ChangeEvent<HTMLInputElement>) => setEditablePersonalInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleEditPersonalInfo = () => { setEditablePersonalInfo({ fullName: profileData.fullName, phone: profileData.phone }); setIsEditingPersonalInfo(true); };
  const handleSavePersonalInfo = async (e: FormEvent) => { e.preventDefault(); console.log('Saving PI:', editablePersonalInfo); setProfileData(prev => ({ ...prev, ...editablePersonalInfo })); setIsEditingPersonalInfo(false); };
  const handleCancelPersonalInfo = () => setIsEditingPersonalInfo(false);
  const handleEditBio = () => { setEditableBio(profileData.bio); setIsEditingBio(true); };
  const handleSaveBio = async (e: FormEvent) => { e.preventDefault(); console.log('Saving bio:', editableBio); setProfileData(prev => ({ ...prev, bio: editableBio })); setIsEditingBio(false); };
  const handleCancelBio = () => setIsEditingBio(false);

  if (isLoadingProfile) return <LoadingSpinnerMini message="Loading profile information..." />;
  if (!authUser) return <p>Please log in to view your profile.</p>;

  // Calculate quiz performance percentage for the progress circle
  const quizPerformanceCirclePercentage = quizStats.totalQuizzesAvailableSystemWide > 0 
    ? (quizStats.quizzesTakenCount / quizStats.totalQuizzesAvailableSystemWide) * 100 
    : 0;
  // For the text display, we use average score
  const quizPerformanceAverageScore = quizStats.averageScore;


  return (
    <div className="profile-page-wrapper">
      <main className="profile-main-content">
        <h1 className="profile-page-title">Edit Profile</h1>

        <div className="profile-header-card">
          <div className="profile-image-area">
            <img src={profileData.profilePictureUrl} alt={profileData.fullName} className="profile-img-main"/>
            <div className="profile-image-text">
              <span className="profile-img-title">User Photo</span>
              <p className="upload-hint">Manage profile picture.</p>
            </div>
          </div>
          <Link to="/profile/change-password" className="profile-btn profile-btn-secondary">
            Change Password
          </Link>
        </div>

        <form onSubmit={handleSavePersonalInfo} className="profile-card">
          <div className="profile-card-header"><h2>Personal Info</h2><div className="profile-personal-info-actions">
              {!isEditingPersonalInfo ? <button type="button" className="profile-btn profile-btn-link" onClick={handleEditPersonalInfo}>Edit</button>
                : (<><button type="button" className="profile-btn profile-btn-secondary" onClick={handleCancelPersonalInfo}>Cancel</button><button type="submit" className="profile-btn profile-btn-primary">Save</button></>)}
          </div></div>
          <div className="profile-info-grid">
            <div className="profile-info-item"><span className="profile-info-label">Full Name</span>
              {isEditingPersonalInfo ? <input type="text" name="fullName" className="profile-form-control info-value-edit" value={editablePersonalInfo.fullName || ''} onChange={handlePersonalInfoChange} /> : <span className="profile-info-value-display">{profileData.fullName}</span>}
            </div>
            <div className="profile-info-item"><span className="profile-info-label">Email</span><span className="profile-info-value-display">{profileData.email}</span></div>
            <div className="profile-info-item"><span className="profile-info-label">Phone</span>
              {isEditingPersonalInfo ? <input type="tel" name="phone" className="profile-form-control info-value-edit" value={editablePersonalInfo.phone || ''} onChange={handlePersonalInfoChange} /> : <span className="profile-info-value-display">{profileData.phone}</span>}
            </div>
          </div>
        </form>

        <div className="profile-card">
          <div className="profile-card-header"><h2>Location</h2></div>
          <div className="profile-location-input-group"><span className="profile-location-icon-placeholder">📍</span><input type="text" id="location" name="location" value={profileData.location} onChange={e => setProfileData(p=>({...p, location: e.target.value}))} className="profile-form-control"/></div>
          <div className="profile-actions"><button type="button" className="profile-btn profile-btn-secondary">Cancel</button><button type="button" className="profile-btn profile-btn-primary">Save changes</button></div>
        </div>

        <form onSubmit={handleSaveBio} className="profile-card">
          <div className="profile-card-header"><h2>Bio</h2>{!isEditingBio ? <button type="button" className="profile-btn profile-btn-link" onClick={handleEditBio}>Edit</button> : null}</div>
          <textarea id="bioTextarea" name="bio" className="profile-form-control" rows={6} readOnly={!isEditingBio} value={isEditingBio ? editableBio : profileData.bio} onChange={e => isEditingBio && setEditableBio(e.target.value)}/>
          {isEditingBio && (<div className="profile-actions"><button type="button" className="profile-btn profile-btn-secondary" onClick={handleCancelBio}>Cancel</button><button type="submit" className="profile-btn profile-btn-primary">Save Bio</button></div>)}
        </form>
      </main>

      <aside className="profile-sidebar">
        <h2 className="profile-sidebar-title">Complete your profile</h2>
        <CircleProgress percentage={profileCompletion} circleId="profilePageProgressCircle" textId="profilePageProgressValue" colorClassType="success" sqSize={100} strokeWidth={8}/>
        <ul className="profile-tasks-list">
          <li>Setup account <span className="profile-task-percent">20%</span><span className={`profile-status-check ${profileData.fullName && profileData.email ? 'completed' : 'pending'}`}>{profileData.fullName && profileData.email ? '✔' : '✕'}</span></li>
          <li>Upload photo <span className="profile-task-percent">10%</span><span className="profile-status-check pending">✕</span></li>
          <li>Personal Info <span className="profile-task-percent">20%</span><span className={`profile-status-check ${profileData.phone !== '(000) 000-0000' ? 'completed' : 'pending'}`}>{profileData.phone !== '(000) 000-0000' ? '✔' : '✕'}</span></li>
          <li>Location <span className="profile-task-percent">20%</span><span className={`profile-status-check ${profileData.location !== 'Not Set' ? 'completed' : 'pending'}`}>{profileData.location !== 'Not Set' ? '✔' : '✕'}</span></li>
          <li>Biography <span className="profile-task-percent">20%</span><span className={`profile-status-check ${!profileData.bio.includes("Default bio") ? 'completed' : 'pending'}`}>{!profileData.bio.includes("Default bio") ? '✔' : '✕'}</span></li>
          <li>Notifications <span className="profile-task-percent">10%</span><span className="profile-status-check pending">✕</span></li>
        </ul>
        <div className="profile-sidebar-separator"></div>
        {authUser.role === 'student' && (
          <>
            <h2 className="profile-sidebar-title">Quiz Performance</h2>
            {isLoadingStats ? <LoadingSpinnerMini message="Loading stats..."/> : statsError ? <ErrorDisplayMini message={statsError} /> : (
              <>
                <CircleProgress 
                    percentage={quizPerformanceAverageScore} // Display average score as the main circle stat
                    circleId="profileQuizPerformanceCircle" 
                    textId="profileQuizPerformanceValue"
                    colorClassType="info"
                    sqSize={100} 
                    strokeWidth={8}
                />
                <div className="profile-quiz-stats-details">
                  <p>Quizzes Taken: <span>{quizStats.quizzesTakenCount} / {quizStats.totalQuizzesAvailableSystemWide}</span></p>
                  <p>Average Score: <span>{quizStats.averageScore}%</span></p>
                </div>
              </>
            )}
          </>
        )}
      </aside>
    </div>
  );
};

export default ProfilePage; // Use default export if this is how you import in App.tsx