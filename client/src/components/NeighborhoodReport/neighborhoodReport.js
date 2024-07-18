import "./neighborhoodReport.css"

import { useState, useEffect } from "react";
import axios from "axios";



const NeighborhoodReport = () => {
  const [data, setData] = useState({
    common_complaints: null,
    complaints_by_frequency: [],
    addresses_with_complaints: [],
    agencies_and_complaints: []
  });

  const [nhoodDescriptions, setNhoodDescriptions] = useState([]); // 1
  const [mostUniqueThings, setMostUniqueThings] = useState([]); // 2
  const [pplShouldVisitIfTheyWant, setPplShouldVisitIfTheyWant] = useState([]); // 3
  const [recommendedFoodTypes, setRecommendedFoodTypes] = useState([]); // 4
  const [nightLifeRecommendations, setNightLifeRecommendations] = useState([]); //5
  const [hoodImages, setHoodImages] = useState([]); // 5



  useEffect(() => {
    const fetchData = async () => {

      const response = await axios.get(`${process.env.REACT_APP_NYC_DATA_BACKEND_URL}/neighborhood_report_data`, {
        params: {
          neighborhood: "Mott Haven"
        }
      });

      // Store the response data in state
      setData(response.data);

      const neighborhoodData = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/neighborhoodData/Williamsburg`);

      const data = neighborhoodData.data;

      const uniqueThings = data.map(item => item.mostUniqueThingAboutNeighborhood);

      const foodTypes = data.flatMap(item => item.recommendedFoodTypes.map(ft => ({
        type: ft.assessment,
        explanation: ft.explanation
      })));

      const neighborhoodDescriptions = data.map(item => item.neighborhoodDescription);
      const peopleShouldVisitIfTheyWant = data.map(item => item.peopleShouldVisitNeighborhoodIfTheyWant);
      const neighborhoodImages = data.map(item => item.neighborhoodImages);
      const nightLifeRecommendations_ = data.map(item => item.nightLifeRecommendations[0])

      setMostUniqueThings(uniqueThings);
      setRecommendedFoodTypes(foodTypes.filter(item => item.explanation !== undefined));
      setNhoodDescriptions(neighborhoodDescriptions);
      setPplShouldVisitIfTheyWant(peopleShouldVisitIfTheyWant);
      setHoodImages(neighborhoodImages);
      setNightLifeRecommendations(nightLifeRecommendations_);

    };
    fetchData();
  }, []);


  function capitalizeAndEnd(sentence) {
    // Trim the sentence to remove any leading/trailing whitespace
    let trimmedSentence = sentence.trim();

    // Capitalize the first letter and append the rest of the sentence
    let capitalizedSentence = trimmedSentence.charAt(0).toUpperCase() + trimmedSentence.slice(1);

    // Ensure the sentence ends with a period
    if (!capitalizedSentence.endsWith('.')) {
      capitalizedSentence += '.';
    }

    return `"${capitalizedSentence}"`;
  }

  function capitalize(sentence) {
    
    let trimmedSentence = sentence.trim();
    let capitalizedSentence = trimmedSentence.charAt(0).toUpperCase() + trimmedSentence.slice(1);

    return `${capitalizedSentence}.`;
  }

  return (
    <div className="__mainContainer">

      <h1 className="neighborhoodDataHeader">According to the Residents</h1>

      <div className="sectionContainer">
        <h2 className="neighborhoodDataSubHeader" >Williamsburg can be described as:</h2>
        {nhoodDescriptions.map((description, index) => {
          return <p key={index}>{capitalizeAndEnd(description)}</p>
        })}
      </div>

      <div className="sectionContainer">
        <h2 className="neighborhoodDataSubHeader">The Most Unique Thing About Williamsburg is:</h2>
        {mostUniqueThings.map((description, index) => {
          return <p key={index}>{capitalizeAndEnd(description)}</p>
        })}
      </div>

      <div className="sectionContainer">
        <h2 className="neighborhoodDataSubHeader">People Shouls Visit Williamsburg if they want:</h2>
        {pplShouldVisitIfTheyWant.map((description, index) => {
          return <p key={index}>{capitalizeAndEnd(description)}</p>
        })}
      </div>

      <div className="sectionContainer">
        <h2 className="neighborhoodDataSubHeader">Recommended Food in Williamsburg:</h2>
        <div className="sectionContainer__">
          {recommendedFoodTypes.map((description, index) => {
            return <div key={index}> <span style={{ color: "#DEA001" }}>{index + 1 + ". " + capitalize(description.explanation)} </span> <span style={{ color: "white" }}>{" " + capitalize(description.type)}</span> </div>
          })}
        </div>
      </div>


      <div className="sectionContainer">
        <h2 className="neighborhoodDataSubHeader">Night Life Recommendations:</h2>
        <div className="sectionContainer__">
          {nightLifeRecommendations.map((description, index) => {
            return <div key={index}> <span style={{ color: "#DEA001" }}>
              {index + 1 + ". " + capitalize(description.assessment)} </span>
              <span style={{ color: "white" }}>{" " + capitalize(description.explanation)}</span>
            </div>
          })}
        </div>
      </div>


      {hoodImages.length > 0 ? (<div className="sectionContainer">
        <h2 className="neighborhoodDataSubHeader">Some Images of Williamsburg:</h2>

        {hoodImages.map((images, index) => (
          images.length > 0 ? <img  style={{width:"30%"}}src={"https://insiderhood.s3.amazonaws.com/" + images[0]?.image} key={index} /> : null
        ))}


      </div>) : null}



      {/* <h1>Neighborhood Complaints Report for Williamsburg HHHHHHHHHHHHHHHHH </h1>
      {data.common_complaints && (
        <div>
          <h2>Most Common Complaint</h2>
          <p>{data.common_complaints.most_common} ({data.common_complaints.count} occurrences)</p>
          <h3>Top Addresses for this Complaint:</h3>
          <ul>
            {data.common_complaints.top_addresses.map((address, index) => (
              <li key={index}>{address}</li>
            ))}
          </ul>
        </div>
      )} */}

      {/* <h2>All Complaints by Frequency HHHHHHHHHHHHHHHHH </h2>
      {data.complaints_by_frequency.slice(0, 10).map((item, index) => (
        <div key={index}>
          <h3>{item.complaint} ({item.count} occurrences)</h3>
          <h4>Top Addresses:</h4>
          <ul>
            {item.top_addresses.map((address, idx) => (
              <li key={idx}>{address}</li>
            ))}
          </ul>
        </div>
      ))} */}

      {/* <h2>Addresses with Complaints HHHHHHHHHHHHHHHHH</h2>
      {data.addresses_with_complaints.slice(0, 10).map(([address, complaints], index) => (
        <div key={index}>
          <h3>{address}</h3>
          <ul>
            {complaints.map((complaint, idx) => (
              <li key={idx}>{complaint}</li>
            ))}
          </ul>
        </div>
      ))} */}

      {/* <h2>Complaints by Agency </h2>
      {Object.entries(data.agencies_and_complaints).slice(0, 10).map(([agency, complaints], index) => (
        <div key={index}>
          <h3>{agency}</h3>
          <ul>
            {complaints.map(([complaint, address], idx) => (
              <li key={idx}>{complaint} at {address}</li>
            ))}
          </ul>
        </div>
      ))}  */}


    </div>
  );





}

export default NeighborhoodReport