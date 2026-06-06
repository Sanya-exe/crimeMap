from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
import gdown
import threading
import torch
import pickle
from datetime import datetime, timedelta
import itertools as it
import json
from LSTMmodel import LSTMNet  # Import your Net class for LSTM
from RNNmodel import RNNNet  # Import your Net class for RNN
from GRUmodel import GRUNet  # Import your Net class for GRU
import firebase_admin
import smtplib
from firebase_admin import credentials, firestore
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Hello, Flask!"

# Load the updated GeoJSON data
with open('sorted_data1.geojson',encoding='UTF-8') as f:
    geojson_data = json.load(f)

# Load the dataset
df = pd.read_csv('processed_crime.csv')

# Custom unpickling function
def custom_unpickler(file, model_class):
    with open(file, 'rb') as f:
        return pickle.load(f, fix_imports=False, encoding='ASCII', errors='strict')

# Load the prediction models
lstm_model = custom_unpickler('crime_predLSTM_model.pkl', LSTMNet)
rnn_model = custom_unpickler('crime_predRNN_model.pkl', RNNNet)
gru_model = custom_unpickler('crime_predGRU_model.pkl', GRUNet)

def datetime_range(start, end, delta):
    current = start
    while current < end:
        yield current
        current += delta

def moving_window(x, length, step=1):
    streams = it.tee(x, length)
    return zip(*[it.islice(stream, i, None, step) for stream, i in zip(streams, it.count(step=step))])

def choose_target_generate_fllist(sheroaks_crime, date):
    time_frequency = 60 * 24
    chunk_size = 10
    crime_type = 8
    neighborhood_type = 113
    end_time_so = date
    format_string = '%Y-%m-%d'
    end_time_so = datetime.strptime(end_time_so, format_string)
    end_time_so = end_time_so + timedelta(days=1)
    start_time_so = end_time_so - timedelta(days=10)
    time_list_so = [dt.strftime('%Y-%m-%d') for dt in datetime_range(start_time_so, end_time_so, timedelta(minutes=time_frequency))]
    x_ = list(moving_window(time_list_so, chunk_size))
    final_list_so = []
    label_list_so = []
    for i in range(0, len(x_)):
        feature_time_frame = x_[i][:chunk_size-1]
        feature_list = []
        for index_fea in range(0, len(feature_time_frame) - 1):
            start_so = feature_time_frame[index_fea]
            end_so = feature_time_frame[index_fea + 1]
            df_so_middle = sheroaks_crime.loc[(sheroaks_crime['date_occ'] >= start_so) & (sheroaks_crime['date_occ'] < end_so)]
            crime_record = np.zeros((neighborhood_type, crime_type))
            for index, row in df_so_middle.iterrows():
                crime_record[int(row["neighborhood_id"])][int(row["crime_type_id"])] = 1
            feature_list.append(crime_record)
        final_list_so.append(feature_list)

        label_time_frame = x_[i][chunk_size-2:]
        label_time_slots = sheroaks_crime.loc[(sheroaks_crime['date_occ'] >= label_time_frame[0]) & (sheroaks_crime['date_occ'] < label_time_frame[1])]
        crime_record = np.zeros((neighborhood_type, crime_type))
        for index_label, row_label in label_time_slots.iterrows():
            crime_record[int(row_label["neighborhood_id"])][int(row_label["crime_type_id"])] = 1
        label_list_so.append(crime_record)

    return final_list_so, label_list_so

@app.route('/data.geojson', methods=['GET'])
def get_geojson():
    return jsonify(geojson_data)

@app.route('/details', methods=['POST'])
def get_details():
    feature_id = request.json.get('id')
    for feature in geojson_data['features']:
        if feature['properties']['OBJECTID'] == feature_id:
            return jsonify(feature['properties'])
    return jsonify({"error": "Feature not found"}), 404


def download_file_from_drive(file_id, dest_path):
    if not os.path.exists(dest_path):
        url = f"https://drive.google.com/uc?id={file_id}"
        gdown.download(url, dest_path, quiet=False)



