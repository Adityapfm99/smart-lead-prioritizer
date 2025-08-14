import React from 'react';
import '../style/App.css';

const Footer: React.FC = () => (
  <footer style={{
    background: '#f7fafc',
    color: '#4a5568',
    textAlign: 'center',
    padding: '1rem 0',
    fontSize: '0.95rem',
    borderTop: '1px solid #e2e8f0',
    position: 'fixed',
    left: 0,
    bottom: 0,
    width: '100%',
    zIndex: 10
  }}>
    &copy; {new Date().getFullYear()} Smart Lead Prioritizer &mdash; Built for seamless lead management
  </footer>
);

export default Footer;