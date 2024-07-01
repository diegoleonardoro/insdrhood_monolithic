import React, { useContext } from 'react';
import { CartContext } from '../../contexts/cart-context';
import { useNavigate } from 'react-router-dom'; 

import "./cartIcon.css";


const CartIcon = () => {
  const { itemCount } = useContext(CartContext);
  const navigate = useNavigate();

  return (
    <div style={{ marginLeft: "30px" }} className='cart-container' onClick={() => navigate('/cart')}>
      <img style={{ height: "50px", width: "50px", cursor: "pointer" }} src="https://raw.githubusercontent.com/diegoleonardoro/multi-k8s/main/z.png" alt='shopping-cart-icon' />
      {
        itemCount > 0 ? <span className='cart-count'> {itemCount} </span> : null
      }

    </div>
  );

}

export default CartIcon;