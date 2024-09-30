import React, { useState } from 'react';
import './emailFooter.css';
import axios from "axios";

const EmailFooter = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/emailregistration`, { email });
      console.log('Email registration successful:', response.data);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Email registration failed:', error);
      setError(error.response?.data?.errors?.[0]?.message || 'An error occurred');
    }
  };

  if (isSubmitted) {
    return null;
  }

  return (
    <footer className="email-footer2">
      <form onSubmit={handleSubmit} className="email-form">
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="Enter your email"
          required
        />
        <button type="submit">Subscribe</button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </footer>
  );
};

export default EmailFooter;
