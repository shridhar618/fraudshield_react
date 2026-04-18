"""
============================================================
  FraudShield AI — ML Model Training (train.py)
  ============================================================

BEGINNER GUIDE — READ THIS FIRST:
----------------------------------
This script does ONE job: take the raw Kaggle dataset and
produce a trained model file (fraud_model.pkl) that can
instantly predict fraud on any new transaction.

Think of it like studying for an exam:
  - Dataset = textbook (examples to learn from)
  - Training = studying
  - Model = your brain after studying
  - .pkl file = saving your knowledge to a file
  - Prediction = answering exam questions

RUN THIS ONCE before starting app.py:
  python model/train.py

REQUIREMENTS:
  pip install scikit-learn imbalanced-learn pandas numpy joblib

DATASET:
  Download creditcard.csv from Kaggle:
  https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud
  Place it in: backend/data/creditcard.csv
"""

import os
import sys
import json
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection   import train_test_split
from sklearn.preprocessing     import StandardScaler
from sklearn.linear_model      import LogisticRegression
from sklearn.ensemble          import RandomForestClassifier
from sklearn.metrics           import (
    classification_report,
    precision_score, recall_score, f1_score, roc_auc_score
)
from imblearn.over_sampling    import SMOTE

# ── Paths ──────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH  = os.path.join(SCRIPT_DIR, '..', 'data', 'creditcard.csv')
MODEL_DIR  = SCRIPT_DIR  # Save .pkl files in same folder as train.py


# ═══════════════════════════════════════════════════════════
# STEP 1 — LOAD DATA
# ═══════════════════════════════════════════════════════════
def load_data():
    """
    Loads the CSV file into a Pandas DataFrame.

    WHAT IS A DATAFRAME?
    Think of it as a smart Excel spreadsheet in Python.
    Each row = one transaction, each column = one feature.
    """
    print("\n" + "="*55)
    print("  STEP 1: Loading Dataset")
    print("="*55)

    if not os.path.exists(DATA_PATH):
        print(f"❌ ERROR: creditcard.csv not found at {DATA_PATH}")
        print("   Download from: https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud")
        sys.exit(1)

    df = pd.read_csv(DATA_PATH)

    print(f"✅ Loaded {len(df):,} rows × {df.shape[1]} columns")
    print(f"   Normal transactions:  {(df['Class']==0).sum():,}")
    print(f"   Fraud transactions:   {(df['Class']==1).sum():,}")
    print(f"   Fraud rate:           {df['Class'].mean()*100:.4f}%")
    print(f"\n   Columns: {list(df.columns)}")

    return df


