from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import tensorflow as tf
# import os

# os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# Load the trained model
model = tf.keras.models.load_model('model.h5')

# Load the dataset and process it
df = pd.read_csv('./dataset/DiseaseAndSymptoms.csv')
df.columns = df.columns.str.lower()

df = df.apply(lambda col: col.str.lower() if col.dtypes == 'object' else col)

if 'disease' in df.columns:
    df['disease'] = df['disease'].str.strip().str.replace(' ', '_')

symptom_columns = [col for col in df.columns if 'symptom_' in col]

# Function to clean symptoms
def clean_symptom(symptom):
    if isinstance(symptom, str):
        return ''.join(symptom.split())
    return symptom

for col in symptom_columns:
    df[col] = df[col].apply(clean_symptom)
    
# Prepare weights and symptoms list
total_symptoms = len(df.columns) - 1
weights = np.linspace(1, 0.05, total_symptoms)

unique_symptoms = set()

for col in df.columns[1:]:
    unique_symptoms.update(df[col].dropna().unique())
    
unique_symptoms = sorted(unique_symptoms)

# Prepare the weighted model dataframe
df_model_weighted = pd.DataFrame(columns=['disease'] + unique_symptoms)

weighted_rows = []

for _, row in df.iterrows():
    weighted_row = {symptom: 0 for symptom in unique_symptoms}

    for i, col in enumerate(df.columns[1:]):
        symptom = row[col]
        if pd.notna(symptom):
            weighted_row[symptom] = weights[i]

    weighted_row['disease'] = row['disease']
    weighted_rows.append(weighted_row)

df_model_weighted = pd.DataFrame(weighted_rows)

df_model_weighted.fillna(0, inplace=True)

# Create disease mapping for encoding
disease_mapping = {disease: i for i, disease in enumerate(df_model_weighted['disease'].unique())}
inverse_disease_mapping = {i: disease for disease, i in disease_mapping.items()}

# Initialize Flask app
app = Flask(__name__)

@app.route('/')
def home():
    return "Welcome to the Symptom Prediction API!"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get the JSON data from the request
        data = request.get_json()
        input_symptoms = data.get('symptoms', [])

        # Validate input
        if not input_symptoms or not isinstance(input_symptoms, list):
            return jsonify({"error": "Invalid input. 'symptoms' must be a list."}), 400

        # Prepare input data for prediction
        input_data = np.zeros((1, len(unique_symptoms)))
        
        for i, symptom in enumerate(input_symptoms):
            if symptom in unique_symptoms:
                input_data[0, unique_symptoms.index(symptom)] = weights[i]

        # Predict disease probabilities
        probabilities = model.predict(input_data)[0]

        # Convert predictions to disease names
        disease_probs = {inverse_disease_mapping[i]: float(prob) for i, prob in enumerate(probabilities)}
        
        # Sort the diseases by their probabilities (correct sorting method)
        sorted_probs = sorted(disease_probs.items(), key=lambda item: item[1], reverse=True)

        # Return sorted diseases with their probabilities as a list of tuples
        return jsonify({"predictions": sorted_probs}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
