import { Link } from 'react-router-dom';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import CartIcon from "../CartIcon/CartIcon";
import { startTransition } from "react";
import { useUserContext } from '../../contexts/UserContext';
import "./header.css";

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Offcanvas from 'react-bootstrap/Offcanvas';


function Header() {
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();
  const location = useLocation();
  const [showHeader, setShowHeader] = useState(true);
  const { currentuser_, setCurrentUserDirectly } = useUserContext();

  useEffect(() => {
    // Set the showHeader state based on the current route
    setShowHeader(location.pathname === '/questionnaire');
  }, [location]);

  const handleSignOut = async () => {

    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/signout`);
      // I DO NOT THIK I NEED THIS:
      // await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/currentuser`);
      await setCurrentUserDirectly(null);
      navigate('/');

    } catch (err) { console.log('error: ', err) }
  }

  const links = [
    // !currentuser_ && { label: "Sign Up", to: "/signup" },
    !currentuser_ && { label: "Sign In", to: "/signin" },
    { label: "Questionnaire", to: "/questionnaire", useTransition: true },
    currentuser_ && { label: "Sign Out", onClick: handleSignOut },
    { label: "Shop", to: "/shop", useTransition: true },
    { label: "311 Calls", to: "/311complaints", useTransition: true },
  ]
    .filter((linkConfig) => linkConfig)
    .map(({ label, to, onClick, useTransition }, index) => {
      if (onClick) {
        return <Nav.Link style={{ cursor: 'pointer', color: "white" }} key={index} onClick={onClick}>{label}</Nav.Link>;
      } else if (useTransition) {
        // Special handling for links marked with useTransition
        return (
          <Nav.Link
            key={index}
            onClick={() => startTransition(() => navigate(to))}
            style={{ cursor: 'pointer', color: "white", border: "1px solid white", margin: "3px" }} // Add cursor pointer to indicate it's clickable
          >
            {label}
          </Nav.Link>
        );
      } else {
        return <Nav.Link style={{ cursor: 'pointer', color: "white", border: "1px solid white", margin: "3px" }} key={index} as={Link} to={to}>{label}</Nav.Link>;
      }
    });

  // bg="dark" data-bs-theme="dark"
  return (
    <>
      {!showHeader ? (

        <>
        {/** nav bar for desktops */}
          <Navbar className="main_header navbar-desktop">
            <Container className="container_">

              <Navbar.Brand className="navBrand" as={Link} to="/">
                <img src="https://insiderhood.s3.amazonaws.com/assets/Insdrhood.png" alt="Logo" className="d-inline-block align-text-top" />
              </Navbar.Brand>
              <div className='menu-container'>
                <ul className="navbar-nav">
                  <li className="nav-item">
                    <a className="nav-link" href="/questionnaire">Questionnaire</a>
                  </li>
                  <li style={{ marginLeft: "20px" }} className="nav-item">
                    <a className="nav-link" href="/shop">Shop</a>
                  </li>
                  {/* <li style={{ marginLeft: "20px" }} className="nav-item">
                    <a className="nav-link" href="/311complaints">311 Calls</a>
                  </li> */}
                  <li style={{ marginLeft: "20px" }} className="nav-item">
                    <a className="nav-link" href="/neighborhoodsearch">Neighborhoods</a>
                  </li> 
                  {!currentuser_ ? (
                    <>
                      <li style={{ marginLeft: "20px" }} className="nav-item">
                        <a className="nav-link" href="/signin">Sign In</a>
                      </li>
                      <li style={{ marginLeft: "20px" }} className="nav-item create">
                        <a className="nav-link" href="/signup">Create a account</a>
                      </li>
                    </>
                  ) : (
                    <li style={{ marginLeft: "20px" }} className="nav-item">
                      <a className="nav-link" style={{ cursor: 'pointer' }} onClick={handleSignOut}>Sign Out</a>
                    </li>
                  )}

                  <CartIcon />
                </ul>
              </div>
            </Container>
          </Navbar>

          {/** nav bar for mobile screens */}
          <Navbar className="main_header navbar-mobile" key='False' expand='False' >
            <Container className="container_" fluid>

              <Navbar.Brand className="navBrand" as={Link} to="/">
                <img src="https://insiderhood.s3.amazonaws.com/assets/Insdrhood.png" alt="Logo" className="d-inline-block align-text-top" />
              </Navbar.Brand>

              <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-False`} />
              <Navbar.Offcanvas
                id={`offcanvasNavbar-expand-False`}
                aria-labelledby={`offcanvasNavbarLabel-expand-False`}
                placement="end"
              >
                <Offcanvas.Header closeButton>
                  <Offcanvas.Title id={`offcanvasNavbarLabel-expand-False`}>
                    {" "}
                  </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                  <Nav className="justify-content-end flex-grow-1 pe-3">
                    <div className='menu-container'>

                      <CartIcon/>
                      <ul className="navbar-nav">
                        <li style={{ marginLeft: "20px", marginTop:"20px" }}  className="nav-item">
                          <a className="nav-link" href="/questionnaire">Questionnaire</a>
                        </li>
                        <li style={{ marginLeft: "20px" }} className="nav-item">
                          <a className="nav-link" href="/shop">Shop</a>
                        </li>
                        <li style={{ marginLeft: "20px" }} className="nav-item">
                          <a className="nav-link" href="/311complaints">311 Calls</a>
                        </li>
                        {!currentuser_ ? (
                          <>
                            <li style={{ marginLeft: "20px" }} className="nav-item">
                              <a className="nav-link" href="/signin">Sign In</a>
                            </li>
                            <li style={{ marginLeft: "20px" }} className="nav-item create">
                              <a className="nav-link" href="/signup">Create a account</a>
                            </li>
                          </>
                        ) : (
                          <li style={{ marginLeft: "20px" }} className="nav-item">
                            <a className="nav-link" style={{ cursor: 'pointer' }} onClick={handleSignOut}>Sign Out</a>
                          </li>
                        )}
                      </ul>
                    </div>
                  </Nav>
                </Offcanvas.Body>
              </Navbar.Offcanvas>
            </Container>
          </Navbar>
        </>
      ) : null}
    </>
  )
}

export default Header;

