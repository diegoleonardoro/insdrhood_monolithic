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

    <div>

      <div className="userProfileContainer" style={{ position: "relative", left: "50%", transform: "translate(-50%, 0)", border: "1px solid black" }}>

        <div className="userIntroContainer"
          style={{ position: "relative" }}>

          <div style={{ width: "100%", backgroundColor: "#FFFCEB" }} >
            <img alt="profileImage" style={{ width: "100%", padding: "10px" }} src="https://raw.githubusercontent.com/diegoleonardoro/multi-k8s/main/DALL%C2%B7E%202023-12-26%2011.59.19%20-%20A%20crisp%20and%20clear%20panoramic%20view%20of%20a%20classic%20New%20York%20City%20neighborhood%2C%20featuring%20brownstones%2C%20restaurants%2C%20and%20bodegas%2C%20all%20without%20people%20and%20with%20(3).jpg"></img>
          </div>

          <div className="containerNhoodItems userInfo">
            <div className="userInfoSubContainer">


              <h1 className="introHeader" style={{ textAlign: "center", position: "relative", top: "10px", display: "flex", justifyContent: "center", padding: "30px" }}>
                <span style={{ marginRight: "5px" }}>
                  <b>{neighborhood?.neighborhood}</b>
                </span>{" "}
                {neighborhood?.user?.name ? (
                  <p> by <b>{neighborhood.user.name}</b>.</p>
                ) : (<p>by anonymous.</p>)}
              </h1>

              {neighborhood && (
                <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", width: "65%", alignItems: "start", position: "relative", left: "50%", transform: "translate(-50%, 0)" }}>
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

                    <img className="imageResidents" alt="residentsimage" src="https://raw.githubusercontent.com/diegoleonardoro/multi-k8s/main/DALL%C2%B7E%202023-12-25%2011.53.09%20-%20A%20minimalistic%20illustration%20depicting%20different%20types%20of%20people%20living%20in%20a%20neighborhood.%20The%20people%20are%20abstract%20figures%2C%20each%20represented%20in%20a%20uniqu.png" />
                  </div>

                  <div style={{ width: "100%" }}>
                    <div style={{ width: "65%", position: "relative", margin: "auto " }}>
                      <h1 className="sectionHeader">The Residents</h1>
                      <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={"The typical resident of " + neighborhood.neighborhood + " tends to be "} content={neighborhood.typicalResidentDescription
                      } objectKey="typicalResidentDescription" />
                      <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={"The average resident can be described as "} adjectives={neighborhood.residentAdjectives} objectKey="residentAdjectives" />
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>


          <div className="containerNhoodItems" >
            {neighborhood && (
              <div className="containerFood" style={{ position: "relative", left: "50%", transform: "translate(-50%, 0)" }}>

                <div className="foodEditableDivsContainer">

                  <div style={{ width: "65%", position: "relative", margin: "auto " }}>

                    <h1 className="recommendationsHeader" > The Food</h1>
                    <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={"The food scene of " + neighborhood.neighborhood + " can be generally described as "} content={neighborhood.foodCulture
                    } objectKey="foodCulture" />
                    <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={[`I would say the food in ${neighborhood.neighborhood} is `, 'because ']} objectData={neighborhood.foodIsAuthentic
                    } objectKey="foodIsAuthentic" />
                    <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={[`Food prices in ${neighborhood.neighborhood} can be `, 'because ']} objectData={neighborhood.foodPrices} objectKey="foodPrices" />
                    <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} recommendationsArrayOfObjects={neighborhood.recommendedFoodTypes} objectKey="recommendedFoodTypes" />
                    <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={[`If I were to suggest ONE place to eat in ${neighborhood.neighborhood} it would be `, 'because ']} objectData={neighborhood.onePlaceToEat} objectKey="onePlaceToEat" />

                  </div>
                </div>
                <div className="imageSectionContainer">

                  <img className="recommendationsImage" alt="foodimage" src="https://raw.githubusercontent.com/diegoleonardoro/multi-k8s/main/DALL%C2%B7E%202023-12-25%2012.01.38%20-%20A%20minimalistic%20illustration%20using%20the%20specified%20color%20palette%20%23efe6ab%2C%20%23848fa8%2C%20%235f582b%2C%20%232961a1%2C%20%23b3d2d1%2C%20depicting%20the%20concept%20of%20'food%20in%20a%20restaur.png"></img>
                </div>
              </div>
            )}
          </div>



          <div className="sectionContainer containerNhoodItems">
            {neighborhood && (
              <div className="nightLifeContainer" style={{ position: "relative", left: "50%", transform: "translate(-50%, 0)", width: "80%" }}>
                <div className="imageSectionContainer">
                  <img alt='nightlifeimage' className="recommendationsImage" src="https://raw.githubusercontent.com/diegoleonardoro/multi-k8s/main/DALL%C2%B7E%202023-12-25%2013.53.18%20-%20Create%20a%20minimalist%20bar%20and%20nightlife%20illustration%20with%20an%20abstract%20representation%20of%20people%20in%20a%201024x1792%20frame.%20The%20background%20should%20be%20a%20solid%20co.png"></img>
                </div>
                <div className="nightLifeEditableDivsContainer">
                  <div style={{ width: "65%", position: "relative", margin: "auto " }}>
                    <h1 className="recommendationsHeader" >Night Life</h1>
                    <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={"I would describe the nighlife of " + neighborhood.neighborhood + " as "} content={neighborhood.nightLife} objectKey="nightLife" />
                    <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} recommendationsArrayOfObjects={neighborhood.nightLifeRecommendations} objectKey="nightLifeRecommendations" />
                    <NeighborhoodEditableDiv isEditable={isEditable} neighborhoodid={neighborhoodid} complementaryText={[`If I were to suggest ONE place for a fun at night, it would be `, 'because ']} objectData={neighborhood.onePlaceForNightLife} objectKey="onePlaceForNightLife" />
                  </div>
                </div>
              </div>
            )}
          </div>


          <div className="containerNhoodItems" >
            {neighborhood && (
              <div style={{ width: "65%", position: "relative", left: "50%", transform: "translate(-50%, 0)" }}>
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