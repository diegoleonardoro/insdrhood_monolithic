import './App.css';
import 'bootstrap/dist/css/bootstrap.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from "axios"
import React, { useEffect, useState, useCallback, Suspense, startTransition } from "react";
import Home from "./views/Home";
import Header from "./components/Header";
import Signin from './components/Signin';
import SignUp from './components/Signup';
import VerifyEmail from './components/EmailConfirmation';
import EmailRegister from './components/EmailConfirmation';
import Alert from 'react-bootstrap/Alert';
import { UserProvider } from './contexts/UserContext';
import Button from 'react-bootstrap/Button';
import EmailRegisterWindow from './components/EmailRegistrationPopup';
import PasswordSetPopup from './components/PasswordSetPopup';
import PrivacyNotice from './components/Privacy';
import SingleProduct from './components/SingleProduct/SingleProduct';
import CartPage from './components/CartPage/CartPage';
import Checkout from './components/Checkout/Checkout';
import { useUser } from "../src/contexts/UserContext";
import { useLocation } from 'react-router-dom';
import Canceled from "./components/Checkout/stripe-checkout/canceled"
import Success from "./components/Checkout/stripe-checkout/success"
import { NavigationHistoryProvider } from "./contexts/navigation-history-context"

const BlogEditor = React.lazy(() => import("./components/BlogEditor/BlogEditor"));
const Blog = React.lazy(() => import("./components/Blog/Blog"));
const FormComponent = React.lazy(() => import("./components/Forms/1"));
const Shop = React.lazy(() => import("./components/Shop/shop"));
const NeighborhoodProfile = React.lazy(() => import("./components/Neighborhood"));


function App() {

  const HeaderMemo = React.memo(Header);
  const [currentuser, setCurrentUser] = useState(null);
  const [showEmailRegisterPopup, setShowEmailRegisterPopup] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const hasTokenInUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('token');
  };

  const showEmailRegistration = () => {
    setShowEmailRegisterPopup(true)
  }

  const showPassWordForm = () => {
    setShowPasswordForm(true)
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
  }, [currentuser]);

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
        <NavigationHistoryProvider>
          <div className="App">
            <div>
              {showEmailRegisterPopup && <EmailRegisterWindow updateCurrentUser={updateCurrentUser} currentuser={currentuser} setShowEmailRegisterPopup={setShowEmailRegisterPopup} />}
              {showPasswordForm && < PasswordSetPopup
                updateCurrentUser={updateCurrentUser}
                currentuser={currentuser} setShowPasswordForm={setShowPasswordForm}>
              </PasswordSetPopup >}
              <HeaderMemo updateCurrentUser={updateCurrentUser} currentuser={currentuser} />
              {currentuser && (
                currentuser.isVerified === false ? (
                  <div style={{ position: "fixed", zIndex: "99999999999", bottom: "0px" }}>
                    {currentuser.email !== null ? (
                      <Alert style={{ height: "50px", margin: "5px", boxShadow: "rgba(0, 0, 0, 0.56) 0px 22px 70px 4px" }} variant="primary">
                        <div style={{ position: "relative", top: "-9px" }}>
                          Verify Email {currentuser.email}
                        </div>
                      </Alert>
                    ) : (
                      <div>
                        <Button onClick={showEmailRegistration} style={{ height: "50px", margin: "5px", boxShadow: "rgba(0, 0, 0, 0.56) 0px 22px 70px 4px", cursor: "pointer" }} variant="primary">
                          Register for future edits
                        </Button>
                      </div>
                    )}
                  </div>
                ) : currentuser.passwordSet === false ? (
                  // Something else to render if passwordSer is false
                  <div style={{ position: "fixed", zIndex: "99999999999", bottom: "0px" }}>
                    <Button onClick={showPassWordForm} style={{ height: "50px", margin: "5px", boxShadow: "rgba(0, 0, 0, 0.56) 0px 22px 70px 4px", cursor: "pointer" }} variant="primary">
                      <div>
                        Set password
                      </div>
                      <hr></hr>
                      <div style={{ fontSize: '10px' }}>
                        Passwords are hashed and encrypted.
                      </div>
                    </Button>
                  </div>
                ) : null
              )}
            </div>

            <Suspense fallback={<div>Loading...</div>}></Suspense>
            <Routes>
              <Route path="/" element={<Home currentuser={currentuser} updateCurrentUser={updateCurrentUser} />} />
              <Route path="/signup" element={<SignUp updateCurrentUser={updateCurrentUser} />} />
              <Route path="/registeremail" element={<EmailRegister updateCurrentUser={updateCurrentUser} />} />
              <Route path="/signin" element={<Signin updateCurrentUser={updateCurrentUser} />} />
              <Route path="/questionnaire" element={<FormComponent updateCurrentUser={updateCurrentUser} />} />
              <Route path="/emailconfirmation/:emailtoken" element={<VerifyEmail updateCurrentUser={updateCurrentUser} />} />
              <Route path="/neighborhood/:neighborhoodid" element={<NeighborhoodProfile currentuserProp={currentuser} updateCurrentUser={updateCurrentUser} />} />
              <Route path="/privacy" element={<PrivacyNotice />}></Route>
              <Route path='/shop' element={<Shop />}></Route>
              <Route path='/product/:id' element={<SingleProduct />}></Route>
              <Route path='/cart' element={<CartPage />}></Route>
              <Route path='/checkout' element={<Checkout />}></Route>
              <Route path='/canceled' element={<Canceled />}></Route>
              <Route path='/success' element={<Success />}></Route>
              <Route path='/post' element={<BlogEditor />}></Route>
              <Route path='/post/:id' element={<Blog />}></Route>
            </Routes>
            <Suspense />


          </div>
        </NavigationHistoryProvider>
      </Router>
    </UserProvider>
  );

}

export default App;
