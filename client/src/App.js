import './App.css';
import 'bootstrap/dist/css/bootstrap.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from "axios"
import React, { useEffect, useState, useCallback } from "react";
import Home from "./views/Home";
import Header from "./components/Header";
import Signin from './components/Signin';
import SignUp from './components/Signup';
import VerifyEmail from './components/EmailConfirmation';
import FormComponent from './components/Forms/1';
import Alert from 'react-bootstrap/Alert';


function App() {

  const HeaderMemo = React.memo(Header);

  const [currentuser, setCurrentUser] = useState(null);

  const updateCurrentUser = (data) => {
    return new Promise((resolve, reject) => {
      if (data !== undefined) {
        setCurrentUser(data);
        resolve()
      } else {
        reject(new Error('No user data provided.'))
      }
    })
  };

  const checkCurrentUser = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/currentuser', { withCredentials: true });
      // setCurrentUser(response.data);
      updateCurrentUser(response.data)
    } catch (error) {
    }
  }

  useEffect(() => {
    if (currentuser === null) {
      setTimeout(() => {
         checkCurrentUser()
      }, 1000);
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <div>
          <HeaderMemo updateCurrentUser={updateCurrentUser} currentuser={currentuser} />
          {
            currentuser && currentuser.isVerified === false ? (
              <div style={{ position: "fixed", zIndex: "99999999999", width: '100%', top: "50px", left: "0"}}>
                <Alert style={{ height: "10px" }} variant="warning">
                  <div style={{position:"relative", top:"-12px"}}>
                    Verify Email {currentuser.email}
                  </div>
                </Alert>
              </div>
            ) : null
          }
        </div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp updateCurrentUser={updateCurrentUser} />} />
          <Route path="/signin" element={<Signin updateCurrentUser={updateCurrentUser} />} />
          <Route path="/questionnaire" element={<FormComponent updateCurrentUser={updateCurrentUser} />} />
          <Route path="/emailconfimation/:emailtoken" element={<VerifyEmail updateCurrentUser={updateCurrentUser} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
