import React, { useContext } from 'react';
import { CartContext } from '../../contexts/cart-context';
import { useNavigate } from 'react-router-dom'; 

import "./cartIcon.css";


const CartIcon = () => {
  const { itemCount } = useContext(CartContext);
  console.log('itemCount:', itemCount);
  const navigate = useNavigate();

  return (
    <div className='cart-container' onClick={() => navigate('/cart')}>
      <img style={{ height: "50px", cursor: "pointer" }} src="https://raw.githubusercontent.com/diegoleonardoro/bx_tourism/master/cart-59-xxl.png" alt='shopping-cart-icon' />
      {
        itemCount > 0 ? <span className='cart-count'> {itemCount} </span> : null
      }

    </div>
  );

}

export default CartIcon;