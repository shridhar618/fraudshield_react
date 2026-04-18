import './Learn.css';

export default function Learn() {
    const concepts = [
        {
            title: 'What is Credit Card Fraud?',
            content: 'Credit card fraud occurs when someone uses another person\'s credit card or account information to make unauthorized purchases or withdraw funds. Common types include stolen cards, skimming, phishing, and account takeover.'
        },
        {
            title: 'How Machine Learning Detects Fraud',
            content: 'ML models analyze transaction patterns using features like amount, location, time, and merchant type. They learn from historical data to identify anomalies that might indicate fraudulent activity.'
        },
        {
            title: 'Random Forest Algorithm',
            content: 'Random Forest is an ensemble learning method that builds multiple decision trees and combines their predictions. It\'s effective for fraud detection because it handles complex, non-linear relationships and is robust against overfitting.'
        },
        {
            title: 'Feature Engineering',
            content: 'The V1-V28 features are PCA-transformed variables that protect sensitive customer data while preserving fraud detection capabilities. Amount is kept raw and scaled during preprocessing.'
        },
        {
            title: 'Model Evaluation Metrics',
            content: 'Precision measures accuracy of fraud predictions. Recall measures how many real frauds are caught. F1-Score balances both. ROC-AUC measures overall model performance across all thresholds.'
        },
        {
            title: 'Class Imbalance Problem',
            content: 'Fraud is rare (0.17% of transactions), so models must be trained carefully. SMOTE (Synthetic Minority Oversampling Technique) creates synthetic fraud samples to balance the dataset.'
        }
    ];

    const steps = [
        {
            step: 1,
            title: 'Data Collection',
            description: 'Gather transaction data with fraud labels from credit card companies.'
        },
        {
            step: 2,
            title: 'Preprocessing',
            description: 'Clean data, handle missing values, scale features, and apply SMOTE for balance.'
        },
        {
            step: 3,
            title: 'Feature Selection',
            description: 'Use PCA-transformed features (V1-V28) to protect privacy while maintaining predictive power.'
        },
        {
            step: 4,
            title: 'Model Training',
            description: 'Train multiple algorithms (Logistic Regression, Random Forest) and compare performance.'
        },
        {
            step: 5,
            title: 'Evaluation',
            description: 'Test models on unseen data using precision, recall, F1-score, and ROC-AUC metrics.'
        },
        {
            step: 6,
            title: 'Deployment',
            description: 'Deploy best model to production for real-time fraud detection.'
        }
    ];

    return (
        <div className="learn">
            <div className="learn-header">
                <h2>Learn About Fraud Detection</h2>
                <p>Understanding the concepts behind AI-powered credit card fraud detection</p>
            </div>

            <div className="learn-content">
                <section className="concepts-section">
                    <h3>Key Concepts</h3>
                    <div className="concepts-grid">
                        {concepts.map((concept, idx) => (
                            <div key={idx} className="concept-card">
                                <h4>{concept.title}</h4>
                                <p>{concept.content}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="process-section">
                    <h3>The ML Pipeline</h3>
                    <div className="process-steps">
                        {steps.map((step, idx) => (
                            <div key={idx} className="step-card">
                                <div className="step-number">{step.step}</div>
                                <div className="step-content">
                                    <h4>{step.title}</h4>
                                    <p>{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="code-section">
                    <h3>Sample Code</h3>
                    <div className="code-examples">
                        <div className="code-card">
                            <h4>Python: Model Training</h4>
                            <pre><code>{`from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Train Random Forest
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=15,
    random_state=42
)
model.fit(X_train, y_train)

# Predict
predictions = model.predict(X_test)
probabilities = model.predict_proba(X_test)[:, 1]`}</code></pre>
                        </div>

                        <div className="code-card">
                            <h4>JavaScript: Frontend Integration</h4>
                            <pre><code>{`// Simulate ML prediction
function simulateMLPrediction(data) {
  let score = 0;
  // Calculate anomaly score using feature weights
  Object.keys(data).forEach(key => {
    if (key !== 'Amount') {
      score += Math.abs(data[key]) * weights[key];
    }
  });

  // Apply sigmoid for probability
  const probability = 1 / (1 + Math.exp(-2.5 * (score - 1.8)));

  return {
    fraud_prediction: probability > 0.5 ? 1 : 0,
    probability: probability,
    risk_level: probability > 0.7 ? 'High Risk' : 'Low Risk'
  };
}`}</code></pre>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}