import React, { useState, useEffect, startTransition, useRef } from 'react';
import './home.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Spinner from 'react-bootstrap/Spinner';
import Card from "react-bootstrap/Card";
import Button from 'react-bootstrap/Button';
import CardBody from 'react-bootstrap/esm/CardBody';
import { useUserContext } from '../../contexts/UserContext';
import CardGroup from 'react-bootstrap/CardGroup';


function Home() {

  const navigate = useNavigate();
  const [neighborhoodsData, setNeighborhoodsData] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBorough, setSelectedBorough] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const [totalItems, setTotalItems] = useState(19);
  const { currentuser_, setCurrentUserDirectly } = useUserContext();

  const [cursor, setCursor] = useState('');

  const blogLoaderRef = useRef(null)
  const loaderRef = useRef(null);
  const [hasMore, setHasMore] = useState(true);
  const blogContainerRef = useRef(null);
  const blogsCursorRef = useRef('');
  const hasMoreBlogsRef = useRef(true);



  useEffect(() => {
    fetchMoreBlogs()
    setIsLoading(false);
  }, []);



  const handleTouchTap = () => {
    // Your code to execute upon tap
    console.log("Tap Detected");
    fetchMoreBlogs();
  };

  useEffect(() => {
    if (!isLoading) {
      const blogContainer = blogContainerRef.current;

      if (blogContainer) {
        // Listen for touchstart events to detect a tap
        blogContainer.addEventListener('touchstart', handleTouchTap);

        // Cleanup
        return () => {
          blogContainer.removeEventListener('touchstart', handleTouchTap);
        };
      }
    }
  }, [isLoading]);


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
    fetchMoreNeighborhoods();
    setIsLoading(false);
  }, [currentPage]);

  useEffect(() => {

    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting) {
        fetchMoreNeighborhoods(); // Fetch more data when loader comes into view
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

  const itemsPerPage = 4; // blogs
  const blogsPerpage = window.innerWidth < 768 ? 2 : 3

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

  const fetchMoreBlogs = async () => {

    const container = blogContainerRef.current;
    const shiftAmount = 200; // Adjust based on your design

    if (container) {
      container.style.transform = `translateX(-${shiftAmount}px)`;
    }

    if (!hasMoreBlogsRef.current) return;
    try {

      const blogsResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/blog/getblogs`, {
        params: { cursor: blogsCursorRef.current, pageSize: blogsPerpage },
      });

      setBlogs(prevData => [...prevData, ...blogsResponse.data.blogs]);
      blogsCursorRef.current = blogsResponse.data.nextCursor; //// <<==============--------

      if (!blogsResponse.data.nextCursor || blogsResponse.data.blogs.length < blogsPerpage) {
        hasMoreBlogsRef.current = false;
      }
    } catch (error) {
      console.error("Failed to fetch more blogs", error);
    }
  };

  const fetchMoreNeighborhoods = async () => {

    if (!hasMore) return;

    try {
      const neighborhoodsResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/neighborhoods`, {
        params: { cursor, pageSize: itemsPerPage },
      });

      setNeighborhoodsData(prevData => [...prevData, ...neighborhoodsResponse.data.neighborhoods]);
      setCursor(neighborhoodsResponse.data.nextCursor);

      if (!neighborhoodsResponse.data.nextCursor || neighborhoodsResponse.data.neighborhoods.length < itemsPerPage) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch more neighborhoods", error);
    }

  };

  const showPreviousBlogs = () => {


    // This would be a navigation function that adjusts state to show previous blogs without fetching new ones
    // For the purpose of demonstration, this could simply scroll to the left
    if (blogContainerRef.current) {

      const container = blogContainerRef.current;
      // Scroll to the left to show previous blogs
      container.style.transform = `translateX(${200}px)`; // Adjust the value based on your layout
    }
  };


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


      <div style={{ width: '100%', overflowX: "hidden", backgroundColor: '#8080801c', display: "flex", position: 'relative' }}>

        <div className="arrowsContainer" onClick={showPreviousBlogs} style={{ cursor: 'pointer', position: "absolute", left: "0px", top: "50%", transform: "translate(0, -50%)", margin: "auto", zIndex: '10', boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px", backgroundColor: "white", borderRadius: "50px", padding: "10px", marginLeft: "20px" }}>
          <svg className='blogArrows bi bi-arrow-left' style={{ fontSize: '100px', border: 'none', zIndex: '10', padding: "10px" }} width="56" height="56" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
          </svg>
        </div>
        <div ref={blogContainerRef} className='articlesContainer' >
          {blogCards}
        </div>

        {/* Right Arrow */}
        <div className="arrowsContainer" onClick={fetchMoreBlogs} style={{ cursor: 'pointer', position: "absolute", right: "0px", top: "50%", transform: "translate(0, -50%)", margin: "auto", zIndex: '10', boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px", backgroundColor: "white", borderRadius: "50px", padding: "10px", marginRight: "20px" }}>
          <svg className='blogArrows bi bi-arrow-right' style={{ fontSize: '100px', border: 'none', padding: "10px", }} xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
          </svg>
        </div>



        <div ref={blogLoaderRef} style={{ margin: "5px" }}>
          {isLoading && <Spinner animation="border" />}
        </div>
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
