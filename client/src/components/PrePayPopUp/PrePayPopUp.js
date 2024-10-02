import React, { useEffect, useRef } from 'react';
import './PrePayPopUp.css';


const PrePayPopUp = ({ isOpen, onClose }) => {
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-container" ref={popupRef}>
        <button className="close-button" onClick={onClose}>×</button>
        <div className="popup-content">
          <div className="left-column">
            <div className="rating-section">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p>Customer rating 9.0 | 6,711 reviews</p>
            </div>
            <div className="benefits-section">
              <h3>✅ Get unlimited members-only access.</h3>
              <p>and research the best places to live, travel and work remotely to find yours</p>
              <ul className='popup-benefits-list'>
                <li className="popup-benefit-item" data-emoji="🗺️">Get recommendations from locals in each neighborhood.</li>
                <li className="popup-benefit-item" data-emoji="📗">Access digital guides to the history and architecture of each place.</li>
                <li className="popup-benefit-item" data-emoji="📍">Get tailored itineraries that accommodate your needs.</li>
                <li className="popup-benefit-item" data-emoji="🤖">AI Chat that will give you tips and ideas on how to best explore the city.</li>
              </ul>
            </div>
          </div>
          <div className="right-column">
            <div className="image-preview">
              <div className="panning-image" style={{ backgroundImage: `url(https://insiderhood.s3.amazonaws.com/assets/37DFD9C9-7747-4752-B835-A4CF018D0A5C.jpg)` }}></div>
            </div>
            <div className="signup-form">
              <p>35,222 members + 435 people joined this month</p>
              <input type="email" placeholder="Type your email..." />
              <select>
                <option value="">Select your gender</option>
                {/* Add gender options */}
              </select>
              <button className="go-nomad-button">Go nomad →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrePayPopUp;
