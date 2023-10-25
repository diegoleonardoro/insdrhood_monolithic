import { useState } from "react";
import axios from "axios";

import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

const SignUp = () => {

  const [errors, setErrors] = useState(null);
  const [imageFile, setImageFile] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    image: "",
    formsResponded: 0
  });

  async function saveUserData() {
    try {
      const response = await axios.post('http://localhost:4000/api/signin',
        { formData });
      return response
    } catch (error) {
      setErrors(error.response.data.errors[0].message);
      // return error
    }
  }


  const onSubmit = async (event) => {
    event.preventDefault();
    // make request to sign user in:
    await saveUserData();
  };

  return (

    <div
      style={{
        display: 'flex',
        justifyContent: "center",
        alignItems: "center",
        height: "70vh"
      }}

      className="signupFormContainer"
    >

      <form style={{ padding: "50px", border:"1px solid #f2eeee", borderRadius:"15px" }}>

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
            }}
          />
        </FloatingLabel>


        <FloatingLabel controlId="floatingInput" label="Create a password" className="mb-3" >
          <Form.Control
            type="password"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
            }}
          />
        </FloatingLabel>


        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label>Choose profile picture</Form.Label>
          <Form.Control
            onChange={(e) => {
              setImageFile(e.target.files[0]);
            }}
            type="file" />
        </Form.Group>

        <Button onClick={onSubmit} style={{ marginTop: "10px" }} variant="primary">Sign Up </Button>

      </form>
    </div>

  )


}

export default SignUp;