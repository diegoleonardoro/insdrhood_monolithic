import React, { useContext } from 'react';
import FeaturedProduct from '../../components/shared/FeaturedProduct';
import { ProductsContext } from '../../contexts/products-context'

import "./shop.css";

const Shop = () => {

  const { products } = useContext(ProductsContext);// all products from the DataBase

  const allProducts = products.map(product => (
    <FeaturedProduct {...product} key={product.id} />// takes as an argument a single product 
  ));

  return (
    <div className='product-list-container'>


      <h2 className='product-list-title'>Shop</h2>
      <p style={{textAlign:"center"}}>Payments ensured with Stripe's advanced security.</p>

      <div className='product-list'>
        {
          allProducts
        }
      </div>
    </div>
  )

}

export default Shop;

