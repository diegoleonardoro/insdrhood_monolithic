import React, { useState, useEffect } from 'react';
// import axios from 'axios';
import './home.css';
import Table from 'react-bootstrap/Table';
import axios from "axios";
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom";
import Spinner from 'react-bootstrap/Spinner';


function Home({ currentuser, updateCurrentUser }) {

  const navigate = useNavigate();
  const [neighborhoodsData, setNeighborhoodsData] = useState([]);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Handle change in search input
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filter neighborhoodsData based on searchTerm
  const filteredNeighborhoods = neighborhoodsData.filter((neighborhood) =>
    neighborhood.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Map the filtered neighborhoods to table rows
  const neighborhoodsList = filteredNeighborhoods.map((neighborhood) => {
    return (
      <tr key={neighborhood._id}>
        <td>{neighborhood.neighborhood}</td>
        <td>
          "{neighborhood.neighborhoodDescription}" {neighborhood.user ? <p>{"- " + neighborhood.user.name + `, resident of ${neighborhood.neighborhood}`}</p> : null}
        </td>
        <td>
          <Link to={`/neighborhood/${neighborhood._id}`}>
            Learn more
          </Link>
        </td>
      </tr>
    );
  });

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
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', width:'90%', margin:'60px auto auto auto', }}>

      <input
        type="text"
        placeholder="Search by neighborhood..."
        value={searchTerm}
        onChange={handleSearchChange}
      
        className='searchByNhoodInput'
      />
      <Table striped bordered hover size="sm" style={{ marginTop: "0"}} >
        <thead>
          <tr>
            <th >Neighborhood</th>
            <th >Description</th>
            <th>Learn more</th>
          </tr>
        </thead>
        {<tbody>{neighborhoodsList}</tbody>}
      </Table>
    </div>
  );

}

export default Home;