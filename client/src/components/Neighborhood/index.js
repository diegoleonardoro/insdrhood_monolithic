import "./neighborhood.css";
import { useParams } from 'react-router-dom';
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import NeighborhoodEditableDiv from "../NeighborhoodEditableDiv/index"

const NeighborhoodProfile = ({ currentuser }) => {

  const { neighborhoodid } = useParams();
  const [neighborhood, setNeighborhood] = useState(null);
  const [isEditable, setIsEditable] = useState(false);


  // make requequest to get the neeighborhood data with id of neighborhoodid
  const getNeighorhoodData = async () => {
    try {
      const neighborhood = await axios.get(`http://localhost:4000/api/neighborhood/${neighborhoodid}`);
      setNeighborhood(neighborhood.data);
      setIsEditable(neighborhood.data.id === currentuser?.residentId[0])
    } catch (error) { }
  }

  useEffect(() => {
    getNeighorhoodData();
  }, []);


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
                  <b>{neighborhood?.neighborhood}</b>
                </span>{" "}
                {neighborhood?.user?.name ? (
                  <p> by <b>{neighborhood.user.name}</b>.</p>
                ) : (<p>by anonymous.</p>)}
              </h4>

              {neighborhood && (

                <div style={{ margin: "10px", display: "flex", justifyContent: "center", flexDirection: "column" }}>
                  <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} content={"I have been living in " + neighborhood.neighborhood + " " + neighborhood.timeLivingInNeighborhood.toLowerCase() + ". "} />

                  <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={"I would describe the neighborhood as "} content={neighborhood.neighborhoodDescription + "."} />
                </div>

              )}



              {/* <EditableDiv isEditable={isEditable} neighborhoodid={residentId} objectKey={'timeLivingInNeighborhood'} content={"I have been living in " + neighborhood.neighborhood + " " + neighborhood.timeLivingInNeighborhood.toLowerCase() + "."} /> */}
            </div>

          </div>


        </div>
      </div>

    </div>




  )
}


export default NeighborhoodProfile