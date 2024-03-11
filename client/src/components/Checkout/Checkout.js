import React, { useContext } from 'react';
import { CartContext } from "../../contexts/cart-context";
import StripeCheckout from "./stripe-checkout/stripe-checkout"

const Checkout = () => {

  const { itemCount, total } = useContext(CartContext);

  return (

    <div style={{position:"relative", marginTop:"30px"}}className='checkout'>
      <h2 style={{textAlign:"center"}}>Checkout Summary</h2>
      <h3 style={{ textAlign: "center" }}>{`Total Items: ${itemCount}`}</h3>
      <h4 style={{ textAlign: "center" }}>{`Amount to Pay: $${total}`}</h4>
      {/* <div style={addressShown}>
        <ShippingAddress setShipping={setShipping} />
      </div> */}
      {/* <div style={cardShown}> */}
      <StripeCheckout />
      {/* <CustomCheckout {...{ shipping, cartItems }} /> */}
      {/* </div> */}
    </div>

  );


}

export default Checkout;
