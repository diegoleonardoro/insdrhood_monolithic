import { useState } from "react";
import axios from "axios";
import "./emailRegister.css";
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { useNavigate } from "react-router-dom";


const EmailRegister = ()=>{

  axios.defaults.withCredentials = true;

  const navigate = useNavigate();

  const [errors, setErrors] = useState(null);

  const [formData, setFormData] = useState({
    email: ""
  });

  const onSubmit = async (event) => {
    event.preventDefault();

    await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/signup`, formData,
      {
        withCredentials: true
      });
   
  };

  return (
    <div className="signupFormContainer">

      <form className="signupForm">
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

        <Button className="signupSubmitButton" onClick={onSubmit} variant="secondary">Sign Up </Button>

      </form>

    </div>
  )




}

export default EmailRegister