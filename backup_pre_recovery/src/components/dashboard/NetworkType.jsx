import React from 'react';

function NetworkType({ networkType = '5G', technology = '5G Sub-6' }) {
  const is5G = networkType === '5G';

  return (
    <div className={`network-type-card ${is5G ? 'type-5g' : 'type-4g'}`}>
      <div className="network-type-header">
        <span className="network-type-badge">{networkType}</span>
        <span className="network-tech-pill">{technology}</span>
      </div>
      <div className="network-type-caption">
        {is5G ? 'Next-Gen Cellular' : 'Broadband Cellular'}
      </div>
    </div>
  );
}

export default NetworkType;
