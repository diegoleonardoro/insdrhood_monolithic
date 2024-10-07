import { useState } from "react";
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import "./signin.css";
import axios from "axios";
import Alert from 'react-bootstrap/Alert';
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../contexts/UserContext";

const Signin = () => {

  axios.defaults.withCredentials = true;
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState(null);
  const { currentuser_, setCurrentUserDirectly } = useUserContext();
  async function sendUserCredentials() {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/signin`,
        { email, password });
      await setCurrentUserDirectly(response.data);
      navigate(`/`);
      return;
    } catch (error) {
      if (error.response.data.errors[0].message) {
        setErrors(error.response.data.errors[0].message);
      }
    }
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    // make request to sign user in:
    await sendUserCredentials();
  };

  return (
    <div className="signinFormContainer">

      <form className="signinform" >
        <FloatingLabel controlId="floatingInput" label="Email address" className="mb-3" >
          <Form.Control
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors(null) }}
          />
        </FloatingLabel>

        <FloatingLabel controlId="floatingPassword" label="Password">
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors(null) }}
          />
        </FloatingLabel>
        <Button className="signinbutton" onClick={onSubmit} variant="secondary">Sign In </Button>
        {errors && (
          <Alert style={{ marginTop: "10px" }} variant='danger'>
            {errors}
          </Alert>
        )}
      </form>

    </div>
  );
};

export default Signin;