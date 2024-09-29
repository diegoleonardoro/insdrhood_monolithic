import React, { useState, useEffect, startTransition } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./neighborhoodReport.css"

const NeighborhoodReport = ({ nhoodData, nhoodsNarrative, neighborhood, nhoodSuggestions }) => {

  console.log("nhoodsNarrative", nhoodsNarrative);

  const [data, setData] = useState({
    common_complaints: null,
    complaints_by_frequency: [],
    addresses_with_complaints: [],
    agencies_and_complaints: []
  });

  neighborhood = neighborhood ? neighborhood.charAt(0).toUpperCase() + neighborhood.slice(1) : '';
  console.log("neighborhood", neighborhood);

  const [nhoodDescriptions, setNhoodDescriptions] = useState([]);
  const [mostUniqueThings, setMostUniqueThings] = useState([]);
  const [pplShouldVisitIfTheyWant, setPplShouldVisitIfTheyWant] = useState([]);
  const [recommendedFoodTypes, setRecommendedFoodTypes] = useState([]);
  const [nightLifeRecommendations, setNightLifeRecommendations] = useState([]);
  const [hoodImages, setHoodImages] = useState([]);
  const [userIds, setUserIds] = useState([]);
  const [displayCount, setDisplayCount] = useState(4);
  const [activeSection, setActiveSection] = useState('Restaurants');
  const [visibleSuggestions, setVisibleSuggestions] = useState(3); 
  const [neighborhoodName, setNeighborhoodName] = useState(neighborhood);

  const handleToggleVisibility = () => {
    setVisibleSuggestions(prev => (prev === 3 ? nhoodsNarrative.information[activeSection].length : 3));
  };

  const navigate = useNavigate();

  const handleNavigation = (path) => {
    startTransition(() => {
      navigate(path);
    });
  };

  useEffect(() => {
    if (!nhoodData) return; // Check if nhoodData is an empty list

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

    setNeighborhoodName(neighborhood);
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

  const formatSuggestions = (suggestions) => {
    return suggestions.map(suggestion => {
      const [name, description] = suggestion.split(':');
      return { name: name?.trim(), description: description?.trim() };
    });
  };

  return (
    <div className="__mainContainer">
      {nhoodsNarrative.imageUrl && (
        <div className="imageHeader" style={{ backgroundImage: `url(${nhoodsNarrative.imageUrl})` }}>
          <h1 className="imageHeaderText">{neighborhoodName}</h1>
        </div>
      )}

      {nhoodsNarrative.information && Object.keys(nhoodsNarrative.information).length > 0 && (
        <>
          {['Neighborhood Introduction', 'History', 'Location', 'Interesting Facts', 'Demographics'].map((section, index) => (
            nhoodsNarrative.information[section] && (
              <div key={index} className="sectionDiv">
                <h2 className="sectionTitle">{section}</h2>
                <p className={`sectionText ${index % 2 != 0 ? 'evenText' : ''}`}>
                  {nhoodsNarrative.information[section]}
                </p>
              </div>
            )
          ))}
        </>
      )}

      {nhoodsNarrative.information && Object.keys(nhoodsNarrative.information).length > 0 ? (
        <div className='sectionDiv'>
          <h1 className="neighborhoodDataHeader">Where to go</h1>
          <nav className="navigation">
            <a href="#" className="navLink" onClick={(e) => { e.preventDefault(); setActiveSection('Restaurants'); }}>Restaurants</a>
            <a href="#" className="navLink" onClick={(e) => { e.preventDefault(); setActiveSection('Museums'); }}>Museums</a>
            <a href="#" className="navLink" onClick={(e) => { e.preventDefault(); setActiveSection('Public Spaces'); }}>Public Spaces</a>
            <a href="#" className="navLink" onClick={(e) => { e.preventDefault(); setActiveSection('Night Life'); }}>Night Life</a>
            <a href="#" className="navLink" onClick={(e) => { e.preventDefault(); setActiveSection('Attractions'); }}>Attractions</a>
          </nav>
          {nhoodsNarrative.information[activeSection] && (
            <div className="restaurantSuggestions">
              {Object.entries(nhoodsNarrative.information[activeSection]).slice(0, visibleSuggestions).map(([name, description], index) => (
                <div key={index} className="restaurantSuggestion">
                  <h5 className="restaurantSuggestionHeader">{name}</h5>
                  <p>{description}</p>
                </div>
              ))}
              {Object.keys(nhoodsNarrative.information[activeSection]).length > 3 && (
                <span style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}
                  onClick={handleToggleVisibility}>
                  {visibleSuggestions > 3 ? 'Show Less' : 'Show More'}
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        Object.keys(nhoodSuggestions).length > 0 && (
          <div className='sectionDiv'>
            <h1 className="neighborhoodDataHeader">Where to go</h1>
            <nav className="navigation">
              <a href="#" className="navLink" onClick={(e) => { e.preventDefault(); setActiveSection('Restaurants'); }}>Restaurants</a>
              <a href="#" className="navLink" onClick={(e) => { e.preventDefault(); setActiveSection('Museums'); }}>Museums</a>
              <a href="#" className="navLink" onClick={(e) => { e.preventDefault(); setActiveSection('Public Spaces'); }}>Public Spaces</a>
              <a href="#" className="navLink" onClick={(e) => { e.preventDefault(); setActiveSection('Night Life'); }}>Night Life</a>
            </nav>
            {nhoodSuggestions[activeSection] && (
              <div className="restaurantSuggestions">
                {formatSuggestions(nhoodSuggestions[activeSection]).slice(0, visibleSuggestions).map((suggestion, index) => (
                  <div key={index} className="restaurantSuggestion">
                    <h5 className="restaurantSuggestionHeader">{suggestion.name}</h5>
                    <p>{suggestion.description}</p>
                  </div>
                ))}
                {nhoodSuggestions[activeSection].length > 3 && (
                  <span style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}
                    onClick={handleToggleVisibility}>
                    {visibleSuggestions > 3 ? 'Show Less' : 'Show More'}
                  </span>
                )}
              </div>
            )}
          </div>
        )
      )}

      {nhoodData && nhoodData.length > 0 && (
        <div className='sectionDiv'>
          <>
            <h1 style={{ marginTop: "30px" }} className="neighborhoodDataHeader"> According to the Residents:</h1>
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

        </div>
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


