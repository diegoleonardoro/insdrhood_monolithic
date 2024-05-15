import React, { useContext } from 'react';
import { CartContext } from '../../contexts/cart-context';
import CartItem from './CartItem';
import './cartpage.css';
import Total from "./Total"

const CartPage = () => {
  const { cartItems, itemCount, total, increase, decrease, removeProduct, clearCart } = useContext(CartContext);
  const funcs = { increase, decrease, removeProduct }

  return (
    <div className='cartPageContainer'>
      <h1 style={{textAlign:'center', margin:'20px'}}>Order Summary</h1>
      {
        cartItems.length === 0 ? <div style={{ margin:"auto" }} className='empty-cart'>Your Cart is empty</div>
          :
          <>
            <div  className='cart-page'>
              <Total itemCount={itemCount} total={total} clearCart={clearCart} />
              <div className='cart-item-container'>
                {
                  cartItems.map(item => <CartItem {...item} key={item.id} {...funcs} />)
                }
              </div>
            </div>
          </>
      }
    </div>

  );
}

export default CartPage;