import { useState, useEffect } from 'react';
import './Dashboard.css';

export default function Dashboard() {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading metrics (in real app, this would fetch from backend)
        setTimeout(() => {
            setMetrics([
                {
                    name: 'Logistic Regression',
                    precision: 0.8920,
                    recall: 0.9286,
                    f1: 0.9100,
                    auc: 0.9780
                },
                {
                    name: 'Random Forest',
                    precision: 0.9630,
                    recall: 0.8724,
                    f1: 0.9155,
                    auc: 0.9997
                }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    if (loading) {
        return (
            <div className="dashboard">
                <div className="dashboard-header">
                    <h2>Model Performance Dashboard</h2>
                    <p>Loading metrics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h2>Model Performance Dashboard</h2>
                <p>Comparison of fraud detection models trained on credit card transaction data</p>
            </div>

            <div className="metrics-grid">
                {metrics.map((model, idx) => (
                    <div key={idx} className={`metric-card ${model.name === 'Random Forest' ? 'winner' : ''}`}>
                        <h3>{model.name}</h3>
                        <div className="metric-bars">
                            <div className="metric-bar">
                                <div className="metric-label">Precision</div>
                                <div className="bar-container">
                                    <div
                                        className="bar precision"
                                        style={{ width: `${model.precision * 100}%` }}
                                    >
                                        {(model.precision * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>

                            <div className="metric-bar">
                                <div className="metric-label">Recall</div>
                                <div className="bar-container">
                                    <div
                                        className="bar recall"
                                        style={{ width: `${model.recall * 100}%` }}
                                    >
                                        {(model.recall * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>

                            <div className="metric-bar">
                                <div className="metric-label">F1-Score</div>
                                <div className="bar-container">
                                    <div
                                        className="bar f1"
                                        style={{ width: `${model.f1 * 100}%` }}
                                    >
                                        {(model.f1 * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>

                            <div className="metric-bar">
                                <div className="metric-label">ROC-AUC</div>
                                <div className="bar-container">
                                    <div
                                        className="bar auc"
                                        style={{ width: `${model.auc * 100}%` }}
                                    >
                                        {model.auc.toFixed(4)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {model.name === 'Random Forest' && (
                            <div className="winner-badge">🏆 Best Model</div>
                        )}
                    </div>
                ))}
            </div>

            <div className="dataset-info">
                <h3>Dataset Information</h3>
                <div className="info-grid">
                    <div className="info-card">
                        <div className="info-number">284,807</div>
                        <div className="info-label">Total Transactions</div>
                    </div>
                    <div className="info-card">
                        <div className="info-number">492</div>
                        <div className="info-label">Fraud Cases</div>
                    </div>
                    <div className="info-card">
                        <div className="info-number">0.172%</div>
                        <div className="info-label">Fraud Rate</div>
                    </div>
                    <div className="info-card">
                        <div className="info-number">29</div>
                        <div className="info-label">Features</div>
                    </div>
                </div>
            </div>
        </div>
    );
}