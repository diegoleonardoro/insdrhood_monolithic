import "./neighborhood.css";
import { useParams } from 'react-router-dom';
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import NeighborhoodEditableDiv from "../NeighborhoodEditableDiv/index";
import Button from 'react-bootstrap/Button';


const NeighborhoodProfile = ({ currentuser }) => {

  console.log("current user: ", currentuser);


  const { neighborhoodid } = useParams();
  const [neighborhood, setNeighborhood] = useState(null);
  const [isEditable, setIsEditable] = useState(false);


  // make requequest to get the neeighborhood data with id of neighborhoodid
  const getNeighorhoodData = async () => {
    try {

      const neighborhood = await axios.get(`http://localhost:4000/api/neighborhood/${neighborhoodid}`);
      setNeighborhood(neighborhood.data);

      console.log(neighborhood.data)
      setIsEditable(neighborhood.data.id === currentuser?.residentId[0]);

    } catch (error) { }
  }

  useEffect(() => {
    getNeighorhoodData();
  }, [currentuser]);

  console.log("neighborhood.neighborhoodAdjectives", neighborhood?.neighborhoodAdjectives)


  return (

    <div style={{ paddingTop: "30px", backgroundColor: "#e4e4e4" }}>

      <div className="userProfileContainer" style={{ width: "70%", position: "relative", left: "50%", transform: "translate(-50%, 0)", border: "1px solid black" }}>

        <div className="userIntroContainer"
          style={{ position: "relative" }}>

          <img alt="profileImage" style={{ width: "100%" }} src="https://raw.githubusercontent.com/diegoleonardoro/multi-k8s/main/mainimg2.png"></img>

          <h4 className="introHeader" style={{ textAlign: "center", position: "relative", top: "-90px" }}>
            <span>
              <b>{neighborhood?.neighborhood}</b>
            </span>{" "}
            {neighborhood?.user?.name ? (
              <p> by <b>{neighborhood.user.name}</b>.</p>
            ) : (<p>by anonymous.</p>)}
          </h4>

          <hr></hr>

          <div className="userInfo">

            <div>
              {neighborhood && (

                <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", width: "50%",alignItems:"start", position: "relative", left: "50%", transform: "translate(-50%, 0)" }}>

                  <NeighborhoodEditableDiv complementaryText={"I have been living in " + neighborhood.neighborhood} isEditable={isEditable} neighborhoodid={neighborhoodid} content={neighborhood.timeLivingInNeighborhood.toLowerCase() + ". "} objectKey="timeLivingInNeighborhood" />

                  <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={neighborhood.neighborhood + " can be described as "} content={neighborhood.neighborhoodDescription + "."} objectKey="neighborhoodDescription" />

                  <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={"The neighborhood has a vibe that's "} adjectives={neighborhood.neighborhoodAdjectives} objectKey="neighborhoodDescription" />
                </div>


              )}
            </div>

          </div>

          <hr></hr>


          <div className="containerNhoodItems" >
            {neighborhood && (
              <div style={{ position: "relative", left: "50%", transform: "translate(-50%, 0)" }}>
                <NeighborhoodEditableDiv
                  neighborhoodid={neighborhoodid}
                  isEditable={isEditable}
                  objectKey={'neighborhoodImages'}
                  images={neighborhood.neighborhoodImages}
                  neighborhood={neighborhood.neighborhood}
                  imagesId={currentuser?.imagesId}
                />
              </div>
            )}
          </div>

          <hr></hr>


          <div className="containerNhoodItems" >



          </div>


        </div>
      </div>

    </div>




  )
}


export default NeighborhoodProfile