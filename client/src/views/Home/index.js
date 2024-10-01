import React, { useState, useEffect, startTransition, useRef } from 'react';
import './home.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";

import CardBody from 'react-bootstrap/esm/CardBody';
import { useUserContext } from '../../contexts/UserContext';
import LazyImage from '../../components/LazyImage/LazyImage';
import blogsData from '../../initialDataLoad/blogs.json';
import neighborhoodsData_ from '../../initialDataLoad/neighborhoods.json';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { Row, Col, Container, Form, Card, Button } from 'react-bootstrap';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Footer from "../../components/Footer/footer"
import neighborhoods from '../../views/neighborhoods';
// import { LazyLoadImage } from 'react-lazy-load-image-component';
// import 'react-lazy-load-image-component/src/effects/blur.css';

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
  const [allNeighborhoods, setAllNeighborhoods] = useState([]);
  const [neighborhoodSearchTerm, setNeighborhoodSearchTerm] = useState('');
  const [selectedBoroughs, setSelectedBoroughs] = useState({
    "Manhattan": false,
    "Brooklyn": false,
    "Queens": false,
    "The Bronx": false,
    "Staten Island": false
  });
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleTouchTap = () => {
    // if (isTapAllowed) {
    // fetchMoreBlogs();
    // }
  };

  const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  console.log("currentuser_ 99999999-->>>", currentuser_)

  // initial static load of neighborhoods and blogs. 
  useEffect(() => {

    // axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/chat/sendChatInfo`, {
    //   webPageRoute: '/home',

    // })
    //   .then(response => {
    //     console.log('vistig notification');
    //   })
    //   .catch(error => {
    //     console.error('Error sending chat info:', error);
    //   });

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


  const itemsPerPage = window.innerWidth < 768 ? 5 : 6// neighborhoods 
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
            <Card.Footer className="nhoodAuthor__" style={{ backgroundColor: 'transparent', border: 'none' }}>
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

  useEffect(() => {
    // Set the neighborhoods data
    setAllNeighborhoods(neighborhoods);
  }, []);

  const handleNeighborhoodSearch = (event) => {
    setNeighborhoodSearchTerm(event.target.value);
  };

  const handleBoroughChange = (event) => {
    setSelectedBoroughs(prevState => ({
      ...prevState,
      [event.target.name]: event.target.checked
    }));
  };

  const filteredAllNeighborhoods = allNeighborhoods.filter(neighborhood => {
    const searchWords = neighborhoodSearchTerm.toLowerCase().split(' ');
    const neighborhoodWords = neighborhood.neighborhood.toLowerCase().split(' ');

    const matchesSearch = searchWords.every(searchWord =>
      neighborhoodWords.some(neighborhoodWord =>
        neighborhoodWord.startsWith(searchWord)
      )
    );

    const matchesBorough = Object.values(selectedBoroughs).every(v => v === false) ||
      selectedBoroughs[neighborhood.borough];

    return matchesSearch && matchesBorough;
  });

  // all neighborhoods cards
  const AllNeighborhoodCards = filteredAllNeighborhoods.map((neighborhood, index) => (
    <Col key={index}>
      <Card className="h-100 cardNhood" style={{
        backgroundImage: neighborhood.imageUrl ? `url(${neighborhood.imageUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="card-content">
          <div className="card-header-container">
            <Card.Header as="h5">
              {neighborhood.neighborhood}
            </Card.Header>
          </div>

          <Card.Body className='card-body-all'>
            <Card.Text className="neighborhoodDescr">
              {neighborhood.borough}
            </Card.Text>

            <Button
              variant="warning"
              className="nhoodButton"
              onClick={() => {
                // You can add navigation or other functionality here later
                handleNavigation(`/neighborhoodsearch/${neighborhood.neighborhood}`);
              }}
            >
              View
            </Button>
          </Card.Body>
        </div>
      </Card>
    </Col>
  ));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {

      //`${process.env.REACT_APP_BACKEND_URL}/api/signup`, formData,
     

      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/emailregistration`, { email });
      console.log('Email registration successful:', response.data);
      // You can add a success message here
      setEmail('');
    } catch (error) {
      console.error('Email registration failed:', error);
      setError(error.response.data.errors[0].message);
    }
  };

  return (
    <div className="home-container">

      <div className="banner">

        <div className="main-banner">
          <img src="https://insiderhood.s3.amazonaws.com/assets/5c0dc8ad4d09c2a06ffa23c83e6ae2ddbd89508e-2160x1677.jpg" className="img-responsive banner-img" alt="Banner" />
        </div>
        <div className="contain">
         

          <div>
            <div className='benefits-container-wrapper'>
              <div className='benefits-container'>
                <h1 style={{ color: "white" }}>(Beta)</h1>
                <h1 className="contain-txt">Explore NYC beyond the obvious </h1>
                <p className='benefits-txt'>Insider Hood is a guide to the best of NYC. Discover hidden gems, insider tips, and local insights from real New Yorkers.</p>
                <ul className='benefits-list'>
                  <li data-emoji="🗺️">Access recommendations from locals in each neighborhood.</li>
                  <li data-emoji="📗">Receive neighborhood guides that explore the history and architecture of each place.</li>
                  <li data-emoji="📍">Get tailored itineraries that accommodate your needs.</li>
                  <li data-emoji="🤖">AI Chat that will give you tips and ideas on how to best explore the city.</li>
                </ul>
              </div>

              <div className='benefits-container'>
                <form className='email-form__' onSubmit={handleSubmit}>
                  <input
                    type="email"
                    placeholder="Type your email..."
                    className='email-input'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <button type="submit" className='submit-button'>
                    Join the waitlist →
                  </button>

                  {error && <p style={{ color: "white" }} className="error-message">{error}</p>}
                </form>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/** articles container: */}
      {/* <div style={{ marginBottom: "100px", marginTop: "100px" }}>
        <div>
          {!blogsLoading ? (
            <>
              <Row className='articlesContainer' ref={blogContainerRef} >
                {blogCards}
              </Row>

            </>
          )
            : (<div className="skeletonBlogs" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          
              <SkeletonLoader width="90%" height="200px" /> 
              <SkeletonLoader width="80%" height="20px" />  
              <SkeletonLoader width="70%" height="20px" />  
            </div>)}

        </div>
      </div> */}










      {/** neighborhoods container: */}
      <div className='nhoodsMainContainer'>

        <div className='nhoodsSecondContainer'>
          <h1 className='residentsHeader'>All NYC Neighborhoods</h1>


          <div className="borough-filter-container">
            {Object.keys(selectedBoroughs).map((borough) => (
              <Form.Check
                key={borough}
                inline
                label={borough}
                name={borough}
                type="checkbox"
                id={`borough-${borough}`}
                checked={selectedBoroughs[borough]}
                onChange={handleBoroughChange}
              />
            ))}
          </div>

          <Form.Control
            type="text"
            placeholder="Search neighborhoods..."
            value={neighborhoodSearchTerm}
            onChange={handleNeighborhoodSearch}
            style={{ margin: "20px", width: "90%" }}
            className="mb-3"
          />

          <Container>
            <Row xs={1} md={3} className="g-4">
              {AllNeighborhoodCards}
            </Row>
          </Container>

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

              {[...Array(4)].map((_, index) => (
                <div key={index} style={{ margin: '10px', width: 'calc(50% - 20px)' }}>
                  <SkeletonLoader width="100%" height="150px" />
                  <SkeletonLoader width="90%" height="20px" />
                  <SkeletonLoader width="80%" height="20px" />
                  <SkeletonLoader width="70%" height="20px" />
                </div>
              ))}
            </div>)}
          </div >

        </div>

        {/* <Stack alignItems='center' sx={{
          '& .MuiPaginationItem-root': {
            color: 'white',
            marginTop: '50px'
          },
        }} spacing={2}>
          <Pagination count={10} shape="rounded" page={currentPage} onChange={handlePageChange} />
        </Stack> */}

      </div>






      <Footer />
    </div>
  );

}

export default Home;