# ═══════════════════════════════════════════════════════════
# STEP 2 — PREPROCESSING
# ═══════════════════════════════════════════════════════════
def preprocess(df):
    """
    Cleans and prepares data for ML training.

    WHAT HAPPENS HERE:
    1. Remove missing values (if any)
    2. Scale 'Amount' to same range as V features
    3. Split into training and test sets (80/20)
    4. Apply SMOTE to fix class imbalance
    """
    print("\n" + "="*55)
    print("  STEP 2: Preprocessing")
    print("="*55)

    # 2a. Handle missing values
    missing = df.isnull().sum().sum()
    print(f"\n Missing values: {missing}")
    if missing > 0:
        df = df.dropna()
        print(f"   Dropped rows with missing values. New size: {len(df):,}")

    # 2b. Scale Amount
    # WHY? V1-V28 are PCA-transformed: values range -5 to +5
    # Amount is raw dollars: range $0 to $25,000
    # Without scaling, model focuses too much on large amounts
    # StandardScaler → mean=0, std=1 (like a z-score)
    print("\n Scaling 'Amount' with StandardScaler...")
    scaler = StandardScaler()
    df['Amount_scaled'] = scaler.fit_transform(df[['Amount']])

    # 2c. Drop original Amount (replaced by scaled) and Time (not useful)
    df = df.drop(columns=['Time', 'Amount'])
    print(f"   Dropped: Time, Amount (Amount_scaled created)")

    # 2d. Separate features (X) and target (y)
    # X = what we feed IN to the model (all columns except 'Class')
    # y = what we want to PREDICT (just 'Class')
    X = df.drop(columns=['Class'])
    y = df['Class']

    print(f"\n Features (X): {X.shape[1]} columns")
    print(f"   Target  (y): 0 = Normal, 1 = Fraud")

    # 2e. Train-test split
    # WHY STRATIFY? Ensures fraud ratio is same in both splits
    # Without stratify, test set might have very few/no fraud cases
    print("\n Splitting: 80% train, 20% test (stratified)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"   Train: {len(X_train):,} rows  |  Test: {len(X_test):,} rows")
    print(f"   Train fraud: {y_train.sum():,}  |  Test fraud: {y_test.sum():,}")

    # 2f. SMOTE — fix class imbalance
    # PROBLEM: Only 394 fraud in train set vs 227,451 normal
    # Model would just learn "always say not fraud" → 99.8% accuracy
    # but catches ZERO frauds!
    #
    # SMOTE FIX: Creates SYNTHETIC fraud samples by interpolating
    # between existing fraud samples. Like making photocopies of
    # fraud patterns with slight variations.
    #
    # IMPORTANT: Apply SMOTE only on TRAINING data, NEVER on test data
    # Test data must represent real-world distribution
    print("\n Applying SMOTE to balance training set...")
    print(f"   Before — Normal: {(y_train==0).sum():,}, Fraud: {y_train.sum():,}")

    smote = SMOTE(random_state=42, k_neighbors=5)
    X_train_balanced, y_train_balanced = smote.fit_resample(X_train, y_train)

    print(f"   After  — Normal: {(y_train_balanced==0).sum():,}, Fraud: {y_train_balanced.sum():,}")
    print(f"   ✅ Classes balanced!")

    feature_names = X.columns.tolist()
    return X_train_balanced, X_test, y_train_balanced, y_test, scaler, feature_names


# ═══════════════════════════════════════════════════════════
# STEP 3 — TRAIN MODELS
# ═══════════════════════════════════════════════════════════
def train_logistic_regression(X_train, y_train):
    """
    Model 1: Logistic Regression

    HOW IT WORKS:
    Draws one "decision line" in high-dimensional space.
    For each transaction: score = V1*w1 + V2*w2 + ... + Amount*w29
    Then: probability = sigmoid(score) = 1 / (1 + e^(-score))

    ANALOGY: Like a rule — "if suspicious score > threshold → fraud"
    Simple but misses complex patterns.
    """
    print("\n Training Logistic Regression...")
    model = LogisticRegression(
        max_iter=1000,    # Max iterations for optimization
        random_state=42,  # For reproducibility
        n_jobs=-1,        # Use all CPU cores
        C=1.0             # Regularization strength (prevent overfitting)
    )
    model.fit(X_train, y_train)
    print("   ✅ Logistic Regression trained")
    return model


def train_random_forest(X_train, y_train):
    """
    Model 2: Random Forest (Our Champion)

    HOW IT WORKS:
    Builds 100 independent Decision Trees.
    Each tree sees:
      - Random subset of training rows (bootstrap sampling)
      - Random subset of features at each split
    Final prediction = majority vote of all 100 trees.

    ANALOGY: Ask 100 different fraud investigators to independently
    analyze the same transaction. If 70+ say fraud → flag it.
    Much harder to fool than one investigator!

    WHY IT'S BETTER:
    - Captures non-linear patterns (fraud doesn't follow simple rules)
    - Robust to outliers
    - Built-in feature importance ranking
    - Ensemble reduces overfitting (no single tree dominates)
    """
    print("\n Training Random Forest (100 trees, may take 2-5 minutes)...")
    model = RandomForestClassifier(
        n_estimators=100,     # Number of trees (more = better but slower)
        max_depth=15,         # Max depth per tree (prevents overfitting)
        min_samples_split=10, # Minimum samples to split a node
        min_samples_leaf=5,   # Minimum samples in leaf node
        random_state=42,      # For reproducibility
        n_jobs=-1,            # Use all CPU cores for parallel training
        class_weight='balanced',  # Extra weight on fraud class
        verbose=0
    )
    model.fit(X_train, y_train)
    print("   ✅ Random Forest trained!")
    return model


# ═══════════════════════════════════════════════════════════
# STEP 4 — EVALUATE MODELS
# ═══════════════════════════════════════════════════════════
def evaluate(model, X_test, y_test, model_name):
    """
    Tests the model on data it has NEVER seen (test set).
    Reports all key metrics.

    WHY THESE METRICS (not accuracy):
    - If model always says "not fraud": accuracy = 99.83%!
    - But it catches 0 frauds — useless!

    PRECISION = Of all I said "fraud", how many were really fraud?
    RECALL    = Of all real frauds, how many did I catch?
    F1-SCORE  = Balance of Precision and Recall
    ROC-AUC   = How well model ranks fraud vs normal (1.0 = perfect)

    In fraud detection: HIGH RECALL is more important
    (missing a fraud is worse than blocking a legit transaction)
    """
    print(f"\n" + "─"*50)
    print(f"  Results: {model_name}")
    print("─"*50)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]  # Probability of class 1 (fraud)

    prec = precision_score(y_test, y_pred)
    rec  = recall_score(y_test, y_pred)
    f1   = f1_score(y_test, y_pred)
    auc  = roc_auc_score(y_test, y_prob)

    print(f"  Precision : {prec*100:.2f}%  (of flagged fraud, how many real?)")
    print(f"  Recall    : {rec*100:.2f}%  (of real fraud, how many caught?)")
    print(f"  F1-Score  : {f1*100:.2f}%  (balance of above two)")
    print(f"  ROC-AUC   : {auc:.4f}  (1.0 = perfect ranking)")
    print()
    print(classification_report(y_test, y_pred, target_names=['Normal', 'Fraud']))

    return {
        'name':      model_name,
        'precision': round(prec, 4),
        'recall':    round(rec, 4),
        'f1':        round(f1, 4),
        'auc':       round(auc, 4)
    }


