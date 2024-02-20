import React, { useContext, useState } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { CartContext } from '../../../contexts/cart-context';
import axios from "axios";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import "./stripecheckout.css";


const StripeCheckout = () => {

  const [email, setEmail] = useState('');
  const { cartItems } = useContext(CartContext);
  const stripe = useStripe();



  const handleGuestCheckout = async (e) => {
    e.preventDefault();

    const line_items = cartItems.map(item => {
      return {
        quantity: item.quantity,
        price_data: {
          currency: 'usd',
          unit_amount: item.price * 100, // amount is in cents
          product_data: {
            name: item.title,
            description: item.description,
            images: item.imageUrl,
          }
        }
      }
    });

    const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/payments/create-checkout-session`,
      { line_items, customer_email: email },
      {
        withCredentials: true
      });

    const { sessionId } = response.data;
    const { error } = await stripe.redirectToCheckout({
      sessionId
    });

    if (error) {
      console.log(error);
    }
  }

  return (
    <Form className="stripeCheckOutForm" onSubmit={handleGuestCheckout}>
      <Form.Group className="mb-3" controlId="formBasicEmail">

        <Form.Control onChange={e => setEmail(e.target.value)} type="email" placeholder="Enter email" />
        <Form.Text className="text-muted">
          We'll never share your email with anyone else.
        </Form.Text>
      </Form.Group>
      <Button style={{ width: "100%", borderRadius: "0" }} type='submit' variant="dark" >
        Secure Checkout with Stripe
      </Button>
    </Form>

  );





}

export default StripeCheckout