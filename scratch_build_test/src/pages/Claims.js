import React, { useState } from 'react';
import './FormPage.css';
import './Claims.css';

const claimHistory = [
  { id: 'CLM-2024-001', type: 'Auto', date: 'Oct 12, 2024', amount: '$3,200', status: 'Approved', icon: '🚗' },
  { id: 'CLM-2023-087', type: 'Home', date: 'Aug 5, 2023', amount: '$8,750', status: 'Settled', icon: '🏠' },
  { id: 'CLM-2023-044', type: 'Health', date: 'Apr 20, 2023', amount: '$1,100', status: 'Processing', icon: '🏥' },
  { id: 'CLM-2022-112', type: 'Auto', date: 'Nov 3, 2022', amount: '$950', status: 'Rejected', icon: '🚗' },
];

const statusColor = { Approved: '#059669', Settled: '#2563eb', Processing: '#d97706', Rejected: '#ef4444' };

export default function Claims() {
  const [form, setForm] = useState({ policy: '', incident: '', date: '', description: '', amount: '' });
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.policy && form.incident && form.date && form.description;

  return (
    <div className="claims-page">
      <div className="claims-layout">
        {/* File Claim */}
        <div className="form-container" style={{ maxWidth: '100%' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <h2 style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>Claim Submitted!</h2>
              <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
                Your claim <strong>CLM-2024-{Math.floor(Math.random() * 900 + 100)}</strong> has been filed.<br />
                Our team will review it within 2–3 business days.
              </p>
              <button className="btn-submit" onClick={() => { setSubmitted(false); setForm({ policy: '', incident: '', date: '', description: '', amount: '' }); }}>
                File Another Claim
              </button>
            </div>
          ) : (
            <>
              <div className="form-header">
                <h1>File a Claim</h1>
                <p>Submit your claim quickly and track it in real time</p>
              </div>
              <div className="form-grid">
                <div className="field full">
                  <label>Select Policy</label>
                  <select value={form.policy} onChange={e => set('policy', e.target.value)}>
                    <option value="">-- Choose a policy --</option>
                    <option value="SS-2024-8821">SS-2024-8821 — Auto Insurance</option>
                    <option value="SS-2023-4412">SS-2023-4412 — Home Insurance</option>
                    <option value="SS-2022-1190">SS-2022-1190 — Life Insurance</option>
                  </select>
                </div>
                <div className="field">
                  <label>Incident Type</label>
                  <select value={form.incident} onChange={e => set('incident', e.target.value)}>
                    <option value="">-- Select type --</option>
                    <option>Accident / Collision</option>
                    <option>Theft / Burglary</option>
                    <option>Natural Disaster</option>
                    <option>Fire Damage</option>
                    <option>Medical Emergency</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="field">
                  <label>Incident Date</label>
                  <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
                </div>
                <div className="field">
                  <label>Estimated Loss Amount ($)</label>
                  <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="e.g. 5000" />
                </div>
                <div className="field full">
                  <label>Description of Incident</label>
                  <textarea
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="Describe what happened in detail..."
                    rows={4}
                  />
                </div>
              </div>
              <button className="btn-submit" disabled={!valid} onClick={() => setSubmitted(true)}>
                Submit Claim
              </button>
            </>
          )}
        </div>

        {/* Claim History */}
        <div className="claim-history">
          <h2>Claim History</h2>
          <div className="claim-list">
            {claimHistory.map(c => (
              <div key={c.id} className="claim-item">
                <div className="claim-icon">{c.icon}</div>
                <div className="claim-info">
                  <div className="claim-id">{c.id}</div>
                  <div className="claim-meta">{c.type} · {c.date}</div>
                </div>
                <div className="claim-right">
                  <div className="claim-amount">{c.amount}</div>
                  <span className="claim-status" style={{ color: statusColor[c.status], background: statusColor[c.status] + '18' }}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
