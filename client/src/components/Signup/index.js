import { useState } from "react";
import axios from "axios";
import "./signup.css";
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../contexts/UserContext";


const SignUp = () => {

  const { currentuser_, setCurrentUserDirectly } = useUserContext();

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
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/signup`, formData,
        {
          withCredentials: true
        });

      setCurrentUserDirectly(response.data);

      navigate('/');

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

        {/* <FloatingLabel controlId="floatingInput" label="Your name" className="mb-3" > */}
          <Form.Control
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
            }}
          placeholder="Name"
          className="signupFormInput_"
          />
        {/* </FloatingLabel> */}

        {/* <FloatingLabel controlId="floatingInput" label="Email address" className="mb-3" > */}
        <Form.Control
          type="email"
          value={formData.email}
          placeholder="Email address"
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            setErrors(null);
          }}
          className="signupFormInput_"
        />
        {/* </FloatingLabel> */}

        {errors && (
          <Alert style={{ marginTop: "10px" }} variant='danger'>
            {errors}
          </Alert>
        )}


        <Form.Control
          type="password"
          value={password1}
          placeholder="Create a Password"
          onChange={(e) => {
            setFormData({ ...formData, password: e.target.value });
            setPassword1(e.target.value);
            setUnmatchingPasswords(false);
          }}
          className="signupFormInput_"
        />


        {/* <FloatingLabel label="Confirm password" className="label-signup-form"  > */}
        <Form.Control
          type="password"
          value={password2}
          placeholder="Confirm Password"
          onChange={(e) => {
            setFormData({ ...formData, password: e.target.value });
            setPassword2(e.target.value);
            setUnmatchingPasswords(false);
          }}
          className="signupFormInput_"
        />
        {/* </FloatingLabel> */}
        {
          unmatchingPasswords ? (
            <Alert style={{ textAlign: "center", marginTop: "15px" }} variant="danger">
              Passwords do not match
            </Alert>
          ) : null
        }
        <Form.Group style={{backgroundColor:"transparent"}} id="formFile" className="mb-3">
          <Form.Label>Choose profile picture</Form.Label>
          <Form.Control
            onChange={(e) => {
              setImageFile(e.target.files[0]);
            }}
            type="file"
            style={{ border: "1px solid black" }} />
        </Form.Group>

        <Button className="signupSubmitButton" onClick={onSubmit} variant="secondary">Sign Up </Button>

      </form>

    </div>
  )


}

export default SignUp;