import React, { useState, useRef, useCallback } from 'react';
import "./blogeditor.css";
import axios from "axios";
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImageResize from 'quill-image-resize-module-react';
import { v4 as uuidv4 } from 'uuid';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../contexts/UserContext";

const Parchment = Quill.import('parchment');

class LazyImageBlot extends Parchment.Embed {
  static create(value) {
    let node = super.create(value);
    node.setAttribute('src', value.url);
    node.setAttribute('loading', 'lazy'); // Set the lazy loading attribute
    if (value.alt) {
      node.setAttribute('alt', value.alt);
    }
    return node;
  }

  static value(node) {
    return {
      url: node.getAttribute('src'),
      alt: node.getAttribute('alt'),
    };
  }
}

Quill.register('modules/imageResize', ImageResize);

LazyImageBlot.blotName = 'lazyImage'; // Define a unique name for your custom blot
LazyImageBlot.tagName = 'img'; // Use the 'img' tag for this blot

// Step 3: Register the custom blot with Quill
// Quill.register(LazyImageBlot, true);

Quill.register({ 'formats/customBlot': LazyImageBlot }, true);


const BlogEditor = () => {

  const [editorContent, setEditorContent] = useState('');
  const quillRef = useRef(null);
  const { currentuser_, setCurrentUserDirectly } = useUserContext();
  const [displayAuthForm, setDisplayAuthForm] = useState(false);
  const [isSignIn, setIsSignIn] = useState(true)
  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState(null);
  const [isValidEmail, setIsValidEmail] = useState(true);
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [showTypeTitle, setShowTypeTitle] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState("");

  const closeAuthForm = () => {
    setDisplayAuthForm(false)
  };
  const handleTitleChange = (e) => {
    setShowTypeTitle(false);
    setTitle(e.target.value);
  };


  const validateEmail = (email) => {
    // Regular expression to test the email format
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return re.test(email);
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

  const registerNewUser = () => {
    const emailValid = validateEmail(signUpData.email);
    setIsValidEmail(validateEmail(signUpData.email));
    if (!emailValid) {
      return
    }

    // MAKE REQUEST TO REGISTER NEW USER.

  };

  const signInUser = async () => {

    // make request to sign user in
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/signin`,
        signInData);
      await setCurrentUserDirectly(response.data);
      const blog = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/blog/post`,
        { content: editorContent, userId: currentuser_.id, title: title, coverImageUrl: coverImageUrl });
      navigate(`/post/${blog.data.insertedId}`);

    } catch (error) {
      console.log("err", error)
      setErrors(error.response.data.errors[0].message)
    }
  };

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
  const displaySignInForm = () => (
    <div className="authElementsContainer">
      <Form.Group as={Row} className="mb-3" controlId="formHorizontalFirstName">
        <Form.Label >
          Email:
        </Form.Label>
        <Col>
          <Form.Control name="email" value={signInData.email} onChange={handleSignInInputChange} />
        </Col>
        <Form.Label>
          Password:
        </Form.Label>
        <Col >
          <Form.Control type="password" name="password" value={signInData.password} onChange={handleSignInInputChange} />

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


  const headerImageHandler = async (e) => {
    const imageFile = e.target.files[0];
    const randomUUID = uuidv4();
    const imageUploadConfig = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/blog/${randomUUID}`);
    await axios.put(imageUploadConfig.data.url, imageFile, {
      headers: {
        "Content-Type": 'image/jpeg',
      },
    });

    const imageUrl = `https://insiderhood.s3.amazonaws.com/${imageUploadConfig.data.key}`;
    setCoverImageUrl(imageUrl);
  }

  const imageHandler = useCallback((e) => {

    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {

      const imageFile = input.files[0];
      const formData = new FormData();
      formData.append('image', imageFile);
      const randomUUID = uuidv4();
      const imageUploadConfig = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/blog/${randomUUID}`);
      await axios.put(imageUploadConfig.data.url, imageFile, {
        headers: {
          "Content-Type": 'image/jpeg',
        },
      });

      const imageUrl = `https://insiderhood.s3.amazonaws.com/${imageUploadConfig.data.key}`;
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection();


      editor.insertEmbed(range.index, 'image', imageUrl);

      
    };

  }, []);

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'image'],
        ['clean'],
      ],
      handlers: {
        image: imageHandler,
      },
    },
    imageResize: {
      parchment: Quill.import('parchment'),
      modules: ['Resize', 'DisplaySize']
    }
  };


  const saveContent = async (e) => {
    e.preventDefault();
    if (title === '') {
      setShowTypeTitle(true)
      return
    }

    const content = editorContent; // Assuming this is the Quill content
    if (content === "") {
      return
    };
    if (currentuser_) {

      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/blog/post`,
        { content: content, userId: currentuser_.id, title: title, coverImageUrl: coverImageUrl });

      // make request to the blog using the insertedId
      navigate(`/post/${response.data.insertedId}`);

    } else {
      setDisplayAuthForm(true)
    }
  };

  return (

    <div>
      <div className="editor-container">
        <Form.Control onChange={handleTitleChange} style={{ marginBottom: "10px" }} size="lg" type="text" placeholder="Title" />
        {showTypeTitle && <p style={{ color: 'red' }}>Please provide a title to your post.</p>}

        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label>Add Cover Photo:</Form.Label>
          <Form.Control onChange={headerImageHandler} type="file" />
        </Form.Group>
        <ReactQuill
          ref={quillRef}
          value={editorContent}
          onChange={setEditorContent}
          modules={modules} // Assuming you have modules configured
          className="editor"
        />

        <Button style={{ width: "100%", marginTop: "10px" }} variant="dark" onClick={saveContent}>Save</Button>
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
          </div>
        </div>
      )}

    </div>

  );

};

export default BlogEditor
