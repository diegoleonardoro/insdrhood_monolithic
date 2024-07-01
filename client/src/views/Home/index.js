import React, { useState, useEffect, startTransition, useRef } from 'react';
import './home.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Button from 'react-bootstrap/Button';
import CardBody from 'react-bootstrap/esm/CardBody';
import { useUserContext } from '../../contexts/UserContext';
import LazyImage from '../../components/LazyImage/LazyImage';
import blogsData from '../../initialDataLoad/blogs.json';
import neighborhoodsData_ from '../../initialDataLoad/neighborhoods.json';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { Row, Col, Container, Form } from 'react-bootstrap';
import { CSSTransition, TransitionGroup } from 'react-transition-group';


function Home() {

  const navigate = useNavigate();
  // const [neighborhoodsData, setNeighborhoodsData] = useState([]); 
  const [blogs, setBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBorough, setSelectedBorough] = useState('All');

  const [neighborhoodsData, setNeighborhoodsData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(19);
  const { currentuser_, setCurrentUserDirectly } = useUserContext();
  const [cursor, setCursor] = useState('');
  const loaderRef = useRef(null);
  const [hasMore, setHasMore] = useState(true);
  const blogContainerRef = useRef(null);
  const blogsCursorRef = useRef('');
  const hasMoreBlogsRef = useRef(true);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [neighborhoodsLoading, setNeighborhoodsLoading] = useState(true);
  const blogContainer = blogContainerRef.current;
  const [loadingNhood, setLoadingNhood] = useState(false);
  const [hoverStates, setHoverStates] = useState([]);
  const [isTapAllowed, setIsTapAllowed] = useState(true);

  const handleTouchTap = () => {
    // if (isTapAllowed) {
    // fetchMoreBlogs();
    // }
  };

  // initial static load of neighborhoods and blogs. 
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

    const initialize = async () => {
      setNeighborhoodsLoading(false);
      const blogsResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/blog/getblogs`)
      setBlogs(blogsResponse.data)
      setBlogsLoading(false);

    };

    initialize();
  }, []);

  // used to attach event listener to the slider div that contains the blogs.
  useEffect(() => {
    if (!blogsLoading) {
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

  }, [blogsLoading]);


  const itemsPerPage = window.innerWidth < 768 ? 1 : 6// neighborhoods 
  const blogsPerpage = window.innerWidth < 768 ? 2 : 3 // blogs

  const handleNavigation = (path) => {
    startTransition(() => {
      navigate(path);
    });
  };


  // Filter neighborhoodsData based on searchTerm and selectedBorough
  const filteredNeighborhoods = (neighborhoodsData[currentPage] || []).filter((neighborhood) => {
    return (
      neighborhood.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedBorough === 'All' || neighborhood.borough === selectedBorough)
    );
  });

  // Handle change in search input
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    // setCurrentPage(1);
  };
  // Handle change in borough selection
  const handleBoroughChange = (event) => {
    setSelectedBorough(event.target.value);
    // setCurrentPage(1); // Reset to first page on borough change
  };

  const NeighborhoodCards = filteredNeighborhoods.map((neighborhood, index) => {
    const key = neighborhood._id ? `${neighborhood._id}-${index}` : index;
    return (
      <Col key={key}>
        <Card className="h-100 cardNhood" onClick={() => handleNavigation(`/neighborhood/${neighborhood._id}`)}>
          <Card.Header as="h5">
            {neighborhood.neighborhood}, {neighborhood.borough}
          </Card.Header>
          <Card.Body>
            <Card.Text className="neighborhoodDescr">
              {neighborhood.neighborhoodDescription}
            </Card.Text>
            <Card.Footer className="nhoodAuthor" style={{ backgroundColor: 'transparent', border: 'none' }}>
              - {neighborhood.user.name !== "" ? neighborhood.user.name : "Anonymous"}
            </Card.Footer>
          </Card.Body>
          <Button
            variant="warning"
            className="nhoodButton"

            onClick={(e) => {
              e.stopPropagation();
              handleNavigation(`/neighborhood/${neighborhood._id}`);
            }}
          >
            Read
          </Button>
        </Card>
      </Col>
    );
  })
  const blogCards = blogs.map((blog) => {

    return (

      <Col style={{ marginTop: "20px" }} key={blog._id} xs={12} sm={6} md={4}>
        <Card className="blogsCard" key={blog._id}>
          <LazyImage
            variant="top"
            src={blog.coverImageUrl}
            alt={blog.title}

          />

          <div style={{ padding: "15px", backgroundColor: "white" }}>
            <Card.Title className='blogCardTitle'>{blog.title}</Card.Title>
            <Button
              onClick={() => handleNavigation(`/post/${blog._id}`)}
              className='read-button'
              variant="dark"
            >
              Read
            </Button>
          </div>

        </Card>
      </Col>
    );

  });


  const fetchMoreBlogs = async () => {

    const container = blogContainerRef.current;
    const shiftAmount = 550;

    if (container) {
      container.style.transform = `translateX(-${shiftAmount}px)`;
    }
    if (!hasMoreBlogsRef.current) return;//|| !isTapAllowed

  };

  useEffect(() => {
    fetchMoreNeighborhoods(currentPage);
  }, [currentPage]);

  const fetchMoreNeighborhoods = async (page) => {
    
    if (neighborhoodsData[page]) {
      return; 
    }

    setLoadingNhood(true)
    if (!hasMore) return;
    try {

      const neighborhoodsResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/neighborhoods`, {
        params: { pageSize: itemsPerPage, page: page },
      });

      setNeighborhoodsData(prevData => ({
        ...prevData,
        [page]: neighborhoodsResponse.data.neighborhoods
      }));

      setLoadingNhood(false)

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
      container.style.transform = `translateX(${550}px)`; // Adjust the value based on your layout
    }
  };

  function SkeletonLoader({ width, height }) {
    // Inline styles for width and height customization
    const style = {
      width: width || '100%',
      height: height || '20px',
    };

    return <div className="skeleton-loader" style={style}></div>;
  }


  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    fetchMoreNeighborhoods(value);
  };
  return (

    <div style={{ width: '100%', margin: 'auto auto auto auto' }}>

      <div className="banner">
        <div className="main-banner">
          <img src="https://insiderhood.s3.amazonaws.com/assets/img11.png" className="img-responsive banner-img" />
        </div>
        <div className="contain">
          <h2 className="contain-txt">Insider Hood: A platform offering insights to deepen your understanding of New York City's neighborhoods.</h2>
        </div>
      </div>

      {/**  width: '100%', overflowX: "hidden", display: "flex", position: 'relative', */}
      <div style={{ marginBottom: "100px" }}>
        {/** className="mainBlogsContainer" */}

        <div >

          {!blogsLoading ? (
            <>
              <Row className='articlesContainer' ref={blogContainerRef} >
                {blogCards}
              </Row>

            </>
          )
            : (<div className="skeletonBlogs" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              {/* Mimic the structure of your blog card with skeleton loaders */}
              <SkeletonLoader width="90%" height="200px" /> {/* For the image */}
              <SkeletonLoader width="80%" height="20px" />  {/* For the title */}
              <SkeletonLoader width="70%" height="20px" />  {/* For the button or small text */}
            </div>)}

        </div>
      </div>
      <div className='nhoodsMainContainer'>

        <div className='nhoodsSecondContainer'>
          <h1 className='residentsHeader'>Discover Neighborhoods from Residents' Perspectives...</h1>

          <Row>
            <Col>
              <Form.Control
                type="text"
                placeholder="Search by neighborhood..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </Col>
            <Col>
              <Form.Select value={selectedBorough} onChange={handleBoroughChange} aria-label="Select Borough">
                <option value="All">All Boroughs</option>
                <option value="Manhattan">Manhattan</option>
                <option value="Brooklyn">Brooklyn</option>
                <option value="Queens">Queens</option>
                <option value="The Bronx">Bronx</option>
                <option value="Staten Island">Staten Island</option>
              </Form.Select>
            </Col>
          </Row>

          <div className='neighborhoodsMainContainer'>

            {!loadingNhood ? (
              <>
                <Container>
                  <Row xs={1} md={3} style={{ marginTop: "0px" }} className="g-4">

                      {NeighborhoodCards}             
                
                  </Row>
                </Container>

              </>

            ) : (<div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
              {/* Repeat the SkeletonLoader or create multiple for simulating several cards */}
              {[...Array(4)].map((_, index) => (
                <div key={index} style={{ margin: '10px', width: 'calc(50% - 20px)' }}> {/* Adjust based on your card width */}
                  <SkeletonLoader width="100%" height="150px" /> {/* For the image or header */}
                  <SkeletonLoader width="90%" height="20px" />
                  <SkeletonLoader width="80%" height="20px" />
                  <SkeletonLoader width="70%" height="20px" />
                </div>
              ))}
            </div>)}
          </div >
        </div>

        <Stack alignItems='center' sx={{
          '& .MuiPaginationItem-root': {
            color: 'white',
            marginTop: '50px'
          },
        }} spacing={2}>
          <Pagination count={10} shape="rounded" page={currentPage} onChange={handlePageChange} />
        </Stack>

      </div>
    </div>
  );


}

export default Home;
