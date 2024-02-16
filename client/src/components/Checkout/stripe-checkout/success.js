import React, { useContext, useEffect } from 'react';
import { CartContext } from '../../../contexts/cart-context';
import { useNavigate } from 'react-router-dom';

const Success = ({ history }) => {

  const navigate = useNavigate();
  const { clearCart, cartItems } = useContext(CartContext);
  useEffect(() => {
    if (cartItems.length !== 0) { clearCart() }
  }, [clearCart, cartItems]);

  return (
    
      <div className='checkout'>
        <h1>Thank you for your order</h1>
        <p>We are currently processing your order and
          will send you a confirmation email shortly
        </p>
        <div>
          <button className='button is-black nomad-btn submit'
            onClick={() => navigate('/shop')}>
            Continue Shopping
          </button>
        </div>
      </div>
    
  );
}

export default Success;