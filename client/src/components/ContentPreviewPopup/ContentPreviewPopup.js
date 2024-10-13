import React, { useState } from 'react';
import './ContentPreviewPopup.css';
import { useStripe } from '@stripe/react-stripe-js';
import axios from 'axios';

const ContentPreviewPopup = ({ isOpen, onClose, previewImages }) => {
  const [email, setEmail] = useState('');

  const stripe = useStripe();
  
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();


    const response = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/api/payments/create-checkout-session`,
      {
        customer_email: email,
        price_id: process.env.REACT_APP_STRIPE_PRICE_ID
      },
      { withCredentials: true }
    );

    const { sessionId } = response.data;

    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      console.log(error);
    }
   
  };

  return (
    <div className="preview-popup-overlay">
      <div className="preview-popup-content">
        <button className="preview-popup-close" onClick={onClose}>Close</button>
        <div className="preview-scroll-container">
          {previewImages.map((image, index) => (
            <div key={index} className="preview-image-wrapper">
              <img 
                src={image} 
                alt={`Preview page ${index + 1}`} 
                className="preview-image"
              />
            </div>
          ))}
        </div>
        <div className="preview-sticky-form">
          <form onSubmit={handleSubmit} className="preview-email-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="preview-email-input"
            />
            <button type="submit" className="preview-submit-button">
              Get the Full Guide
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContentPreviewPopup;
