import React, { useState, useEffect } from 'react';
// import axios from 'axios';
import './home.css';
import Table from 'react-bootstrap/Table';
import axios from "axios";
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom";

function Home({ currentuser, updateCurrentUser }) {

  const navigate = useNavigate();

  const [neighborhoodsData, setNeighborhoodsData] = useState([]);

  // const [user, setUser] = useState(null);

  useEffect(() => {

    console.log("log inside useEffect of Home component ")

    // Extract the token from the URL
    const urlParams = new URLSearchParams(window.location.search);

    const token = urlParams.get('token');

    if (token) {

      console.log("log inside if statement of useEffect in Home component");

      const logUserWithToken = async () => {

        console.log("log inside logUserWithToken function inside useEffect in Home component");

        try {

          const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/emailVerification/${token}`);

          console.log("response to emailverificaiton route from Home component", response);

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
    }

    (async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/neighborhoods`);

        console.log("response to get neighborhoods route in Home component ", response);

        setNeighborhoodsData(response.data);

      } catch (error) {
        console.error("Failed to fetch neighborhoods", error);
        // Handle the error state appropriately here
      }
    })();

  }, []);



  // useEffect(() => {
  //   if (user !== null) {
  //     // DIRECT THE USER TO RESPOND THE FORM 
  //     updateCurrentUser(user);
  //     // setTimeout(() => {
  //     //   navigate(`/`);
  //     // }, 2000);
  //   } else {
  //   }
  // }, [user])



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