@app.route('/api/crime-data', methods=['POST'])
def get_crime_data():
    data = request.json
    start_date = data.get('start_date')
    end_date = data.get('end_date')

    if not start_date or not end_date:
        return jsonify({'error': 'Please provide both start and end dates.'}), 400
    
    download_file_from_drive('12E5j6VbXpOkxgwVZxD9LKAEaRiOn6axO', 'combined.csv')

    df = pd.read_csv('combined.csv')
    df['date_occ'] = pd.to_datetime(df['date_occ'], errors='coerce')

    mask = (df['date_occ'] >= start_date) & (df['date_occ'] <= end_date)
    filtered_df = df.loc[mask, ['date_occ', 'neighborhood', 'new_category', 'time_occ']]

    data = filtered_df.to_dict(orient='records')
    return jsonify(data)



@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    predict_date = data.get('date')
    model_choice = data.get('model', 'LSTM')  # Default to 'LSTM' if no model is specified
    
    if not predict_date:
        return jsonify({"error": "Missing date"}), 400   

    # Generate features for the given date
    feature, label = choose_target_generate_fllist(df, predict_date)
    feature = torch.tensor(feature, dtype=torch.float32)
    test_example = feature.reshape(1, 8, -1)

    # Choose the model based on input
    if model_choice == 'RNN':
        predictions = rnn_model(test_example)
    elif model_choice == 'GRU':
        predictions = gru_model(test_example)
    else:  # Default to LSTM
        predictions = lstm_model(test_example)
    
    predictions_reshaped = predictions.squeeze(0).view(113, 8).detach().numpy()

    # Convert the predictions to a list for easier JSON serialization
    predictions_list = predictions_reshaped.tolist()

    return jsonify({"predictions": predictions_list})



# Firebase setup
service_account_key_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS', '/etc/secrets/serviceAccountKey.json')
cred = credentials.Certificate(service_account_key_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

# Email setup
MAIL_SERVER = os.getenv('MAIL_SERVER')
MAIL_PORT = int(os.getenv('MAIL_PORT'))
MAIL_USERNAME = os.getenv('MAIL_USERNAME')
MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
MAIL_USE_TLS = os.getenv('MAIL_USE_TLS') == 'True'
ADMIN_EMAIL = os.getenv('ADMIN_EMAIL')

def send_email(to, subject, body):
    try:
        with smtplib.SMTP(MAIL_SERVER, MAIL_PORT) as server:
            if MAIL_USE_TLS:
                server.starttls()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            
            msg = MIMEMultipart()
            msg['From'] = MAIL_USERNAME
            msg['To'] = to
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain'))
            server.sendmail(MAIL_USERNAME, to, msg.as_string())
            app.logger.debug(f"Sent email to {to}")
    except Exception as e:
        app.logger.error(f"Failed to send email to {to}: {e}")

@app.route('/contact', methods=['POST'])
def contact():
    data = request.get_json()
    app.logger.debug(f"Received data: {data}")
    
    # Save message to Firestore with retry logic
    retries = 3
    for _ in range(retries):
        try:
            doc_ref = db.collection('messages').add({
                'name': data['name'],
                'email': data['email'],
                'subject': data['subject'],
                'message': data['message'],
                'timestamp': firestore.SERVER_TIMESTAMP
            })
            app.logger.debug(f"Saved message to Firestore: {doc_ref}")
            break
        except Exception as e:
            app.logger.error(f"Failed to save message to Firestore: {e}")
            if _ == retries - 1:
                return jsonify({'message': 'Failed to save message.', 'success': False}), 500

    # Send emails asynchronously
    threading.Thread(target=send_email, args=(ADMIN_EMAIL, f"New Contact Form Submission: {data['subject']}", f"Name: {data['name']}\nEmail: {data['email']}\nSubject: {data['subject']}\n\nMessage:\n{data['message']}")).start()
    threading.Thread(target=send_email, args=(data['email'], "Thank you for reaching out!", "Thank you for reaching out to us. We have received your message and will get back to you shortly.")).start()

    return jsonify({'message': 'Message sent successfully!', 'success': True})

if __name__ == '__main__':
    app.run(debug=True)

