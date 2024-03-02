import React, { useState, useEffect } from 'react';
// import axios from 'axios';
import './home.css';
import Table from 'react-bootstrap/Table';
import axios from "axios";
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom";
import Spinner from 'react-bootstrap/Spinner';
import Card from "react-bootstrap/Card";
import CardGroup from "react-bootstrap/CardGroup";
import Button from 'react-bootstrap/Button';
import CardBody from 'react-bootstrap/esm/CardBody';



function Home({ currentuser, updateCurrentUser }) {

  const navigate = useNavigate();
  const [neighborhoodsData, setNeighborhoodsData] = useState([]);
  const [blogs, setBlogs] = useState([]);
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

    return (
      <Card className="neighborhoodCard" key={neighborhood._id}>
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
          <Button style={{ margin: "20px", borderRadius: "0" }} variant="dark">Learn More</Button>
        </Link>
      </Card>
    );

  });


  const blogCards = blogs.map((blog) => {
    return (
      <Card className ="blogsCard" key={blog._id}>
        <Card.Img variant="top" src={blog.coverImage} />
        <CardBody>
          <Card.Title>{blog.title}</Card.Title>
        </CardBody>

        <Card.Footer >

          <Link to={`/post/${blog._id}`} style={{ textDecoration: 'none'}}>
            <Button style={{ margin: "20px", borderRadius: "0", width:"90%"  }} variant="dark">Read Article</Button>
          </Link>

        </Card.Footer>

      </Card>
    )
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
        const blogs = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/blog/getblogs`);
        setBlogs(blogs.data);

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
      <div style={{ position: "relative", left: "45%", transform: "translate(-50%, 0)", display: "inline" }}>
        <Spinner style={{ position: "relative", height: "100px", width: "100px", top: "50px" }} animation="grow" />
        <div style={{ display: "inline", position: "absolute", bottom: "-10px", left: "15px", color: "white" }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', margin: '60px auto auto auto' }}>

      <div className='articlesContainer'>
        {blogCards}
      </div>

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
