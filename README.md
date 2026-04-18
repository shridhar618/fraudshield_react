# 🛡️ FraudShield AI
## MCA Second Sem Mini-Project — AI-Powered Credit Card Fraud Detection

---

## 📁 Project Structure

```
fraudshield_react/
│
├── backend/
│   ├── app.py                 ← Flask API server (run this to start backend)
│   ├── data/
│   │   └── creditcard.csv     ← Download from Kaggle (place here)
│   └── model/
│       ├── train.py           ← ML training script (run FIRST)
│       ├── fraud_model.pkl    ← Saved model (auto-generated)
│       ├── scaler.pkl         ← Saved scaler (auto-generated)
│       ├── feature_names.pkl  ← Feature list (auto-generated)
│       └── metrics.json       ← Performance stats (auto-generated)
│
├── src/                       ← React frontend source
│   ├── App.jsx                ← Root component
│   ├── App.css                ← Global styles
│   ├── utils/
│   │   └── mlUtils.js         ← ML prediction logic
│   └── components/
│       ├── NavBar.jsx
│       ├── Analyzer.jsx       ← Transaction risk analyzer
│       ├── Dashboard.jsx      ← Charts and statistics
│       ├── Learn.jsx          ← Beginner's guide
│       └── UseCases.jsx       ← Real-world applications
│
├── package.json
└── README.md
```

---

## 🚀 Quick Setup (Step by Step)

### Prerequisites
Install these before starting:
- Python 3.9+: https://www.python.org
- Node.js 18+: https://nodejs.org
- Git (optional): https://git-scm.com

---

### Step 1: Get the dataset
1. Go to https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud
2. Click Download
3. Extract and place `creditcard.csv` inside `backend/data/`

---

### Step 2: Install Python dependencies
```bash
cd backend
pip install flask flask-cors scikit-learn imbalanced-learn pandas numpy joblib
```

---

### Step 3: Train the ML model
```bash
# Make sure you're in the backend folder
cd backend
python model/train.py
```
This takes 5-10 minutes. You'll see:
```
✅ Model loaded: Random Forest
🏆 Best Model: Random Forest
   ROC-AUC: 0.9997
✅ Saved: fraud_model.pkl, scaler.pkl, ...
```

---

### Step 4: Start the Flask server
```bash
# From the repo root:
python backend/app.py

# If port 5000 is busy on your machine, use a different port:
FRAUDSHIELD_PORT=5001 python backend/app.py
```
Output:
```
✅ Model loaded successfully
 * Running on http://0.0.0.0:5000
```

---

### Step 5: Start the React frontend (Development)
```bash
# In a NEW terminal window
cd src
npm install

# Point the frontend to the backend (adjust port if you changed it above)
VITE_API_BASE=http://127.0.0.1:5000 npm run dev
```
Open: http://localhost:5173

---

### Step 6: Build for Production (optional)
```bash
cd src
npm run build   # Builds React into backend/frontend/dist/
python backend/app.py  # Flask now serves the React build
# Open: http://localhost:5000
```

---

## 🌐 Deploy on PythonAnywhere (Free — Perfect for College!)

1. Create account at https://www.pythonanywhere.com

2. Upload your project:
   - Files tab → Upload files OR
   - Use the Git clone option

3. Open Bash console:
```bash
pip install --user flask flask-cors scikit-learn imbalanced-learn pandas numpy joblib
cd ~/fraudshield/backend
python model/train.py  # Train model on server
```

4. Web tab → Add new web app:
   - Framework: Manual configuration
   - Python version: 3.10
   - Source code: /home/yourusername/fraudshield/backend

5. Edit WSGI file:
```python
import sys
sys.path.insert(0, '/home/yourusername/fraudshield/backend')
from app import app as application
```

6. Click Reload → Live at yourusername.pythonanywhere.com ✅

---

## 📡 API Reference

### POST /predict
```json
// Request
{
  "Amount": 149.62,
  "V1": -1.3598, "V2": -0.0728, ..., "V28": -0.0211
}

// Response
{
  "fraud_prediction": 1,
  "fraud_label": "FRAUD DETECTED",
  "probability": 0.9412,
  "risk_score": 94.1,
  "risk_level": "High Risk",
  "risk_color": "#f75757",
  "model_used": "Random Forest (100 trees)",
  "top_features": [{"name": "V14", "importance": 0.095}, ...]
}
```

### GET /metrics → Model performance stats
### GET /demo    → Sample fraud and normal transactions
### GET /health  → API and model status

---

## 🧠 How It Works (Explain in Your Presentation)

```
TRANSACTION
    │
    ▼
[Flask API receives JSON]
    │
    ▼
[StandardScaler scales Amount]
    │
    ▼
[Random Forest processes V1-V28 + Amount_scaled]
    │
    ├── 100 decision trees each vote
    │
    ▼
[Majority vote → probability 0.0-1.0]
    │
    ├── < 0.30 → Low Risk  (green)  → Approve
    ├── 0.30-0.70 → Medium Risk (yellow) → Review
    └── > 0.70 → High Risk (red)   → Block
```

---

## 📊 Model Results

| Model               | Precision | Recall | F1-Score | ROC-AUC |
|---------------------|-----------|--------|----------|---------|
| Logistic Regression | 89.20%    | 92.86% | 91.00%   | 0.9780  |
| **Random Forest**   | **96.30%**| 87.24% | **91.55%** | **0.9997** |

**Winner: Random Forest** — ROC-AUC of 0.9997 (near perfect!)

---

## 💡 Key Concepts for Your Viva

| Question | Answer |
|----------|--------|
| Why Random Forest? | 100 trees vote → captures non-linear fraud patterns, AUC 0.9997 |
| Why SMOTE? | Dataset has 0.17% fraud — must balance for model to learn fraud |
| Why not use accuracy? | 99.83% accuracy without detecting any fraud — misleading! |
| What are V1-V28? | PCA-compressed bank features (location, merchant, time → anonymized) |
| What is ROC-AUC? | Probability that model ranks a random fraud above a random normal. 0.9997 ≈ perfect |

---

## 🔮 Future Improvements

1. **XGBoost / LightGBM** — even faster and more accurate
2. **SHAP explainability** — show WHY a transaction was flagged
3. **Real-time streaming** — Kafka/WebSocket for live transactions
4. **PostgreSQL logging** — store all predictions for audit trails
5. **JWT Authentication** — secure login for bank analysts
6. **Model drift detection** — alert when fraud patterns change
