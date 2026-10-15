import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const products = [
  { icon: '🚗', title: 'Auto Insurance', desc: 'Comprehensive coverage for your vehicle against accidents, theft, and natural disasters.', color: '#2563eb' },
  { icon: '🏠', title: 'Home Insurance', desc: 'Protect your home and belongings with our flexible homeowner policies.', color: '#7c3aed' },
  { icon: '❤️', title: 'Life Insurance', desc: 'Secure your family\'s financial future with term and whole life plans.', color: '#db2777' },
  { icon: '🏥', title: 'Health Insurance', desc: 'Access quality healthcare with individual and family health plans.', color: '#059669' },
  { icon: '💼', title: 'Business Insurance', desc: 'Safeguard your business assets, employees, and operations.', color: '#d97706' },
  { icon: '✈️', title: 'Travel Insurance', desc: 'Travel worry-free with coverage for cancellations, medical, and baggage.', color: '#0891b2' },
];

const stats = [
  { value: '2M+', label: 'Happy Customers' },
  { value: '98%', label: 'Claims Settled' },
  { value: '24/7', label: 'Support Available' },
  { value: '50+', label: 'Years of Trust' },
];

const testimonials = [
  { name: 'Sarah M.', role: 'Auto Policy Holder', text: 'ShieldSure settled my claim within 48 hours. Absolutely seamless experience!', rating: 5 },
  { name: 'James R.', role: 'Home Policy Holder', text: 'Best rates I found after comparing 10 providers. Highly recommend their home plan.', rating: 5 },
  { name: 'Priya K.', role: 'Health Policy Holder', text: 'The app makes managing my policy so easy. Customer support is always responsive.', rating: 5 },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">Trusted Since 1974</div>
          <h1>Insurance That <span className="highlight">Protects</span> What Matters Most</h1>
          <p>Get instant quotes, manage policies, and file claims — all in one place. Simple, transparent, and built for you.</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate('/quote')}>Get Free Quote</button>
            <button className="btn-outline" onClick={() => navigate('/policies')}>View My Policies</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <div className="hc-header">
              <span>🛡️</span>
              <span>Active Policy</span>
            </div>
            <div className="hc-policy">Auto Insurance</div>
            <div className="hc-row"><span>Policy #</span><strong>SS-2024-8821</strong></div>
            <div className="hc-row"><span>Coverage</span><strong>$500,000</strong></div>
            <div className="hc-row"><span>Premium</span><strong>$89/mo</strong></div>
            <div className="hc-row"><span>Status</span><span className="badge-active">Active ✓</span></div>
            <div className="hc-bar"><div className="hc-fill" /></div>
            <div className="hc-exp">Renews: Dec 31, 2025</div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-bar">
        {stats.map(s => (
          <div key={s.label} className="stat-item">
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Products */}
      <section className="section">
        <div className="section-header">
          <h2>Our Insurance Products</h2>
          <p>Comprehensive coverage tailored to every stage of your life</p>
        </div>
        <div className="products-grid">
          {products.map(p => (
            <div key={p.title} className="product-card" onClick={() => navigate('/quote')}>
              <div className="product-icon" style={{ background: p.color + '18', color: p.color }}>{p.icon}</div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <span className="card-link" style={{ color: p.color }}>Get Quote →</span>
            </div>
          ))}
        </div>
      </section>

      {/* Why Us */}
      <section className="why-us">
        <div className="section-header">
          <h2>Why Choose ShieldSure?</h2>
          <p>We make insurance simple, affordable, and reliable</p>
        </div>
        <div className="why-grid">
          {[
            { icon: '⚡', title: 'Instant Quotes', desc: 'Get personalized quotes in under 2 minutes with no paperwork.' },
            { icon: '🔒', title: 'Secure & Trusted', desc: 'Bank-grade encryption protects your data and transactions.' },
            { icon: '📱', title: 'Manage Anywhere', desc: 'Access your policies, documents, and claims from any device.' },
            { icon: '🤝', title: 'Dedicated Support', desc: '24/7 expert support via chat, phone, or email — always here.' },
          ].map(w => (
            <div key={w.title} className="why-card">
              <div className="why-icon">{w.icon}</div>
              <h3>{w.title}</h3>
              <p>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="section-header">
          <h2>What Our Customers Say</h2>
          <p>Over 2 million satisfied policyholders trust ShieldSure</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map(t => (
            <div key={t.name} className="testimonial-card">
              <div className="stars">{'★'.repeat(t.rating)}</div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="author-avatar">{t.name[0]}</div>
                <div>
                  <div className="author-name">{t.name}</div>
                  <div className="author-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Ready to Get Protected?</h2>
        <p>Join millions of customers who trust ShieldSure for their insurance needs.</p>
        <button className="btn-primary large" onClick={() => navigate('/quote')}>Start Your Free Quote</button>
      </section>
    </div>
  );
}
