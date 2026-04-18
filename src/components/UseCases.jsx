import './UseCases.css';

export default function UseCases() {
    const useCases = [
        {
            title: 'Real-time Transaction Monitoring',
            description: 'Banks and payment processors use fraud detection models to analyze transactions in real-time, flagging suspicious activity before it causes significant losses.',
            icon: '⚡',
            benefits: ['Instant detection', 'Reduced chargebacks', 'Improved customer trust']
        },
        {
            title: 'E-commerce Fraud Prevention',
            description: 'Online retailers implement fraud detection to protect against stolen card usage, fake accounts, and organized fraud rings targeting high-value purchases.',
            icon: '🛒',
            benefits: ['Safer online shopping', 'Lower fraud losses', 'Better conversion rates']
        },
        {
            title: 'Mobile Payment Security',
            description: 'Mobile wallet and payment apps use AI to detect unusual patterns in location, device, and transaction behavior for contactless payments.',
            icon: '📱',
            benefits: ['Secure mobile payments', 'Location-based verification', 'Device fingerprinting']
        },
        {
            title: 'ATM and Point-of-Sale Protection',
            description: 'Physical terminals and ATMs use fraud detection to identify skimming devices and unusual withdrawal patterns.',
            icon: '🏦',
            benefits: ['ATM fraud prevention', 'Skimming detection', 'Cash withdrawal security']
        },
        {
            title: 'Insurance Claim Analysis',
            description: 'Insurance companies apply similar techniques to detect fraudulent claims by analyzing patterns in claim amounts, frequencies, and supporting documentation.',
            icon: '📋',
            benefits: ['Fraudulent claim detection', 'Reduced payout losses', 'Faster legitimate claims']
        },
        {
            title: 'Cryptocurrency Transaction Monitoring',
            description: 'Crypto exchanges use ML models to detect money laundering, scam transactions, and unusual trading patterns in blockchain data.',
            icon: '₿',
            benefits: ['Blockchain analysis', 'AML compliance', 'Crypto fraud prevention']
        }
    ];

    const challenges = [
        {
            challenge: 'Class Imbalance',
            solution: 'SMOTE and other oversampling techniques balance the dataset by creating synthetic fraud examples.'
        },
        {
            challenge: 'Feature Privacy',
            solution: 'PCA transformation (V1-V28) preserves fraud detection while protecting sensitive customer data.'
        },
        {
            challenge: 'Real-time Processing',
            solution: 'Optimized models and feature engineering enable millisecond-level prediction times.'
        },
        {
            challenge: 'Concept Drift',
            solution: 'Continuous model retraining with new data adapts to evolving fraud patterns.'
        },
        {
            challenge: 'False Positives',
            solution: 'Risk scoring and multi-threshold approaches balance security with user experience.'
        },
        {
            challenge: 'Regulatory Compliance',
            solution: 'Transparent models with explainable predictions meet financial regulation requirements.'
        }
    ];

    return (
        <div className="usecases">
            <div className="usecases-header">
                <h2>Real-World Applications</h2>
                <p>How AI fraud detection is transforming industries</p>
            </div>

            <div className="usecases-content">
                <section className="applications-section">
                    <h3>Industry Applications</h3>
                    <div className="applications-grid">
                        {useCases.map((useCase, idx) => (
                            <div key={idx} className="application-card">
                                <div className="card-header">
                                    <span className="card-icon">{useCase.icon}</span>
                                    <h4>{useCase.title}</h4>
                                </div>
                                <p className="card-description">{useCase.description}</p>
                                <ul className="benefits-list">
                                    {useCase.benefits.map((benefit, bidx) => (
                                        <li key={bidx}>{benefit}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="challenges-section">
                    <h3>Technical Challenges & Solutions</h3>
                    <div className="challenges-grid">
                        {challenges.map((item, idx) => (
                            <div key={idx} className="challenge-card">
                                <div className="challenge-header">
                                    <h4>{item.challenge}</h4>
                                </div>
                                <p className="solution">{item.solution}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="impact-section">
                    <h3>Industry Impact</h3>
                    <div className="impact-stats">
                        <div className="stat-card">
                            <div className="stat-number">$32B</div>
                            <div className="stat-label">Annual Fraud Losses Prevented</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">85%</div>
                            <div className="stat-label">Fraud Detection Accuracy</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">&lt; 1ms</div>
                            <div className="stat-label">Prediction Time</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">24/7</div>
                            <div className="stat-label">Continuous Monitoring</div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}