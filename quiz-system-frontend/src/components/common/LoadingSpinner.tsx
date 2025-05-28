// src/components/common/LoadingSpinner.tsx
import React from 'react';
const LoadingSpinner: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
  <div className="loading-spinner-overlay"><div className="loading-spinner"></div>{message && <p>{message}</p>}</div>
);
export default LoadingSpinner; // Default export for easier import if only one