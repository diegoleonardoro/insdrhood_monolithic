import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import styles from './CheckoutSuccess.module.css';
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../contexts/UserContext";

const CheckoutSuccess = () => {
  const [status, setStatus] = useState('loading');
  const location = useLocation();
  const navigate = useNavigate();

  const { setCurrentUserDirectly } = useUserContext();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const sessionId = queryParams.get('session_id');

    if (sessionId) {
      axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/payments/handle-checkout-success?session_id=${sessionId}`)
        .then(response => {
          if (response.data.success) {
            setStatus('success');
            setCurrentUserDirectly(response.data);
            setTimeout(() => {
              navigate(`/`);
            }, 2000);

          } else {
            setStatus('error');
          }
        })
        .catch(error => {
          console.error('Error handling checkout success:', error);
          setStatus('error');
        });
    } else {
      setStatus('error');
    }
  }, [location]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Checkout Status</h1>
      {status === 'loading' && <p className={styles.message}>Processing your payment...</p>}
      {status === 'success' && (
        <div>
          <p className={styles.message}>Thank you for subscribing!</p>
          <p className={styles.subMessage}>Your subscription has been successfully activated.</p>
        </div>
      )}
      {status === 'error' && (
        <div>
          <p className={styles.message}>Oops! Something went wrong.</p>
      
        </div>
      )}
    </div>
  );
};

export default CheckoutSuccess;