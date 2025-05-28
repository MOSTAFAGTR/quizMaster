// src/components/common/SuccessDisplay.tsx
import React from 'react';
const SuccessDisplay: React.FC<{ message: string | null }> = ({ message }) => message ? <p className="success-message form-feedback">{message}</p> : null;
export default SuccessDisplay;