import "./blog.css";
import { useParams } from 'react-router-dom';
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useUserContext } from "../../contexts/UserContext";
import DOMPurify from 'dompurify';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import SingleProduct  from "../SingleProduct/SingleProduct";
import { ProductsContext } from "../../contexts/products-context";


const Blog = () => {

  const { id } = useParams();
  const { currentuser_ } = useUserContext();
  const [email, setEmail] = useState("")
  const [blogHtml, setBlogHtml] = useState('');
  const [title, setTitle] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [emailSignUperror, setEmailSignUpError] = useState(null);
  const [showEmailError, setShowEmailError] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const { products } = useContext(ProductsContext);
  const [associatedProducts, setAssociatedProducts] = useState([])

  const filteredIds = products
    .filter(product => associatedProducts?.includes(product.name))
    .map(product => product.id)

  const productsList = filteredIds.map((id) => {
    return (
      <SingleProduct key={id} productId={id} />
    )
  })

  const getBlog = async () => {
    const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/blog/post/${id}`);
    setTitle(response.data.title);
    const cleanHTML = DOMPurify.sanitize(response.data.content);
    setBlogHtml(cleanHTML);
    setAssociatedProducts(response.data.selectedProducts)
  }

  useEffect(() => {
    // make request to fetch the blog post:
    getBlog()
  }, [])

  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);
    // Check email validity whenever the input changes
    setIsValidEmail(checkEmailStructure(inputEmail));
  };

  const checkEmailStructure = (inputEmail) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(inputEmail);
  };

  const handleSubmit = async () => {
    if (isValidEmail && email) {
      try {
        await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/newsletter/signup`,
          { email });
        setSignUpSuccess(true);
      } catch (error) {
        setEmailSignUpError(error.response.data.errors[0].message)
      }
    } else {
      setShowEmailError(true)
    }
  };

  const setEmailErrorFalse = () => {
    setShowEmailError(false)
    setEmailSignUpError(null)
  }

  return (
    <div className="blogMainContainer">
      {!currentuser_ && !signUpSuccess && (
        <div>
          <InputGroup className="mb-3">
            <Form.Control
              placeholder="Subscribe to the Newsletter"
              aria-label="Recipient's username"
              aria-describedby="basic-addon2"
              onChange={(e) => {
                handleEmailChange(e);
                setEmailErrorFalse(e);
              }}
            />
            <Button onClick={handleSubmit} variant="outline-secondary" id="button-addon2">
              Register
            </Button>
          </InputGroup>
          {emailSignUperror && (
            <Alert style={{ marginTop: "10px" }} variant='danger'>
              {emailSignUperror}
            </Alert>
          )}
          {showEmailError && (
            <Alert style={{ marginTop: "10px" }} variant='danger'>
              Ivalid Email Format
            </Alert>
          )}
        </div>
      )}
      {signUpSuccess && ( // Render success message
        <Alert style={{ marginTop: "10px" }} variant='success'>
          Thank you for subscribing to our newsletter!
        </Alert>
      )}
      <h1 className="article-title">{title}</h1>
      <div className="blogContainer" dangerouslySetInnerHTML={{ __html: blogHtml }} />

      {productsList}

    </div>
  );



}

export default Blog;