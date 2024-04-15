import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import InputGroup from 'react-bootstrap/InputGroup';
import Alert from 'react-bootstrap/Alert';
import "./newsLetterReferral.css";

const NewsLetterReferral = () => {

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
  });

  const [suceess, setSuccess] = useState(false)
  const [errors, setErrors] = useState(null);
  const emailRegex = /\S+@\S+\.\S+/;
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setErrors("Email is required.");
      return;
    } else if (!emailRegex.test(formData.email)) {
      setErrors("Please enter a valid email address.");
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/newsletter/newsletterreferral`, formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1000);

    } catch (error) {
      console.error("There was an error submitting the form:", error);
      setErrors(error?.response?.data?.errors?.[0]?.message);
    }
  }

  const handleChange = (e) => {
    setErrors(null);
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  return (

    <>

      <div className="newsLetterParent">
        <InputGroup className="mb-3 emailReferralForm">
          <Form.Control
            placeholder="Recipient's email"
            aria-label="Recipient's username"
            aria-describedby="basic-addon2"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />



          {!suceess && (
            <Button variant="outline-secondary" id="button-addon2"
              onClick={handleSubmit}
            > Send Invite </Button>)}
          {suceess && (
            <Alert variant='success'>
              Thank you for for singing up!
            </Alert>
          )}
        </InputGroup>

      </div>

      {
        errors && (
          <Alert style={{ textAlign: "center" }} variant='danger'>
            {errors}
          </Alert>
        )
      }
    </>


  )




}

export default NewsLetterReferral;