import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Color mapping based on RF signal thresholds
const getSignalColor = (dbm) => {
  if (dbm >= -80) return '#10b981'; // Emerald (Excellent)
  if (dbm >= -90) return '#06b6d4'; // Cyan (Good)
  if (dbm >= -100) return '#f59e0b'; // Amber (Fair)
  return '#ef4444'; // Red (Poor)
};

function CoverageMap({ coverageData, loading, error, onRetry }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const heatLayerGroupRef = useRef(null);
  const markerLayerGroupRef = useRef(null);

  const [activeLayer, setActiveLayer] = useState('both'); // 'both' | 'heat' | 'markers'
  const [selectedPoint, setSelectedPoint] = useState(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [37.7749, -122.4194],
      zoom: 14,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false, // Prevents accidental page-scroll interception
    });

    // Public free OpenStreetMap tile layer (100% free, no API key required)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19,
      className: 'dark-map-tiles',
    }).addTo(map);

    // Create Layer Groups
    heatLayerGroupRef.current = L.layerGroup().addTo(map);
    markerLayerGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    // Invalidate size once DOM layout stabilizes
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Points and Heatmap Layers
  const updateMapLayers = useCallback(() => {
    if (!mapInstanceRef.current || !coverageData?.points) return;

    const heatGroup = heatLayerGroupRef.current;
    const markerGroup = markerLayerGroupRef.current;

    if (heatGroup) heatGroup.clearLayers();
    if (markerGroup) markerGroup.clearLayers();

    coverageData.points.forEach((point) => {
      const color = getSignalColor(point.signalStrength);

      // 1. Heat footprint radius circle (simulating RF path coverage propagation)
      if (heatGroup) {
        // Radius scale based on signal strength
        const radiusMeters = point.signalStrength >= -75 ? 240 : point.signalStrength >= -90 ? 190 : 140;
        const heatCircle = L.circle([point.latitude, point.longitude], {
          radius: radiusMeters,
          color: color,
          weight: 0,
          fillColor: color,
          fillOpacity: point.signalStrength >= -80 ? 0.22 : 0.16,
          className: 'rf-heat-bubble',
        });
        heatGroup.addLayer(heatCircle);
      }

      // 2. Interactive node marker with rich popup
      if (markerGroup) {
        const marker = L.circleMarker([point.latitude, point.longitude], {
          radius: 6,
          fillColor: color,
          color: '#ffffff',
          weight: 1.5,
          opacity: 0.9,
          fillOpacity: 1,
          className: 'coverage-node-marker',
        });

        // Popup content formatting
        const popupContent = `
          <div class="map-popup-card">
            <div class="map-popup-header">
              <span class="map-popup-gen ${point.networkType === '5G' ? 'gen-5g' : 'gen-4g'}">${point.networkType}</span>
              <span class="map-popup-tech">${point.technology}</span>
            </div>
            <div class="map-popup-signal" style="color: ${color}">
              <strong>${point.signalStrength} dBm</strong>
              <span class="map-popup-bars">${point.signalBars} / 5 bars</span>
            </div>
            <div class="map-popup-metrics">
              <div class="map-metric-row"><span>Quality:</span> <strong>${point.quality}</strong></div>
              <div class="map-metric-row"><span>Downlink:</span> <strong>${point.downloadSpeed} Mbps</strong></div>
              <div class="map-metric-row"><span>Uplink:</span> <strong>${point.uploadSpeed} Mbps</strong></div>
              <div class="map-metric-row"><span>Latency:</span> <strong>${point.latency} ms</strong></div>
            </div>
            <div class="map-popup-time">
              Recorded: ${new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          className: 'custom-map-popup',
          closeButton: false,
        });

        marker.on('click', () => {
          setSelectedPoint(point);
        });

        markerGroup.addLayer(marker);
      }
    });

    // Handle layer visibility based on active filter
    if (mapInstanceRef.current) {
      if (activeLayer === 'heat') {
        if (!mapInstanceRef.current.hasLayer(heatGroup)) mapInstanceRef.current.addLayer(heatGroup);
        if (mapInstanceRef.current.hasLayer(markerGroup)) mapInstanceRef.current.removeLayer(markerGroup);
      } else if (activeLayer === 'markers') {
        if (mapInstanceRef.current.hasLayer(heatGroup)) mapInstanceRef.current.removeLayer(heatGroup);
        if (!mapInstanceRef.current.hasLayer(markerGroup)) mapInstanceRef.current.addLayer(markerGroup);
      } else {
        if (!mapInstanceRef.current.hasLayer(heatGroup)) mapInstanceRef.current.addLayer(heatGroup);
        if (!mapInstanceRef.current.hasLayer(markerGroup)) mapInstanceRef.current.addLayer(markerGroup);
      }
    }
  }, [coverageData, activeLayer]);

  useEffect(() => {
    updateMapLayers();
  }, [updateMapLayers]);

  // Recenter map on central demo location
  const handleRecenter = () => {
    if (mapInstanceRef.current && coverageData?.center) {
      mapInstanceRef.current.flyTo(
        [coverageData.center.latitude, coverageData.center.longitude],
        coverageData.center.defaultZoom || 14,
        { duration: 1.2 }
      );
    }
  };

  return (
    <div className="coverage-map-card">
      <div className="coverage-map-header">
        <div className="coverage-header-info">
          <h3 className="coverage-title">Coverage Intelligence</h3>
          <span className="coverage-subtitle">
            Geographic RF distribution &amp; signal propagation density ({coverageData?.points?.length || 0} sample nodes)
          </span>
        </div>

        {/* View Controls */}
        <div className="coverage-map-controls">
          <div className="layer-toggle-group" role="group" aria-label="Map Layer Toggle">
            <button
              type="button"
              className={`layer-btn ${activeLayer === 'both' ? 'active' : ''}`}
              onClick={() => setActiveLayer('both')}
            >
              Density &amp; Nodes
            </button>
            <button
              type="button"
              className={`layer-btn ${activeLayer === 'heat' ? 'active' : ''}`}
              onClick={() => setActiveLayer('heat')}
            >
              Heatmap
            </button>
            <button
              type="button"
              className={`layer-btn ${activeLayer === 'markers' ? 'active' : ''}`}
              onClick={() => setActiveLayer('markers')}
            >
              Nodes
            </button>
          </div>

          <button
            type="button"
            className="recenter-map-btn"
            onClick={handleRecenter}
            title="Recenter to Sector Center"
          >
            Target Sector
          </button>
        </div>
      </div>

      {/* Map Container Area */}
      <div className="map-view-wrapper">
        {loading && !coverageData && (
          <div className="map-overlay-loading">
            <div className="loading-radar-spinner" aria-hidden="true" />
            <span>Mapping RF Topology...</span>
          </div>
        )}

        {error && (
          <div className="map-overlay-error" role="alert">
            <span>Coverage data unavailable.</span>
            {onRetry && (
              <button type="button" className="retry-btn" onClick={onRetry}>
                Retry
              </button>
            )}
          </div>
        )}

        <div
          ref={mapContainerRef}
          className="leaflet-map-element"
          style={{ height: '420px', width: '100%' }}
        />

        {/* Selected Node Summary Drawer (when a user clicks a node) */}
        {selectedPoint && (
          <div className="map-point-inspector">
            <div className="inspector-header">
              <span className="inspector-title">Active Node Details</span>
              <button
                type="button"
                className="inspector-close"
                onClick={() => setSelectedPoint(null)}
                aria-label="Close details"
              >
                ✕
              </button>
            </div>
            <div className="inspector-grid">
              <div className="inspector-item">
                <span className="inspector-label">Technology</span>
                <span className="inspector-val">{selectedPoint.technology} ({selectedPoint.networkType})</span>
              </div>
              <div className="inspector-item">
                <span className="inspector-label">Signal Level</span>
                <span className="inspector-val" style={{ color: getSignalColor(selectedPoint.signalStrength) }}>
                  {selectedPoint.signalStrength} dBm ({selectedPoint.signalBars}/5 bars)
                </span>
              </div>
              <div className="inspector-item">
                <span className="inspector-label">Downlink</span>
                <span className="inspector-val">{selectedPoint.downloadSpeed} Mbps</span>
              </div>
              <div className="inspector-item">
                <span className="inspector-label">Latency</span>
                <span className="inspector-val">{selectedPoint.latency} ms</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="coverage-map-legend">
        <span className="legend-label">Signal Intensity Legend:</span>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-dot dot-excellent" />
            <span>Excellent (&ge; -80 dBm)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot dot-good" />
            <span>Good (-81 to -90 dBm)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot dot-fair" />
            <span>Fair (-91 to -100 dBm)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot dot-poor" />
            <span>Poor (&le; -101 dBm)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoverageMap;
