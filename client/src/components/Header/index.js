import { Link } from 'react-router-dom';
import axios from "axios"
import "./header.css";
import { useNavigate } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import CartIcon from "../CartIcon/CartIcon";
import { startTransition } from "react";
import { useUserContext } from '../../contexts/UserContext';

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
    !currentuser_ && { label: "Sign Up", to: "/signup" },
    !currentuser_ && { label: "Sign In", to: "/signin" },
    { label: "Questionnaire", to: "/questionnaire", useTransition: true },
    currentuser_ && { label: "Sign Out", onClick: handleSignOut },
    { label: "Shop", to: "/shop", useTransition: true },
  ]
    .filter((linkConfig) => linkConfig)
    .map(({ label, to, onClick, useTransition }, index) => {
      if (onClick) {
        return <Nav.Link key={index} onClick={onClick}>{label}</Nav.Link>;
      } else if (useTransition) {
        // Special handling for links marked with useTransition
        return (
          <Nav.Link
            key={index}
            onClick={() => startTransition(() => navigate(to))}
            style={{ cursor: 'pointer' }} // Add cursor pointer to indicate it's clickable
          >
            {label}
          </Nav.Link>
        );
      } else {
        return <Nav.Link key={index} as={Link} to={to}>{label}</Nav.Link>;
      }
    });

  return (
    <>
      {!showHeader ? (
        <Navbar bg="dark" data-bs-theme="dark">
          <Container id="container_">
            <Navbar.Brand id="navBrand" as={Link} to="/">
              Insdr Hood
            </Navbar.Brand>
            <Nav className="me-auto">
              {links}
            </Nav>

            <CartIcon />

          </Container>
        </Navbar>
      ) : null}
    </>
  )
}

export default Header;

