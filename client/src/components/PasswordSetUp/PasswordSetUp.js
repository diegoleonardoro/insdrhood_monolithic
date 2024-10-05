import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserContext } from "../../contexts/UserContext";
import './PasswordSetUp.css';

const PasswordSetUp = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const { setCurrentUserDirectly } = useUserContext();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/verifyUser/${userId}`,
          { withCredentials: true }
        );
        if (response.status === 200) {
          setCurrentUserDirectly(response.data);
        }
      } catch (error) {
        console.error('Error verifying user:', error);
        setError('Failed to verify user. Please try again.');
      }
    };

    verifyUser();
  }, [userId, setCurrentUserDirectly]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/updatepassword/${userId}`,
        { newPassword: formData.password },
        { withCredentials: true }
      );

      if (response.status === 200) {
        // Password set successfully, update the user context and navigate to home
        setCurrentUserDirectly(response.data);
        navigate('/');
      } else {
        setError('Failed to update password. Please try again.');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="password-setup-container">
      <h2>Set Up Your Password</h2>
      <form onSubmit={handleSubmit} className="password-setup-form">
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="submit-button">Set Password</button>
      </form>
    </div>
  );
};

export default PasswordSetUp;
