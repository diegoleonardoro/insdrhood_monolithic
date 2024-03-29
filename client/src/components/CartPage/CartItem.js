import React from 'react';
import { PlusCircleIcon, MinusCircleIcon, TrashIcon } from '../Icons/index';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import "./cartpage.css"


const CartItem = (props) => {

  const { title, imageUrl,
    price, quantity,
    id, description,
    increase, decrease,
    removeProduct, 
    tShirtColor, size, 
    logo, text, color } = props;

  const product = { title, imageUrl, price, quantity, id, description, size, tShirtColor, text, color };

  /** Images slider */
  const PrevArrowPhotos = ({ onClick }) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" onClick={onClick} height="3em" viewBox="0 0 512 512"
        style={{
          fill: 'black',
          cursor: 'pointer',
          position: 'absolute',
          left: '0px',
          zIndex: "4",
          top: '50%',
          transform: 'translate(0, -50%)',
          //  backgroundColor:'#7575fb',
          padding: '5px',
          borderRadius: '5px'
        }}>
        <path d="M512 256A256 256 0 1 0 0 256a256 256 0 1 0 512 0zM231 127c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-71 71L376 232c13.3 0 24 10.7 24 24s-10.7 24-24 24l-182.1 0 71 71c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0L119 273c-9.4-9.4-9.4-24.6 0-33.9L231 127z" />
      </svg>
    );
  };

  const NextArrowPhotos = ({ onClick }) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" onClick={onClick} height="3em" viewBox="0 0 512 512"
        style={{
          fill: 'black',
          cursor: 'pointer',
          position: 'absolute',
          right: '0px',
          zIndex: "4",
          top: '50%',
          transform: 'translate(0, -50%)',
          //  backgroundColor:'#7575fb',
          padding: '5px',
          borderRadius: '5px'
        }}
      >
        <path d="M0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM281 385c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l71-71L136 280c-13.3 0-24-10.7-24-24s10.7-24 24-24l182.1 0-71-71c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0L393 239c9.4 9.4 9.4 24.6 0 33.9L281 385z" />
      </svg>
    );
  };

  // Image slider settings:
  const settings = {
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1, // Ensure this is set to display slides horizontally
    prevArrow: <PrevArrowPhotos />,
    nextArrow: <NextArrowPhotos />,
    background: "transparent",
    adaptiveHeight: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          // Consider if you need this since it might confuse the initial slide position.
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]

  };

  return (
    <div className='cart-item'>

      {imageUrl && (
        <div className='galleryParent_Cart'>
          <Slider {...settings}>
            {imageUrl.map((image, index) => (
              <img key={index} alt="product" className="imageprodCart" src={image}></img>
            ))}
          </Slider>
        </div>
      )}
      {tShirtColor && (
        <div className="tshirt-display">
          <img src={tShirtColor} className="tshirt" alt="Custom T-shirt" />
          <img src={logo} className="logo" alt="Logo" />
        </div>
      )}
      {size&&(
        <p>
          {`Size ${size}`}
        </p>
      )}
      {color && (
        <p>
          {`Color ${color}`}
        </p>
      )}
      <div style={{ marginLeft: "40px" }}>
        <div className='name-price'>
          {title && (
            <h4>{title}</h4>
          )}
          <p>${price}</p>
        </div>
        <div className='quantity'>
          <p>{`Quantity: ${quantity}`}</p>
        </div>
        <div className='btns-container'>
          <button
            style={{ backgroundColor: 'transparent', marginRight: '5px' }}
            className='btn-increase' onClick={() => increase(product)}>
            <PlusCircleIcon width='20px' />
          </button>
          {
            quantity === 1 &&
            <button
              style={{ backgroundColor: 'transparent' }}
              className='btn-trash' onClick={() => removeProduct(product)}>
              <TrashIcon width='20px' />
            </button>
          }
          {
            quantity > 1 &&
            <button
              className='btn-decrease' onClick={() => decrease(product)}>
              <MinusCircleIcon width='20px' />
            </button>
          }
        </div>
      </div>


    </div>
  );
}

export default CartItem;