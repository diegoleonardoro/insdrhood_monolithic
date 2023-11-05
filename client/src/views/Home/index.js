// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
import './home.css';
import Table from 'react-bootstrap/Table';

function Home() {

  // const [residentsData, setResidentsData] = useState(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  // useEffect(() => {
    // Define an async function
    // const fetchData = async () => {
    //   try {
    //     // Replace the URL with your backend endpoint
    //     const response = await axios.get('http://localhost:3001/api/data-endpoint');
    //     setResidentsData(response.data);
    //     setLoading(false);
    //   } catch (err) {
    //     setError(err.message);
    //     setLoading(false);
    //   }
    // };
    
    // fetchData();
    
  // }, []);  // The empty array means this useEffect will run once when the component mounts

  // const residentsList = residentsData.map((resident) => {
  //   return (
  //     <tr key={resident.id}>
  //       <td >{resident.user ? resident.user.name : null}</td>
  //       <td >{resident.neighborhood}</td>
  //       <td>
  //         {resident.neighborhoodDescription}
  //       </td>
  //       <td>
  //         {/* <Link href={"/residents/profile/[residentId]"} as ={`/residents/profile/${resident.id}`}  > 
  //           View
  //         </Link> */}
  //       </td>
  //     </tr>
  //   );
  // });

  // if (loading) return <div>Loading...</div>;
  // if (error) return <div>Error: {error}</div>;


  return (
    <Table striped bordered hover size="sm" style={{width:"90%", margin:"50px auto"}} > 
        <thead>
          <tr>
            <th>Resident</th>
            <th >Neighborhood</th>
            <th >Neighborhood Description</th>
            <th>Learn more</th>
          </tr>
        </thead>
       {/* {<tbody>{residentsList}</tbody>} */}
    </Table>
  );
}

export default Home;