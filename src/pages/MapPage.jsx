import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import axios from 'axios'
import { interpolateOrRd } from 'd3-scale-chromatic'
import './MapPage.css'

const BACKEND = 'https://crimemap-z3so.onrender.com'

function getColor(value, max) {
  if (!max || max === 0) return '#1e3a5f'
  return interpolateOrRd(value / max)
}

function MapPage() {
  const [geojson, setGeojson] = useState(null)
  const [predictions, setPredictions] = useState(null)
  const [date, setDate] = useState('2023-01-01')
  const [model, setModel] = useState('LSTM')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get(`${BACKEND}/data.geojson`)
      .then(res => setGeojson(res.data))
      .catch(() => setError('Failed to load map data. Is the backend running?'))
  }, [])

  const handlePredict = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`${BACKEND}/predict`, { date, model })
      setPredictions(res.data.predictions)
    } catch {
      setError('Prediction failed. Make sure the backend is running.')
    }
    setLoading(false)
  }

  const getScore = (objectId) => {
    if (!predictions) return 0
    const idx = objectId - 1
    if (idx < 0 || idx >= predictions.length) return 0
    return predictions[idx].reduce((a, b) => a + b, 0)
  }

  const maxScore = predictions
    ? Math.max(...predictions.map(row => row.reduce((a, b) => a + b, 0)))
    : 1

  const styleFeature = (feature) => ({
    fillColor: predictions
      ? getColor(getScore(feature.properties.OBJECTID), maxScore)
      : '#1e3a5f',
    fillOpacity: 0.7,
    color: '#ffffff',
    weight: 0.5,
    opacity: 0.6,
  })

  const onEachFeature = (feature, layer) => {
    const name = feature.properties.NAME || feature.properties.name || `Area ${feature.properties.OBJECTID}`
    const score = getScore(feature.properties.OBJECTID)

    layer.on({
      mouseover: (e) => {
        e.target.setStyle({ fillOpacity: 0.95, weight: 2, color: '#58a6ff' })
        layer.bindTooltip(
          `<div class="tooltip-content"><b>${name}</b>${predictions ? `<br/>Crime Score: <b>${score.toFixed(2)}</b>` : ''}</div>`,
          { sticky: true }
        ).openTooltip()
      },
      mouseout: (e) => {
        e.target.setStyle({ fillOpacity: 0.7, weight: 0.5, color: '#ffffff' })
        layer.closeTooltip()
      },
    })
  }

  return (
    <div className="map-page">
      <div className="map-controls">
        <h2><i className="fa-solid fa-map-location-dot"></i> Crime Prediction Map</h2>
        <div className="controls-row">
          <div className="control-group">
            <label>Prediction Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
          <div className="control-group">
            <label>ML Model</label>
            <select value={model} onChange={e => setModel(e.target.value)}>
              <option value="LSTM">LSTM</option>
              <option value="RNN">RNN</option>
              <option value="GRU">GRU</option>
            </select>
          </div>
          <button className="predict-btn" onClick={handlePredict} disabled={loading}>
            {loading ? 'Predicting...' : 'Run Prediction'}
          </button>
          {predictions && (
            <span className="prediction-badge">
              <i className="fa-solid fa-circle-check"></i> Predictions loaded
            </span>
          )}
        </div>
        {error && <p className="error"><i className="fa-solid fa-triangle-exclamation"></i> {error}</p>}
      </div>

      <div className="map-wrapper">
        {geojson ? (
          <MapContainer
            center={[34.0522, -118.2437]}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            <GeoJSON
              key={predictions ? predictions[0][0] : 'base'}
              data={geojson}
              style={styleFeature}
              onEachFeature={onEachFeature}
            />
          </MapContainer>
        ) : (
          <div className="map-loading">
            {error ? error : 'Loading map data...'}
          </div>
        )}

        {predictions && (
          <div className="legend">
            <p className="legend-title">Crime Intensity</p>
            <div className="legend-bar"></div>
            <div className="legend-labels">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MapPage
