import React, { useState } from 'react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'overview', label: 'Network Overview', icon: '📡' },
  { id: 'scanner', label: 'Network Scanner', icon: '🔍' },
  { id: 'signal', label: 'Signal Monitoring', icon: '📶' },
  { id: 'mode', label: '4G / 5G Mode', icon: '⚡' },
  { id: 'speedtest', label: 'Speed & Latency', icon: '⚡' },
  { id: 'heatmap', label: 'Heat Map', icon: '🗺️' },
  { id: 'history', label: 'History & Analytics', icon: '📈' },
  { id: 'offline', label: 'Offline Mode', icon: '📴' },
  { id: 'settings', label: 'Settings & About', icon: '⚙️' },
];

function Navbar({ activeTab, onSelectTab, isOfflineSimulated }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelect = (tabId) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="main-nav-container" aria-label="Main Navigation">
      <div className="nav-desktop-tabs">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`nav-tab-btn ${isActive ? 'active' : ''} ${item.id === 'offline' && isOfflineSimulated ? 'nav-offline-active' : ''}`}
              onClick={() => handleSelect(item.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="nav-tab-icon" aria-hidden="true">{item.icon}</span>
              <span className="nav-tab-label">{item.label}</span>
              {item.id === 'offline' && isOfflineSimulated && (
                <span className="nav-tab-badge">SIMULATED</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile Menu Toggle Button */}
      <div className="nav-mobile-toggle">
        <button
          type="button"
          className="mobile-hamburger-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <span className="hamburger-icon">{mobileMenuOpen ? '✕' : '☰'}</span>
          <span className="current-tab-label">
            {NAV_ITEMS.find((n) => n.id === activeTab)?.label || 'Menu'}
          </span>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="nav-mobile-dropdown">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`mobile-nav-link ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleSelect(item.id)}
            >
              <span className="nav-tab-icon">{item.icon}</span>
              <span className="nav-tab-label">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
