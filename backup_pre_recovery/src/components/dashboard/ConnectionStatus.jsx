import React from 'react';

function ConnectionStatus({ status = 'Connected' }) {
  const getStatusClass = () => {
    switch (status.toLowerCase()) {
      case 'connected':
        return 'status-connected';
      case 'weak':
        return 'status-weak';
      case 'disconnected':
        return 'status-disconnected';
      default:
        return 'status-connected';
    }
  };

  return (
    <div className={`connection-status-badge ${getStatusClass()}`}>
      <span className="connection-status-dot" aria-hidden="true" />
      <span className="connection-status-label">{status}</span>
    </div>
  );
}

export default ConnectionStatus;
