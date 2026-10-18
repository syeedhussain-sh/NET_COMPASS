import React from 'react';

function SignalStrength({ signalStrength = -75, signalBars = 4 }) {
  // Determine color based on signal level
  const getSignalColor = () => {
    if (signalBars >= 4) return 'var(--accent-emerald)';
    if (signalBars === 3) return 'var(--accent-cyan)';
    if (signalBars === 2) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const signalColor = getSignalColor();

  return (
    <div className="signal-strength-card">
      <div className="signal-bars-container" aria-label={`Signal strength: ${signalBars} of 5 bars`}>
        {[1, 2, 3, 4, 5].map((bar) => {
          const isActive = bar <= signalBars;
          return (
            <span
              key={bar}
              className={`signal-bar ${isActive ? 'active' : 'inactive'}`}
              style={{
                height: `${bar * 20}%`,
                backgroundColor: isActive ? signalColor : 'rgba(148, 163, 184, 0.2)',
                boxShadow: isActive ? `0 0 6px ${signalColor}` : 'none',
              }}
            />
          );
        })}
      </div>
      <div className="signal-details">
        <span className="signal-dbm-value">{signalStrength} dBm</span>
        <span className="signal-bars-label">{signalBars} / 5 bars</span>
      </div>
    </div>
  );
}

export default SignalStrength;
