import React, { useState, useRef, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import "./blogeditor.css";
import { useUserContext } from "../../contexts/UserContext";
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";
import { useNavigate } from "react-router-dom";

let savedRange = null;

const BlogEditor = () => {

  const [title, setTitle] = useState('');

  const editorRef = useRef(null);
  const uploadButtonRef = useRef(null);
  const titleRef = useRef(null);
  const [displayAuthForm, setDisplayAuthForm] = useState(false);
  const [isSignIn, setIsSignIn] = useState(true); // Default to 'Sign in'
  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState(null);
  const navigate = useNavigate();

  let blogBody = {}// this object will be used for the blog data. 

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault(); // Prevent the default Enter behavior

        // Create a new div with default or no specific styling
        const newDiv = document.createElement('div');
        newDiv.innerHTML = '<br>'; // Insert a break line for visual space, or customize as needed

        editor.appendChild(newDiv);

        // Move the cursor into the new div
        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(newDiv, 0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    };

    editor.addEventListener('keydown', handleKeyDown);

    return () => {
      editor.removeEventListener('keydown', handleKeyDown); // Clean up
    };
  }, []);

  // This randomUUID will be used to save the images
  const randomUUID = uuidv4();
  const { currentuser_, setCurrentUserDirectly } = useUserContext();
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [showTypeTitle, setShowTypeTitle] = useState(false);
  const[converImageUrl, setCoverImageUrl]= useState("");

  const validateEmail = (email) => {
    // Regular expression to test the email format
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return re.test(email);
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      savedRange = selection.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedRange);
  };

  const handleEditorInput = (e) => {

    const editor = editorRef.current;

    if (!editor) return;

    if (e.key === 'Enter') {
      // e.preventDefault(); // Prevent the default behavior of adding a new line

      // Access the last child of the editor to check if it's an image container
      const lastChild = editor.lastChild;

      if (lastChild && lastChild instanceof HTMLElement && lastChild.className.indexOf("imageContainer") > -1) {
        // If the lastChild is an image container, then proceed to add your customized div
        // Create a customized div element
        const customDiv = document.createElement('div');
        customDiv.contentEditable = true; // Make it editable if needed
        customDiv.className = 'customClass'; // Add any custom class for styling or identification
        customDiv.innerHTML = '<br>'; // Add a line break inside it, or any other content you wish

        // Append the customized div to the editor
        editor.appendChild(customDiv);

        // Optionally, set the cursor inside the newly added div
        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(customDiv, 0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        customDiv.focus(); // Focus on the new div to continue typing in it
      }
    }

  };

  const handleTitleChange = (e) => {
    setShowTypeTitle(false);
    setTitle(e.target.value);
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files) return;
    let imgUrls = []
    for (var i = 0; i < files.length; i++) {
      const imageFile = files[i];
      const imageUploadConfig = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/blog/${randomUUID}`);

      imgUrls.push(`https://insiderhood.s3.amazonaws.com/${imageUploadConfig.data.key}`)
      await axios.put(imageUploadConfig.data.url, imageFile, {
        headers: {
          "Content-Type": 'image/jpeg',
        },
      });
    }

    if(e.target.name==="coverImage"){
      //update state of cover image

      console.log('main image', imgUrls)
      setCoverImageUrl(imgUrls[0]);
    }else{
      insertImageAtCaret(imgUrls);
    }
    
  };

  const insertImageAtCaret = (imgUrls) => {

    // Create an image element
    const editor = editorRef.current;
    if (!editor) return;

    // Create a div element to hold all images
    const divContainer = document.createElement('div');
    divContainer.style.display = 'block';
    divContainer.style.marginTop = '5px';
    divContainer.style.marginBotton = '5px';
    divContainer.style.display = 'flex';

    divContainer.className = "imageContainer"

    imgUrls.forEach((imgUrl) => {
      // Create an image element for each URL
      const img = document.createElement('img');
      img.src = imgUrl;
      img.style.maxWidth = '100px';
      img.alt = 'Uploaded image';
      img.style.display = 'block';
     

      // Append each image to the div container
      divContainer.appendChild(img);

    });

    editor.appendChild(divContainer);
  };

  const closeAuthForm = () => {
    setDisplayAuthForm(false)
  }

  const registerNewUser = () => {
    const emailValid = validateEmail(signUpData.email);
    setIsValidEmail(validateEmail(signUpData.email));
    if (!emailValid) {
      return
    }

    // make request to register new user




  };

  const signInUser = async () => {

    // make request to sign user in
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/signin`,
        signInData);
      await setCurrentUserDirectly(response.data);

      // update the blogBody object with the user id
      blogBody.userId = response.data.id;

      // make request to save blog post.





      // direct the user to their blog post. 
      // navigate('/');

    } catch (error) {

      console.log("err", error)
      setErrors(error.response.data.errors[0].message)
    }
  };

  const handleSignInInputChange = (event) => {
    const { name, value } = event.target;
    setSignInData({
      ...signInData,
      [name]: value
    })
  };

  const handleSignUpInputChange = (event) => {
    const { name, value } = event.target;
    setSignUpData({
      ...signUpData,
      [name]: value
    })
  };

  const submitWithoutAuthentication = () => {

    // make request to save the blog data. 


  }

  // Submit the data:
  const handleSubmit = async () => {

    if(title===''){
      setShowTypeTitle(true)
      return
    }

    const editorRefInnerHtml = editorRef.current.innerHTML;

    if (editorRefInnerHtml ===''){
      return 
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(editorRefInnerHtml, 'text/html');
    // create the object that will be sent to the server. It should have the title as plain text and the doc body of the editable div
    blogBody = {
      title,
      coverImage: converImageUrl,
      body: doc.body.innerHTML
    };
    if (currentuser_.data) {
      // ..... //
      // make a request to save the blog inner text with and include the user id
      // save the blog post with the  currentuser_.id 
      blogBody.userId = currentuser_.data.id;
      // make the request to save the blog:
      try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/blog/post`,
          { blogBody: blogBody });
        // make request to the blog using the insertedId
        navigate(`/post/${response.data.insertedId}`);
      } catch (error) {

      }
    } else {
      setDisplayAuthForm(true);
      // if there is no currently logged-in user show a pop up asking users to register ot to sign
      // if the user decides not to sign up, save with out any user associated to it
    }
  };

  const displaySignInForm = () => (
    <div className="authElementsContainer">
      <Form.Group as={Row} className="mb-3" controlId="formHorizontalFirstName">
        <Form.Label >
          Email:
        </Form.Label>
        <Col>
          <Form.Control name="email" value={signInData.email} onChange={handleSignInInputChange} />
          {/**onChange={'updateNewUserData'} */}
        </Col>
        <Form.Label>
          Password:
        </Form.Label>
        <Col >
          <Form.Control type="password" name="password" value={signInData.password} onChange={handleSignInInputChange} />
          {/**onChange={'updateNewUserData'} */}
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="mb-3">
        <Col>
          <Button variant="dark" size="lg" style={{ width: "100%", marginTop: "10px" }} type="submit" onClick={signInUser}>Submit</Button>
        </Col>
      </Form.Group>
      {< p style={{ color: 'red' }}>{errors}</p>}

    </div>
  );

  const displaySignUpForm = () => (
    <div className="authElementsContainer">
      <Form.Group as={Row} className="mb-3" >
        <Form.Label >
          Name:
        </Form.Label>
        <Col>
          <Form.Control name="name" value={signUpData.name} onChange={handleSignUpInputChange} />

        </Col>
        <Form.Label>
          Email:
        </Form.Label>
        <Col >
          <Form.Control name="email" value={signUpData.email} onChange={handleSignUpInputChange} />
        </Col>
      </Form.Group>
      {!isValidEmail && <p style={{ color: 'red' }}>Please enter a valid email address.</p>}
      <Form.Group as={Row} className="mb-3">
        <Col >
          <Button variant="dark" size="lg" style={{ width: "100%", marginTop: "10px" }} type="submit" onClick={registerNewUser}>Submit</Button>
        </Col>
      </Form.Group>
    </div>
  );

  return (
    <div>
      <div className="blog-editor-container" >
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Blog Title"
          style={{ display: 'block', width: '100%', marginBottom: '10px' }}
        />
        {showTypeTitle && <p style={{ color: 'red' }}>Please provide a title to your post.</p>}

        <div
          ref={uploadButtonRef}
          className="upload-main-image"
        >
          <label className='labelUploadImage'>
            Upload Cover Image
            <input name="coverImage" type="file" onChange={handleFileUpload} />
          </label>
        </div>

        <div
          ref={editorRef}
          contentEditable
          style={{ minHeight: '200px', border: '1px solid black', padding: '10px' }}
        />
        <div
          ref={uploadButtonRef}
          className="upload-button"
        >
          <label className='labelUploadImage'>
            Upload Image(s)
            <input type="file" onChange={handleFileUpload} multiple />
          </label>
        </div>

        <Button onClick={handleSubmit} style={{ marginTop: '10px', width: "100%", backgroundColor:"black" }} variant="dark">Submit Post</Button>
      </div>

      {displayAuthForm && (
        <div className='authFormContainer'>
          <div className="authForm">
            <div style={{ display: "flex", justifyContent: "center", marginTop: "40px", marginBottom: "20px" }}>
              <Button style={{ width: "50%" }} variant={isSignIn ? "dark" : "outline-dark"} onClick={() => setIsSignIn(true)}>Sign In</Button>
              <Button variant={!isSignIn ? "dark" : "outline-dark"} onClick={() => setIsSignIn(false)} style={{ marginLeft: '10px', width: "50%" }}>Sign Up</Button>
            </div>
            {isSignIn ? displaySignInForm() : displaySignUpForm()}
            <div style={{ position: "absolute", top: "0px", right: "10px", cursor: "pointer" }} onClick={closeAuthForm}>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="bi bi-x" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
              </svg>
            </div>
            <Button variant="secondary" size="lg" style={{ width: "100%", marginTop: "0px" }} type="submit" onClick={submitWithoutAuthentication}>Submit Without Authentication</Button>
          </div>
        </div>
      )}
    </div>
  );

};

export default BlogEditor



