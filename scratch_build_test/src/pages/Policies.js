import React, { useState } from 'react';
import './Policies.css';

const policies = [
  {
    id: 'SS-2024-8821', type: 'Auto Insurance', icon: '🚗', status: 'Active',
    coverage: '$500,000', premium: '$89/mo', deductible: '$500',
    start: 'Jan 1, 2024', end: 'Dec 31, 2025', progress: 72,
    color: '#2563eb',
  },
  {
    id: 'SS-2023-4412', type: 'Home Insurance', icon: '🏠', status: 'Active',
    coverage: '$850,000', premium: '$142/mo', deductible: '$1,000',
    start: 'Mar 15, 2023', end: 'Mar 14, 2026', progress: 55,
    color: '#7c3aed',
  },
  {
    id: 'SS-2022-1190', type: 'Life Insurance', icon: '❤️', status: 'Active',
    coverage: '$1,000,000', premium: '$65/mo', deductible: 'N/A',
    start: 'Jun 1, 2022', end: 'Jun 1, 2042', progress: 10,
    color: '#db2777',
  },
  {
    id: 'SS-2021-0033', type: 'Health Insurance', icon: '🏥', status: 'Expired',
    coverage: '$200,000', premium: '$210/mo', deductible: '$2,500',
    start: 'Jan 1, 2021', end: 'Dec 31, 2023', progress: 100,
    color: '#059669',
  },
];

export default function Policies() {
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const filtered = filter === 'All' ? policies : policies.filter(p => p.status === filter);

  return (
    <div className="policies-page">
      <div className="policies-header">
        <div>
          <h1>My Policies</h1>
          <p>Manage and track all your insurance policies</p>
        </div>
        <div className="filter-tabs">
          {['All', 'Active', 'Expired'].map(f => (
            <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="policies-grid">
        {filtered.map(p => (
          <div key={p.id} className="policy-card" onClick={() => setSelected(p)}>
            <div className="pc-top">
              <div className="pc-icon" style={{ background: p.color + '18', color: p.color }}>{p.icon}</div>
              <span className={`status-badge ${p.status.toLowerCase()}`}>{p.status}</span>
            </div>
            <h3>{p.type}</h3>
            <div className="pc-id">Policy # {p.id}</div>
            <div className="pc-details">
              <div className="pc-detail"><span>Coverage</span><strong>{p.coverage}</strong></div>
              <div className="pc-detail"><span>Premium</span><strong>{p.premium}</strong></div>
              <div className="pc-detail"><span>Deductible</span><strong>{p.deductible}</strong></div>
              <div className="pc-detail"><span>Expires</span><strong>{p.end}</strong></div>
            </div>
            <div className="pc-progress-label">
              <span>Policy Term</span><span>{p.progress}%</span>
            </div>
            <div className="pc-progress-bar">
              <div className="pc-progress-fill" style={{ width: `${p.progress}%`, background: p.color }} />
            </div>
            <button className="btn-view">View Details →</button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            <div className="modal-icon" style={{ background: selected.color + '18', color: selected.color }}>
              {selected.icon}
            </div>
            <h2>{selected.type}</h2>
            <div className="modal-id">Policy # {selected.id}</div>
            <span className={`status-badge ${selected.status.toLowerCase()}`}>{selected.status}</span>
            <div className="modal-grid">
              {[
                ['Coverage Amount', selected.coverage],
                ['Monthly Premium', selected.premium],
                ['Deductible', selected.deductible],
                ['Start Date', selected.start],
                ['End Date', selected.end],
                ['Policy Term Progress', `${selected.progress}%`],
              ].map(([k, v]) => (
                <div key={k} className="modal-row">
                  <span>{k}</span><strong>{v}</strong>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn-submit">Download Policy PDF</button>
              <button className="btn-back" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
