import { useState, useEffect } from "react";
// import Alert from 'react-bootstrap/Alert';
// import Spinner from 'react-bootstrap/Spinner';
// import Form from 'react-bootstrap/Form';
// import Button from 'react-bootstrap/Button';
import { useParams } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import axios from "axios";


const VerifyEmail = () => {

  const { emailtoken } = useParams();
  const [errors, setErrors] = useState(null);
  const [user, setUser] = useState({})

  // make request to get the user with the emailtoken
  const makeRequest = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/emailVerification/${emailtoken}`);
    } catch (error) {
      setErrors(error.response.data.errors[0].message);
    }
  }

  useEffect(() => {
    makeRequest()

  }, [])


  // the following three states are meant to be used when the user has not set their password.
  // const [password1, setPassword1] = useState("");
  // const [password2, setPassword2] = useState("");
  // const [unmatchingPasswords, setUnmatchingPasswords] = useState(false);
  // const [showPasswordForm, setShowPasswordForm] = useState(false);
  // const [showRedirecting, setShowRedirecting] = useState(false);
  // const [userDataToUpdate, setUserDataToUpdate] = useState({
  //   id: user.id,
  //   password: "",
  //   passwordSet: true
  // })

  return (
    <div>

      {errors && (
        <Alert style={{ marginTop: "10px" }} variant='danger'>
          {errors}
        </Alert>
      )}
    </div>
  )

}

export default VerifyEmail;