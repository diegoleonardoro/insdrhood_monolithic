import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import Card from "react-bootstrap/Card";
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import chroma from 'chroma-js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';


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



const Complaints311 = ({ showRegisterFrom = true }) => {

  const [complaints, setComplaints] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [descriptorCountchartData, setDescriptorCountchartData] = useState([]);

  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');

  const [filters, setFilters] = useState({
    "zip": '',
    "Borough": '',
    "Agency": '',
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
  };

  const fetchComplaints = async (reset = false, applyFilters = false) => {

    setLoading(true);

    const valueThreshold = Object.values(filters).some(value => value !== '') ? 3: 20

    const params_ = applyFilters ? filters : { limit: 10, page };

    const zipCodesArray = filters.zip.split(/\s*,\s*|\s+/).filter(zip => zip !== '');

    try {
      const response = await axios.get(`${process.env.REACT_APP_NYC_DATA_BACKEND_URL}/311calls`, {
        params: {
          ...params_,
          zip: zipCodesArray
        }
      });

      setMinDate(formatReadableDate(response.data.max_date))
      setMaxDate(formatReadableDate(response.data.min_date))
    

      const sortedData_descriptor_counts = transformAndSortData(response.data.descriptor_counts);
      const filteredData_descriptor_counts = sortedData_descriptor_counts.filter(item => item.value > valueThreshold);
      // Determine the entries that do not exceed the threshold
      const otherEntries = sortedData_descriptor_counts.filter(item => item.value <= valueThreshold);
      // Calculate the total count of 'Other' entries
      const otherDataSum = otherEntries.reduce((acc, item) => acc + item.value, 0);
      // Add 'Other' category only if there are more than 15 items in otherEntries
      const finalData_descriptor_counts = filteredData_descriptor_counts.concat(otherEntries.length > 15 ? { name: 'Other', value: otherDataSum } : otherEntries);
      setDescriptorCountchartData(finalData_descriptor_counts);

      if (response.data.original_data.length > 0) {
        if (reset) {
          setComplaints(response.data.original_data);
        } else {

          setComplaints(prev => [...prev, ...response.data.original_data]);
        }
        setPage(prevPage => prevPage + 1);
      } else {
        setHasMore(false);
      }

    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setInitialLoad(false);
    fetchComplaints(true, true);
  };

  useEffect(() => {
    if (initialLoad) {
      fetchComplaints(true, false);

   
    }
  }, [initialLoad]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    if (name === 'zip') {

      setFilters(prevFilters => ({
        ...prevFilters,
        [name]: value,
        Borough: ''
      }));

    } else if (name === 'Borough') {
      // Reset the zip code to the default value when borough changes
      setFilters(prevFilters => ({
        ...prevFilters,
        [name]: value,
        zip: ''
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
  

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: "100vh", backgroundColor:'white' }}>

      <div style={{
        backgroundColor: '#f0f4f8', // light greyish background
        padding: '10px 20px', // padding around the text
        borderRadius: '8px', // rounded corners
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // subtle shadow for depth
        margin: '20px auto', // centered with margin
        maxWidth: '600px', // maximum width
        textAlign: 'center', // center text alignment
        fontFamily: 'Arial, sans-serif', // font family
        fontSize: '20px', // text size
        color: '#333' // dark grey text color
      }}>
        Data from {minDate} to {maxDate}
      </div>

      {/* Always render the form */}
      <Form onSubmit={handleFilterSubmit} style={{ width: '85%', maxWidth: '400px', margin: '40px' }}>
        <Form.Group controlId="formZip">
          <Form.Label>Incident Zip:</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter zip"
            name="zip"
            value={filters.zip}
            onChange={handleFilterChange}
            style={{ backgroundColor: "transparent", border: "1px solid  #5f5e5e" }}
          />
        </Form.Group>
        <Form.Group controlId="formBorough">
          <Form.Label>Borough:</Form.Label>
          <Form.Control
            as="select"
            name="Borough"
            value={filters.Borough}
            onChange={handleFilterChange}
            style={{ backgroundColor: "transparent", border: "1px solid  #5f5e5e", cursor: "pointer" }}
          >
            <option value="">All Boroughs</option>
            <option value="BRONX">Bronx</option>
            <option value="BROOKLYN">Brooklyn</option>
            <option value="QUEENS">Queens</option>
            <option value="MANHATTAN">Manhattan</option>
            <option value="STATEN ISLAND">Staten Island</option>
          </Form.Control>
        </Form.Group>
        <Button className="filter311button" style={{ marginTop: "20px", width: "100%", backgroundColor: "rgba(255, 151, 5, 0.221)", color: "black" }} type="submit" variant="dark">Apply Filters</Button>
      </Form>

      <ResponsiveContainer width="100%" height={500}>
        <PieChart margin={{ top: 20, right: 150, bottom: 20, left: 150 }}>
          <Pie
            data={descriptorCountchartData}
            cx="50%"
            cy="50%"
            outerRadius={130}
            fill="#8884d8"
            dataKey="value"
            startAngle={280}
            endAngle={-180}
            labelLine={true}
            label={(props) => {
              const { cx, cy, midAngle, outerRadius, name, percent } = props;
              const RADIAN = Math.PI / 180;
              const radius = outerRadius + 30;  // Adjust the distance of the label from the center
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);

              // Determine if label should be on the left or right half of the pie
              const textAnchor = (midAngle > 270 || midAngle < 90) ? 'start' : 'end';

              return (
                <text
                  x={x}
                  y={y}
                  fill="#333"
                  textAnchor={textAnchor}
                  dominantBaseline="central"
                  style={{ fontSize: '0.55rem' }}  // You can adjust the font size for better fit
                >
                  {`${name}: ${(percent * 100).toFixed(0)}%`}
                </text>
              );
            }}
          >
            {descriptorCountchartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          {/* <Legend align="right" verticalAlign="middle" layout="vertical" wrapperStyle={{ top: 0, right: 0, width: 300 }} content={<CustomLegend />} /> */}
        </PieChart>
      </ResponsiveContainer>



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
            {hasMore && <Button style={{ padding: "15px", alignSelf: "center" }} variant="dark" onClick={() => fetchComplaints()}>Load More</Button>}
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

