import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from "axios";
import Card from "react-bootstrap/Card";
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import chroma from 'chroma-js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Rectangle, LineChart, Line } from 'recharts';
import MuiButton from '@mui/material/Button';
import { styled } from '@mui/system';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import moment from 'moment';
import ZipCodeBoroSelect from '../ZipCodeBoroInput/ZipCodeBoroInput';
import BoroughSelect from '../MultipleBoroSelect/MultipleBoroSelect';
import { useLocation } from 'react-router-dom';
import "./311complaints.css";

const useQuery = () => {
  const location = useLocation();
  return new URLSearchParams(location.search);
};

const transformAndSortData = (dataObject) => {
  const transformedData = Object.keys(dataObject).map(key => ({
    name: key,
    value: dataObject[key]
  }));
  return transformedData.sort((a, b) => b.value - a.value);
};

const processChartData = (data) => {
  const aggregatedData = {};
  data.forEach(item => {
    if (!aggregatedData[item.name]) {
      aggregatedData[item.name] = { name: item.name };
    }
    Object.keys(item).forEach(zip => {
      if (zip !== 'name') {
        if (!aggregatedData[item.name][zip]) {
          aggregatedData[item.name][zip] = 0;
        }
        aggregatedData[item.name][zip] += item[zip];
      }
    });
  });
  const dataArray = Object.values(aggregatedData);

  // Sort by sum of all zip code values for each entry
  return dataArray.sort((a, b) => {
    const totalA = Object.keys(a).reduce((acc, key) => key !== 'name' ? acc + a[key] : acc, 0);
    const totalB = Object.keys(b).reduce((acc, key) => key !== 'name' ? acc + b[key] : acc, 0);
    return totalB - totalA;
  });
};


