import React, { useEffect, useRef, useState } from 'react';
import './PrePayPopUp.css';
import axios from 'axios';
import { useStripe } from '@stripe/react-stripe-js';

const PrePayPopUp = ({ isOpen, onClose, initialEmail }) => {
  const [email, setEmail] = useState('');
  const popupRef = useRef(null);
  const stripe = useStripe();

  // Update email when initialEmail changes or when the popup opens
  useEffect(() => {
    if (isOpen && initialEmail) {
      setEmail(initialEmail);
    }
  }, [isOpen, initialEmail]);


  const handleSubscription = async (e) => {
    e.preventDefault();

    const response = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/api/payments/create-checkout-session`,
      {
        customer_email: email,
        price_id: 'price_1Q5Y85Cjli54jhBvaD9lDL10' 
      },
      { withCredentials: true }
    );

    const { sessionId } = response.data;

    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      console.log(error);
    }
  }

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

            <div className="benefits-section">
              <h3>Thank you for your interest in Insiderhood</h3>
              
              <p>By becoming a member, you will be supporting this project and will get access to some eventual virtual guides.</p>

              {/* <ul className='popup-benefits-list'>
                <li className="popup-benefit-item" data-emoji="🗺️">Get recommendations from locals in each neighborhood.</li> 
                <li className="popup-benefit-item" data-emoji="📗">Access and download digial guides.</li>
                <li className="popup-benefit-item" data-emoji="📷">Download high-resolution photos in multiple sizes</li>
                 <li className="popup-benefit-item" data-emoji="📍 📷">Get tailored itineraries that accommodate your needs.</li>
                <li className="popup-benefit-item" data-emoji="🤖">AI Chat that will give you tips and ideas on how to best explore the city.</li> 
              </ul> */}

              
            </div>
          </div>
          <div className="right-column">
            {/* <div className="image-preview">
              <div className="panning-image" style={{ backgroundImage: `url(https://insiderhood.s3.amazonaws.com/assets/37DFD9C9-7747-4752-B835-A4CF018D0A5C.jpg)` }}></div>
            </div> */}
            <div className="signup-form">
             
              <input
                type="email"
                placeholder="Type your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {/* <select>
                <option value="">Select your gender</option>
                
              </select> */}
              <button onClick={handleSubscription} className="go-nomad-button">Become a member →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrePayPopUp;
