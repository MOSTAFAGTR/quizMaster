// src/components/common/ErrorDisplay.tsx
import React from 'react';
const ErrorDisplay: React.FC<{ message: string | null }> = ({ message }) => message ? <p className="error-message form-feedback">{message}</p> : null;
export default ErrorDisplay;