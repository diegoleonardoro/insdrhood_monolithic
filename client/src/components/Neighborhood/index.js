import "./neighborhood.css";
import { useParams } from 'react-router-dom';
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const NeighborhoodProfile = ({ currentuser }) => {

  const { neighborhoodid } = useParams();

  const isEditable = neighborhoodid === currentuser?.id;

  // make requequest to get the neeighborhood data with id of neighborhoodid

  const getNeighorhoodData = async ()=>{
    try {
      const neighborhood = await axios.get(`http://localhost:4000/api/neighborhood/${neighborhoodid}`);
      console.log('llll', neighborhood);
    } catch (error) {
      
    }
  }

  useEffect(()=>{

    getNeighorhoodData()

  },[])

  return (



    <div style={{ paddingTop: "30px", backgroundColor: "#e4e4e4" }}>

      <div className="userProfileContainer" style={{ width: "70%", position: "relative", left: "50%", transform: "translate(-50%, 0)", border: "1px solid black" }}>

        <div className="userIntroContainer"
          style={{ borderBottom: "solid black 1px", position: "relative" }}>

          <img alt="profileImage" style={{ width: "100%" }} src="https://raw.githubusercontent.com/diegoleonardoro/multi-k8s/main/mainimg2.png"></img>




          <div className="userInfo">

            <div>
              <h4 className="introHeader" style={{ textAlign: "center" }}>
                <span>
                  {/* <b>{resident.neighborhood}</b> */}
                </span>{" "}
                {/* {resident.user?.name ? (
                  <p> by <b>{resident.user.name}</b>.</p>
                ) : (<p>by anonymous.</p>)} */}
              </h4>
              {/* <EditableDiv isEditable={isEditable} residentId={residentId} objectKey={'timeLivingInNeighborhood'} content={"I have been living in " + resident.neighborhood + " " + resident.timeLivingInNeighborhood.toLowerCase() + "."} /> */}
            </div>

          </div>


        </div>
      </div>

    </div>




  )
}


export default NeighborhoodProfile