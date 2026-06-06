# React + Vite

# CrimeMap: AI-Driven Crime Prediction and Visualization

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)
- [Video Demo](#video-demo)

## Project Overview
CrimeMap is an AI-driven application designed to predict and visualize crime occurrences. Leveraging machine learning models, the application provides predictions based on historical crime data and presents the information in an interactive and visually appealing map interface.

## Features
- **Crime Predictions**: Uses LSTM, GRU, and RNN models to predict future crime occurrences.
- **Interactive Map**: Displays crime data on a choropleth map with popups showing neighborhood crime counts.
- **Temporal Analysis**: Provides date filters and charts for analyzing crime data over time.
- **Contact Form**: Users can send messages via a contact form, with email notifications sent to both the user and admin.

## Tech Stack
- **Frontend**:
  - React
  - Mapbox GL JS for map visualization
- **Backend**:
  - Flask
  - Python
- **Machine Learning**:
  - LSTM, GRU, and RNN models (stored as .pkl files)
- **Database**:
  - To be determined (could be SQL, NoSQL, etc.)
- **Deployment**:
  - Local server: http://127.0.0.1:5000
  - Considering serverless functions for backend deployment

## Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/CrimeMap.git
   cd CrimeMap

