import axios from "axios"
import React, { useEffect, useState, useCallback } from "react";
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../contexts/UserContext";

const PasswordSetPopup = ({   setShowPasswordForm }) => {

  const [errors, setErrors] = useState(null);
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const { currentuser_, setCurrentUserDirectly } = useUserContext();

  const [unmatchingPasswords, setUnmatchingPasswords] = useState(false);

  const [formData, setFormData] = useState({
    password: "",
    passwordSet:true
  });

  const navigate = useNavigate();

  // function that will update the user with the email
  const onSubmitPassword = async () => {

    if (password1 !== password2) {
      //Show a banner telling that the passwords do not match 
      setUnmatchingPasswords(true);

      return;
    }

    try {

  
      // make request to update the user
      const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/updateuserdata/${currentuser_.id}`, formData, {
        withCredentials: true
      })

      // make request to update the neighborhood data with the user:
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/updateneighborhood/${currentuser_.neighborhoodId[0]}`, { user: formData })



      setShowPasswordForm(false);
      setCurrentUserDirectly(response.data);
      // navigate to the neighborhood profile so that the udpated data is reflected in the profile:
      navigate(`/neighborhood/${response.data.neighborhoodId[0]}`);

    } catch (error) {
      setErrors(error?.response?.data?.errors?.[0]?.message);
    }

  }

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '10px',
      zIndex: '9000',
      backgroundColor: '#cfe2ff',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      border: 'solid 1px #9ec5fe'
    }}>
      <svg onClick={() => setShowPasswordForm(false)} xmlns="http://www.w3.org/2000/svg" width="30" height="30" style={{ position: 'absolute', top: '0', right: '-4px', zIndex: '999', cursor: 'pointer' }} fill="currentColor" className="bi bi-x" viewBox="0 0 16 16">
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
      </svg>
      <form>

        <FloatingLabel controlId="floatingInput" label="Password" className="mb-3" >
          <Form.Control
            value={password1}
            controlId="formPlaintextPassword"
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              setPassword1(e.target.value);
            }}
            type="password"
          />
        </FloatingLabel>

        <FloatingLabel controlId="floatingInput" label="Confirm password" className="mb-3" >
          <Form.Control
            value={password2}
            onChange={(e) => {
              setPassword2(e.target.value);
            }}
            type="password"
          />
        </FloatingLabel>

        {
          unmatchingPasswords ? (
            <Alert style={{ textAlign: "center", marginTop: "15px" }} variant="warning">
              Passwords do not match
            </Alert>
          ) : null
        }

        {errors && (
          <Alert style={{ marginTop: "10px" }} variant='danger'>
            {errors}
          </Alert>
        )}

      </form>
      <Button className="signupSubmitButton" onClick={onSubmitPassword} variant="primary">Submit </Button>

    </div>
  )

}

export default PasswordSetPopup;
