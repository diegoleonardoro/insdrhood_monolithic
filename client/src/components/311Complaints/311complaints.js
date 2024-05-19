import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import Card from "react-bootstrap/Card";
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

import Modal from 'react-bootstrap/Modal';

import "./311complaints.css";

const Complaints311 = () => {

  const [complaints, setComplaints] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [filters, setFilters] = useState({
    "IncidentZip": '',
    "Borough": '',
    "Agency": '',
    "CreatedDate": ''
  });


  const [initialLoad, setInitialLoad] = useState(true);
  const [newsletter, setNewsletter] = useState({ email: '', zipCode: '' });
  const [formVisible, setFormVisible] = useState(true); // Controls the form's visible state

  const [showNewsletterForm, setShowNewsletterForm] = useState(true)

  const handleNewsletterChange = (event) => {
    const { name, value } = event.target;
    setNewsletter(prev => ({ ...prev, [name]: value }));
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    // Implement the newsletter signup logic here, possibly calling an API
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/newsletter/signup`,
        newsletter);

      setShowNewsletterForm(false);

    } catch (error) {

    }



  };

  const toggleForm = () => {
    setFormVisible(!formVisible);
  };


  const fetchComplaints = async (reset = false, applyFilters = false) => {
    setLoading(true);

    // Define parameters based on whether filters are applied
    const params = applyFilters ? filters : { limit: 10, page };

    try {
      const response = await axios.get(`${process.env.REACT_APP_NYC_DATA_BACKEND_URL}/311calls`, {
        params: params
      });

      if (response.data.length > 0) {
        if (reset) {
          setComplaints(response.data);
        } else {
          setComplaints(prev => [...prev, ...response.data]);
        }
        setPage(prevPage => prevPage + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setInitialLoad(false);
    fetchComplaints(true, true);
  };

  useEffect(() => {
    if (initialLoad) {
      fetchComplaints(true, false);
    }
  }, [initialLoad]);


  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    if (name === 'IncidentZip') {
      // Reset the borough to the default value when zip code changes
      setFilters(prevFilters => ({
        ...prevFilters,
        [name]: value,
        Borough: ''
      }));
    } else if (name === 'Borough') {
      // Reset the zip code to the default value when borough changes
      setFilters(prevFilters => ({
        ...prevFilters,
        [name]: value,
        IncidentZip: ''
      }));
    } else {
      // For other fields, just update them as before
      setFilters(prevFilters => ({
        ...prevFilters,
        [name]: value
      }));
    }
  };

  function formatDate(dateStr) {
    const months = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];

    const date = new Date(dateStr);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Adding ordinal suffix to day
    let suffix = 'th';
    const exceptions = [1, 21, 31];
    if (exceptions.includes(day)) {
      suffix = 'st';
    } else if ([2, 22].includes(day)) {
      suffix = 'nd';
    } else if ([3, 23].includes(day)) {
      suffix = 'rd';
    }

    // Formatting time in 12-hour format
    const timePeriod = hours >= 12 ? 'PM' : 'AM';
    const formattedHour = ((hours + 11) % 12 + 1); // converts 24h to 12h format and handles midnight case
    const formattedMinute = minutes < 10 ? `0${minutes}` : minutes;

    return `${month} ${day}${suffix} at ${formattedHour}:${formattedMinute} ${timePeriod}`;
  }

  function titleCase(string) {
    return string.toLowerCase().split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: "100vh" }}>

      <Form onSubmit={handleFilterSubmit} style={{ width: '85%', maxWidth: '400px', margin: '40px' }}>
        <Form.Group controlId="formZip">
          <Form.Label>Incident Zip:</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter zip"
            name="IncidentZip"
            value={filters.IncidentZip}
            onChange={handleFilterChange}
            style={{ backgroundColor: "transparent", border: "1px solid  #5f5e5e" }}
          />
        </Form.Group>
        <Form.Group controlId="formBorough">
          <Form.Label>Borough:</Form.Label>
          <Form.Control
            as="select"
            name="Borough"
            value={filters.Borough}
            onChange={handleFilterChange}
            style={{ backgroundColor: "transparent", border: "1px solid  #5f5e5e", cursor: "pointer" }}
          >
            <option value="">All Boroughs</option>
            <option value="BRONX">Bronx</option>
            <option value="BROOKLYN">Brooklyn</option>
            <option value="QUEENS">Queens</option>
            <option value="MANHATTAN">Manhattan</option>
            <option value="STATEN ISLAND">Staten Island</option>
          </Form.Control>
        </Form.Group>
        {/* <Form.Group controlId="formAgency">
            <Form.Label>Agency</Form.Label>
            <Form.Control
              as="select"
              name="Agency"
              value={filters.Agency}
              onChange={handleFilterChange}
            >
              <option value="">Show All</option>
              <option value="NYPD">NYPD - New York Police Department</option>
              <option value="DOT">DOT - Department of Transportation</option>
              <option value="DHS">DHS - Department of Homeless Services</option>
              <option value="DOHMH">DOHMH - Department of Health and Mental Hygiene</option>
              <option value="HPD">HPD - Housing Preservation and Development</option>
              <option value="DPR">DPR - Department of Parks and Recreation</option>
              <option value="DSNY">DSNY - Department of Sanitation</option>
              <option value="DCWP">DCWP - Department of Consumer and Worker Protection</option>
              <option value="TLC">TLC - Taxi and Limousine Commission</option>
              <option value="EDC">EDC - Economic Development Corporation</option>
              <option value="DEP">DEP - Department of Environmental Protection</option>
            </Form.Control>
          </Form.Group> */}
        {/* <Form.Group controlId="formDate">
          <Form.Label>Created Date</Form.Label>
          <Form.Control
            type="date"
            name="CreatedDate"
            value={filters.CreatedDate}
            onChange={handleFilterChange}
          />
        </Form.Group> */}
        <Button className="filter311button" style={{ marginTop: "20px", width: "100%", backgroundColor: "rgba(255, 151, 5, 0.221)", color: "black" }} type="submit" variant="dark">Apply Filters</Button>
      </Form>

      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', backgroundColor: "#F4E1D2" }}>
        {complaints.map((complaint, index) => (
          <Card className="Cards311" style={{ width: '18rem', margin: "20px" }} key={index}>
            <ListGroup className="list-group-flush Cards_Group">
              <Card.Header className="Cards_Group_1" as="h5">{titleCase(complaint['Borough'])}, {complaint['Incident Zip']}</Card.Header>
              <ListGroup.Item className="Cards_Group_2"> {complaint['Descriptor']}. {complaint['Complaint Type']} </ListGroup.Item>
              <ListGroup.Item className="Cards_Group_3" > <span style={{ fontWeight: "bold" }} >Address: </span>{titleCase(complaint['Incident Address'])}</ListGroup.Item>
              <ListGroup.Item className="Cards_Group_4" ><span style={{ fontWeight: "bold" }}>Issued: </span>{formatDate(complaint['Created Date'])}</ListGroup.Item>
              <ListGroup.Item className="Cards_Group_5"><span style={{ fontWeight: "bold" }} >Responding agency: </span>{complaint['Agency']}</ListGroup.Item>
            </ListGroup>
          </Card>
        ))}
        {loading && <div>
          <Spinner animation="grow" size="sm" className="spinner spinner1" />
          <Spinner animation="grow" className="spinner spinner2" />
          <Spinner animation="grow" style={{ height: "50px", width: "50px" }} className="spinner spinner3" />
        </div>}
        {!hasMore && <div>No more complaints to show.</div>}
        {hasMore && !loading && <Button style={{ padding: "15px", alignSelf: "center" }} variant="dark" onClick={() => fetchComplaints()}>Load More</Button>}

      </div>


      {/* Sticky signup form at the bottom */}

      {showNewsletterForm && (
        <div className={`newsletter-form ${formVisible ? 'expanded' : 'collapsed'}`} style={{ transition: 'height 0.3s ease-in-out', padding: "2px" }}>
          <div style={{padding:"15px", paddingBottom:"30px"}}>
            <p className='p_signup311Complaints'>Register for 311 Updates in your Zipcode:</p>
            <Form className="signup311Complaints" onSubmit={handleNewsletterSubmit} style={{ display: 'flex', alignItems: 'center' }}>
              {formVisible ? (
                <>

                  <Form.Group className="emailcomplaintsnewsletter" style={{ width: '90%' }}>
                    <Form.Control className='input311Form' type="email" name="email" placeholder="Enter email" value={newsletter.email} onChange={handleNewsletterChange} required />
                  </Form.Group>
                  <Form.Group style={{ width: '90%' }}>
                    <Form.Control className='input311Form' type="text" name="zipCode" placeholder="Zip Code" value={newsletter.zipCode} onChange={handleNewsletterChange} required />
                  </Form.Group>
                  <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', paddingLeft: '10px' }}>
                    <Button style={{ width: "65%", height: "30px", backgroundColor: "#ffc107", color: "black", borderColor: "black", fontSize: "12px" }} type="submit" variant="primary">Register</Button>
                    <Button style={{ width: "35%", height: "30px", alignSelf: "center", fontSize: "10px" }} variant="outline-secondary" onClick={toggleForm}>Close</Button>
                  </div>
                </>
              ) : (
                <Button className="show311Form"variant="outline-secondary" onClick={toggleForm} style={{ width: '100%', marginBottom:"10px", height:"25px" }}>Sign Up for Updates</Button>
              )}
            </Form>
          </div>
        </div>

      )}


    </div>
  );



};

export default Complaints311;

