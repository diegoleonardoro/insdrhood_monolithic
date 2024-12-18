import './App.css';
import 'bootstrap/dist/css/bootstrap.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React, { useState, Suspense } from "react";
import Home from "./views/Home";
import Header from "./components/Header";
import Signin from './components/Signin';
import SignUp from './components/Signup';
import VerifyEmail from './components/EmailConfirmation';
import EmailRegister from './components/EmailConfirmation';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import EmailRegisterWindow from './components/EmailRegistrationPopup';
import PasswordSetPopup from './components/PasswordSetPopup';
import PrivacyNotice from './components/Privacy';
import SingleProduct from './components/SingleProduct/SingleProduct';
import CartPage from './components/CartPage/CartPage';
import Checkout from './components/Checkout/Checkout';
import Canceled from "./components/Checkout/stripe-checkout/canceled"
import Success from "./components/Checkout/stripe-checkout/success"
import { NavigationHistoryProvider } from "./contexts/navigation-history-context"
import { useUserContext } from '../src/contexts/UserContext';
import TShirtCustomizer from './components/TshirtCustomizer/tshirtCustomizer';
import NewsLetterLanding from './components/Newsletter/newsletter';
import NewsLetterReferral from './components/Newsletter/newsLetterReferal';
import NewsLetterPreferences from './components/NewsletterPreferences/newsLetterPreferences';
import ResetPassword from './components/ResetPassword/ResetPassword';
import Complaints311 from './components/311Complaints/311complaints';
import Dashboard from './components/Dashboard/Dashboard';
import DOBApprovedPermits from './components/DOB_ApprovedPermits/DobApprovedPermits'
import Footer from './components/Footer/footer'
import NeighborhoodReport from "./components/NeighborhoodReport/neighborhoodReport"
import SearchBar from "./components/NeighborhoodSearch/NieghborhoodSearch";
import FormResponsesCount from "./components/FormResponsesCount/FormResponsesCount"
import Chat from "./components/Chat/Chat"
import EmailFooter from './components/EmailFooter/EmailFooter';
import CheckoutSuccess from './components/CheckOutLanding/CheckoutLanding';
import PasswordSetUp from './components/PasswordSetUp/PasswordSetUp';
const BlogEditor = React.lazy(() => import("./components/BlogEditor/BlogEditor"));
const Blog = React.lazy(() => import("./components/Blog/Blog"));
const FormComponent = React.lazy(() => import("./components/Forms/1"));
const Shop = React.lazy(() => import("./components/Shop/shop"));
const NeighborhoodProfile = React.lazy(() => import("./components/Neighborhood"));



function App() {

  const HeaderMemo = React.memo(Header);
  const [showEmailRegisterPopup, setShowEmailRegisterPopup] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const showEmailRegistration = () => {
    setShowEmailRegisterPopup(true)
  }
  const showPassWordForm = () => {
    setShowPasswordForm(true)
  }

  const { currentuser_ } = useUserContext();
  return (
    <Router>
      <NavigationHistoryProvider>
        <div className="App">
          <div style={{position:"absolute", top:0, left:0, right:0, bottom:0}}> 
            
            {/* {showEmailRegisterPopup && <EmailRegisterWindow setShowEmailRegisterPopup={setShowEmailRegisterPopup} />}
            {showPasswordForm && < PasswordSetPopup setShowPasswordForm={setShowPasswordForm}>
            </PasswordSetPopup >} */}
            <HeaderMemo />
            {/* {currentuser_ && (
              currentuser_.isVerified === false ? (
                <div style={{ position: "fixed", zIndex: "99999999999", bottom: "0px" }}>
                  {currentuser_.email !== null ? (
                    <Alert style={{ height: "50px", margin: "5px", boxShadow: "rgba(0, 0, 0, 0.56) 0px 22px 70px 4px" }} variant="primary">
                      <div style={{ position: "relative", top: "-9px" }}>
                        Verify Email {currentuser_.email}
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
              ) : currentuser_.passwordSet === false ? (
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
            )} */}
          </div>

          <Suspense fallback={<div>Loading...</div>}></Suspense>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/registeremail" element={<EmailRegister />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/questionnaire" element={<FormComponent />} />
            <Route path="/emailconfirmation/:emailtoken" element={<VerifyEmail />} />
            <Route path="/neighborhood/:neighborhoodid" element={<NeighborhoodProfile />} />
            <Route path="/privacy" element={<PrivacyNotice />}></Route>
            <Route path='/shop' element={<Shop />}></Route>
            <Route path='/product/:id' element={<SingleProduct />}></Route>
            {/* <Route path='/tshirtcustomizer' element={<TShirtCustomizer logoUrl={{ dark: 'https://insiderhood.s3.amazonaws.com/tshirts/logos/thenewyorker.png', white: 'https://insiderhood.s3.amazonaws.com/tshirts/logos/thenewyorkerwhite.png' }} />}></Route> */}
            <Route path='/cart' element={<CartPage />}></Route>
            <Route path='/checkout' element={<Checkout />}></Route>
            <Route path='/canceled' element={<Canceled />}></Route>
            {/* <Route path='/success' element={<Success />}></Route> */}
            <Route path='/post' element={<BlogEditor />}></Route>
            <Route path='/post/:id' element={<Blog />}></Route>
            <Route path='/newsletter' element={<NewsLetterLanding />}></Route>
            <Route path='/newsletterreferral' element={<NewsLetterReferral />}></Route>
            <Route path='/newsletterpreferences' element={<NewsLetterPreferences />}></Route>
            {/* <Route path='/311complaints' element={<Complaints311 />}></Route> */}
            {/* <Route path='/dashboard' element={<Dashboard />}></Route> */}
            {/* <Route path='/DOBApprovedPermits' element={<DOBApprovedPermits />}></Route> */}
            <Route path='/NeighborhoodReport' element={<NeighborhoodReport />}></Route>
            <Route path='/neighborhoodsearch/:neighborhood' element={<SearchBar />}></Route>
            <Route path='/FormResponsesCount' element={<FormResponsesCount />}></Route>
            <Route path='/chat' element={<Chat />}></Route>
            <Route path='/success' element={<CheckoutSuccess />}></Route>
            <Route path="/set-password/:userId" element={<PasswordSetUp />} />
            <Route path="/resetpassword/:userId" element={<ResetPassword />} />
            
          </Routes>
          <Suspense />

          {/* <EmailRegister/> */}

          {/* <EmailFooter /> */}

          {/* <Footer/> */}
        </div>
      </NavigationHistoryProvider>
    </Router>

  );

}

export default App;
