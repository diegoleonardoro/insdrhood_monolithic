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
import NeighborhoodProfile from './components/Neighborhood';
import EmailRegister from './components/EmailConfirmation';
import Alert from 'react-bootstrap/Alert';
import { useLocation } from 'react-router-dom'; // Import useLocation
import { UserProvider } from './contexts/UserContext';
import Button from 'react-bootstrap/Button';
import EmailRegisterWindow from './components/EmailRegistrationPopup'



function App() {

  const HeaderMemo = React.memo(Header);
  const [currentuser, setCurrentUser] = useState(null);

  const [showEmailRegisterPopup, setShowEmailRegisterPopup] = useState(false);


  const hasTokenInUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('token');
  };
  

  const showEmailRegistration = () => {
    setShowEmailRegisterPopup(true)
  }

  const updateCurrentUser = useCallback((data) => {
    return new Promise((resolve, reject) => {
      if (data !== undefined) {
        setCurrentUser(data);
        resolve();
      } else {
        reject(new Error('No user data provided.'));
      }
    });
  }, []);

  // Memoize checkCurrentUser so it's not recreated on every render
  const checkCurrentUser = useCallback(async () => {
    try {
      // I want to make the following request only when there is not a token in the url:
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/currentuser`, { withCredentials: true });

      updateCurrentUser(response.data);

    } catch (error) {
      // Handle the error appropriately
      console.error('Failed to check current user:', error);
    }

  }, [updateCurrentUser]); // updateCurrentUser is a dependency

  useEffect(() => {
    if (!hasTokenInUrl() && currentuser === null) {
      const timer = setTimeout(() => {
        checkCurrentUser();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []); // checkCurrentUser  is now a stable function reference

  return (
    <UserProvider>
      <Router>
        <div className="App">

          <div>
            {showEmailRegisterPopup && <EmailRegisterWindow updateCurrentUser={updateCurrentUser} currentuser={currentuser} setShowEmailRegisterPopup={setShowEmailRegisterPopup} />}

            <HeaderMemo updateCurrentUser={updateCurrentUser} currentuser={currentuser} />
            {
              currentuser && currentuser.isVerified === false ? (
                <div style={{ position: "fixed", zIndex: "99999999999", bottom: "0px" }}>

                  {currentuser.email !== "" ? (
                    <Alert style={{ height: "50px", margin: "5px", boxShadow: "rgba(0, 0, 0, 0.56) 0px 22px 70px 4px" }} variant="primary">
                      <div style={{ position: "relative", top: "-9px" }}>
                        Verify Email {currentuser.email}
                      </div>
                    </Alert>

                  ) : (
                    <div>

                      <Alert onClick={showEmailRegistration} style={{ height: "50px", margin: "5px", boxShadow: "rgba(0, 0, 0, 0.56) 0px 22px 70px 4px", cursor: "pointer" }} variant="danger">
                        <div style={{ position: "relative", top: "-5px" }}>
                          <div>
                            Register for future edits
                          </div>
                        </div>
                      </Alert>
                    </div>
                  )}

                </div>
              ) : null
            }


          </div>


          <Routes>
            <Route path="/" element={<Home currentuser={currentuser} updateCurrentUser={updateCurrentUser} />} />
            <Route path="/signup" element={<SignUp updateCurrentUser={updateCurrentUser} />} />

            <Route path="/registeremail" element={<EmailRegister updateCurrentUser={updateCurrentUser} />} />

            <Route path="/signin" element={<Signin updateCurrentUser={updateCurrentUser} />} />
            <Route path="/questionnaire" element={<FormComponent updateCurrentUser={updateCurrentUser} />} />
            <Route path="/emailconfirmation/:emailtoken" element={<VerifyEmail updateCurrentUser={updateCurrentUser} />} />
            <Route path="/neighborhood/:neighborhoodid" element={<NeighborhoodProfile />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );

}

export default App;
