import React from 'react';

function MetricCard({
  title,
  value,
  unit,
  icon,
  subtext,
  colorVariant = 'cyan',
}) {
  return (
    <div className={`metric-card metric-card-${colorVariant}`}>
      <div className="metric-card-top">
        <span className="metric-card-title">{title}</span>
        {icon && <span className="metric-card-icon" aria-hidden="true">{icon}</span>}
      </div>
      <div className="metric-card-body">
        <span className="metric-card-value">{value}</span>
        {unit && <span className="metric-card-unit">{unit}</span>}
      </div>
      {subtext && <div className="metric-card-subtext">{subtext}</div>}
    </div>
  );
}

export default MetricCard;
