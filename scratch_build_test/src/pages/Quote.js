import React, { useState } from 'react';
import './FormPage.css';

const insuranceTypes = [
  { id: 'auto', icon: '🚗', label: 'Auto' },
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'life', icon: '❤️', label: 'Life' },
  { id: 'health', icon: '🏥', label: 'Health' },
  { id: 'business', icon: '💼', label: 'Business' },
  { id: 'travel', icon: '✈️', label: 'Travel' },
];

const initialForm = {
  type: '',
  firstName: '', lastName: '', email: '', phone: '', dob: '',
  address: '', city: '', state: '', zip: '',
  coverageAmount: '100000', deductible: '500',
};

export default function Quote() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const quote = form.coverageAmount
    ? `$${(parseInt(form.coverageAmount) * 0.00089).toFixed(0)}/mo`
    : '--';

  if (submitted) {
    return (
      <div className="form-page">
        <div className="success-box">
          <div className="success-icon">✅</div>
          <h2>Quote Request Submitted!</h2>
          <p>Your estimated premium is <strong style={{ color: 'var(--primary-light)', fontSize: '1.3rem' }}>{quote}</strong></p>
          <p>We'll send a detailed quote to <strong>{form.email}</strong> within 24 hours.</p>
          <button className="btn-submit" onClick={() => { setSubmitted(false); setStep(1); setForm(initialForm); }}>
            Get Another Quote
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-container">
        <div className="form-header">
          <h1>Get Your Free Quote</h1>
          <p>Takes less than 2 minutes — no commitment required</p>
        </div>

        {/* Progress */}
        <div className="progress-bar">
          {[1, 2, 3].map(s => (
            <React.Fragment key={s}>
              <div className={`step-dot ${step >= s ? 'active' : ''} ${step > s ? 'done' : ''}`}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && <div className={`step-line ${step > s ? 'active' : ''}`} />}
            </React.Fragment>
          ))}
        </div>
        <div className="step-labels">
          <span>Coverage Type</span><span>Personal Info</span><span>Coverage Details</span>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="form-step">
            <h3>What would you like to insure?</h3>
            <div className="type-grid">
              {insuranceTypes.map(t => (
                <button
                  key={t.id}
                  className={`type-btn ${form.type === t.id ? 'selected' : ''}`}
                  onClick={() => set('type', t.id)}
                >
                  <span className="type-icon">{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
            <button className="btn-submit" disabled={!form.type} onClick={() => setStep(2)}>
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="form-step">
            <h3>Personal Information</h3>
            <div className="form-grid">
              <div className="field">
                <label>First Name</label>
                <input value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="John" />
              </div>
              <div className="field">
                <label>Last Name</label>
                <input value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Doe" />
              </div>
              <div className="field">
                <label>Email Address</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@example.com" />
              </div>
              <div className="field">
                <label>Phone Number</label>
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(555) 000-0000" />
              </div>
              <div className="field">
                <label>Date of Birth</label>
                <input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} />
              </div>
              <div className="field">
                <label>ZIP Code</label>
                <input value={form.zip} onChange={e => set('zip', e.target.value)} placeholder="10001" />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-back" onClick={() => setStep(1)}>← Back</button>
              <button
                className="btn-submit"
                disabled={!form.firstName || !form.email}
                onClick={() => setStep(3)}
              >Continue →</button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="form-step">
            <h3>Coverage Details</h3>
            <div className="form-grid">
              <div className="field full">
                <label>Coverage Amount: <strong style={{ color: 'var(--primary-light)' }}>${parseInt(form.coverageAmount).toLocaleString()}</strong></label>
                <input
                  type="range" min="50000" max="2000000" step="50000"
                  value={form.coverageAmount}
                  onChange={e => set('coverageAmount', e.target.value)}
                  className="range-input"
                />
                <div className="range-labels"><span>$50K</span><span>$2M</span></div>
              </div>
              <div className="field full">
                <label>Deductible: <strong style={{ color: 'var(--primary-light)' }}>${parseInt(form.deductible).toLocaleString()}</strong></label>
                <input
                  type="range" min="250" max="5000" step="250"
                  value={form.deductible}
                  onChange={e => set('deductible', e.target.value)}
                  className="range-input"
                />
                <div className="range-labels"><span>$250</span><span>$5,000</span></div>
              </div>
            </div>

            <div className="quote-preview">
              <div className="qp-label">Estimated Monthly Premium</div>
              <div className="qp-value">{quote}</div>
              <div className="qp-note">Final quote may vary based on full assessment</div>
            </div>

            <div className="form-actions">
              <button className="btn-back" onClick={() => setStep(2)}>← Back</button>
              <button className="btn-submit" onClick={() => setSubmitted(true)}>Submit Quote Request</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
