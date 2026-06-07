# CrimeMap: AI-Driven Crime Prediction and Visualization

CrimeMap is a full-stack web application that uses deep learning models to predict crime occurrences across neighborhoods and visualizes them on an interactive map. Built with React, Flask, and Firebase, it combines machine learning with geospatial data to make crime patterns easier to understand.

## What it does

- Predicts crime likelihood across 113 neighborhoods using LSTM, GRU, and RNN models
- Displays predictions as a color-coded choropleth map (green = low risk, red = high risk)
- Lets you explore historical crime data by date range with charts and tables
- Includes a contact form that saves messages to Firebase and sends email notifications

## Tech Stack

**Frontend** — React, React Leaflet, Chart.js, Axios, React Router

**Backend** — Flask, Python

**Machine Learning** — LSTM, GRU, RNN (PyTorch, trained on LA crime dataset)

**Database** — Firebase Firestore

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- A Firebase project with Firestore enabled

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Sanya-exe/crimeMap.git
   cd crimeMap
   ```

2. Set up the backend
   ```bash
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Add your Firebase service account key
   - Download `serviceAccountKey.json` from your Firebase project settings
   - Place it in the root of the project

4. Create a `.env` file in the root with the following:
   ```
   MAIL_SERVER=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=your_email@gmail.com
   MAIL_PASSWORD=your_app_password
   MAIL_USE_TLS=True
   ADMIN_EMAIL=your_email@gmail.com
   GOOGLE_APPLICATION_CREDENTIALS=C:/path/to/serviceAccountKey.json
   ```

5. Install frontend dependencies
   ```bash
   npm install
   ```

### Running the app

Start the backend (in one terminal):
```bash
python Map.py
```

Start the frontend (in another terminal):
```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## ML Models

The app uses three sequence models trained on historical LA crime data (2018, 113 neighborhoods, 8 crime types):

- **LSTM** (Long Short-Term Memory) — best at capturing long-term patterns in crime sequences
- **GRU** (Gated Recurrent Unit) — faster than LSTM with comparable accuracy
- **RNN** (Recurrent Neural Network) — simpler baseline model

Each model takes the past 9 days of crime data as input and predicts crime likelihood for the next day across all neighborhoods and crime types.

## Project Structure

```
CrimeMap/
├── src/                  # React frontend
│   ├── pages/            # Map, Crime Data, Contact pages
│   └── components/       # Navbar
├── Map.py                # Flask backend + API routes
├── LSTMmodel.py          # LSTM model architecture
├── GRUmodel.py           # GRU model architecture
├── RNNmodel.py           # RNN model architecture
├── processed_crime.csv   # Cleaned crime dataset
└── sorted_data1.geojson  # LA neighborhood boundaries
```

## License

MIT
