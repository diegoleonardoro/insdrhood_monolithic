import React from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import "./header.css";

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';


// import Col from 'react-bootstrap/Col';
// import Image from 'react-bootstrap/Image';

function Header (props){
  return(
    <Navbar bg="dark" data-bs-theme="dark">
    <Container>
      <Navbar.Brand href="#home">Insdr Hood</Navbar.Brand>
      <Nav className="me-auto">
        <Nav.Link href="#home">Home</Nav.Link>
        <Nav.Link href="#features">Show your hood</Nav.Link>
        <Nav.Link href="#pricing">Pricing</Nav.Link>
      </Nav>
      <Form className="d-flex">
            <Form.Control
              type="search"
              placeholder="Search neighborhood"
              className="me-2"
              aria-label="Search neighborhood"
            />
            <Button variant="outline-success">Search</Button>
      </Form>
    </Container>
  </Navbar>
  )
}

export default Header;