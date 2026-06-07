import { useState } from 'react'
import axios from 'axios'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import './CrimeDataPage.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const BACKEND = 'http://127.0.0.1:5000'

function CrimeDataPage() {
  const [startDate, setStartDate] = useState('2023-01-01')
  const [endDate, setEndDate] = useState('2023-01-31')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    setError('')
    setData([])
    try {
      const res = await axios.post(`${BACKEND}/api/crime-data`, {
        start_date: startDate,
        end_date: endDate,
      })
      setData(res.data)
      setSearched(true)
    } catch {
      setError('Failed to fetch crime data. Make sure the backend is running.')
    }
    setLoading(false)
  }

  const neighborhoodCounts = data.reduce((acc, row) => {
    const n = row.neighborhood || 'Unknown'
    acc[n] = (acc[n] || 0) + 1
    return acc
  }, {})

  const topNeighborhoods = Object.entries(neighborhoodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)

  const chartData = {
    labels: topNeighborhoods.map(([name]) => name),
    datasets: [
      {
        label: 'Crime Count',
        data: topNeighborhoods.map(([, count]) => count),
        backgroundColor: 'rgba(88, 166, 255, 0.6)',
        borderColor: '#58a6ff',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Top 15 Neighborhoods by Crime Count',
        color: '#c9d1d9',
        font: { size: 13, family: 'Poppins' },
      },
    },
    scales: {
      x: {
        ticks: { color: '#8b949e', font: { size: 10 }, maxRotation: 45 },
        grid: { color: '#21262d' },
      },
      y: {
        ticks: { color: '#8b949e' },
        grid: { color: '#21262d' },
      },
    },
  }

  return (
    <div className="crime-page">
      <div className="crime-controls">
        <h2><i className="fa-solid fa-chart-bar"></i> Crime Data Explorer</h2>
        <div className="controls-row">
          <div className="control-group">
            <label>Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="control-group">
            <label>End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <button className="search-btn" onClick={handleSearch} disabled={loading}>
            {loading ? 'Loading...' : 'Search'}
          </button>
          {data.length > 0 && (
            <span className="result-badge">
              <i className="fa-solid fa-circle-check"></i> {data.length} records found
            </span>
          )}
        </div>
        {error && <p className="error"><i className="fa-solid fa-triangle-exclamation"></i> {error}</p>}
      </div>

      <div className="crime-content">
        {data.length > 0 && (
          <>
            <div className="chart-section">
              <Bar data={chartData} options={chartOptions} />
            </div>

            <div className="table-section">
              <table className="crime-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Neighborhood</th>
                    <th>Crime Category</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 200).map((row, i) => (
                    <tr key={i}>
                      <td>{row.date_occ ? String(row.date_occ).slice(0, 10) : '-'}</td>
                      <td>{row.time_occ || '-'}</td>
                      <td>{row.neighborhood || '-'}</td>
                      <td><span className="crime-badge">{row.new_category || '-'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length > 200 && (
                <p className="table-note">Showing first 200 of {data.length} records.</p>
              )}
            </div>
          </>
        )}

        {searched && data.length === 0 && !loading && !error && (
          <div className="empty-state">
            <i className="fa-solid fa-magnifying-glass"></i>
            <p>No crime data found for the selected date range.</p>
          </div>
        )}

        {!searched && (
          <div className="empty-state">
            <i className="fa-solid fa-calendar-days"></i>
            <p>Select a date range and click Search to explore crime data.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CrimeDataPage
