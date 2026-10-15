import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      background: '#1a3c6e',
      color: 'rgba(255,255,255,0.75)',
      padding: '2rem',
      textAlign: 'center',
      fontSize: '0.88rem',
    }}>
      <div style={{ marginBottom: '0.5rem', fontWeight: 700, color: '#fff', fontSize: '1rem' }}>
        🛡️ ShieldSure Insurance
      </div>
      <div style={{ marginBottom: '0.75rem' }}>Auto · Home · Life · Health · Business</div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {['Privacy Policy', 'Terms of Service', 'Accessibility', 'Sitemap'].map(l => (
          <a key={l} href="#!" style={{ color: 'rgba(255,255,255,0.6)' }}>{l}</a>
        ))}
      </div>
      <div>© {new Date().getFullYear()} ShieldSure Inc. All rights reserved.</div>
    </footer>
  );
}
