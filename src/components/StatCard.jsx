import React from 'react';
import '../App.css';

const StatCard = ({ title, value, description, icon, className = "" }) => {
  return (
    <div className={`chart-card ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="section-title mb-2">{title}</h3>
          <div className="metric-value mb-1">{value}</div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {icon && (
          <div className="ml-4 p-2 bg-primary/10 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;

