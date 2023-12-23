import "./neighborhood.css";
import { useParams } from 'react-router-dom';
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import NeighborhoodEditableDiv from "../NeighborhoodEditableDiv/index";
import Button from 'react-bootstrap/Button';


const NeighborhoodProfile = ({ currentuser }) => {

  const { neighborhoodid } = useParams();
  const [neighborhood, setNeighborhood] = useState(null);
  const [isEditable, setIsEditable] = useState(false);

  // make requequest to get the neeighborhood data with id of neighborhoodid
  const getNeighorhoodData = async () => {
    try {

      const neighborhood = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/neighborhood/${neighborhoodid}`);

      setNeighborhood(neighborhood.data);

      setIsEditable(neighborhood.data.user.id === currentuser?.id);
    } catch (error) { }
  }

  useEffect(() => {
    getNeighorhoodData();
  }, [currentuser]);//currentuser

  // console.log("is editable", isEditable);



  return (

    <div style={{ paddingTop: "30px" }}>

      <div className="userProfileContainer" style={{ position: "relative", left: "50%", transform: "translate(-50%, 0)", border: "1px solid black" }}>

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



          <div className="containerNhoodItems userInfo">
            <div className="userInfoSubContainer">
              {neighborhood && (
                <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", width: "80%", alignItems: "start", position: "relative", left: "50%", transform: "translate(-50%, 0)" }}>
                  <NeighborhoodEditableDiv complementaryText={"I have been living in " + neighborhood.neighborhood} isEditable={isEditable} neighborhoodid={neighborhoodid} content={neighborhood.timeLivingInNeighborhood.toLowerCase() + ". "} objectKey="timeLivingInNeighborhood" />
                  <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={neighborhood.neighborhood + " can be described as "} content={neighborhood.neighborhoodDescription + "."} objectKey="neighborhoodDescription" />
                  <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={"The neighborhood has a vibe that's "} adjectives={neighborhood.neighborhoodAdjectives} objectKey="neighborhoodAdjectives" />
                  <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={"I would say the most unique thing about " + neighborhood.neighborhood + " is "} content={neighborhood.mostUniqueThingAboutNeighborhood
                  } objectKey="mostUniqueThingAboutNeighborhood" />
                  <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={"People should visit " + neighborhood.neighborhood + " if they want "} content={neighborhood.peopleShouldVisitNeighborhoodIfTheyWant
                  } objectKey="peopleShouldVisitNeighborhoodIfTheyWant" />
                </div>
              )}
            </div>
          </div>


          <div className="containerNhoodItems" >
            {neighborhood && (
              <div style={{ width: "80%", position: "relative", left: "50%", transform: "translate(-50%, 0)" }}>
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


          <div className="sectionContainer containerNhoodItems" >
            {neighborhood && (
              <div style={{ position: "relative", left: "50%", transform: "translate(-50%, 0)", width: "80%" }}>
                <div className="detailsContainer">
                  <div className="imageSectionContainer">
                    <h5 className="sectionHeader">The residents</h5>
                    <img className="imageResidents" alt="residentsimage" style={{ padding: "20px" }} src="https://raw.githubusercontent.com/diegoleonardoro/multi-k8s/main/socialbutterflies.png" />
                  </div>

                  <div style={{ width: "100%" }}>
                    <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={"The typical resident of " + neighborhood.neighborhood + " tends to be "} content={neighborhood.typicalResidentDescription
                    } objectKey="typicalResidentDescription" />
                    <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={"The average resident can be described as "} adjectives={neighborhood.residentAdjectives} objectKey="residentAdjectives" />
                  </div>

                </div>
              </div>
            )}
          </div>


          <div className="containerNhoodItems" >
            {neighborhood && (
              <div className="containerFood" style={{ position: "relative", left: "50%", transform: "translate(-50%, 0)" }}>
                <div className="imageSectionContainer">
                  <h5 className="recommendationsHeader" >Food</h5>
                  <img className="recommendationsImage" alt="foodimage" src="https://raw.githubusercontent.com/diegoleonardoro/multi-k8s/main/food.png"></img>
                </div>
                <div className="foodEditableDivsContainer">
                  <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={"The food scene of " + neighborhood.neighborhood + " can be generally described as "} content={neighborhood.foodCulture
                  } objectKey="foodCulture" />
                  <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={[`I would say the food in ${neighborhood.neighborhood} is `, 'because ']} objectData={neighborhood.foodIsAuthentic
                  } objectKey="foodIsAuthentic" />
                  <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={[`Food prices in ${neighborhood.neighborhood} can be `, 'because ']} objectData={neighborhood.foodPrices} objectKey="foodPrices" />
                  <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} recommendationsArrayOfObjects={neighborhood.recommendedFoodTypes} objectKey="recommendedFoodTypes" />
                  <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={[`If I were to suggest ONE place to eat in ${neighborhood.neighborhood} it would be `, 'because ']} objectData={neighborhood.onePlaceToEat} objectKey="onePlaceToEat" />
                </div>
              </div>
            )}
          </div>



          <div className="sectionContainer containerNhoodItems">
            {neighborhood && (
              <div className="nightLifeContainer" style={{ position: "relative", left: "50%", transform: "translate(-50%, 0)", width: "80%" }}>
                <div className="imageSectionContainer">
                  <h5 className="recommendationsHeader" >Night Life</h5>
                  <img alt='nightlifeimage' className="recommendationsImage" src="https://raw.githubusercontent.com/diegoleonardoro/multi-k8s/main/DALL%C2%B7E-2023-11-14-11.10.18---A-linear-pencil-sketch-of-a-cocktail-glass-with-a-grain-effect%2C-symbolizing-nightlife.-The-sketch-is-defined-by-clean%2C-crisp-lines-to-illustrate-the-s.png"></img>
                </div>
                <div className="nightLifeEditableDivsContainer">
                  <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={"I would describe the nighlife of " + neighborhood.neighborhood + " as "} content={neighborhood.nightLife} objectKey="nightLife" />
                  <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} recommendationsArrayOfObjects={neighborhood.nightLifeRecommendations} objectKey="nightLifeRecommendations" />
                  <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={[`If I were to suggest ONE place for a fun at night, it would be `, 'because ']} objectData={neighborhood.onePlaceForNightLife} objectKey="onePlaceForNightLife" />
                </div>
              </div>
            )}
          </div>


          <div className="containerNhoodItems" >
            {neighborhood && (
              <div style={{ width: "80%", position: "relative", left: "50%", transform: "translate(-50%, 0)" }}>
                <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} neighborhood={neighborhood.neighborhood} nestedObjects={neighborhood.statements} objectKey="statements" />
              </div>
            )}

          </div>

        </div>
      </div>
    </div>

  )

}


export default NeighborhoodProfile