import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import "./newsletter.css";
import Alert from 'react-bootstrap/Alert';
import { useNavigate } from "react-router-dom";

const NewsLetterLanding = () => {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    newsletter: true,
    frequency: 'everyweek'
  });


  const [suceess, setSuccess] = useState(false)
  const [errors, setErrors] = useState(null);

  // Handle form field changes
  const handleChange = (e) => {
    setErrors(null);
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // console.log("formdata", formData)
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/newsletter/signup`, formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1000);

    } catch (error) {
      console.error("There was an error submitting the form:", error);
      setErrors(error?.response?.data?.errors?.[0]?.message);
    }
  };

  return (

    <div className="newsLetterParent">

      <div className='newsLetterExplanationText'>
        <img className="newsLetterImage" src="https://insiderhood.s3.amazonaws.com/tshirts/logos/thenewyorkernotext.png"></img>
        {/* <p>
          Welcome to Insider Hood, <span style={{ backgroundColor:'#ffff96', padding:'10px'}}>a window to the distinctive architecture and vibrant neighborhoods New York City.</span>
        </p>
        <p>
          Our mission is to provide you with fascinating information about New York's historic and iconic buildings. Dive deep into the <span style={{ backgroundColor: '#ffff96', padding: '10px' }}>architectural essence and the rich history</span> that shape the character of the city.
        </p>
        <p>
          If exploring the architectural marvels and historical narratives of New York City excites you, <span style={{ backgroundColor: '#ffff96', padding: '10px' }}>sign up to the newsletter by filling out the form to the right.</span>
        </p> */}

      </div>
      <Form className="newsLetterform" onSubmit={handleSubmit}>

        <Form.Group className="newsLetterformGroup">
          <Form.Control
            className="newsLetterformControl"
            placeholder="Your Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="newsLetterformGroup">
          <Form.Control
            className="newsLetterformControl"
            type="email"
            placeholder="Enter Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </Form.Group>

        {/* Frequency selection updated with onChange */}
        <Form.Group className="newsLetterformGroup">
          <h4 className="newsLetterlabel">How often do you want to receive the newsletter?</h4>
          <div className='checksContainer'>
            <Form.Check
              type='radio'
              id='everyweek'
              name='frequency'
              label='Every week'
              value='Every week'
              onChange={handleChange}
              checked={formData.frequency === 'Every week'}
            />
            <Form.Check
              type='radio'
              id='everytwoweeks'
              name='frequency'
              label='Every two weeks'
              value='Every two weeks'
              onChange={handleChange}
              checked={formData.frequency === 'Every two weeks'}
            />
            <Form.Check
              type='radio'
              id='everythreeweeks'
              name='frequency'
              label='Every three weeks'
              value='Every three weeks'
              onChange={handleChange}
              checked={formData.frequency === 'Every three weeks'}
            />
            <Form.Check
              type='radio'
              id='everymonth'
              name='frequency'
              label='Every month'
              value='Every month'
              onChange={handleChange}
              checked={formData.frequency === 'Every month'}
            />
          </div>
        </Form.Group>
        {errors && (
          <Alert style={{ marginTop: "10px" }} variant='danger'>
            {errors}
          </Alert>
        )}

        {!suceess && (
          <Button variant="dark" className="newsLetterbutton" type="submit">Sign me up to the newsletter</Button>
        )}

        {suceess && (
          <Alert variant='success'>
            Thank you for for singing up!
          </Alert>
        )}

      </Form>
    </div>
  );
}

export default NewsLetterLanding;