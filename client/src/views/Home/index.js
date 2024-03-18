import React, { useState, useEffect, startTransition, useRef } from 'react';
// import axios from 'axios';
import './home.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Spinner from 'react-bootstrap/Spinner';
import Card from "react-bootstrap/Card";
import Button from 'react-bootstrap/Button';
import CardBody from 'react-bootstrap/esm/CardBody';
import { useUserContext } from '../../contexts/UserContext';

function Home() {

  const navigate = useNavigate();
  const [neighborhoodsData, setNeighborhoodsData] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBorough, setSelectedBorough] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const indexOfLastItem = currentPage * itemsPerPage;
  const [totalItems, setTotalItems] = useState(19);
  const { currentuser_, setCurrentUserDirectly } = useUserContext();
  const [cursor, setCursor] = useState('');
  const loaderRef = useRef(null);
  const [hasMore, setHasMore] = useState(true);


  const handleNavigation = (path) => {
    startTransition(() => {
      navigate(path);
    });
  };

  // Filter neighborhoodsData based on searchTerm and selectedBorough
  const filteredNeighborhoods = neighborhoodsData.filter((neighborhood) => {
    return (
      neighborhood.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedBorough === 'All' || neighborhood.borough === selectedBorough)
    );
  });

  // Handle change in search input
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };
  // Handle change in borough selection
  const handleBoroughChange = (event) => {
    setSelectedBorough(event.target.value);
    setCurrentPage(1); // Reset to first page on borough change
  };

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
        <Button
          onClick={() => handleNavigation(`/neighborhood/${neighborhood._id}`)}
          style={{ margin: "20px", borderRadius: "0" }}
          variant="dark"
        >
          Learn More
        </Button>
      </Card>
    );

  });

  const blogCards = blogs.map((blog) => {
    return (
      <Card className="blogsCard" key={blog._id}>
        <Card.Img variant="top" src={blog.coverImageUrl} />
        <CardBody>
          <Card.Title>{blog.title}</Card.Title>
        </CardBody>
        <Card.Footer >
          <Button
            onClick={() => handleNavigation(`/post/${blog._id}`)}
            style={{ margin: "20px", borderRadius: "0" }}
            variant="dark"
          >
            Read
          </Button>
        </Card.Footer>
      </Card>
    )
  });

  const fetchData = async () => {
    if (!hasMore) return; 
    try {
      const blogsUrl = `${process.env.REACT_APP_BACKEND_URL}/api/blog/getblogs`;
      const [neighborhoodsResponse, blogsResponse] = await Promise.all([//blogsResponse
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/neighborhoods`, {
          params: { cursor, pageSize: itemsPerPage },
        }),
        axios.get(blogsUrl)
      ]);

      setBlogs(blogsResponse.data);//
      setIsLoading(false);
      setNeighborhoodsData(prevData => [...prevData, ...neighborhoodsResponse.data.neighborhoods]); 
      setCursor(neighborhoodsResponse.data.nextCursor);

      if (!neighborhoodsResponse.data.nextCursor || neighborhoodsResponse.data.neighborhoods.length < itemsPerPage) {
        setHasMore(false); 
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
    }
  };


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
          setCurrentUserDirectly(response.data);
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
    }

    fetchData();

  }, [currentPage]);


  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting) {
        fetchData(); // Fetch more data when loader comes into view
      }
    });

    // Observe the loader element
    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    // Cleanup
    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [cursor]);

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
      <h2 className='residentsHeader'>Discover Neighborhoods from Residents' Perspectives...</h2>
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


      <div ref={loaderRef} style={{ height: "20px", margin: "100px" }}>
        {isLoading && <Spinner animation="border" />}
      </div>

    </div>
  );

}

export default Home;
