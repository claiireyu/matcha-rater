import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="app-header">
      <h1 className="title">Matcha Latte Rater</h1>
      <p className="tagline">Capture or upload an image, rate your matcha</p>
      <Link to="/gallery" className="gallery-button">
        Gallery
      </Link>
    </header>
  );
};

export default Header;