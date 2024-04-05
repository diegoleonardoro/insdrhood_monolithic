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
import SingleProduct from "../SingleProduct/SingleProduct";
import TShirtCustomizer from "../TshirtCustomizer/tshirtCustomizer";
import { ProductsContext } from "../../contexts/products-context";
import Spinner from 'react-bootstrap/Spinner';
import { useNavigate } from "react-router-dom";
import BlogEditor from "../BlogEditor/BlogEditor";

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
  const [isLoading, setIsLoading] = useState(true);
  const [blogUserId, setBlogUserid] = useState(null)
  const isEditable = blogUserId === currentuser_?.id;
  const [editContent, setEditContent] = useState(false);
  const [coverImage, setCoverImage] = useState('')

  const filteredProds = products
    .filter(product => associatedProducts?.includes(product.name))
    .map(product => product)

  console.log('associatedProducts', associatedProducts)

  const productsList = filteredProds.map((prod) => {
    if (prod.id !== 7) {
      return <SingleProduct key={prod.id} productId={prod.id} />;
    } else {
      // Spread the prod properties into TShirtCustomizer, ensuring it also receives the key prop.
      return <TShirtCustomizer {...prod} key={prod.id} />;
    }
  });

  const getBlog = async () => {
    const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/blog/post/${id}`);
    setTitle(response.data.title);
    const cleanHTML = DOMPurify.sanitize(response.data.content);
    setBlogHtml(cleanHTML);
    setAssociatedProducts(response.data.selectedProducts);
    setBlogUserid(response.data.userId)
    setCoverImage(response.data.coverImageUrl);
  }

  useEffect(() => {
    // make request to fetch the blog post:
    getBlog()
    setIsLoading(false);

  }, [])


  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);
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

  if (isLoading) {
    return (
      <div style={{ position: "relative", left: "45%", transform: "translate(-50%, 0)", display: "inline" }}>
        <Spinner style={{ position: "relative", height: "100px", width: "100px", top: "50px" }} animation="grow" />
        <div style={{ display: "inline", position: "absolute", bottom: "-10px", left: "15px", color: "white" }}>Loading...</div>
      </div>
    )
  }

  const handleEditClick = () => {
    //send user to the editor. 
    setEditContent(true)
  };

  return (
    <>
      {isLoading ? (
        <div style={{ position: "relative", left: "45%", transform: "translate(-50%, 0)", display: "inline" }}>
          <Spinner style={{ position: "relative", height: "100px", width: "100px", top: "50px" }} animation="grow" />
          <div style={{ display: "inline", position: "absolute", bottom: "-10px", left: "15px", color: "white" }}>Loading...</div>
        </div>
      ) : (
        !editContent ? (
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
                      setEmailErrorFalse();
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
                    Invalid Email Format
                  </Alert>
                )}
              </div>
            )}
            {signUpSuccess && (
              <Alert style={{ marginTop: "10px" }} variant='success'>
                Thank you for subscribing to our newsletter!
              </Alert>
            )}

            {isEditable && (
              <Button variant="dark" onClick={handleEditClick} className="editSvg" size="lg" style={{ width: '100%' }} >Edit</Button>
            )}

            <h1 className="article-title">{title}</h1>
            {productsList}
            <div className="blogContainer" dangerouslySetInnerHTML={{ __html: blogHtml }} />
          </div>

        ) :

          (<BlogEditor
            id={id}
            blogHtml={blogHtml}
            title_={title}
            selectedProducts_={associatedProducts}
            coverImage={coverImage}


          />)

      )}
    </>
  );


}

export default Blog;