const transformDatForLineChart = (data) => {
  let dates = {};
  const validBoroughs = ["BROOKLYN", "QUEENS", "MANHATTAN", "BRONX", "STATEN ISLAND"];

  // Loop through each borough data
  data.forEach(borough => {
    Object.entries(borough).forEach(([key, value]) => {
      if (key !== "Borough" && validBoroughs.includes(borough.Borough)) {
        if (!dates[key]) dates[key] = { date: key };
        dates[key][borough.Borough] = value;
      }
    });
  });

  return Object.values(dates);
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


function getRandomColor() {
  // Define a list of distinct colors that are clearly visible against a white background
  const distinctColors = [
    '#00429d', // Strong Blue
    '#d70060', // Vivid Raspberry
    '#005f73', // Dark Cyan
    '#e59500', // Vivid Orange
    '#ab2346', // Strong Reddish Pink
    '#006837', // Dark Green
    '#f13c20', // Vivid Red Orange
    '#560088', // Strong Violet
    '#d54062', // Strong Purplish Pink
    '#6dac4f', // Moderate Lime Green
    '#d85a7f', // Soft Thulian Pink
    '#6a994e', // Earthy Green
    '#ffba08', // Amber, vivid yellow-orange
    '#7b2cbf', // Strong Violet
    '#0077b6', // Strong Blue
  ];

  // Randomly pick a color from the list
  const index = Math.floor(Math.random() * distinctColors.length);
  return distinctColors[index];
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
  const [selectedData, setSelectedData] = useState('all');
  const [currentZipForDisplay, setCurrentZipForDisplay] = useState([]);
  const [loadingBarChart, setLoadingBarChart] = useState(false);
  const [loadingLineChart, setLoadingLineChart] = useState(false);
  const [chartMainWidth, setChartMainWidth] = useState(window.innerWidth);
  const [chartHeight, setChartHeight] = useState(400);
  const [yAxisFontSize, setYAxisFontSize] = useState('13px');
  const [xAxisFontSize, setXAxisFontSize] = useState('11px');
  const [initialLoadDayDataCountCheck, setInitialLoadDayDataCountCheck] = useState(true)
  const [dayCountData, setDayCountData] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [newsletter, setNewsletter] = useState({ email: '', zipCode: '' });
  const [formVisible, setFormVisible] = useState(false); // Controls the form's visible state
  const [linekeys, setLinekeys] = useState([]);
  // const 
  const query = useQuery();
  // let zips = query.get('zips');

  const [zips, setZips] = useState(query.get('zips'))



  const [filters, setFilters] = useState({
    "zip": '',
    "Borough": '',
    "Agency": '',
    "ComplaintType": '',
    "CreatedDate": ''
  });

  const updateDayCountData = async (data) => {
    setDayCountData(data)
    setLinekeys(Object.keys(data[0]).filter(key => key !== 'date'))
    setLoadingLineChart(false)
  }

  const loadingLineChartonClick = () => {
    setLoadingLineChart(true)
  }

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

  const complaintCardsRef = useRef(null);

  const scrollToCardsRef = () => {
    // Ensure the ref current is not null
    if (complaintCardsRef.current) {
      window.scrollTo({
        top: complaintCardsRef.current.offsetTop, // Adjusts to the top position of the element
        behavior: 'smooth' // Optional: Defines smooth scrolling
      });
    }
  };

  const fetchComplaints = async (reset = false, applyFilters = false, resetPage = false) => {

    if (reset) {
      setLoading(true);
    } else {
      setLoadingLoadMore(true)
    }
    if (resetPage) {
      setPage(1)
    }
    if (reset && !applyFilters && !resetPage) {
      // This if statement will take place if the user clicks "Apply Filters" or if there is a hard reload of the page
      setLoadingBarChart(true); // show the loading component for the bar chart area
      setSelectedData('all');
    }
    if (reset && !applyFilters && resetPage && selectedData === "all") {
      // This if statement will take place when the user clicks the button inside of the bar graph and no bar has been been clicked 
      setLoading(false);
      return
    }



    const params_ = applyFilters ? filters : { limit: 10, page: resetPage ? 1 : page };
    let zipCodesArray = filters.zip.split(/\s*,\s*|\s+/).filter(zip => zip !== '');

    // this if statement will change the value of zipCodesArray to whatever comes in url params if no zip code has been selected
    if (zipCodesArray.length === 0 && zips) {
      zipCodesArray = zips.split(",");
    }

    try {

      setCurrentZipForDisplay(zipCodesArray);

      const response = await axios.get(`${process.env.REACT_APP_NYC_DATA_BACKEND_URL}/311calls`, {
        params: {
          ...params_,
          zip: zipCodesArray,// 
          Borough: filters.Borough ? [filters.Borough] : '',
          ComplaintType: filters.ComplaintType === "all" ? "" : filters.ComplaintType,// if filters.ComplaintType is equal to 'all' it means 
          initialLoad: initialLoadDayDataCountCheck
        }
      });

      if (filters.ComplaintType == '') {
        // the following lines of code should not take place when there state filters.complaintType has a value
        // this block will take place when there is a hard reload of the page or when the user clicks Apply Filters

        setMaxDate(formatReadableDate(response.data.max_date))
        setMinDate(formatReadableDate(response.data.min_date))
        setComplaintsNumber(response.data.data_length);
        // i only want to update the descriptorCountchartData state whenever the user hard loads or when they apply filters:
        let chartData;

        if (Array.isArray(response.data.descriptor_counts)) { //this means that there are filters being applied and the data is coming as an array of objs
          chartData = processChartData(response.data.descriptor_counts);
        } else {
          chartData = transformAndSortData(response.data.descriptor_counts);
        }
        setDescriptorCountchartData(chartData);

      }

      if (initialLoadDayDataCountCheck) {
        


        // if there are zipcodes coming in the url, then set the linekeys with those zip codes

        if (zips) {
          updateDayCountData(response.data.data_count_by_day)
          setLinekeys(zips.split(","));

        } else {

          // when we enter this if satement it means that there was a hard reload of the page in which case, we want to update the data_count_by_day coming from the server
          const transFormedData = transformDatForLineChart(response.data.data_count_by_day)
          setDayCountData(transFormedData);
          setLoadingLineChart(false);
          setLinekeys(["BROOKLYN", "QUEENS", "MANHATTAN", "BRONX", "STATEN ISLAND"]);
        }

      }

      if (response.data.original_data.length > 0) {
        //it is important to set hasmMore to True here because every time the user fetches data with the bar graph button the previous value of hasMore is going to be preserved, and if it is "false" the no more complaints will be shown.
        setHasMore(true);

        if (reset) {
          setComplaints(response.data.original_data); // when the user clicks on the bar graph button, all complaints should be reset.
        } else {
          setComplaints(prev => [...prev, ...response.data.original_data]);
        }
        setPage(prevPage => prevPage + 1);// increase page number when the data fetching process is not being made from the button in the bar graph. 

      } else {
        setHasMore(false);
      }

    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
      setLoadingLoadMore(false);
      setLoadingBarChart(false);
    }
  };

  const handleFilterSubmit = (e) => {
    if (e) {
      e.preventDefault();
    }
    setInitialLoad(false);
    fetchComplaints(true, false);
  };

  useEffect(() => {


    setInitialLoadDayDataCountCheck(false);

    if (initialLoad) {
      fetchComplaints(true, false);
    }

    const handleResize = () => {
      setChartMainWidth(window.innerWidth);
      if (window.innerWidth < 1018) {
        setChartHeight(300);
        setYAxisFontSize('15px');
        setXAxisFontSize('14px');
      } else {
        setChartHeight(400);
        setYAxisFontSize('13px');
        setXAxisFontSize('11px');
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial setup

    return () => window.removeEventListener('resize', handleResize);


  }, []);


  // This useEffect makes sure that there is a request fetched filtered data when the user clicks a borough.
  useEffect(() => {
    if (filters.Borough && filters.ComplaintType === '') {// this line makes sure that the request only takes places when when the borough changes and not when the user clicks a bar
      handleFilterSubmit();
    }
  }, [filters]);

  const handleBarClick = (event) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ComplaintType: event.name
    }));
    setSelectedData(event.name);// this state is going to be used for displaying that complaint data was clicked by the use
  };

  const handleFilterChange = (event) => {

    const { name, value } = event.target;

    setZips(null)// this will make sure that when there are zip codes in the url and the user wants to apply filters to the bar chart, the zips in the url will not be considered in the filtering process 

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

  const colors = [
    "#6699CC", // Light blue
    "#66CC66", // Light green
    "#CC6666", // Soft red
    "#336699", // Bluish
    "#CC99CC",  // Pale purple
    "#FF9966",  // Light orange
    "#33CCCC",  // Soft teal
    "#CC3333",  // Soft dark red
    "#9999CC",  // Soft violet
    "#FFCC99"   // Peach
  ]

  // Define the width for each bar (e.g., 100px)  
  // Calculate the total width of the chart
  const barWidth = 100;
  const chartWidth = descriptorCountchartData.length * barWidth;

  return (

    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: "100vh", backgroundColor: 'white' }}>

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

      {/** Bar chart */}

      <div style={{ width: "100%", backgroundColor: "#f7f7f7" }}>
        <div className='chartsContainer' >

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
              label="Enter one or more Zipcodes to compare"
              sx={{ width: "100%" }}
              name="zip"
              value={filters.zip}
              onChange={handleFilterChange}
            />
            <MuiButton sx={{
              color: "white", border: "1px solid rgba(0, 0, 0, 0.87)", backgroundColor: "black", backgroundColor: 'black',
              '&:hover': {
                backgroundColor: 'white',
                color: 'black',
                border: "1px solid rgba(0, 0, 0, 0.87)",
              },
              marginBottom: "20px",
              width: "20%",
              cursor: "pointer",
              height: "50px",
              fontSize: "10px"

            }} variant="outlined" onClick={handleFilterSubmit}>Search Zipcode(s)
            </MuiButton>
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
          </Box>
          {loadingBarChart && (
            <>
              <div style={{ margin: "30px", textAlign: "center" }}>
                <div style={{ position: "relative" }}>
                  <Spinner animation="grow" size="sm" className="spinner spinner1" />
                  <Spinner animation="grow" className="spinner spinner2" />
                  <Spinner animation="grow" style={{ height: "50px", width: "50px" }} className="spinner spinner3" />
                </div>

                Fetching data...
              </div>
            </>
          )}

          {!loadingBarChart && (
            <>
              {selectedData && (
                <Button style={{ width: "90%", margin: "auto" }} variant="link" color="info" onClick={() => { fetchComplaints(true, false, true); scrollToCardsRef() }}>
                  See all <span style={{ fontWeight: "bolder", marginLeft: "5px", marginRight: "5px", textDecoration: 'underline' }}> {selectedData} </span>complaints for
                  {
                    filters.zip ? (
                      <span style={{ fontWeight: "bolder", marginLeft: "5px", marginRight: "5px", textDecoration: 'underline' }}>
                        {currentZipForDisplay.length > 0 ? currentZipForDisplay.join(', ') : "all"} zipcode(s)
                      </span>
                    ) : (
                      <span style={{ fontWeight: "bolder", marginLeft: "5px", marginRight: "5px", textDecoration: 'underline' }}>
                        {filters.Borough !== '' ? filters.Borough.charAt(0).toUpperCase() + filters.Borough.slice(1).toLowerCase() : "the entire city."}
                      </span>
                    )
                  }
                </Button>
              )}

              <div style={{ width: '100%', overflowX: 'auto', marginBottom: "15px" }}>
                <ResponsiveContainer style={{ margin: 'auto' }} width={chartWidth} height={chartHeight}>
                  <BarChart
                    width={chartWidth}
                    data={descriptorCountchartData}
                    margin={{ top: 20, right: 50, left: 50, bottom: 90 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" textAnchor="end" angle={-20} interval={0} style={{ fontSize: xAxisFontSize }} />
                    <YAxis label={{ value: 'Number of Complaints', angle: -90, position: 'insideLeft', dx: -35, dy: 55, fontSize: yAxisFontSize }} />


                    <Tooltip />
                    <Legend />
                    {
                      descriptorCountchartData && descriptorCountchartData.length > 0 ? (
                        Object.keys(descriptorCountchartData[0]).filter(key => key !== 'name').map((zip, idx) => (
                          <Bar
                            key={zip}
                            dataKey={zip}
                            stackId="a"
                            fill={colors[idx % colors.length]}
                            shape={(props) => <CustomBarShape {...props} handleBarClick={handleBarClick} fill={colors[idx % colors.length]} />}
                          />
                        ))
                      ) : (
                        <p>Loading data...</p> // Or some other placeholder content
                      )
                    }

                  </BarChart>
                  {/* // )} */}
                </ResponsiveContainer>
              </div>
            </>

          )}
        </div>
      </div>


      {/** Line chart */}
      <div className='lineChartMainContainer' >


        <div className='chartsContainer' >
          <div style={{
            borderRadius: '8px', // rounded corners
            fontFamily: 'Arial, sans-serif', // font family
            fontSize: '13px', // text size
            color: '#333', // dark grey text color
            alignSelf: 'start',
            marginLeft: '10px',
            margin: '20px',
            marginTop: "20px"
          }}>
            Compare specific complaint types across different zip codes or boroughs in the past week:
          </div>

          <div >
            <ZipCodeBoroSelect loadingLineChartonClick={loadingLineChartonClick} updateDayCountData={updateDayCountData}></ZipCodeBoroSelect>
          </div>

          {loadingLineChart && (
            <>
              <div style={{ margin: "100px", textAlign: "center" }}>
                <div style={{ position: "relative" }}>
                  <Spinner animation="grow" size="sm" className="spinner spinner1" />
                  <Spinner animation="grow" className="spinner spinner2" />
                  <Spinner animation="grow" style={{ height: "50px", width: "50px" }} className="spinner spinner3" />
                </div>

                Fetching data...
              </div>
            </>
          )}


          {!loadingLineChart && (

            <ResponsiveContainer style={{ marginTop: "15px" }} width="100%" height={400}>
              <LineChart
                width={500}
                height={300}
                data={dayCountData}
                margin={{ top: 50, right: 50, left: 50, bottom: 50 }}  // Adjust bottom margin as needed
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  height={70}
                  tickFormatter={(tickItem) => moment(tickItem).format('MMM Do')}
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                  style={{ fontSize: xAxisFontSize }}
                />
                <YAxis label={{ value: 'Number of Complaints', angle: -90, position: 'insideLeft', dx: -35, dy: 55, fontSize: yAxisFontSize }} />
                <Tooltip />
                <Legend
                  wrapperStyle={{
                    padding: 10, // Adds padding around the legend items
                    margin: 20, // Adds margin outside the legend
                    justifyContent: 'space-around' // Spreads the legend items evenly
                  }}
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                />


                {linekeys.map(key => (
                  <Line
                    key={key}
                    type="linear"
                    dataKey={key}
                    stroke={getRandomColor()} // Implement getRandomColor to assign colors or define a mapping
                    activeDot={{ r: 8 }}
                  />
                ))}

                {/* <Line type="linear" dataKey="BROOKLYN" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="linear" dataKey="QUEENS" stroke="#82ca9d" />
                <Line type="linear" dataKey="MANHATTAN" stroke="#ffc658" />
                <Line type="linear" dataKey="BRONX" stroke="#ff7300" />
                <Line type="linear" dataKey="STATEN ISLAND" stroke="#d0ed57" /> */}

              </LineChart>
            </ResponsiveContainer>
          )}


        </div>



      </div>

      {/* Conditional rendering based on loading for the remaining content */}
      {!loading && (
        <div style={{ marginTop: "35px", backgroundColor: "#f7f7f7" }}>

          <h5 style={{ textAlign: "center", margin: "30px" }}> All <span style={{ fontWeight: "bolder", marginLeft: "5px", marginRight: "5px", textDecoration: 'underline' }}> {selectedData} </span>complaints for
            {
              filters.zip ? (
                <span style={{ fontWeight: "bolder", marginLeft: "5px", marginRight: "5px", textDecoration: 'underline' }}>
                  {currentZipForDisplay.length > 0 ? currentZipForDisplay.join(', ') : "all"} zipcode(s)
                </span>
              ) : (
                <span style={{ fontWeight: "bolder", marginLeft: "5px", marginRight: "5px", textDecoration: 'underline' }}>
                  {filters.Borough !== '' ? filters.Borough.charAt(0).toUpperCase() + filters.Borough.slice(1).toLowerCase() : "the entire city:"}
                </span>
              )
            }</h5>

          <div ref={complaintCardsRef} style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', backgroundColor: "#f7f7f7" }}>
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

        </div>
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
