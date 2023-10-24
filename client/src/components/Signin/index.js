import { useState } from "react";
// import styles from "./Signin.module.css";
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';



const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const onSubmit = async (event) => {
    event.preventDefault();
    // make request to sign user in:
    
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: "center",
      alignItems: "center",
    }}
      className="signinFormContainer"
    >
      {/* <img style={{position:'relative', width:'50%'}}src="https://raw.githubusercontent.com/diegoleonardoro/multi-k8s/main/DALL%C2%B7E%202023-08-12%2021.40.56%20-%20linear%20image%20of%20historic%20nyc%20townhouse____.png"></img> */}

      <form style={{ padding: "50px", boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px" }}>

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
        <Button onClick={onSubmit} style={{ marginTop: "10px" }} variant="primary">Sign In </Button>
      </form>
    </div>
  );
};

export default Signin;