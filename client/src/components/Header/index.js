import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import {Link} from 'react-router-dom';

import "./header.css";

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';



// import Col from 'react-bootstrap/Col';
// import Image from 'react-bootstrap/Image';

function Header({ currentuser }) {

  const links = [
    !currentuser && { label: "Sign Up", to: "/auth/signup" },
    !currentuser && { label: "Sign In", to: "/auth/signin" },
    currentuser && { label: "Questionnaire", to: "/auth/questionnainre" },
    currentuser && { label: "Sign Out", to: "/auth/signin" },
  ]
    .filter((linkConfig) => linkConfig)
    .map(({ label, to }, index) => {
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
          {/* <Nav.Link as={Link} to="/">Home</Nav.Link>
          <Nav.Link as={Link} to="/signup">Sign up</Nav.Link>
          <Nav.Link as={Link} to="/signin">Sign in</Nav.Link>
          <Nav.Link as={Link} to="/questionnaire">Show your hood</Nav.Link> */}
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