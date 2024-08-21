import React, { useState, useEffect, startTransition } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NeighborhoodReport = ({ nhoodData, nhoodsNarrative, neighborhood }) => {

  const [data, setData] = useState({
    common_complaints: null,
    complaints_by_frequency: [],
    addresses_with_complaints: [],
    agencies_and_complaints: []
  });

  const [nhoodDescriptions, setNhoodDescriptions] = useState([]);
  const [mostUniqueThings, setMostUniqueThings] = useState([]);
  const [pplShouldVisitIfTheyWant, setPplShouldVisitIfTheyWant] = useState([]);
  const [recommendedFoodTypes, setRecommendedFoodTypes] = useState([]);
  const [nightLifeRecommendations, setNightLifeRecommendations] = useState([]);
  const [hoodImages, setHoodImages] = useState([]);
  const [userIds, setUserIds] = useState([]);

  const [displayCount, setDisplayCount] = useState(4);


  const navigate = useNavigate();

  const handleNavigation = (path) => {
    startTransition(() => {
      navigate(path);
    });
  };

  useEffect(() => {
    if (!nhoodData) return; // Check if nhoodData is an empty list


    // axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/chat/sendChatInfo`, {
    //   webPageRoute: '/NeighborhoodReport',
    // })
    //   .then(response => {
    //     console.log('vistig notification');
    //   })
    //   .catch(error => {
    //     console.error('Error sending chat info:', error);
    //   });

    const fetchData = async () => {

      const uniqueThings = nhoodData.map(item => item.mostUniqueThingAboutNeighborhood);
      const foodTypes = nhoodData.flatMap(item =>
        item.recommendedFoodTypes.map(ft => ({
          type: ft.assessment,
          explanation: ft.explanation,
          _id: item._id
        }))
      );

      const neighborhoodDescriptions = nhoodData.map(item => item.neighborhoodDescription);
      const peopleShouldVisitIfTheyWant = nhoodData.map(item => item.peopleShouldVisitNeighborhoodIfTheyWant);
      const neighborhoodImages = nhoodData.map(item => item.neighborhoodImages);
      const nightLifeRecommendations_ = nhoodData.map(item => item.nightLifeRecommendations[0]);
      const userIds = nhoodData.map(item => item._id);

      setMostUniqueThings(uniqueThings);
      setRecommendedFoodTypes(foodTypes.filter(item => item.explanation !== undefined));
      setNhoodDescriptions(neighborhoodDescriptions);
      setPplShouldVisitIfTheyWant(peopleShouldVisitIfTheyWant);
      setHoodImages(neighborhoodImages);
      setNightLifeRecommendations(nightLifeRecommendations_);
      setUserIds(userIds);
    };

    fetchData();
  }, [nhoodData]); // Added nhoodData as a dependency to re-run effect when it changes

  function capitalizeAndEnd(sentence) {
    let trimmedSentence = sentence.trim();
    let capitalizedSentence = trimmedSentence.charAt(0).toUpperCase() + trimmedSentence.slice(1);
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

  // if ((!nhoodData || nhoodData.length === 0) && Object.keys(nhoodsNarrative).length === 0) {
  //   return null
  // }


  return (
    <div className="__mainContainer">


      {Object.entries(nhoodsNarrative).slice(0, displayCount).map(([key, value], index) => (
        <div className="sectionContainer" key={index}>
          <h2 className="neighborhoodDataSubHeader">{key}:</h2>
          <p>{value}</p>
        </div>
      ))}

      {Object.keys(nhoodsNarrative).length > displayCount && (
        <span style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}
          onClick={() => setDisplayCount(Object.keys(nhoodsNarrative).length)}>
          Show More
        </span>
      )}
      {displayCount > 4 && (
        <span style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline', marginLeft: '10px' }}
          onClick={() => setDisplayCount(4)}>
          Show Less
        </span>
      )}

      
      {nhoodData && nhoodData.length > 0 && (
        <>
          <h1 style={{ marginTop: "60px" }} className="neighborhoodDataHeader"> According to the Residents:</h1>
          <div className="sectionContainer">
            <h2 className="neighborhoodDataSubHeader" >{neighborhood} can be described as:</h2>
            {nhoodDescriptions.map((description, index) => {
              return <a target="_blank" rel="noopener noreferrer" href={`/neighborhood/${userIds[index]}`} key={index} className="hyperlink"> <p key={index}>{capitalizeAndEnd(description)}</p></a>
            })}
          </div>
          <div className="sectionContainer">
            <h2 className="neighborhoodDataSubHeader">The Most Unique Thing About {neighborhood} is:</h2>
            {mostUniqueThings.map((description, index) => {
              return <a target="_blank" rel="noopener noreferrer" key={index} href={`/neighborhood/${userIds[index]}`} className="hyperlink"><p key={index}>{capitalizeAndEnd(description)}</p></a>
            })}
          </div>
          <div className="sectionContainer">
            <h2 className="neighborhoodDataSubHeader">People Should Visit {neighborhood} if they want:</h2>
            {pplShouldVisitIfTheyWant.map((description, index) => {
              return <a target="_blank" rel="noopener noreferrer" key={index} href={`/neighborhood/${userIds[index]}`} className="hyperlink"><p key={index}>{capitalizeAndEnd(description)}</p></a>
            })}
          </div>
          <div className="sectionContainer">
            <h2 className="neighborhoodDataSubHeader">Recommended Food in {neighborhood}:</h2>
            <div className="sectionContainer__">
              {recommendedFoodTypes.map((description, index) => {
                return <div key={index}> <span style={{ color: "#DEA001" }}>{index + 1 + ". " + capitalize(description.explanation)} </span> <a target="_blank" rel="noopener noreferrer" href={`/neighborhood/${description._id}`} className="hyperlink_"><span style={{ color: "white" }}>{" " + capitalize(description.type)}</span></a> </div>
              })}
            </div>
          </div>
          {nightLifeRecommendations[0] ? (
            <div className="sectionContainer">
              <h2 className="neighborhoodDataSubHeader">Night Life Recommendations:</h2>
              <div className="sectionContainer__">
                {nightLifeRecommendations.map((description, index) => {
                  return (
                    <div key={index}>
                      {description.assessment ? (
                        <>
                          <span style={{ color: "#DEA001" }}>
                            {index + 1 + ". " + capitalize(description.assessment)}
                          </span>
                          <a target="_blank" rel="noopener noreferrer" href={`/neighborhood/${userIds[index]}`} className="hyperlink_">
                            <span style={{ color: "white" }}>{" " + capitalize(description.explanation)}</span>
                          </a>
                        </>
                      ) : (
                        <span style={{ color: "#DEA001" }}>
                          {index + 1 + ". "} {/* Optionally handle the case where assessment is undefined */}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
          {hoodImages.length > 0 ? (<div className="sectionContainer">
            <h2 className="neighborhoodDataSubHeader">Some Images of {neighborhood}:</h2>
            {hoodImages.map((images, index) => (
              images.length > 0 ? <img style={{ width: "30%" }} src={"https://insiderhood.s3.amazonaws.com/" + images[0]?.image} key={index} /> : null
            ))}
          </div>) : null}

        </>
      )}

    </div>






  );
}
export default NeighborhoodReport



{
      /* <h1>Neighborhood Complaints Report for Williamsburg HHHHHHHHHHHHHHHHH </h1>
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

{
  /* <h2>Complaints by Agency </h2>
  {Object.entries(data.agencies_and_complaints).slice(0, 10).map(([agency, complaints], index) => (
    <div key={index}>
      <h3>{agency}</h3>
      <ul>
        {complaints.map(([complaint, address], idx) => (
          <li key={idx}>{complaint} at {address}</li>
        ))}
      </ul>
    </div>
  ))}  
*/
}
