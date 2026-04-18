// ============================================================
//   FraudShield AI — React Frontend (App.jsx)
//   Entry point — mounts all tabs and routing
// ============================================================

import { useState } from 'react';
import NavBar    from './components/NavBar';
import Analyzer  from './components/Analyzer';
import Dashboard from './components/Dashboard';
import Learn     from './components/Learn';
import UseCases  from './components/UseCases';
import './App.css';

export default function App() {
  const [tab, setTab] = useState('Analyzer');

  return (
    <div className="app">
      <NavBar tab={tab} setTab={setTab} />
      <main className="main-content">
        {tab === 'Analyzer'   && <Analyzer />}
        {tab === 'Dashboard'  && <Dashboard />}
        {tab === 'Learn'      && <Learn />}
        {tab === 'Use Cases'  && <UseCases />}
      </main>
    </div>
  );
}
