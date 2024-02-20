import React, { useContext, useState } from 'react';
import { CartContext } from "../../contexts/cart-context";
import CustomCheckout from "./custom-checkout/CustomCheckout"
import ShippingAddress from './custom-checkout/ShippingAdress';
import StripeCheckout from "./stripe-checkout/stripe-checkout"

// import ShippingAddress from './custom-checkout/shipping-address';
// import CustomCheckout from './custom-checkout/custom-checkout';
// import './checkout.styles.scss';


const Checkout = () => {

  const { itemCount, total, cartItems } = useContext(CartContext);
  const [shipping, setShipping] = useState(null);
  const addressShown = {
    display: (shipping ? 'none' : 'block')
  }
  const cardShown = {
    display: (shipping ? 'block' : 'none')
  }

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
