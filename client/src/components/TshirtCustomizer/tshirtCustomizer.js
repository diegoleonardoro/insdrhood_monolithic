import React, { useState, useEffect, useContext } from 'react';

import { useNavigate } from 'react-router-dom';
import "./tshirtcustomizer.css";
import { isInCart } from '../../helpers';
import { CartContext } from '../../contexts/cart-context';
import Button from 'react-bootstrap/Button';

const TShirtCustomizer = (props) => {

  const { id, darkLogoImage, whiteLogoImage, text, price, type } = props;
  const { addProduct, cartItems, increase } = useContext(CartContext);

  const navigate = useNavigate();

  // Initial state setup with color options and corresponding T-shirt image URLs
  var colorOptions = {
    white: 'https://insiderhood.s3.amazonaws.com/tshirts/tshirts/tshirtwhite.jpg',
    black: 'https://insiderhood.s3.amazonaws.com/tshirts/tshirts/tshirtblack.jpg',
    grey: 'https://insiderhood.s3.amazonaws.com/tshirts/tshirts/tshirtgray.jpg',
    green: 'https://insiderhood.s3.amazonaws.com/tshirts/tshirts/tshirtgreen.jpg',
    red: 'https://insiderhood.s3.amazonaws.com/tshirts/tshirts/tshirtred.jpg',
    yellow: 'https://insiderhood.s3.amazonaws.com/tshirts/tshirts/tshirtyellow.jpg'
  };

  const [color, setColor] = useState('white');
  const [size, setSize] = useState('M');
  const [blendedLogo, setBlendedLogo] = useState(darkLogoImage);


  // title
  // description
  // imageUrl 
  const [product, setProduct] = useState({
    price,
    id: `${id}-${color}-${size}`,
    text,
    tShirtColor: colorOptions[color],
    logo: blendedLogo,
    size,
    color,
    type
  });

  const itemInCart = isInCart(product, cartItems);

  const handleColorChange = (event) => {

    const newColor = event.target.value;
    const newLogo = newColor === 'black' || newColor === 'red' ? whiteLogoImage : darkLogoImage;

    // Update color and blendedLogo states
    setColor(newColor);
    setBlendedLogo(newLogo);

    // Update product state
    setProduct(prevProduct => ({
      ...prevProduct,
      color: newColor,
      logo: newLogo,
      tShirtColor: colorOptions[newColor],
      id: `${id}-${newColor}-${prevProduct.size}` // Use prevProduct.size to get the most recent size
    }));

  };

  const handleSizeChange = (event) => {
    const newSize = event.target.value;
    // Update size state
    setSize(newSize);
    // Update product state
    setProduct(prevProduct => ({
      ...prevProduct,
      size: newSize,
      id: `${id}-${prevProduct.color}-${newSize}` // Use prevProduct.color to get the most recent color
    }));
  };

  const triggerAddProduct = () => {
    addProduct(product);
  }

  return (
    <div className='mainImageControlContainer'>

      <div>
        <div className="tshirt-display">
          <img src={colorOptions[color]} className="tshirt" alt="Custom T-shirt" />
          <img src={blendedLogo} className="logo" alt="Logo" />
        </div>
      </div>

      <div className='controlsProductDetailsContainer'>
        <div className="controls">
          <label style={{ display: "flex", justifyContent: "space-evenly" }}>
            Color:
            <select value={color} onChange={handleColorChange}>
              {Object.keys(colorOptions).map((colorKey) => (
                <option key={colorKey} value={colorKey}>
                  {colorKey.charAt(0).toUpperCase() + colorKey.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "flex", justifyContent: "space-evenly" }} >
            Size:
            <select value={size} onChange={handleSizeChange}>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
            </select>
          </label>
        </div>
        <div className='product-details'>
          <div className='name-price'>
            <p>${price}.00</p>
          </div>
          <div className='add-to-cart-btns'>
            {
              !itemInCart &&
              <Button
                style={{ margin: "20px 20px 0px 20px", width: "80%", borderRadius: '0', border: 'none', backgroundColor: '#333' }}
                onClick={() => {

                  setProduct(prevProduct => ({
                    ...prevProduct,
                    tShirtColor: colorOptions[color],
                    // include the size in the id 
                    id: `${id}-${color}-${size}`
                  }))

                  triggerAddProduct()
                  // addProduct(product);
                }}
              >
                ADD TO CART
              </Button>
            }
            {
              itemInCart &&
              <Button
                style={{ margin: "20px 20px 0px 20px", width: "80%", borderRadius: '0', border: 'none', backgroundColor: '#333' }}
                onClick={() => increase(product)}
              >
                ADD MORE
              </Button>
            }


            {cartItems.length > 0 &&
              <Button variant="primary" style={{ margin: "20px 20px 0px 20px", width: "80%", borderRadius: '0', border: 'none', backgroundColor: '#333' }}
                onClick={() => navigate('/cart')}
              >
                GO TO CART
              </Button>
            }



          </div>

        </div>
      </div>


    </div>
  );

};

export default TShirtCustomizer;