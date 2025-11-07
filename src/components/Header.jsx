import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>News MarketPlace</h1>
        </div>
        
        <nav className="nav-menu">
          <ul>
            <li><a href="#agencies">Agencies</a></li>
            <li><a href="#social-media">Social Media</a></li>
            <li><a href="#language">Language</a></li>
            <li><a href="#blog">Blog</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
        
        <div className="header-actions">
          <button className="btn-register">Agency Registration</button>
          <button className="btn-submit">Submit Publication</button>
          <button className="btn-signin">Sign In / Sign Up</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
