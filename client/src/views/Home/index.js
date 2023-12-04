import React, { useState, useEffect } from 'react';
// import axios from 'axios';
import './home.css';
import Table from 'react-bootstrap/Table';
import axios from "axios";
import { Link } from "react-router-dom"

function Home() {

  const [neighborhoodsData, setNeighborhoodsData] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/neighborhoods`);

        console.log("response", response)
        setNeighborhoodsData(response.data);

      } catch (error) {
        console.error("Failed to fetch neighborhoods", error);
        // Handle the error state appropriately here
      }
    })();
  }, []);


  const neighborhoodsList = neighborhoodsData.map((neighborhood) => {
    return (
      <tr key={neighborhood._id}>
        <td >{neighborhood.user ? neighborhood.user.name : null}</td>
        <td >{neighborhood.neighborhood}</td>
        <td>
          {neighborhood.neighborhoodDescription}
        </td>
        <td>
          <Link to={`/neighborhood/${neighborhood._id}`}  >
            Learn more
          </Link>
        </td>
      </tr>
    );
  });

  // if (loading) return <div>Loading...</div>;
  // if (error) return <div>Error: {error}</div>;


  return (
    <Table striped bordered hover size="sm" style={{ width: "90%", margin: "50px auto" }} >
      <thead>
        <tr>
          <th>Resident</th>
          <th >Neighborhood</th>
          <th >Neighborhood Description</th>
          <th>Learn more</th>
        </tr>
      </thead>
      {<tbody>{neighborhoodsList}</tbody>}
    </Table>
  );
}

export default Home;