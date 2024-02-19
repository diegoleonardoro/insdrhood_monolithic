import React, { useState, useEffect } from 'react';
// import axios from 'axios';
import './home.css';
import Table from 'react-bootstrap/Table';
import axios from "axios";
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom";
import Spinner from 'react-bootstrap/Spinner';
import Card from "react-bootstrap/Card";
import Button from 'react-bootstrap/Button';




function Home({ currentuser, updateCurrentUser }) {

  const navigate = useNavigate();
  const [neighborhoodsData, setNeighborhoodsData] = useState([]);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBorough, setSelectedBorough] = useState('All');


  // Handle change in search input
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  // Handle change in borough selection
  const handleBoroughChange = (event) => {
    setSelectedBorough(event.target.value);
  };

  // Filter neighborhoodsData based on searchTerm and selectedBorough
  const filteredNeighborhoods = neighborhoodsData.filter((neighborhood) => {
    return (
      neighborhood.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedBorough === 'All' || neighborhood.borough === selectedBorough)
    );
  });

  const neighborhoodCards = filteredNeighborhoods.map((neighborhood) => {
    { console.log(neighborhood) }

    return (
      <Card className ="neighborhoodCard"  key={neighborhood._id}>
        <Card.Header as="h5">{neighborhood.neighborhood}{", "} {neighborhood.borough}</Card.Header>
        <Card.Body>
          <blockquote className="blockquote mb-0">
            <p>
              {' '}
              {neighborhood.neighborhoodDescription}
              {' '}
            </p>
            <footer className="blockquote-footer">
              {neighborhood.user.name != "" ? neighborhood.user.name : "Anonymous"}
            </footer>
          </blockquote>
        </Card.Body>

        <Link to={`/neighborhood/${neighborhood._id}`} style={{ textDecoration: 'none' }}>
          <Button style={{ margin: "20px", borderRadius: "0" }} variant="primary">Learn More</Button>
        </Link>
      </Card>
    );

  })

  useEffect(() => {
    // Extract the token from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      const logUserWithToken = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/emailVerification/${token}`,
            {
              withCredentials: true
            });
          // setUser(response.data);
          updateCurrentUser(response.data);
          // Extract the current URL search parameters
          const urlParams = new URLSearchParams(window.location.search);
          // Create the new URL, preserving the existing parameters
          const newUrl = `/?${urlParams.toString()}`;
          // Navigate to the new URL
          navigate(newUrl, { replace: true });
        } catch (error) {
          // Handle error here
        }
      };
      logUserWithToken();
    } else {

      const checkCurrentUser = async () => {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/currentuser`, { withCredentials: true });
        updateCurrentUser(response.data);
      }
      checkCurrentUser()
    }

    (async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/neighborhoods`);

        setNeighborhoodsData(response.data);

      } catch (error) {
        console.error("Failed to fetch neighborhoods", error);
        // Handle the error state appropriately here
      } finally {
        setIsLoading(false); // Stop loading
      }
    })();

  }, []);

  if (isLoading) {
    return (
      <div>
        <Spinner style={{ position: "relative", height: "100px", width: "100px", top: "50px" }} animation="grow" />
        Loading...
      </div>
    )
  }

  return (
    <div style={{ width: '90%', margin: '60px auto auto auto' }}>
      { /**  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '90%', margin: '60px auto auto auto', }} */}
      <div className='filterInputsContainer'>
        <input
          type="text"
          placeholder="Search by neighborhood..."
          value={searchTerm}
          onChange={handleSearchChange}
          className='searchByNhoodInput'
        />
        <div className="dropdownFilterByBorough">
          <select value={selectedBorough} onChange={handleBoroughChange} className='boroughSelect' id="boroughSelect">
            <option value="All">All Boroughs</option>
            <option value="Manhattan">Manhattan</option>
            <option value="Brooklyn">Brooklyn</option>
            <option value="Queens">Queens</option>
            <option value="The Bronx">The Bronx</option>
            <option value="Staten Island">Staten Island</option>
          </select>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
        {neighborhoodCards}
      </div>
    </div>
  );

}

export default Home;

{/* 

  // Map the filtered neighborhoods to table rows
  const neighborhoodsList = filteredNeighborhoods.map((neighborhood) => {
    return (
      <tr key={neighborhood._id}>
        <td data-label="Neighborhood">{neighborhood.neighborhood}</td>
        <td data-label="Borough">{neighborhood.borough}</td>
        <td data-label="Description">"{neighborhood.neighborhoodDescription}" {neighborhood.user ? <p>{"- " + neighborhood.user.name + `, resident of ${neighborhood.neighborhood}`}</p> : null}</td>
        <td data-label="Learn more">
          <Link to={`/neighborhood/${neighborhood._id}`}>
            Learn more
          </Link>
        </td>
      </tr>
    );
  });

<Table striped bordered hover size="sm" className="nhoodsTable" style={{ marginTop: "0" }} >
        <thead>
          <tr>
            <th >Neighborhood</th>
            <th >Borough</th>
            <th >Description</th>
            <th>Learn more</th>
          </tr>
        </thead>
        {<tbody>{neighborhoodsList}</tbody>}
</Table> */}
