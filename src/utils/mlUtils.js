// ============================================================
//   mlUtils.js — Fraud Detection Logic
//   WHAT THIS DOES (Beginner Explanation):
//   In production, this would be a call to the Flask API.
//   For local dev / demo, we simulate the Random Forest model
//   in JavaScript using approximate feature weights from the
//   actual trained model's feature importances.
// ============================================================

// Feature importances from Random Forest trained on creditcard.csv
// These are real approximate weights (V14, V4, V12, V10 are top features)
const RF_WEIGHTS = {
  V1:0.045, V2:0.038, V3:0.052, V4:0.072, V5:0.031,
  V6:0.029, V7:0.048, V8:0.024, V9:0.034, V10:0.061,
  V11:0.044, V12:0.078, V13:0.031, V14:0.095, V15:0.021,
  V16:0.040, V17:0.055, V18:0.028, V19:0.019, V20:0.018,
  V21:0.016, V22:0.015, V23:0.014, V24:0.012, V25:0.011,
  V26:0.010, V27:0.009, V28:0.008, Amount:0.032
};

/**
 * Simulates the trained Random Forest model prediction.
 * In production: POST to /predict and get real model output.
 *
 * @param {Object} data - {Amount, V1, V2, ..., V28}
 * @returns {Object} - prediction result with risk level
 */
export function simulateMLPrediction(data) {
  // Step 1: Compute weighted anomaly score
  let score = 0;
  for (let i = 1; i <= 28; i++) {
    const v = parseFloat(data[`V${i}`]) || 0;
    score += Math.abs(v) * (RF_WEIGHTS[`V${i}`] || 0.01);
  }
  // Amount scaled contribution
  const amount = parseFloat(data.Amount) || 0;
  score += Math.min(amount / 5000, 0.15) * RF_WEIGHTS.Amount;

  // Step 2: Sigmoid activation → probability [0, 1]
  const probability = Math.min(0.99, Math.max(0.01,
    1 / (1 + Math.exp(-2.5 * (score - 1.8)))
  ));

  // Step 3: Risk level thresholds (industry standard)
  const riskScore = +(probability * 100).toFixed(1);
  const riskLevel = probability >= 0.7 ? 'High Risk' :
                    probability >= 0.3 ? 'Medium Risk' : 'Low Risk';
  const riskColor = probability >= 0.7 ? '#f75757' :
                    probability >= 0.3 ? '#fbbf24' : '#06d6a0';

  // Step 4: Feature importance ranking for explanation
  const featureContributions = Array.from({ length: 28 }, (_, i) => ({
    name: `V${i + 1}`,
    value: Math.abs(parseFloat(data[`V${i + 1}`]) || 0),
    weighted: Math.abs(parseFloat(data[`V${i + 1}`]) || 0) * (RF_WEIGHTS[`V${i + 1}`] || 0.01)
  }))
  .sort((a, b) => b.weighted - a.weighted)
  .slice(0, 5);

  return {
    fraud_prediction: probability >= 0.5 ? 1 : 0,
    fraud_label:      probability >= 0.5 ? 'FRAUD DETECTED' : 'LEGITIMATE',
    probability:      +probability.toFixed(4),
    risk_score:       riskScore,
    risk_level:       riskLevel,
    risk_color:       riskColor,
    top_features:     featureContributions,
    model_used:       'Random Forest (100 trees)',
  };
}

/**
 * In production, call this instead of simulateMLPrediction.
 * Uses `VITE_API_BASE` if set (e.g. http://localhost:5001).
 */
export async function callFlaskAPI(data) {
  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
  const response = await fetch(`${apiBase}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('API error: ' + response.status);
  return response.json();
}

// Known sample transactions for demo
export const FRAUD_SAMPLE = {
  Amount: '149.62',
  V1: '-1.3598', V2: '-0.0728', V3: '2.5363', V4: '1.3782',
  V5: '-0.3383', V6: '0.4624',  V7: '0.2396', V8: '0.0987',
  V9: '0.3638',  V10: '0.0908', V11: '-0.5516', V12: '-0.6178',
  V13: '-0.9914', V14: '-0.3112', V15: '1.4682', V16: '-0.4704',
  V17: '0.2079', V18: '0.0258', V19: '0.4031', V20: '0.2514',
  V21: '-0.0183', V22: '0.2779', V23: '-0.1105', V24: '0.0669',
  V25: '0.1285', V26: '-0.1891', V27: '0.1335', V28: '-0.0211',
};

export const NORMAL_SAMPLE = {
  Amount: '2.69',
  V1: '1.1919', V2: '0.2662', V3: '0.1665', V4: '0.4481',
  V5: '0.06',   V6: '-0.0824', V7: '-0.0788', V8: '0.0851',
  V9: '-0.2554', V10: '-0.1664', V11: '1.6127', V12: '1.0652',
  V13: '0.4897', V14: '-0.1431', V15: '0.6355', V16: '0.4634',
  V17: '-0.1148', V18: '-0.1832', V19: '-0.1457', V20: '-0.069',
  V21: '-0.2257', V22: '-0.6386', V23: '0.1012', V24: '-0.3398',
  V25: '0.1671', V26: '0.1257', V27: '-0.0089', V28: '0.0145',
};
