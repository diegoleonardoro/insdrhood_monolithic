import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import Card from "react-bootstrap/Card";
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Form onSubmit={handleFilterSubmit} style={{ width: '100%', maxWidth: '500px', margin: '20px' }}>
        <Form.Group controlId="formZip">
          <Form.Label>Incident Zip</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter zip"
            name="IncidentZip"
            value={filters.IncidentZip}
            onChange={handleFilterChange}
          />
        </Form.Group>
        <Form.Group controlId="formBorough">
          <Form.Label>Borough</Form.Label>
          <Form.Control
            as="select"
            name="Borough"
            value={filters.Borough}
            onChange={handleFilterChange}
          >
            <option value="">Select Borough</option>
            <option value="BRONX">Bronx</option>
            <option value="BROOKLYN">Brooklyn</option>
            <option value="QUEENS">Queens</option>
            <option value="MANHATTAN">Manhattan</option>
            <option value="STATEN ISLAND">Staten Island</option>
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="formAgency">
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
        </Form.Group>
        {/* <Form.Group controlId="formDate">
          <Form.Label>Created Date</Form.Label>
          <Form.Control
            type="date"
            name="CreatedDate"
            value={filters.CreatedDate}
            onChange={handleFilterChange}
          />
        </Form.Group> */}
        <Button style={{ marginTop: "20px", width: "100%" }} type="submit" variant="dark">Apply Filters</Button>
      </Form>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        {complaints.map((complaint, index) => (
          <Card style={{ width: '18rem', margin: "20px" }} key={index}>
            <ListGroup className="list-group-flush">
              <Card.Header as="h5">{complaint['Descriptor']}. {complaint['Complaint Type']}</Card.Header>
              <ListGroup.Item>{titleCase(complaint['Borough'])}, {complaint['Incident Zip']} </ListGroup.Item>
              <ListGroup.Item><span style={{ fontWeight: "bold" }}>Issued: </span>{formatDate(complaint['Created Date'])}</ListGroup.Item>

              <ListGroup.Item> <span style={{ fontWeight: "bold" }} >Address: </span>{titleCase(complaint['Incident Address'])}</ListGroup.Item>
              <ListGroup.Item><span style={{ fontWeight: "bold" }} >Responding agency: </span>{complaint['Agency']}</ListGroup.Item>
            </ListGroup>
          </Card>
        ))}
      </div>
      {loading && <div>Loading more complaints...</div>}
      {!hasMore && <div>No more complaints to show.</div>}
      {hasMore && !loading && <Button style={{ margin: "20px", padding: "15px" }} variant="dark" onClick={() => fetchComplaints()}>Load More</Button>}
    </div>
  );



};

export default Complaints311;

