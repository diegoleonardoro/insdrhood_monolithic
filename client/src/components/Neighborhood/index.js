import "./neighborhood.css";
import { useParams } from 'react-router-dom';
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import NeighborhoodEditableDiv from "../NeighborhoodEditableDiv/index";
import { useUserContext } from "../../contexts/UserContext";

import Button from 'react-bootstrap/Button';
import { useUser } from "../../contexts/UserContext";
import { useNavigate } from 'react-router-dom';

const NeighborhoodProfile = () => {

  const { currentuser_, setCurrentUserDirectly } = useUserContext();

  const { neighborhoodid } = useParams();
  const [neighborhood, setNeighborhood] = useState(null);
  const [isEditable, setIsEditable] = useState(false);

  // Function that will check if the last character of a string is a period and if so it will remove it:
  function removeTrailingPeriod(str) {
    if (str && typeof str === 'string') {
      return str.replace(/\.\s*$/, '');
    }
    return str;
  }

  const getNeighorhoodData = async () => {
    try {
      const neighborhood = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/neighborhood/${neighborhoodid}`);
      const currentUser__ = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/currentuser`, { withCredentials: true });
      setNeighborhood(neighborhood.data);
      setIsEditable(neighborhood.data.user.id === currentUser__?.data.id);

    } catch (error) { }
  }

  useEffect(() => {
    getNeighorhoodData();
  }, []);//currentuser

  const nhoodName = neighborhood?.neighborhood.charAt(0).toUpperCase() + neighborhood?.neighborhood.slice(1);



  return (

    <div>

      <div className="userProfileContainer">

        <div className="userIntroContainer"
          style={{ position: "relative" }}>

          {/* <div style={{ width: "100%", backgroundColor: "#FFFCEB" }} >
            <img alt="profileImage" style={{ width: "100%", padding: "10px" }} src="https://raw.githubusercontent.com/diegoleonardoro/multi-k8s/main/DALL%C2%B7E%202023-12-26%2011.59.19%20-%20A%20crisp%20and%20clear%20panoramic%20view%20of%20a%20classic%20New%20York%20City%20neighborhood%2C%20featuring%20brownstones%2C%20restaurants%2C%20and%20bodegas%2C%20all%20without%20people%20and%20with%20(3).jpg"></img>
          </div> */}

          <div className="containerNhoodItems userInfo">

            <div className="userInfoSubContainer">

              <h1 style={{ textAlign: "center", position: "relative", top: "10px", display: "flex", justifyContent: "center", padding: "30px" }}>
                <span style={{ marginRight: "5px" }}>
                  <b>{nhoodName ? (nhoodName) : ''}</b>
                </span>{" "}
                {neighborhood?.user?.name ? (
                  <p> by <b>{neighborhood.user.name}</b>.</p>
                ) : (<p>by anonymous.</p>)}
              </h1>

              {neighborhood && (

                <div className="introContainer" >

                  <NeighborhoodEditableDiv complementaryText={"I have been living in " + nhoodName} isEditable={isEditable} neighborhoodid={neighborhoodid} content={neighborhood.timeLivingInNeighborhood.toLowerCase() + ". "} objectKey="timeLivingInNeighborhood" />

                  <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={nhoodName + " can be described as follows"} content={
                    removeTrailingPeriod(neighborhood.neighborhoodDescription.toLowerCase()) + "."
                  } objectKey="neighborhoodDescription" />

                  <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={"The neighborhood has a vibe that's "} adjectives={neighborhood.neighborhoodAdjectives} objectKey="neighborhoodAdjectives" />

                  <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={"I would say the most unique thing about " + nhoodName + " is "} content={
                    removeTrailingPeriod(neighborhood.mostUniqueThingAboutNeighborhood.toLowerCase()) } objectKey="mostUniqueThingAboutNeighborhood" />

                  <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={"People should visit " + nhoodName + " if they want "} content={
                    removeTrailingPeriod(neighborhood.peopleShouldVisitNeighborhoodIfTheyWant.toLowerCase()) 
                  } objectKey="peopleShouldVisitNeighborhoodIfTheyWant" />
                </div>
              )}
            </div>
          </div>

          {/** IMAGES */}
          <div className="containerNhoodItems" >
            {neighborhood && (
              <div >
                <NeighborhoodEditableDiv
                  neighborhoodid={neighborhoodid}
                  isEditable={isEditable}
                  objectKey={'neighborhoodImages'}
                  images={neighborhood.neighborhoodImages}
                  neighborhood={nhoodName}
                  imagesId={currentuser_?.imagesId}
                />
              </div>
            )}
          </div>

          {/** RESIDENTS */}
          <div className="sectionContainer containerNhoodItems" >
            {neighborhood && (
              <div className="subContainerNhoodItems"  >
                <div className="detailsContainer_">
{/* 
                  <picture className="imageSectionContainer">

                    <source media="(max-width: 700px)" srcSet='https://raw.githubusercontent.com/diegoleonardoro/multi-k8s/main/1_residents%20.png' />

                    <img className="imageResidents" alt="residentsimage" src="https://raw.githubusercontent.com/diegoleonardoro/multi-k8s/main/residents%20.png" />

                  </picture> */}

                  <div className="reisidentsSubContainer" >
                    <div className="residentesSubSubContainer">
                      <h1 className="sectionHeader">The Residents of {nhoodName}</h1>
                      {/* <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={"The typical resident of " + nhoodName + " tends to be "} content={neighborhood.typicalResidentDescription
                      } objectKey="typicalResidentDescription" /> */}
                      <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={"The average resident can be described as"} adjectives={neighborhood.residentAdjectives} objectKey="residentAdjectives" />
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>


          {/** FOOD */}
          <div className="containerNhoodItems" >
            {neighborhood && (
              <div className="containerFood" style={{ position: "relative", left: "50%", transform: "translate(-50%, 0)" }}>

                <div className="foodEditableDivsContainer">

                  <div className="foodEditableDivsContainer_">

                    <h1 className="recommendationsHeader" > The Food of {nhoodName}</h1>

                    <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={[`I would say the food in ${nhoodName} is `, 'because ']} objectData={neighborhood.foodIsAuthentic
                    } objectKey="foodIsAuthentic" />
                    <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={[`Food prices in ${nhoodName} can be `, 'because ']} objectData={neighborhood.foodPrices} objectKey="foodPrices" />
                    <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} recommendationsArrayOfObjects={neighborhood.recommendedFoodTypes} objectKey="recommendedFoodTypes" />
                    <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={[`If I were to suggest ONE place to eat in ${nhoodName} it would be `, 'because ']} objectData={neighborhood.onePlaceToEat} objectKey="onePlaceToEat" />

                  </div>
                </div>
                {/* <picture className="imageSectionContainer">

                  <source media="(max-width: 700px)" srcSet='https://raw.githubusercontent.com/diegoleonardoro/multi-k8s/main/1_food.png' />

                  <img className="recommendationsImage" alt="foodimage" src="https://raw.githubusercontent.com/diegoleonardoro/multi-k8s/main/DALL%C2%B7E%202023-12-25%2012.01.38%20-%20A%20minimalistic%20illustration%20using%20the%20specified%20color%20palette%20%23efe6ab%2C%20%23848fa8%2C%20%235f582b%2C%20%232961a1%2C%20%23b3d2d1%2C%20depicting%20the%20concept%20of%20'food%20in%20a%20restaur.png"></img>


                </picture> */}
              </div>
            )}
          </div>


          {/** NIGHTLIFE */}
          <div className="sectionContainer containerNhoodItems">
            {neighborhood && (
              <div className="nightLifeContainer">
                {/* <picture className="imageSectionContainer">
                  <source media="(max-width: 700px)" srcSet='https://raw.githubusercontent.com/diegoleonardoro/multi-k8s/main/1_nightlife.jpg' />
                  <img className="recommendationsImage" alt="foodimage" src="https://raw.githubusercontent.com/diegoleonardoro/multi-k8s/main/nitelife.jpg"></img>
                </picture> */}

                <div className="nightLifeEditableDivsContainer">
                  <div style={{ position: "relative", margin: "auto " }}>
                    <h1 className="recommendationsHeader" >The Night Life of {nhoodName}</h1>

                    <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={[`Night life in ${nhoodName} can be `, 'because ']} objectData={neighborhood.nightLife} objectKey="nightLife" />
                    
                    {
                      ((neighborhood.nightLifeRecommendations && neighborhood.nightLifeRecommendations.length > 0) || isEditable) &&
                      <NeighborhoodEditableDiv
                        isEditable={isEditable}
                        neighborhoodid={neighborhoodid}
                        recommendationsArrayOfObjects={neighborhood.nightLifeRecommendations}
                        objectKey="nightLifeRecommendations"
                      />
                    }
                    <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={[`If I were to suggest ONE place for a fun at night, it would be `, 'because ']} objectData={neighborhood.onePlaceForNightLife} objectKey="onePlaceForNightLife" />
                  </div>
                </div>

              </div>
            )}
          </div>


          {/** STATEMENTS */}
          <div className="containerNhoodItems" >

            <h1>Some Neighborhood Assessments:</h1>
            {neighborhood && (
              <div className="assessmentsContainer">
                <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} neighborhood={nhoodName} nestedObjects={neighborhood.statements} objectKey="statements" />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>

  )

}


export default NeighborhoodProfile