import React from 'react';
import '../style/Header.css';

const Header: React.FC = () => (
  <header className="custom-header">
    <h1 className="custom-title">
      Smart <span className="highlight">Lead</span> Prioritizer
    </h1>
    <p className="custom-subtitle">Upload, enrich, and prioritize your sales leads with ease.</p>
  </header>
);

export default Header;