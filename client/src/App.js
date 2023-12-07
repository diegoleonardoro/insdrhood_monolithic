import './App.css';
import 'bootstrap/dist/css/bootstrap.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from "axios"
import React, { useEffect, useState, useCallback  } from "react";
import Home from "./views/Home";
import Header from "./components/Header";
import Signin from './components/Signin';
import SignUp from './components/Signup';
import VerifyEmail from './components/EmailConfirmation';
import FormComponent from './components/Forms/1';
import NeighborhoodProfile from './components/Neighborhood';
import Alert from 'react-bootstrap/Alert';
import { useLocation } from 'react-router-dom'; // Import useLocation


function App() {

  const HeaderMemo = React.memo(Header);

  const [currentuser, setCurrentUser] = useState(null);

  const hasTokenInUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('token');
  };

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
      console.log("response data", response.data);
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
      return () => clearTimeout(timer); // Clear the timeout if the component unmounts
    }
  }, [checkCurrentUser]); // checkCurrentUser is now a stable function reference


  return (
    <Router>
      <div className="App">
        <div>
           <HeaderMemo updateCurrentUser={updateCurrentUser} currentuser={currentuser} />
          {
            currentuser && currentuser.isVerified === false ? (
              <div style={{ position: "fixed", zIndex: "99999999999", width: '100%', top: "50px", left: "0" }}>
                <Alert style={{ height: "10px" }} variant="warning">
                  <div style={{ position: "relative", top: "-12px" }}>
                    Verify Email {currentuser.email}
                  </div>
                </Alert>
              </div>
            ) : null
          }
        </div>
        <Routes>
          <Route path="/" element={<Home currentuser={currentuser} updateCurrentUser={updateCurrentUser} />} />
          <Route path="/signup" element={<SignUp updateCurrentUser={updateCurrentUser} />} />
          <Route path="/signin" element={<Signin updateCurrentUser={updateCurrentUser} />} />
          <Route path="/questionnaire" element={<FormComponent updateCurrentUser={updateCurrentUser} />} />
          <Route path="/emailconfirmation/:emailtoken" element={<VerifyEmail updateCurrentUser={updateCurrentUser} />} />
          <Route path="/neighborhood/:neighborhoodid" element={<NeighborhoodProfile currentuser={currentuser} />} />
        </Routes>
      </div>
    </Router>
  );

}

export default App;
