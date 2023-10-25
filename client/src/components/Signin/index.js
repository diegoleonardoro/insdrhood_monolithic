import { useState } from "react";
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import "./signin.css";
import axios from "axios";


const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  async function saveUserData() {

    try {
      const response = await axios.post('http://localhost:4000/api/signin',
        { email, password });

      console.log("resss", response);

      return response
    } catch (error) {
      console.log('errrroorrrr',error)
      return error
    }

  }


  const onSubmit = async (event) => {
    event.preventDefault();
    // make request to sign user in:
    await saveUserData();
  };


  return (
    <div className="signinFormContainer">
      {/* <img style={{position:'relative', width:'50%'}}src="https://raw.githubusercontent.com/diegoleonardoro/multi-k8s/main/DALL%C2%B7E%202023-08-12%2021.40.56%20-%20linear%20image%20of%20historic%20nyc%20townhouse____.png"></img> */}

      <form className="signinform" >

        <FloatingLabel controlId="floatingInput" label="Email address" className="mb-3" >
          <Form.Control
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FloatingLabel>

        <FloatingLabel controlId="floatingPassword" label="Password">
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FloatingLabel>
        <Button className="signinbutton" onClick={onSubmit} variant="secondary">Sign In </Button>
      </form>
    </div>
  );
};

export default Signin;