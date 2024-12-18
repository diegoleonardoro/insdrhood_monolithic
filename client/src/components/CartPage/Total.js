import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./cartpage.css"

const Total = ({ itemCount, total, history, clearCart }) => {

  const navigate = useNavigate();
  return (
    <div className='total-container'>
      <div className='total'>
        <p>Total Items: {itemCount}</p>
        <p>{`Total: $${total}.00`}</p>
      </div>
      <div className='checkout'>
        <button
          className='button is-black'
          style={{ backgroundColor: "transparent", margin: "5px", borderRadius: "20px", padding: "10px" }}
          onClick={() => navigate('/checkout')}>CHECKOUT</button>
        <button style={{ backgroundColor: "transparent", margin: "5px", borderRadius: "20px", padding: "10px" }} className='button is-white' onClick={() => clearCart()}>CLEAR</button>
      </div>
    </div>
  );
}

export default Total;