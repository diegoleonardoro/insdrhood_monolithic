import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import Card from "react-bootstrap/Card";
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import chroma from 'chroma-js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Rectangle } from 'recharts';
import MuiButton from '@mui/material/Button';
import { styled } from '@mui/system';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import "./311complaints.css";


const transformAndSortData = (dataObject) => {
  const transformedData = Object.keys(dataObject).map(key => ({
    name: key,
    value: dataObject[key]
  }));
  return transformedData.sort((a, b) => b.value - a.value);
};

const generateColorPalette = (dataLength) => {
  return chroma.scale(
    [
      "#003366",
      "#014421",
      "#800020",
      "#002147",
      "#8E4585",
      "#E97451",
      "#008080",
      "#800000",
      "#4B0082",
      "#954535"
    ]

  ).mode('lch').colors(dataLength);
};

function formatReadableDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}


const CustomBarShape = (props) => {
  const { x, y, width, height, fill, payload, handleBarClick } = props;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} />
      {/* Transparent overlay for extending the clickable area */}
      <rect x={x - 10} y={0} width={width + 20} height="100%" fill="transparent" onClick={() => handleBarClick(payload)} style={{ cursor: 'pointer' }} />
    </g>
  );
};



const Complaints311 = ({ showRegisterFrom = true }) => {

  const [complaints, setComplaints] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [descriptorCountchartData, setDescriptorCountchartData] = useState([]);
  const [complaintsNumber, setComplaintsNumber] = useState();
  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');
  const [loadingLoadMore, setLoadingLoadMore] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [currentZipForDisplay, setCurrentZipForDisplay] = useState([]);

  const [filters, setFilters] = useState({
    "zip": '',
    "Borough": '',
    "Agency": '',
    "ComplaintType": '',
    "CreatedDate": ''
  });

  const [initialLoad, setInitialLoad] = useState(true);
  const [newsletter, setNewsletter] = useState({ email: '', zipCode: '' });
  const [formVisible, setFormVisible] = useState(true); // Controls the form's visible state

  const [showNewsletterForm, setShowNewsletterForm] = useState(true)

  const handleNewsletterChange = (event) => {
    const { name, value } = event.target;
    setNewsletter(prev => ({ ...prev, [name]: value }));
  };
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    // Implement the newsletter signup logic here, possibly calling an API
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/newsletter/signup`,
        newsletter);

      setShowNewsletterForm(false);

    } catch (error) {

    }

  };
  const toggleForm = () => {
    setFormVisible(!formVisible);
  }

  const fetchComplaints = async (reset = false, applyFilters = false, resetPage = false) => {

    if (reset) {
      setLoading(true);
    } else {
      setLoadingLoadMore(true)
    }

    if (resetPage) {
      setPage(1)
    }

    // This if statement will take place if the user clicks "Apply Filters" or if there is a hard reload of the page
    if(reset && !applyFilters && !resetPage){
      setSelectedData(null);
    }


    const params_ = applyFilters ? filters : { limit: 10, page: resetPage ? 1 : page };
    const zipCodesArray = filters.zip.split(/\s*,\s*|\s+/).filter(zip => zip !== '');

    try {

      setCurrentZipForDisplay(zipCodesArray);

      const response = await axios.get(`${process.env.REACT_APP_NYC_DATA_BACKEND_URL}/311calls`, {
        params: {
          ...params_,
          zip: zipCodesArray,
          Borough: filters.Borough,
          ComplaintType: filters.ComplaintType
        }
      });

      // ---- The following lines will create the "Other" category ----
      //  const valueThreshold = Object.values(filters).some(value => value !== '') ? 3 : 20
      // const filteredData_descriptor_counts = filteredData_descriptor_counts.filter(item => item.value > valueThreshold);
      // // Determine the entries that do not exceed the threshold
      // const otherEntries = filteredData_descriptor_counts.filter(item => item.value <= valueThreshold);
      // // Calculate the total count of 'Other' entries
      // const otherDataSum = otherEntries.reduce((acc, item) => acc + item.value, 0);
      // // Add 'Other' category only if there are more than 15 items in otherEntries. Pass this value to 'setDescriptorCountchartData' if you want to have an "Other" section
      // const finalData_descriptor_counts = filteredData_descriptor_counts.concat(otherEntries.length > 15 ? { name: 'Other', value: otherDataSum } : otherEntries);
      // ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----


      // the following lines of code should not take place when there state filters.complaintType has a value
      if (filters.ComplaintType == '') {
        setMaxDate(formatReadableDate(response.data.max_date))
        setMinDate(formatReadableDate(response.data.min_date))
        const sortedData_descriptor_counts = transformAndSortData(response.data.descriptor_counts);
        setDescriptorCountchartData(sortedData_descriptor_counts);
        setComplaintsNumber(response.data.data_length);
      }
      //----------------------------------------------

      if (response.data.original_data.length > 0) {

        //it is important to set hasmMore to True here because every time the user fetches data with the bar graph button the previous value of hasMore is going to be preserved, and if it is "false" the no more complaints will be shown.
        setHasMore(true);

        if (reset) {
          setComplaints(response.data.original_data); // when the user clicks on the bar graph button, all complaints should be reset.
        } else {
          setComplaints(prev => [...prev, ...response.data.original_data]);
        }

        // if (!resetPage) {
          setPage(prevPage => prevPage + 1);// increase page number when the data fetching process is not being made from the button in the bar graph. 
        // }else{
          // setPage(1)
        // }

      } else {
        setHasMore(false);
      }

    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {

      setLoading(false);
      setLoadingLoadMore(false);

    }
  };


  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setInitialLoad(false);
    fetchComplaints(true, false);
  };

  useEffect(() => {
    if (initialLoad) {
      fetchComplaints(true, false);
    }
  }, [initialLoad]);



  const handleBarClick = (event) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ComplaintType: event.name
    }));
    setSelectedData(event.name);// this state is going to be used for displaying that complaint data was clicked by the use

  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    if (name === 'zip') {

      setFilters(prevFilters => ({
        ...prevFilters,
        [name]: value,
        Borough: '',
        ComplaintType: ''
      }));

    } else if (name === 'Borough') {

      // Reset the zip code to the default value when borough changes
      setFilters(prevFilters => ({
        ...prevFilters,
        [name]: value,
        zip: '',
        ComplaintType: ''

      }));

    } else {
      // For other fields, just update them as before
      setFilters(prevFilters => ({
        ...prevFilters,
        [name]: value
      }));
    }
  };

  function formatDate(dateStr) {
    const months = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];

    const date = new Date(dateStr);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Adding ordinal suffix to day
    let suffix = 'th';
    const exceptions = [1, 21, 31];
    if (exceptions.includes(day)) {
      suffix = 'st';
    } else if ([2, 22].includes(day)) {
      suffix = 'nd';
    } else if ([3, 23].includes(day)) {
      suffix = 'rd';
    }

    // Formatting time in 12-hour format
    const timePeriod = hours >= 12 ? 'PM' : 'AM';
    const formattedHour = ((hours + 11) % 12 + 1); // converts 24h to 12h format and handles midnight case
    const formattedMinute = minutes < 10 ? `0${minutes}` : minutes;

    return `${month} ${day}${suffix} at ${formattedHour}:${formattedMinute} ${timePeriod}`;
  }

  function titleCase(string) {
    return string.toLowerCase().split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  const colors = generateColorPalette(descriptorCountchartData.length);

  // Define the width for each bar (e.g., 100px)  
  // Calculate the total width of the chart
  const barWidth = 100;
  const chartWidth = descriptorCountchartData.length * barWidth;



  return (

    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: "100vh", backgroundColor: 'white' }}>

      {/** Filter form: */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          '& > :not(style)': { m: 1 },
          width: "100%",
          margin: '10px',
          marginBottom: '0px'
        }}
        className="zipBoroughFilterForm"
      >
        <TextField
          id="demo-helper-text-aligned"
          label="Incident Zip"
          sx={{ width: "100%" }}
          name="zip"
          value={filters.zip}
          onChange={handleFilterChange}
        />
        <Select
          displayEmpty
          inputProps={{ 'aria-label': 'Name' }}
          sx={{ width: "100%" }}
          name="Borough"
          value={filters.Borough}
          onChange={handleFilterChange}
        >
          <MenuItem value="">
            <em>Select Borough</em>
          </MenuItem>
          <MenuItem value='MANHATTAN'>Manhattan</MenuItem>
          <MenuItem value='BROOKLYN'>Brooklyn</MenuItem>
          <MenuItem value='QUEENS'>Queens</MenuItem>
          <MenuItem value='BRONX'>Bronx</MenuItem>
          <MenuItem value='STATEN ISLAND'>Staten Island</MenuItem>

        </Select>
        <MuiButton sx={{
          color: "white", border: "1px solid rgba(0, 0, 0, 0.87)", backgroundColor: "black", backgroundColor: 'black',
          '&:hover': {
            backgroundColor: 'white',
            color: 'black',
            border: "1px solid rgba(0, 0, 0, 0.87)",

          },
          marginBottom: "20px",
          width: "30%",
          cursor: "pointer",
          height: "50px"
        }} variant="outlined" onClick={handleFilterSubmit}>Apply Filters</MuiButton>
      </Box>

      <div style={{
        borderRadius: '8px', // rounded corners
        fontFamily: 'Arial, sans-serif', // font family
        fontSize: '13px', // text size
        color: '#333', // dark grey text color
        alignSelf: 'start',
        marginLeft: '10px',
        margin: '20px'
      }}>
        Showing data from <span style={{ fontWeight: "bold" }}>{minDate}</span> to <span style={{ fontWeight: "bold" }}>{maxDate}.</span> {complaintsNumber ? complaintsNumber.toLocaleString() : null} records.

      </div>

      <div className='chartsContainer' >

        {selectedData && (
          
          <Button style={{width:"90%", margin:"auto"}} variant="link" color="info" onClick={() => { fetchComplaints(true, false, true) }}>
              See all <span style={{ fontWeight: "bolder", marginLeft: "5px", marginRight: "5px", textDecoration: 'underline' }}> {selectedData} </span>complaints for
              <span style={{ fontWeight: "bolder", marginLeft: "5px", marginRight: "5px", textDecoration: 'underline' }} >{currentZipForDisplay.length > 0 ? currentZipForDisplay.join(', ') : "all"}</span> zipcode(s)
            </Button>
         
        )}

        <div style={{ width: '100%', overflowX: 'auto' }}>
          <ResponsiveContainer style={{ margin: 'auto' }} width={chartWidth} height={400}>
            <BarChart
              width={chartWidth}
              data={descriptorCountchartData}
              margin={{ top: 20, right: 50, bottom: 90, left: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" textAnchor="end" angle={-35} interval={0} style={{ fontSize: '11px' }} />
              <YAxis label={{ value: 'Number of Complaints', angle: -90, position: 'insideLeft', dx: -35,dy:55, fontSize:"13px"}} />
              <Tooltip />

              <Bar
                dataKey="value"
                fill="#8884d8" // Default fill, not necessary unless you want a fallback color
                shape={(props) => <CustomBarShape {...props} handleBarClick={handleBarClick} fill={colors[props.index % colors.length]} />}
              />

            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Conditional rendering based on loading for the remaining content */}
      {!loading && (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', backgroundColor: "white" }}>
            {complaints.map((complaint, index) => (
              <Card className="Cards311" style={{ width: '18rem', margin: "20px" }} key={index}>
                <ListGroup className="list-group-flush Cards_Group">
                  <Card.Header className="Cards_Group_1" as="h5">{titleCase(complaint['Borough'])}, {complaint['Incident Zip']}</Card.Header>
                  <ListGroup.Item className="Cards_Group_2"> {complaint['Descriptor']}. {complaint['Complaint Type']} </ListGroup.Item>
                  <ListGroup.Item className="Cards_Group_3" > <span style={{ fontWeight: "bold" }} >Address: </span>{titleCase(complaint['Incident Address'])}</ListGroup.Item>
                  <ListGroup.Item className="Cards_Group_4" ><span style={{ fontWeight: "bold" }}>Issued: </span>{formatDate(complaint['Created Date'])}</ListGroup.Item>
                  <ListGroup.Item className="Cards_Group_5"><span style={{ fontWeight: "bold" }} >Responding agency: </span>{complaint['Agency']}</ListGroup.Item>
                </ListGroup>
              </Card>
            ))}
            {!hasMore && <div>No more complaints to show.</div>}
            {hasMore && !loadingLoadMore && (
              <Button style={{ padding: "15px", alignSelf: "center" }} variant="dark" onClick={() => fetchComplaints()}>
                Load More
              </Button>
            )}

            {loadingLoadMore && (
              <div >
                <div style={{ position: "relative", left: "45%", top: "30%" }}>
                  <Spinner animation="grow" size="sm" className="spinner spinner1" />
                  <Spinner animation="grow" className="spinner spinner2" />
                  <Spinner animation="grow" style={{ height: "50px", width: "50px" }} className="spinner spinner3" />
                </div>
              </div>
            )}

          </div>

          {showRegisterFrom && showNewsletterForm && (
            <div className={`newsletter-form ${formVisible ? 'expanded' : 'collapsed'}`} style={{ transition: 'height 0.3s ease-in-out', padding: "2px" }}>
              <div style={{ padding: "15px", paddingBottom: "30px" }}>
                <p className='p_signup311Complaints'>Register for 311 Updates in your Zipcode:</p>
                <Form className="signup311Complaints" onSubmit={handleNewsletterSubmit} style={{ display: 'flex', alignItems: 'center' }}>
                  {formVisible ? (
                    <>
                      <Form.Group className="emailcomplaintsnewsletter" style={{ width: '90%' }}>
                        <Form.Control className='input311Form' type="email" name="email" placeholder="Enter email" value={newsletter.email} onChange={handleNewsletterChange} required />
                      </Form.Group>
                      <Form.Group style={{ width: '90%' }}>
                        <Form.Control className='input311Form' type="text" name="zipCode" placeholder="Zip Code" value={newsletter.zipCode} onChange={handleNewsletterChange} required />
                      </Form.Group>
                      <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', paddingLeft: '10px' }}>
                        <Button style={{ width: "65%", height: "30px", backgroundColor: "#ffc107", color: "black", borderColor: "black", fontSize: "12px" }} type="submit" variant="primary">Register</Button>
                        <Button style={{ width: "35%", height: "30px", alignSelf: "center", fontSize: "10px" }} variant="outline-secondary" onClick={toggleForm}>Close</Button>
                      </div>
                    </>
                  ) : (
                    <Button className="show311Form" variant="outline-secondary" onClick={toggleForm} style={{ width: '100%', marginBottom: "10px", height: "25px" }}>Sign Up for Updates</Button>
                  )}
                </Form>
              </div>
            </div>
          )}
          
        </>
      )}

      {/* Loading spinner that only appears when the content is being loaded */}
      {loading && (
        <div style={{ height: "87.5vh" }}>
          <div style={{ position: "relative", left: "45%", top: "30%" }}>
            <Spinner animation="grow" size="sm" className="spinner spinner1" />
            <Spinner animation="grow" className="spinner spinner2" />
            <Spinner animation="grow" style={{ height: "50px", width: "50px" }} className="spinner spinner3" />
          </div>
        </div>
      )}





    </div>

  );





};

export default Complaints311;

