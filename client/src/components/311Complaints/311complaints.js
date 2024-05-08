import React, { useContext, useEffect, useState } from 'react';
import axios from "axios";
import Card from "react-bootstrap/Card";
import ListGroup from 'react-bootstrap/ListGroup';
import "./311complaints.css";

const Complaints311 = () => {
  const [complaints, setComplaints] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchComplaints = async () => {
    if (!loading && hasMore) {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_NYC_DATA_BACKEND_URL}/311calls?page=${page}&limit=15`);
      if (response.data.length > 0) {
        setComplaints(prevComplaints => [...prevComplaints, ...response.data]);
        setPage(prevPage => prevPage + 1);
      } else {
        setHasMore(false);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || loading) return;
      fetchComplaints();
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

  useEffect(() => {
    fetchComplaints(); 
  }, []);

  const complaintsCards = complaints.map((complaint, index) => (
    <Card style={{ width: '18rem', margin: "20px" }} key={index}>
      <ListGroup className="list-group-flush">
        <Card.Header as="h5">{complaint['Descriptor']}. {complaint['Complaint Type']}</Card.Header>
        <ListGroup.Item>{complaint['Created Date']}</ListGroup.Item>
        <ListGroup.Item>{complaint['Incident Address']}, {complaint['Incident Zip']}, {complaint['Borough']}</ListGroup.Item>
        <ListGroup.Item>Responding agency: {complaint['Agency']}</ListGroup.Item>
      </ListGroup>
    </Card>
  ));

  return (
    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
      {complaintsCards}
      {loading && <div>Loading more complaints...</div>}
      {!hasMore && <div>No more complaints to show.</div>}
    </div>
  );
};

export default Complaints311;