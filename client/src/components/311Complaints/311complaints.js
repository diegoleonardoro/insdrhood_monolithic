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

  //filters:
  const [filters, setFilters] = useState({
    "IncidentZip": '',
    "Borough": '',
    "Agency": '',
    "CreatedDate": ''
  });

  const fetchComplaints = async (reset = false) => {
    // if (!loading && hasMore) {
    setLoading(true);

    const params = new URLSearchParams({
      ...filters,
      page,
      limit: 5
    });
    console.log("filters", filters)
    console.log("paramss", params.toString())
    console.log("url", `${process.env.REACT_APP_NYC_DATA_BACKEND_URL}/311calls?${params}`)
    // const response = await axios.get(`${process.env.REACT_APP_NYC_DATA_BACKEND_URL}/311calls?${params}`);
    const response = await axios.get(`${process.env.REACT_APP_NYC_DATA_BACKEND_URL}/311calls`, { params: { ...filters, page, limit: 5 } });

    console.log("responseeee", response)
    if (response.data.length > 0) {
      setComplaints(prevComplaints => reset ? [...response.data] : [...prevComplaints, ...response.data]);
      setPage(prevPage => prevPage + 1);
    } else {
      setHasMore(false);
    }
    setLoading(false);

    // }
  };

  // Handler for changing filters
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchComplaints(true);
  };

  useEffect(() => {
    fetchComplaints(true);
  }, []);



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
            <option value="Brooklyn">Brooklyn</option>
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
              <ListGroup.Item>{complaint['Created Date']}</ListGroup.Item>
              <ListGroup.Item>{complaint['Incident Address']}, {complaint['Incident Zip']}, {complaint['Borough']}</ListGroup.Item>
              <ListGroup.Item>Responding agency: {complaint['Agency']}</ListGroup.Item>
            </ListGroup>
          </Card>
        ))}
      </div>
      {loading && <div>Loading more complaints...</div>}
      {!hasMore && <div>No more complaints to show.</div>}
      {hasMore && !loading && <Button style={{ margin: "20px", padding:"15px"}}variant="dark" onClick={() => fetchComplaints()}>Load More</Button>}
    </div>
  );

};

export default Complaints311;

