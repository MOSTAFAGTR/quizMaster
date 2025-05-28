// src/components/common/CircleProgress.tsx
import React, { useState, useEffect } from 'react';
interface CircleProgressProps { /* ... same as animated version ... */ 
  percentage: number; sqSize?: number; strokeWidth?: number; circleId: string; textId: string;   
  colorClassType: 'success' | 'info' | 'warning' | 'danger' | 'primary'; displayText?: string; animationDuration?: number;
}
export const CircleProgress: React.FC<CircleProgressProps> = ({ 
  percentage, sqSize = 100, strokeWidth = 8, circleId, textId, colorClassType, displayText, animationDuration = 200 
}) => {
  const radius = (sqSize - strokeWidth) / 2; const viewBox = `0 0 ${sqSize} ${sqSize}`;
  const dashArray = radius * Math.PI * 2;
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  useEffect(() => {
    let startValue = animatedPercentage; const endValue = Math.max(0, Math.min(percentage, 100));
    if (startValue === endValue) { setAnimatedPercentage(endValue); return; }
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsedTime = currentTime - startTime; const progress = Math.min(elapsedTime / animationDuration, 1);
      const currentValue = startValue + (endValue - startValue) * progress;
      setAnimatedPercentage(currentValue);
      if (progress < 1) requestAnimationFrame(animate); else setAnimatedPercentage(endValue);
    };
    const animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [percentage, animationDuration, animatedPercentage]);
  const normalizedDisplayPercentage = Math.max(0, Math.min(animatedPercentage, 100));
  const dashOffset = dashArray - (dashArray * normalizedDisplayPercentage) / 100;
  let strokeColorClass = 'progress-ring__circle--primary', textColorClass = 'progress-text--primary';
  switch (colorClassType) {
    case 'success': strokeColorClass = 'progress-ring__circle--success'; textColorClass = 'progress-text--success'; break;
    case 'info': strokeColorClass = 'progress-ring__circle--info'; textColorClass = 'progress-text--info'; break;
    case 'warning': strokeColorClass = 'progress-ring__circle--warning'; textColorClass = 'progress-text--warning'; break;
    case 'danger': strokeColorClass = 'progress-ring__circle--danger'; textColorClass = 'progress-text--danger'; break;
  }
  return (
    <div className="circle-progress-container">
      <svg width={sqSize} height={sqSize} viewBox={viewBox} className="progress-ring-svg">
        <circle className="progress-ring__bg" cx={sqSize/2} cy={sqSize/2} r={radius} strokeWidth={`${strokeWidth}px`} fill="transparent"/>
        <circle className={`progress-ring__circle ${strokeColorClass}`} id={circleId} cx={sqSize/2} cy={sqSize/2} r={radius} strokeWidth={`${strokeWidth}px`} fill="transparent"
          style={{ strokeDasharray: dashArray, strokeDashoffset: dashOffset, transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: `stroke-dashoffset ${animationDuration}ms ease-out` }}/>
      </svg>
      <div className={`progress-text ${textColorClass}`} id={textId}>{displayText !== undefined ? displayText : `${Math.round(normalizedDisplayPercentage)}%`}</div>
    </div>
  );
};