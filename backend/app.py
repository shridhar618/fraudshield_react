"""
============================================================
  FraudShield AI — Flask Backend API  (app.py)
  ============================================================

BEGINNER EXPLANATION:
---------------------
This file is the "brain server". When the React frontend
sends transaction data, this server:
  1. Receives it (like a waiter taking an order)
  2. Scales the Amount using the saved scaler
  3. Feeds it to the saved Random Forest model
  4. Returns the prediction + risk score as JSON

Think of it as: React = customer, Flask = waiter, Model = chef

HOW TO RUN:
  1. Run model/train.py first to create fraud_model.pkl
  2. python app.py
  3. Open http://localhost:5000
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# ── App Setup ─────────────────────────────────────────────
# __file__ = this file's path
# os.path.dirname = the directory containing this file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(
    __name__,
    static_folder=os.path.join(BASE_DIR, 'frontend', 'dist'),  # React build
    static_url_path=''
)

# CORS = Cross-Origin Resource Sharing
# Allows React (port 3000) to talk to Flask (port 5000) during development
CORS(app)

# ── Load Saved Model Artifacts ─────────────────────────────
MODEL_DIR = os.path.join(BASE_DIR, 'model')

try:
    model         = joblib.load(os.path.join(MODEL_DIR, 'fraud_model.pkl'))
    scaler        = joblib.load(os.path.join(MODEL_DIR, 'scaler.pkl'))
    feature_names = joblib.load(os.path.join(MODEL_DIR, 'feature_names.pkl'))
    with open(os.path.join(MODEL_DIR, 'metrics.json')) as f:
        metrics = json.load(f)
    MODEL_LOADED = True
    print("✅ Model loaded successfully")
    print(f"   Features: {len(feature_names)}")
    print(f"   Best AUC: {max(m['auc'] for m in metrics):.4f}")
except Exception as e:
    print(f"⚠️  Model not found — run model/train.py first\n   Error: {e}")
    model = scaler = feature_names = None
    metrics = []
    MODEL_LOADED = False


# ── Helper: Convert probability → risk level ───────────────
def get_risk_info(probability: float) -> dict:
    """
    Maps model output probability to human-readable risk levels.

    Thresholds based on industry practice:
    - Low:    0% – 30%   → approve transaction
    - Medium: 30% – 70%  → request additional verification
    - High:   70% – 100% → block transaction
    """
    score = round(float(probability) * 100, 2)
    if probability < 0.30:
        return {'risk_score': score, 'risk_level': 'Low Risk',    'risk_color': '#06d6a0'}
    elif probability < 0.70:
        return {'risk_score': score, 'risk_level': 'Medium Risk', 'risk_color': '#fbbf24'}
    else:
        return {'risk_score': score, 'risk_level': 'High Risk',   'risk_color': '#f75757'}


# ── ROUTE: Serve React Frontend ────────────────────────────
@app.route('/')
def serve_react():
    """Serves the built React app (after npm run build)"""
    return send_from_directory(app.static_folder, 'index.html')


# ── ROUTE: /predict (Main ML Endpoint) ────────────────────
@app.route('/predict', methods=['POST'])
def predict():
    """
    Main prediction endpoint.

    Accepts:
        POST /predict
        Content-Type: application/json
        Body: {"Amount": 149.62, "V1": -1.36, "V2": -0.07, ... "V28": -0.02}

    Returns:
        {
            "fraud_prediction": 1,
            "fraud_label": "FRAUD DETECTED",
            "probability": 0.94,
            "risk_score": 94.0,
            "risk_level": "High Risk",
            "risk_color": "#f75757",
            "model_used": "Random Forest"
        }
    """
    if not MODEL_LOADED:
        return jsonify({'error': 'Model not loaded. Run model/train.py first.'}), 503

    data = request.get_json(force=True)
    if not data:
        return jsonify({'error': 'No JSON body received'}), 400

    try:
        # Extract Amount and scale it (same way training did)
        amount_raw    = float(data.get('Amount', 0))
        amount_scaled = float(scaler.transform([[amount_raw]])[0][0])

        # Build feature vector in correct order
        # feature_names = the exact column order the model was trained on
        row = {}
        for feat in feature_names:
            if feat == 'Amount_scaled':
                row[feat] = amount_scaled
            else:
                row[feat] = float(data.get(feat, 0))

        # Create DataFrame (model expects this format)
        input_df = pd.DataFrame([row])[feature_names]

        # Get prediction
        probability = float(model.predict_proba(input_df)[0][1])
        prediction  = int(model.predict(input_df)[0])
        risk_info   = get_risk_info(probability)

        # Feature importances for explanation
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
            top_idx = importances.argsort()[-5:][::-1]
            top_features = [
                {'name': feature_names[i], 'importance': round(float(importances[i]), 4)}
                for i in top_idx
            ]
        else:
            top_features = []

        return jsonify({
            'fraud_prediction': prediction,
            'fraud_label':      'FRAUD DETECTED' if prediction == 1 else 'LEGITIMATE',
            'probability':      round(probability, 4),
            'model_used':       'Random Forest (100 trees)',
            'top_features':     top_features,
            **risk_info
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ── ROUTE: /metrics ────────────────────────────────────────
@app.route('/metrics', methods=['GET'])
def get_metrics():
    """Returns model performance comparison from training"""
    return jsonify(metrics)


# ── ROUTE: /demo ───────────────────────────────────────────
@app.route('/demo', methods=['GET'])
def demo():
    """Returns sample transactions for testing"""
    return jsonify({
        'fraud_sample': {
            'Amount': 149.62,
            'V1': -1.3598, 'V2': -0.0728, 'V3': 2.5363, 'V4': 1.3782,
            'V5': -0.3383, 'V6': 0.4624,  'V7': 0.2396, 'V8': 0.0987,
            'V9': 0.3638,  'V10': 0.0908, 'V11': -0.5516, 'V12': -0.6178,
            'V13': -0.9914,'V14': -0.3112,'V15': 1.4682,  'V16': -0.4704,
            'V17': 0.2079, 'V18': 0.0258, 'V19': 0.4031, 'V20': 0.2514,
            'V21': -0.0183,'V22': 0.2779, 'V23': -0.1105,'V24': 0.0669,
            'V25': 0.1285, 'V26': -0.1891,'V27': 0.1335, 'V28': -0.0211
        },
        'normal_sample': {
            'Amount': 2.69,
            'V1': 1.1919, 'V2': 0.2662, 'V3': 0.1665, 'V4': 0.4481,
            'V5': 0.06,   'V6': -0.0824,'V7': -0.0788,'V8': 0.0851,
            'V9': -0.2554,'V10': -0.1664,'V11': 1.6127,'V12': 1.0652,
            'V13': 0.4897,'V14': -0.1431,'V15': 0.6355,'V16': 0.4634,
            'V17': -0.1148,'V18': -0.1832,'V19': -0.1457,'V20': -0.069,
            'V21': -0.2257,'V22': -0.6386,'V23': 0.1012,'V24': -0.3398,
            'V25': 0.1671,'V26': 0.1257,'V27': -0.0089,'V28': 0.0145
        }
    })


# ── ROUTE: /health ─────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    """Health check — useful for deployment monitoring"""
    return jsonify({
        'status':       'running',
        'model_loaded': MODEL_LOADED,
        'features':     len(feature_names) if feature_names else 0
    })


# ── Run Server ─────────────────────────────────────────────
if __name__ == '__main__':
    # Set `FRAUDSHIELD_DEBUG=1` to enable Flask debug mode.
    # Keep `use_reloader=False` because some environments disallow the reloader.
    debug = os.environ.get('FRAUDSHIELD_DEBUG') == '1'
    host = os.environ.get('FRAUDSHIELD_HOST', '0.0.0.0')
    port = int(os.environ.get('FRAUDSHIELD_PORT', os.environ.get('PORT', '5000')))
    app.run(debug=debug, use_reloader=False, host=host, port=port)
