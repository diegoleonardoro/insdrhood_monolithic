import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Link } from 'react-router-dom';
import axios from "axios"
import "./header.css";
import { useNavigate } from "react-router-dom";

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';



// import Col from 'react-bootstrap/Col';
// import Image from 'react-bootstrap/Image';

function Header({ updateCurrentUser, currentuser }) {
  
  axios.defaults.withCredentials = true;

  const navigate = useNavigate();

  const handleSignOut = async () => {
    //${process.env.BACKEND_URL}
    try {
      await axios.post(`${process.env.BACKEND_URL}/api/signout`);
      await axios.get(`${process.env.BACKEND_URL}/api/currentuser`);
      await updateCurrentUser(null);
      navigate('/');

    } catch (err) { console.log('error: ', err) }
  }

  const links = [
    !currentuser && { label: "Sign Up", to: "/signup" },
    !currentuser && { label: "Sign In", to: "/signin" },
    { label: "questionnaire", to: "/questionnaire" },
    currentuser && { label: "Sign Out", onClick: handleSignOut },
  ]
    .filter((linkConfig) => linkConfig)
    .map(({ label, to, onClick }, index) => {

      if (onClick) {
        return <Nav.Link key={index} onClick={onClick}>{label}</Nav.Link>
      }
      return (
        <Nav.Link key={index} as={Link} to={to}>{label}</Nav.Link>
      );
    });

  return (
    <Navbar bg="dark" data-bs-theme="dark">
      <Container>
        <Navbar.Brand as={Link} to="/">Insdr Hood</Navbar.Brand>
        <Nav className="me-auto">
          {links}
        </Nav>
        <Form className="d-flex">
          <Form.Control
            type="search"
            placeholder="Search neighborhood"
            className="me-2"
            aria-label="Search neighborhood"
          />
          <Button variant="outline-warning">Search</Button>
        </Form>
      </Container>
    </Navbar>
  )
}

export default Header;