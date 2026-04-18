import './NavBar.css';

export default function NavBar({ tab, setTab }) {
    const tabs = ['Analyzer', 'Dashboard', 'Learn', 'Use Cases'];

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <h1>🛡️ FraudShield AI</h1>
                <p>Credit Card Fraud Detection</p>
            </div>
            <div className="navbar-tabs">
                {tabs.map(t => (
                    <button
                        key={t}
                        className={tab === t ? 'active' : ''}
                        onClick={() => setTab(t)}
                    >
                        {t}
                    </button>
                ))}
            </div>
        </nav>
    );
}