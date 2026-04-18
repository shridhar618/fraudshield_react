import { useState } from 'react';
import { simulateMLPrediction, FRAUD_SAMPLE, NORMAL_SAMPLE } from '../utils/mlUtils.js';
import './Analyzer.css';

export default function Analyzer() {
    const [formData, setFormData] = useState({
        Amount: '',
        V1: '', V2: '', V3: '', V4: '', V5: '', V6: '', V7: '', V8: '',
        V9: '', V10: '', V11: '', V12: '', V13: '', V14: '', V15: '', V16: '',
        V17: '', V18: '', V19: '', V20: '', V21: '', V22: '', V23: '', V24: '',
        V25: '', V26: '', V27: '', V28: ''
    });

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Convert string values to numbers
        const data = {};
        Object.keys(formData).forEach(key => {
            data[key] = parseFloat(formData[key]) || 0;
        });

        // Simulate API call delay
        setTimeout(() => {
            const prediction = simulateMLPrediction(data);
            setResult(prediction);
            setLoading(false);
        }, 1000);
    };

    const loadSample = (sample) => {
        setFormData(sample);
        setResult(null);
    };

    return (
        <div className="analyzer">
            <div className="analyzer-header">
                <h2>Transaction Fraud Analyzer</h2>
                <p>Enter transaction details to analyze for potential fraud</p>
            </div>

            <div className="analyzer-content">
                <form onSubmit={handleSubmit} className="analyzer-form">
                    <div className="form-group">
                        <label htmlFor="Amount">Amount ($)</label>
                        <input
                            type="number"
                            id="Amount"
                            name="Amount"
                            value={formData.Amount}
                            onChange={handleInputChange}
                            step="0.01"
                            required
                        />
                    </div>

                    <div className="v-features-grid">
                        {Array.from({ length: 28 }, (_, i) => (
                            <div key={`V${i + 1}`} className="form-group">
                                <label htmlFor={`V${i + 1}`}>V{i + 1}</label>
                                <input
                                    type="number"
                                    id={`V${i + 1}`}
                                    name={`V${i + 1}`}
                                    value={formData[`V${i + 1}`]}
                                    onChange={handleInputChange}
                                    step="0.0001"
                                    required
                                />
                            </div>
                        ))}
                    </div>

                    <div className="form-actions">
                        <button type="submit" disabled={loading} className="analyze-btn">
                            {loading ? 'Analyzing...' : 'Analyze Transaction'}
                        </button>
                        <div className="sample-buttons">
                            <button type="button" onClick={() => loadSample(FRAUD_SAMPLE)} className="sample-btn fraud">
                                Load Fraud Sample
                            </button>
                            <button type="button" onClick={() => loadSample(NORMAL_SAMPLE)} className="sample-btn normal">
                                Load Normal Sample
                            </button>
                        </div>
                    </div>
                </form>

                {result && (
                    <div className="results-panel">
                        <h3>Analysis Results</h3>
                        <div className="result-card" style={{ borderColor: result.risk_color }}>
                            <div className="result-header">
                                <span className="fraud-label" style={{ backgroundColor: result.risk_color }}>
                                    {result.fraud_label}
                                </span>
                                <span className="risk-level" style={{ color: result.risk_color }}>
                                    {result.risk_level}
                                </span>
                            </div>

                            <div className="result-metrics">
                                <div className="metric">
                                    <span className="metric-label">Fraud Probability</span>
                                    <span className="metric-value">{(result.probability * 100).toFixed(2)}%</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Risk Score</span>
                                    <span className="metric-value">{result.risk_score}</span>
                                </div>
                            </div>

                            <div className="top-features">
                                <h4>Top Contributing Features</h4>
                                <ul>
                                    {result.top_features.map((feature, idx) => (
                                        <li key={idx}>
                                            <span className="feature-name">{feature.name}</span>
                                            <span className="feature-weight">{feature.weighted.toFixed(4)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}