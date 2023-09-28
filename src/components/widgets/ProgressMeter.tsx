import React from 'react';

interface ProgressMeterProps {
  percentage: number;
  classNames?: string;
}

const ProgressMeter: React.FC<ProgressMeterProps> = ({ percentage, classNames = '' }) => {
  return (
    <div className="progress">
      <div 
        className={classNames} 
        role="progressbar" 
        style={{ width: `${percentage}%` }} 
        aria-valuenow={percentage} 
        aria-valuemin={0}
        aria-valuemax={100}
      ></div>
    </div>
  );
};

export default ProgressMeter;
