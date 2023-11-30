import { useState } from "react";
import axios from "axios";
import "./signup.css";
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { useNavigate } from "react-router-dom";

const SignUp = ({ updateCurrentUser }) => {
  
  axios.defaults.withCredentials = true;

  const navigate = useNavigate();

  const [errors, setErrors] = useState(null);
  const [imageFile, setImageFile] = useState("");

  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [unmatchingPasswords, setUnmatchingPasswords] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    image: "",
    formsResponded: 0
  });

  async function saveUserData() {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/signup`,
        formData);        

      console.log("kk", response.data)
      await updateCurrentUser(response.data);

      navigate('/');
      
      // return

    } catch (error) {
      setErrors(error?.response?.data?.errors?.[0]?.message);
    }
  }

  async function checkPasswordsMatch(password1, password2) {
    if (password1 !== password2) {
      //Show a banner telling that the passwords do not match 
      setUnmatchingPasswords(true);
    } else {
      // make request to sign user in:
      await saveUserData();
    }
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    checkPasswordsMatch(password1, password2);
  };

  return (
    <div className="signupFormContainer">

      <form className="signupForm">

        <FloatingLabel controlId="floatingInput" label="Your name" className="mb-3" >
          <Form.Control
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
            }}
          />
        </FloatingLabel>

        <FloatingLabel controlId="floatingInput" label="Email address" className="mb-3" >
          <Form.Control
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              setErrors(null);
            }}
          />
        </FloatingLabel>

        {errors && (
          <Alert style={{ marginTop: "10px" }} variant='danger'>
            {errors}
          </Alert>
        )}

        <FloatingLabel controlId="floatingInput" label="Create a password" className="mb-3" >
          <Form.Control
            type="password"
            value={password1}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              setPassword1(e.target.value);
              setUnmatchingPasswords(false);
            }}
          />
        </FloatingLabel>

        <FloatingLabel controlId="floatingInput" label="Confirm password" className="mb-3" >
          <Form.Control
            type="password"
            value={password2}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              setPassword2(e.target.value);
              setUnmatchingPasswords(false);
            }}
          />
        </FloatingLabel>
        {
          unmatchingPasswords ? (
            <Alert style={{ textAlign: "center", marginTop: "15px" }} variant="danger">
              Passwords do not match
            </Alert>
          ) : null
        }
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label>Choose profile picture</Form.Label>
          <Form.Control
            onChange={(e) => {
              setImageFile(e.target.files[0]);
            }}
            type="file" />
        </Form.Group>

        <Button className="signupSubmitButton" onClick={onSubmit} variant="secondary">Sign Up </Button>

      </form>

    </div>
  )
}

export default SignUp;