import { useState, useEffect } from "react";

import { useParams } from 'react-router-dom';

import axios from "axios";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { useNavigate } from "react-router-dom";
import "./emailconfirmation.css"


const VerifyEmail = ({ updateCurrentUser }) => {

  const { emailtoken } = useParams();
  const [errors, setErrors] = useState(null);
  const [user, setUser] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [unmatchingPasswords, setUnmatchingPasswords] = useState(false);

  // when set to true, this state will will show a windown telling the user thaty they have successfully verified their email.
  const [showRedirecting, setShowRedirecting] = useState(false);

  // state used when the use has not set their passwords and we need to update their data:
  const [userDataToUpdate, setUserDataToUpdate] = useState({
    id: 'user.id',
    password: "",
    passwordSet: true
  });

  const navigate = useNavigate();

  // make request to get the user with the emailtoken
  const makeRequest = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/emailVerification/${emailtoken}`);
      setUser(response.data);
    } catch (error) {
      setErrors(error.response.data.errors[0].message);
    }
  }
  useEffect(() => {
    makeRequest()
  }, []);

  useEffect(() => {
    if (user !== null) {

      // if the user has not set their password, show a form for them to set their passwords:
      if (user.passwordSet === false) {
        setShowPasswordForm(true);
      } else if (user.formsResponded === 0) {

        // SHOW WINDOW SAYING USER HAS CONFIRMED THEIR EMAIL 
        setShowRedirecting(true);

        // DIRECT THE USER TO RESPOND THE FORM 
        const queryString = `token=${emailtoken}`
        // updateCurrentUser(user);
        setTimeout(() => {
          navigate(`/?${queryString}`);
        }, 2000);

      } else {

        // SHOW WINDOW SAYING USER HAS CONFIRMED THEIR EMAIL 
        setShowRedirecting(true);

        // DIRECT THE USER TO THE MAIN PAGE (EVENTUALLY DIRECT THEM TO THEIR PROFILE)
        const queryString = `token=${emailtoken}`
        setTimeout(() => {
          navigate(`/?${queryString}`);
        }, 2000);
      }
    }
  }, [user])


  // this funciton will only be called when the user has registered responding the form. That will be the only case in which the user has not set their password
  async function checkPasswordsMatch(password1, password2) {
    if (password1 !== password2) {
      //Show a banner telling that the passwords do not match 
      setUnmatchingPasswords(true);
    } else {
      // make the request to update the user's password (this request will only take place when the user has not set their password prior to confirming their email, which can happen when they respond the form before registering):
      const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/updateuserdata/${user.id}`, { password: password1, passwordSet :true});
      updateCurrentUser(response.data);      
      navigate(`/neighborhood/${response.data.neighborhoodId[0]}`);
    }
  }

  // the following three states are meant to be used when the user has not set their password.
  // const [showRedirecting, setShowRedirecting] = useState(false);

  return (
    <div>
      {errors && (
        <Alert style={{ marginTop: "10px" }} variant='danger'>
          {errors}
        </Alert>
      )}

      {user ? (<Alert variant="success">
        <Alert.Heading>Hey! you have successfully verfified your email</Alert.Heading>
        {showRedirecting ? (
          <>
            <p>
              You can now edit your profile and add more information
            </p>
            <hr />
            <div style={{ marginTop: "35px", position: "relative", left: "50%", transform: "translate(-50%, 0)" }}>
              <h3 style={{ marginBottom: "10px" }}>Redirecting</h3>
              <Spinner animation="grow" size="sm" variant="success" />
              <Spinner animation="grow" variant="success" />
            </div>
          </>
        ) : null}

      </Alert>) : null}

      {showPasswordForm ? (<div  className = "setPasswordContainer">
        <h3 style={{ display: "block" }} id="passwordHelpBlock" muted>
          Set a password for future logins
        </h3>
        <Form.Label style={{ marginTop: "5%" }} htmlFor="inputPassword5">Password: </Form.Label>

        <Form.Control
          type="password"
          id="inputPassword5"
          aria-describedby="passwordHelpBlock"
          onChange={(e) => {
            setPassword1(e.target.value);
            setUnmatchingPasswords(false);
            setUserDataToUpdate((prevData) => ({
              ...prevData,
              password: e.target.value
            }))

          }}
        />
        <Form.Label style={{ marginTop: "5%" }} htmlFor="inputPassword5">Confirm password: </Form.Label>
        <Form.Control
          type="password"
          id="inputPassword5"
          aria-describedby="passwordHelpBlock"
          onChange={(e) => {
            setPassword2(e.target.value);
            setUnmatchingPasswords(false);
          }}
        />
        <Button style={{ width: "100%", marginTop: "15px" }} variant="primary" size="lg" onClick={() => { checkPasswordsMatch(password1, password2) }}>
          Submit
        </Button>
        {
          unmatchingPasswords ? (
            <Alert style={{ textAlign: "center", marginTop: "15px" }} variant="warning">
              Passwords do not match
            </Alert>
          ) : null
        }
      </div>) : null
      }
    </div>
  )



}

export default VerifyEmail;