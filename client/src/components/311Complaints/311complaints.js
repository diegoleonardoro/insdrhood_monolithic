import React, { useContext, useEffect, useState } from 'react';
import { CartContext } from '../../contexts/cart-context';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Card from "react-bootstrap/Card";
import CardBody from 'react-bootstrap/esm/CardBody';
import ListGroup from 'react-bootstrap/ListGroup';

import "./311complaints.css";

const Complaints311 = () => {

  const [complaints, setComplaints] = useState([]);

  const fetchComplaints = async () => {
    const complaints311 = await axios.get(`${process.env.REACT_APP_NYC_DATA_BACKEND_URL}/311calls`);

    console.log("complaints311 ", complaints311);

    setComplaints(complaints311.data);
  }

  useEffect(() => {
    fetchComplaints()
  }, []);


  console.log("complaints", complaints)

  const complaintsCards = 
  complaints.map((complaint, index) => {

    const key = index

    return (
      < Card style={{ width: '18rem', margin:"20px" }} key={key} >
        <ListGroup className="list-group-flush">
           <Card.Header as="h5">{complaint['Descriptor']}. {complaint['Complaint Type']} </Card.Header>
          <ListGroup.Item>  {complaint['Created Date']}</ListGroup.Item>
          <ListGroup.Item>{complaint['Incident Address']}, {complaint['Incident Zip']}, {complaint['Borough']}</ListGroup.Item>
          <ListGroup.Item>Responding agency: {complaint['Agency']}</ListGroup.Item>
        </ListGroup>
      </Card>
    )




  })

  return (
    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
      {complaintsCards}
    </div>
  )



}

export default Complaints311;