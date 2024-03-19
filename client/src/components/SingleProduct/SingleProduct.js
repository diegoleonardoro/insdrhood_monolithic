import React, { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'
import { ProductsContext } from "../../contexts/products-context"
import { CartContext } from '../../contexts/cart-context';
import { isInCart } from '../../helpers';
import "./singleProduct.css";
import { useNavigate } from "react-router-dom";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';


const SingleProduct = (props) => {

  
  const params = useParams();
  const id = props.productId || params.id;

  const { products } = useContext(ProductsContext);
  const { addProduct, cartItems, increase } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();

  // ---------------------------------------

  /** Images slider */
  const PrevArrowPhotos = ({ onClick }) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" onClick={onClick} height="3em" viewBox="0 0 512 512"
        style={{
          fill: 'black',
          cursor: 'pointer',
          position: 'absolute',
          left: '-30px',
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
          right: '-30px',
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
    slidesToScroll: 1,
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

  // ---------------------------------------

  useEffect(() => {
    const product = products.find(item => Number(item.id) === Number(id));

    // if product does not exist, redirec to shop page
    if (!product) {
      navigate('/shop');
    }

    setProduct(product);
  }, [id, product, products]);


  if (!product) { return null }

  const { imageUrl, title, price, description } = product;
  const itemInCart = isInCart(product, cartItems);


  return (

    <div className='single-product-container'>
      <div className="galleryParent__" style={{ position: "relative" }}>
        <Slider {...settings}>
          {imageUrl.map((image, index) => (
            <img key={index} className="imageprod" src={image}></img>
          ))}
        </Slider>
      </div>
      <div className='product-details'>
        <div className='name-price'>
          <h3>{title}</h3>
          <p>${price}.00</p>
        </div>
        <div className='add-to-cart-btns'>
          {
            !itemInCart &&
            <button
              className='button is-white nomad-btn'
              id='btn-white-outline'
              onClick={() => addProduct(product)}>
              ADD TO CART
            </button>
          }
          {
            itemInCart &&
            <button
              className='button is-white nomad-btn'
              id='btn-white-outline'
              onClick={() => increase(product)}>
              ADD MORE
            </button>
          }

          {/* <button className='button is-black nomad-btn' id='btn-white-outline' onClick={() => navigate('/checkout')}>
            PROCEED TO CHECKOUT
          </button> */}

        </div>
        <div className='product-description'>
          <p>
            {description}
          </p>
        </div>
      </div>
    </div>

  );



}


export default SingleProduct;