# ═══════════════════════════════════════════════════════════
# STEP 5 — SAVE MODEL
# ═══════════════════════════════════════════════════════════
def save_artifacts(model, scaler, feature_names, metrics_list):
    """
    Saves trained model to disk using joblib.

    joblib is better than Python's pickle for NumPy arrays
    (used inside scikit-learn models).

    FILES SAVED:
    - fraud_model.pkl    : The trained Random Forest model
    - scaler.pkl         : The StandardScaler (needed for new predictions)
    - feature_names.pkl  : Column order (must match when predicting)
    - metrics.json       : Performance comparison for dashboard
    """
    print("\n" + "="*55)
    print("  STEP 5: Saving Model Artifacts")
    print("="*55)

    os.makedirs(MODEL_DIR, exist_ok=True)

    joblib.dump(model,        os.path.join(MODEL_DIR, 'fraud_model.pkl'))
    joblib.dump(scaler,       os.path.join(MODEL_DIR, 'scaler.pkl'))
    joblib.dump(feature_names,os.path.join(MODEL_DIR, 'feature_names.pkl'))

    with open(os.path.join(MODEL_DIR, 'metrics.json'), 'w') as f:
        json.dump(metrics_list, f, indent=2)

    print(f"\n✅ Saved to: {MODEL_DIR}/")
    print("   fraud_model.pkl    — trained Random Forest")
    print("   scaler.pkl         — Amount scaler")
    print("   feature_names.pkl  — feature column order")
    print("   metrics.json       — performance metrics")


# ═══════════════════════════════════════════════════════════
# MAIN — Run Everything
# ═══════════════════════════════════════════════════════════
if __name__ == '__main__':
    print("\n" + "🔵"*28)
    print("  FraudShield AI — Model Training Pipeline")
    print("🔵"*28)

    # Run pipeline
    df = load_data()
    X_train, X_test, y_train, y_test, scaler, feature_names = preprocess(df)

    # Train both models
    lr_model = train_logistic_regression(X_train, y_train)
    rf_model = train_random_forest(X_train, y_train)

    # Evaluate
    print("\n" + "="*55)
    print("  STEP 4: Evaluation (on unseen test data)")
    print("="*55)
    lr_metrics = evaluate(lr_model, X_test, y_test, 'Logistic Regression')
    rf_metrics = evaluate(rf_model, X_test, y_test, 'Random Forest')

    # Choose winner
    best_model  = rf_model if rf_metrics['f1'] >= lr_metrics['f1'] else lr_model
    best_name   = rf_metrics['name'] if rf_metrics['f1'] >= lr_metrics['f1'] else lr_metrics['name']

    print("\n" + "="*55)
    print(f"  🏆 Best Model: {best_name}")
    print("="*55)
    print(f"  ROC-AUC: {rf_metrics['auc']:.4f} vs {lr_metrics['auc']:.4f}")
    print("  Reason:  Random Forest captures non-linear fraud patterns")
    print("           and uses ensemble voting for robustness.")

    # Print top feature importances
    if hasattr(best_model, 'feature_importances_'):
        importances = best_model.feature_importances_
        top_idx = importances.argsort()[-5:][::-1]
        print("\n  Top 5 Most Important Features:")
        for i in top_idx:
            print(f"    {feature_names[i]:20s} {importances[i]*100:.2f}%")

    # Save
    save_artifacts(best_model, scaler, feature_names, [lr_metrics, rf_metrics])

    print("\n✅ Training Complete!")
    print("   Next step: python backend/app.py")
    print("   Then open: http://localhost:5000\n")
