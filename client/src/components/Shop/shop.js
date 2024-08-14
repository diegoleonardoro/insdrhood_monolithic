import React, { useContext, useEffect } from 'react';
import FeaturedProduct from '../../components/shared/FeaturedProduct';
import TShirtCustomizer from '../TshirtCustomizer/tshirtCustomizer';
import { ProductsContext } from '../../contexts/products-context';
import { Row, Col, Card } from 'react-bootstrap';

import "./shop.css";

const Shop = () => {

  useEffect(()=>{
    axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/chat/sendChatInfo`, {
      webPageRoute: '/shop',
      payLoad: JSON.stringify(validChatHistory)
    })
      .then(response => {
        console.log('vistig notification');
      })
      .catch(error => {
        console.error('Error sending chat info:', error);
      });
  }, [])

  const { products } = useContext(ProductsContext);
  const allProducts = products.map(product => {
    // Check the condition. For example, whether the product is featured.
    if (product.type !== 't-shirt') {
      return <FeaturedProduct {...product} key={product.id} />;
    } else {
      // Render a different component if the condition is not met.
      // return <TShirtCustomizer {...product} key={product.id} />;
    }
  });

  return (
    <div className='product-list-container'>
      <h2 style={{margin:"20px"}} className='product-list-title'>Shop</h2>
      <h5 style={{margin:"20px"}}>Payments are ensured with Stripe's security infrastructure.</h5>
      <div className='product-list'>
        
        {
          allProducts
        }
      </div>
    </div>
  )

}

export default Shop;

