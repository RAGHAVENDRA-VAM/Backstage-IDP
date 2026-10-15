import React, { useState } from 'react';
import './FormPage.css';
import './Contact.css';

const contactInfo = [
  { icon: '📞', title: 'Call Us', detail: '1-800-SHIELD-1', sub: 'Mon–Fri, 8am–8pm EST' },
  { icon: '📧', title: 'Email Us', detail: 'support@shieldsure.com', sub: 'Response within 24 hours' },
  { icon: '💬', title: 'Live Chat', detail: 'Available 24/7', sub: 'Average wait: < 2 minutes' },
  { icon: '📍', title: 'Visit Us', detail: '123 Insurance Ave, NY 10001', sub: 'Mon–Fri, 9am–5pm' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.name && form.email && form.message;

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <h1>Get in Touch</h1>
        <p>Our team is here to help you with any questions about your coverage</p>
      </div>

      <div className="contact-layout">
        {/* Info Cards */}
        <div className="contact-info">
          {contactInfo.map(c => (
            <div key={c.title} className="info-card">
              <div className="info-icon">{c.icon}</div>
              <div>
                <div className="info-title">{c.title}</div>
                <div className="info-detail">{c.detail}</div>
                <div className="info-sub">{c.sub}</div>
              </div>
            </div>
          ))}

          <div className="faq-box">
            <h3>Frequently Asked</h3>
            {[
              'How do I file a claim?',
              'Can I change my coverage?',
              'How do I add a beneficiary?',
              'What is my deductible?',
            ].map(q => (
              <div key={q} className="faq-item">
                <span>→</span> {q}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="form-container" style={{ maxWidth: '100%' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📬</div>
              <h2 style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>Message Sent!</h2>
              <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
                Thanks, <strong>{form.name}</strong>! We'll get back to you at <strong>{form.email}</strong> within 24 hours.
              </p>
              <button className="btn-submit" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>
                Send Another Message
              </button>
            </div>
          ) : (
            <>
              <div className="form-header">
                <h1>Send a Message</h1>
                <p>Fill out the form and we'll respond promptly</p>
              </div>
              <div className="form-grid">
                <div className="field">
                  <label>Full Name</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Doe" />
                </div>
                <div className="field">
                  <label>Email Address</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@example.com" />
                </div>
                <div className="field full">
                  <label>Subject</label>
                  <select value={form.subject} onChange={e => set('subject', e.target.value)}>
                    <option value="">-- Select a topic --</option>
                    <option>Policy Inquiry</option>
                    <option>Claim Status</option>
                    <option>Billing Question</option>
                    <option>Coverage Change</option>
                    <option>General Question</option>
                  </select>
                </div>
                <div className="field full">
                  <label>Message</label>
                  <textarea
                    value={form.message}
                    onChange={e => set('message', e.target.value)}
                    placeholder="How can we help you today?"
                    rows={5}
                  />
                </div>
              </div>
              <button className="btn-submit" disabled={!valid} onClick={() => setSubmitted(true)}>
                Send Message
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
