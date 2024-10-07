import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './ResetPassword.css';
import { useUserContext } from "../../contexts/UserContext"

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { userId } = useParams();
  const navigate = useNavigate();
  const { setCurrentUserDirectly } = useUserContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/passwordreset/${userId}`, { password });
      setSuccess(true);
      await setCurrentUserDirectly(response.data);
      // Redirect to home page after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {

      setError('Failed to reset password. Please try again.');
    }
  };

  if (success) {
    return <div className="reset-password-success">Password reset successfully!</div>;
  }

  return (
    <div className="reset-password-container">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit} className="reset-password-form">
        <div className="form-group">
          <label htmlFor="password">New Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" className="reset-button">Reset Password</button>
      </form>
    </div>
  );


};

export default ResetPassword;
