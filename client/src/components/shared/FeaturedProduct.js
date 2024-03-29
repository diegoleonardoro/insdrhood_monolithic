import "./featuredProduct.css"
import React, { useContext } from 'react';
import { isInCart } from "../../helpers";
import { CartContext } from "../../contexts/cart-context"
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';



const FeaturedProduct = (props) => {

  const { title, imageUrl, price, id, description } = props;
  const product = { title, imageUrl, price, id, description };
  const { addProduct, cartItems, increase } = useContext(CartContext);
  const itemInCart = isInCart(product, cartItems);
  const navigate = useNavigate();

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

  return (
    <div className="galleryParent__" style={{ position: "relative" }}>
      <Slider {...settings}>
        {imageUrl.map((image, index) => (
          <img key={index} className="imageprod" src={image}></img>
        ))}
      </Slider>
      <div style={{ margin: '30px', textAlign: "start" }} className='name-price'>
        <h3>{title}</h3>
        <p>$ {price}</p>
        <p >{description}</p>
        {
          !itemInCart &&
          <Button style={{ margin: "20px 20px 0px 20px", width: "80%", borderRadius: '0', border: 'none', backgroundColor: '#333' }} onClick={() => addProduct(product)} variant="primary">ADD TO CART</Button>
        }
        {
          itemInCart &&
          <Button style={{ margin: "20px 20px 0px 20px", width: "80%", borderRadius: '0', border: 'none', backgroundColor: '#333' }} variant="primary" onClick={() => increase(product)} >ADD MORE</Button>
        }

        <Button variant="primary" style={{ margin: "20px 20px 0px 20px", width: "80%", borderRadius: '0', border: 'none', backgroundColor: '#333' }} onClick={() => navigate('/cart')}>
          PROCEED TO CHECKOUT
        </Button>

      </div>
    </div>
  );

}


export default FeaturedProduct;
// export default withRouter(FeaturedProduct);

