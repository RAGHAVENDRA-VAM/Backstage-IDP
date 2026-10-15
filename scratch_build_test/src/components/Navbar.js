import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="brand-icon">🛡️</span>
        <span className="brand-name">ShieldSure</span>
      </div>

      <button className="hamburger" onClick={() => setOpen(!open)}>
        <span /><span /><span />
      </button>

      <ul className={`nav-links ${open ? 'open' : ''}`}>
        {[
          { to: '/', label: 'Home' },
          { to: '/quote', label: 'Get a Quote' },
          { to: '/policies', label: 'My Policies' },
          { to: '/claims', label: 'Claims' },
          { to: '/contact', label: 'Contact' },
        ].map(({ to, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={() => setOpen(false)}
            >
              {label}
            </NavLink>
          </li>
        ))}
        <li>
          <button className="btn-login">Login / Sign Up</button>
        </li>
      </ul>
    </nav>
  );
}
