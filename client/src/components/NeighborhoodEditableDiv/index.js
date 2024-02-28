import React, { useEffect, useState, useRef, useCallback } from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import axios from "axios";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import Table from 'react-bootstrap/Table';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import "./neighborhoodEditableDiv.css";


const NeighborhoodEditableDiv = ({
  isEditable, // this state will be set to true if whoever is logged in is the owner of the neighbohood profile. 
  neighborhoodid,
  objectKey,
  content,
  adjectives = [],
  images = [],
  neighborhood,
  objectData,
  recommendationsArrayOfObjects,
  complementaryText, // complementarytext is text that is going to be rendered by this editable component but the user will not have the option to edit. 
  imagesId,// this will be used to associate images with an user when the user adds more images
  nestedObjects
}) => {

  // this state will be set to true wheneber the user clicks the "edit" button.
  const [isEditing, setIsEditing] = useState(false);

  // these two states will be used when we are editing a section that only contains text:
  const [text, setText] = useState(content);
  const [textHistory, setTextHistory] = useState(content)


  // the following two states will be used when editing a section of adjectives:
  const [adjectivesText, setAdjectivesText] = useState(adjectives);
  const [adjectivesTextHistory, setAdjectivesTextHistory] = useState(adjectives);


  // the following states will be used when the user is updating data that came in object format
  const [objectData_, setObjectData_] = useState(objectData);
  const [objectDataHistory, setObjectDataHistory] = useState(objectData);


  // the following states will be used when editing the neighborhood images:
  const [nhoodImages, setNhoodImages] = useState(images);
  const [nhoodImagesHistory, setNhoodImagesHistory] = useState(images);


  // The following state and refs will be used when the user is editing the neighborhood images:
  const [newImages, setNewImages] = useState([]);
  const imgRefs = useRef([]);
  const addImagesInput = useRef(null);
  const galleryParentRef = useRef(null);


  // The following state will be used when the user is editing the recommendations that come as an array of object (food and restaurants recommend)
  const [recommendationsArrayOfObjects_, setRecommendationsArrayOfObjects_] = useState(recommendationsArrayOfObjects);
  const [recommendationsArrayOfObjectsFromTable_, setRecommendationsArrayOfObjectsFromTable_] = useState([]);
  const [recommendationsArrayOfObjectsHistory, setRecommendationsArrayOfObjectsHistory] = useState(recommendationsArrayOfObjects);

  // The following statements will be used when the use is editing nested objects such as the statements:
  const [nestedObjects_, setNestedObjects_] = useState(nestedObjects);
  const [nestedObjectsHistory, setNestedObjectsHistory] = useState(nestedObjects);

  // The following satate will be used to add more rows to the table that adds more recommended places:
  const [rows, setRows] = useState([{ assessment: '', recommendations: '' }]);

  // Function that will check if the last character of a string is a period and if so it will remove it:
  function removeTrailingPeriod(str) {
    if (str && typeof str === 'string') {
      return str.replace(/\.\s*$/, '');
    }
    return str;
  }

  // Function that will add more rows to the table if an input has been typed:
  const addRow = () => {
    // Check if any input is filled
    if (rows.length === 0 || rows[rows.length - 1].assessment.trim() || rows[rows.length - 1].recommendations.trim()) {
      setRows([...rows, { assessment: '', recommendations: '' }]);
    };

  };

  const updateField = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  // Function that will check if the last character of a string is a period and if so it will remove it:
  function removeTrailingPeriod(str) {
    if (str && typeof str === 'string') {
      return str.replace(/\.\s*$/, '');
    }
    return str;
  }

  /** Images slider */
  const PrevArrowPhotos = ({ onClick }) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" onClick={onClick} height="3em" viewBox="0 0 512 512"
        style={{
          fill: 'white',
          cursor: 'pointer',
          position: 'absolute',
          left: '2px',
          zIndex: "4",
          top: '50%',
          transform: 'translate(0, -50%)',
          //  backgroundColor:'#7575fb',
          padding: '5px',
          borderRadius: '5px'
        }}>
        <path d="M512 256A256 256 0 1 0 0 256a256 256 0 1 0 512 0zM231 127c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-71 71L376 232c13.3 0 24 10.7 24 24s-10.7 24-24 24l-182.1 0 71 71c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0L119 273c-9.4-9.4-9.4-24.6 0-33.9L231 127z" />
      </svg>
    );
  };

  const NextArrowPhotos = ({ onClick }) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" onClick={onClick} height="3em" viewBox="0 0 512 512"
        style={{
          fill: 'white',
          cursor: 'pointer',
          position: 'absolute',
          right: '2px',
          zIndex: "4",
          top: '50%',
          transform: 'translate(0, -50%)',
          //  backgroundColor:'#7575fb',
          padding: '5px',
          borderRadius: '5px'
        }}
      >
        <path d="M0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM281 385c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l71-71L136 280c-13.3 0-24-10.7-24-24s10.7-24 24-24l182.1 0-71-71c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0L393 239c9.4 9.4 9.4 24.6 0 33.9L281 385z" />
      </svg>
    );
  };

  // Image slider settings:
  const settings = {
    // dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    initialSlide: 0,
    prevArrow: <PrevArrowPhotos />, // Custom component for the previous arrow
    nextArrow: <NextArrowPhotos />,
    background: "transparent",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  // function that will update the neighborhood data
  const updateNeighborhoodData = useCallback(async (dataToUpdate) => {
    await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/updateneighborhood/${neighborhoodid}`, dataToUpdate);
  }, [neighborhoodid]);


  const removePhoto = (index) => {
    const url = imgRefs.current[index].src;
    const cleanedString = decodeURIComponent(url.replace("https://insiderhood.s3.amazonaws.com/", ""));
    const filteredUrls = nhoodImages.filter((item) => item.image !== cleanedString);
    setNhoodImages(filteredUrls);
  };

  // the following function will enable editing functionality:
  const handleEditClick = () => {
    // galleryParentRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    setIsEditing(true);
  };

  const handleChange = (event, index, flag) => {

    // event.preventDefault();

    // user is trying to update the data that came as an object of objects:
    if (hasNestedObjects(nestedObjects)) {
      const key = event.target.id;
      const subKey = event.target.name;
      setNestedObjects_(prevState => ({
        ...prevState,
        [key]: {
          ...prevState[key],
          [subKey]: event.target.value
        }
      }))
    }

    // user is trying to update the data that came in as an array of obects:
    if (Array.isArray(recommendationsArrayOfObjects)) {

      if (flag === 'table') {

        const newEntries = [...recommendationsArrayOfObjectsFromTable_];
        const field = event.target.name;

        // I want to add a new row only when 
        // // Check if the last entry is already filled
        if (index === recommendationsArrayOfObjectsFromTable_.length) {
          // If both fields are filled, add a new object
          newEntries.push({ assessment: '', explanation: '' });
        }

        // Update the field in the last object of the array
        newEntries[index][field] = event.target.value;
        setRecommendationsArrayOfObjectsFromTable_(newEntries);

      } else {
        const updatedArray = recommendationsArrayOfObjects_.map((item, i) => {
          if (i === index) {
            return { ...item, [event.target.name]: event.target.value }
          }
          return item;
        });
        setRecommendationsArrayOfObjects_(updatedArray);
      }

    };

    // If user is trying to edit any of the data came as an  object:
    if (typeof objectData === "object") {

      setObjectData_(prevState => {
        return { ...prevState, [event.target.id]: event.target.value }
      })

      return
    };



    // If the user is adding or removing neighborhood adjectives:
    if (objectKey === 'neighborhoodAdjectives' || objectKey === 'residentAdjectives') {

      setAdjectivesText(event.target.value.split(", "));
      return
    };

    setText(event.target.value);

  };

  // function that will remove objects from an array of recommendations
  const removeObject = (index) => {
    const array = [...recommendationsArrayOfObjects_];
    array.splice(index, 1);
    setRecommendationsArrayOfObjects_(array);
  };

  /** Function that will save the images */
  async function uploadImagesAndUpdateState(addImagesInput, neighborhood, imagesId, objectKey) {
    // Convert file list to array
    const newImages = Array.from(addImagesInput.current.files);

    // Map each file to an upload promise
    const uploadPromises = newImages.map(async (imageFile) => {
      const imageType = imageFile.type.split('/')[1];
      // Fetch upload configuration from backend
      const imageUploadConfig = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/neighborhood/imageupload/${neighborhood}/${imagesId}/${imageType}`);

      // Upload image file to the provided URL
      await axios.put(imageUploadConfig.data.url, imageFile, {
        headers: {
          "Content-Type": imageType,
        }
      });

      // Return the image key and a default description
      return { image: imageUploadConfig.data.key, description: "" };
    });

    // Wait for all uploads to complete
    const imagesUrls = await Promise.all(uploadPromises);

    // Update neighborhood images history state
    setNhoodImagesHistory(prevNhoodImagesArray => {
      const updatedImages = [...prevNhoodImagesArray, ...imagesUrls];
      setNewImages(updatedImages); // Assuming this triggers a save to the backend
      return updatedImages;
    });

    // Update neighborhood images state
    setNhoodImages(prevNhoodImagesArray => [...prevNhoodImagesArray, ...imagesUrls]);

    // Update neighborhood data with new images
    updateNeighborhoodData({ [objectKey]: imagesUrls });

  };

  // function to save edited data:
  const handleSaveClick = async () => {

    // user is editing an object of objects, such as the statements:

    if (hasNestedObjects(nestedObjects)) {
      // let dataToUpdate = [...nestedObjects_];
      setNestedObjectsHistory(prevState => {
        // check if the prev state 
        if (!objectsAreEqual(nestedObjectsHistory, nestedObjects_)) {
          // make the request to update the state:
          updateNeighborhoodData({ [objectKey]: nestedObjects_ });
        }
        return nestedObjects_
      })
    }

    // user is editing an array of objects, such as food recommendations:
    if (Array.isArray(recommendationsArrayOfObjects)) {
      let dataToUpdate = [...recommendationsArrayOfObjects_];

      if (recommendationsArrayOfObjectsFromTable_.length > 0) {// checks if user has typed values on the table
        dataToUpdate = [...dataToUpdate, ...recommendationsArrayOfObjectsFromTable_];
        setRecommendationsArrayOfObjectsFromTable_([])
        setRows([{ assessment: '', recommendations: '' }]);
      };

      setRecommendationsArrayOfObjectsHistory(prevState => {
        if (areObjectsDifferent(dataToUpdate, recommendationsArrayOfObjectsHistory)) {
          // make request to update data:
          updateNeighborhoodData({ [objectKey]: dataToUpdate });
        };
        // update the state:
        return dataToUpdate
      });

    };

    // user is editing an object, such as food prices assessment and explanation:
    if (typeof objectData_ === 'object') {
      setObjectDataHistory(prevState => {
        if (areObjectsDifferent(objectData_, objectDataHistory)) {
          // make request:
          updateNeighborhoodData({ [objectKey]: objectData_ })
        }
        return { ...objectData_ }
      })
    }

    // user is editing the images of the neighborhood:
    //images.length > 0
    if (objectKey === 'neighborhoodImages') {

      if (addImagesInput.current !== null && addImagesInput.current.files.length > 0) {

        await uploadImagesAndUpdateState(addImagesInput, neighborhood, imagesId, objectKey);

        setIsEditing(false);
      };

      if (imgRefs.current.length !== nhoodImages.length) {

        // THIS MEANS THAT THE USER REMOVED A PHOTO AND CLICKED SAVE.
        // MAKE A REQUEST TO UPDATE NEIGHBORHOOD DATA WITH A SPECIFIC KEYNAME SO THAT IN THE BACK END WE KNOW THAT WE NEED TO 
        updateNeighborhoodData({ ['removeImages']: nhoodImages });
      }

    }


    // user is editing the list of neighborhood adjectives 
    if (objectKey === 'neighborhoodAdjectives' || objectKey === 'residentAdjectives') {
      setAdjectivesTextHistory(prevAdjectivesText => {
        if (!areArraysEqual(prevAdjectivesText, adjectivesText)) {
          updateNeighborhoodData({ [objectKey]: adjectivesText })
        }
        return [...adjectivesText];
      });
    }




    // user is editing a text-based section of the neighborhood profile:
    if (objectKey === 'timeLivingInNeighborhood' ||
      objectKey === 'neighborhoodDescription' ||
      objectKey === 'mostUniqueThingAboutNeighborhood' ||
      objectKey === 'peopleShouldVisitNeighborhoodIfTheyWant') {

      // content 
      setTextHistory(prevText => {
        if (prevText !== text) {
          updateNeighborhoodData({ [objectKey]: text })
        }
        return text;
      });
    };

    setIsEditing(false);

  };

  const handleCancelClick = () => {
    setAdjectivesText(adjectivesTextHistory);
    setText(textHistory);
    setNhoodImages(nhoodImagesHistory);
    setIsEditing(false);
  };

  // RETURN OBJECTS:
  /** We are rendering an object of nested objects, such as the statements  */
  const assessmentsTexts = {
    publicTransportation: [`Public transportation in ${neighborhood} is `],
    owningPets: ['I ', `having pets in ${neighborhood}`],
    safety: [`I think safety in ${neighborhood} is `],
    socializing: [`I think ${neighborhood} is `, 'for meeting new people']
  };

  if (hasNestedObjects(nestedObjects)) {

    const inputStyle = { marginLeft: "10px" };

    const renderAssessmentInput = (object, index, key) => (
      <Form.Control
        name="assessment"
        id={key}
        onChange={(e) => handleChange(e, index)}
        type="text"
        value={object["assessment"]}
        style={inputStyle}
      />
    );

    const renderExplanation = (object, index, key) => (
      // object.hasOwnProperty('explanation') && (
      <div style={{ display: "flex", margin: "10px", flexDirection: "column" }}>
        <div style={{ fontWeight: 'bold' }}>because:</div>
        <Form.Control
          name="explanation"
          id={key}
          onChange={(e) => handleChange(e, index)}
          type="text"
          value={object["explanation"]}
        // style={inputStyle}
        />
      </div>
      // )
    );

    const renderNonEditableContent = (key, object, assessmentsTexts) => {
      const explanation = object.hasOwnProperty('explanation') ? `, because ${object['explanation']}` : "";
      return (
        <div>
          <p style={{ display: "inline", backgroundColor: "yellow", fontWeight: "bold", padding: "3px" }}>
            {
              `${assessmentsTexts[key][0]}${" "}${object["assessment"]}${assessmentsTexts[key][1] || ''}`
            }
          </p>

          {
            `${explanation}.`
          }
        </div>
      );
    };

    const renderObject = (key, object, editing, index, handleChange) => {

      const assessmentText = assessmentsTexts[key] ? assessmentsTexts[key][0] : '';
      const additionalText = assessmentsTexts[key] && assessmentsTexts[key][1] ? assessmentsTexts[key][1] : '';
      if (!editing) {
        return renderNonEditableContent(key, object, assessmentsTexts);
      }

      return (
        <div>
          <div style={{ display: "flex", flexDirection: "column", margintop: "10px" }}>
            <div style={{ margin: '10px', fontWeight: 'bold' }} >{`${assessmentText}:`}</div>
            {renderAssessmentInput(object, index, key)}{/** need to pass the 'key' and whether it is an assessment or an explanation   */}
            <div style={{ margin: '10px', fontWeight: 'bold' }}>{additionalText}</div>
          </div>
          {renderExplanation(object, index, key)} {/** need to pass the 'key' and whether it is an assessment or an explanation   */}
          <hr style={{ height: '2px', backgroundColor: 'black', marginTop: '30px' }}></hr>
        </div>
      );

    };

    const content = Object.keys(nestedObjects_).map((key) => {
      return (
        <div style={{ marginTop: "30px", marginBottom: "30px", textAlign: "start" }} key={key}>
          {renderObject(key, nestedObjects_[key], false)}
        </div>
      )
    });


    const contentEditing = Object.keys(nestedObjects_).map((key) => {
      return (
        <div style={{ marginTop: "10px", marginBottom: "10px" }} key={key}>
          {renderObject(key, nestedObjects_[key], true)}
        </div>
      )
    });



    // Return the constructed content
    return (

      <div style={{ padding: "15px", width: "100%" }}>

        {isEditing ? (

          <div>
            {contentEditing}
            <div className="divSaveCancelBtns">
              <Button variant='outline-primary' style={{ width: "30%" }} className="buttonDataSave" onClick={handleSaveClick}>Save</Button>
              <Button variant='outline-danger' style={{ width: "30%" }} className="buttonDataSave" onClick={handleCancelClick}>Cancel</Button>
            </div>
          </div>

        ) : (

          <div className="adjectivesDiv" style={{ border: "1px dotted black", display: "flex", flexDirection: "column", alignItems: "start" }}>
            {isEditable ? (

              <Button onClick={handleEditClick} className="editSvg" size='sm' style={{ fontSize: "11px" }} >Edit</Button>

              // <svg onClick={handleEditClick} className="editSvg" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>


            ) : null}
            {content}
          </div>

        )}
      </div>

    )
  };

  /** We are rendering an object that contains information of recommended restaurants or nightlife venues */
  if (Array.isArray(recommendationsArrayOfObjects)) {

    return (
      <div>

        {objectKey === 'recommendedFoodTypes' ? <h2 >Make sure to try:</h2> : <h2 >Make sure to visit:</h2>}
        <div style={{ padding: "15px", width: "100%", position: "relative" }}>

          {isEditing || (isEditable && recommendationsArrayOfObjectsHistory.length === 0) ? (
            <div style={{ marginTop: "20px" }}>
              {recommendationsArrayOfObjects_.map((item, index) => {
                let text;
                if (objectKey === 'recommendedFoodTypes') {
                  if (index === 0) {
                    text = 'Make sure to try ';
                  } else if (index === 1) {
                    text = 'You should also try ';
                  } else if (index === 2) {
                    text = 'Also make sure to try ';
                  } else {
                    text = "You'll also want to try ";
                  }
                } else if (objectKey === 'nightLifeRecommendations') {
                  if (index === 0) {
                    text = 'I would recommend going to';
                  } else if (index === 1) {
                    text = 'You should also go to';
                  } else if (index === 2) {
                    text = 'You will also want to go to';
                  } else {
                    text = "Also visit";
                  }
                }

                return (
                  <div key={index} style={{ border: "1px dotted black", marginTop: "15px", padding: "15px" }}>

                    <OverlayTrigger

                      placement="bottom"
                      overlay={
                        <Tooltip id="button-tooltip-2">
                          Delete item
                        </Tooltip>
                      }
                    >
                      {({ ref, ...triggerHandler }) => (
                        <svg
                          ref={ref}
                          onClick={(e) => { removeObject(index) }}
                          {...triggerHandler}
                          style={{
                            position: "absolute",
                            right: "5px",
                            backgroundColor: "rgb(228, 228, 228)",
                            marginTop: "10px",
                            cursor: "pointer"
                          }}
                          xmlns="http://www.w3.org/2000/svg"
                          width="25"
                          height="25"
                          fill="currentColor"
                          className="bi bi-trash"
                          viewBox="0 0 16 16"
                        >
                          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                          <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                        </svg>
                      )}
                    </OverlayTrigger>

                    <div style={{ display: "flex", flexDirection: "column", textAlign: "start", marginTop: "10px" }}>

                      <div style={{ marginTop: "none" }}>{text}</div>
                      <Form.Control name="assessment" onChange={(e) => { handleChange(e, index) }} type="text" value={item.assessment} />
                      {objectKey === 'recommendedFoodTypes' ? (<div style={{ marginLeft: "10px" }}> food. </div >) : null}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", marginTop: "20px", textAlign: "start", marginBottom: "30px" }}>

                      {objectKey === 'recommendedFoodTypes' ? (
                        <div>Go to </div >
                      ) : objectKey === 'nightLifeRecommendations' ? (
                        <div>Because </div >
                      ) : null}

                      <Form.Control name="explanation" onChange={(e) => { handleChange(e, index) }} type="text" value={item.explanation} />

                      {objectKey === 'recommendedFoodTypes' ? <div>{`for authentic ${item.assessment} food.`}</div > : null}

                    </div>
                  </div>
                );
              })}

              {objectKey === 'recommendedFoodTypes' ?
                <h4 style={{ marginTop: "20px" }}>Add recommended restaurants: </h4> :
                <h4 style={{ marginTop: "20px" }}>Add recommended night life venues: </h4>
              }

              <table className="tableRecommendedPlaces" style={{ margin: "5px", position: "relative", left: "50%", transform: "translate(-50%, 0)" }} >
                <thead>
                  <tr>
                    <th className='tableHeaderRecommededPlaces'>#</th>
                    <th className='tableHeaderRecommededPlaces'>{objectKey === 'recommendedFoodTypes' ? 'Food type' : 'Venue name'}</th>
                    <th className='tableHeaderRecommededPlaces'>{objectKey === 'recommendedFoodTypes' ? 'Restaurant name' : 'Description'}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index}>
                      <td className='tableCellRecommededPlaces'>{index + 1}</td>
                      <td className='tableCellRecommededPlaces'>
                        <input
                          style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', width: '100%' }}
                          value={row.assessment}
                          name="assessment"
                          onChange={(e) => {
                            updateField(index, 'assessment', e.target.value); // this function will add a new row to the table 
                            handleChange(e, index, 'table'); ///
                          }}
                        />
                      </td>
                      <td className='tableCellRecommededPlaces'>
                        <input
                          style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', width: '100%' }}
                          value={row.recommendations}
                          name="explanation"
                          onChange={(e) => {
                            updateField(index, 'recommendations', e.target.value); // this function will add a new row to the table 
                            handleChange(e, index, 'table');
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
              <div onClick={addRow} id="addTableRowContainer" style={{ padding: "5px", cursor: "pointer" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="rgb(120 120 120)" className="bi bi-plus-square" viewBox="0 0 16 16">
                  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                </svg>
              </div>
              <div className="divSaveCancelBtns">
                <Button variant='outline-primary' style={{ width: "30%" }} className="buttonDataSave" onClick={handleSaveClick}>Save</Button>
                <Button variant='outline-danger' style={{ width: "30%" }} className="buttonDataSave" onClick={handleCancelClick}>Cancel</Button>
              </div>
            </div>

          ) : (
            <div style={{ border: "1px dotted black ", padding: "15px", display: "flex", flexDirection: "column" }}>
              {isEditable ? (
                <Button onClick={handleEditClick} className="editSvg" size='sm' style={{ fontSize: "11px" }} >Edit</Button>
              ) : null}
              {recommendationsArrayOfObjectsHistory.map((item, index) => {

                let text;
                if (objectKey === 'recommendedFoodTypes') {

                  if (index === 0) {
                    text = 'Make sure to try ';
                  } else if (index === 1) {
                    text = 'You should also try ';
                  } else if (index === 2) {
                    text = 'Also make sure to try ';
                  } else {
                    text = "You'll also want to try ";
                  }
                  text += item.assessment;
                } else if (objectKey === 'nightLifeRecommendations') {
                  if (index === 0) {
                    text = 'I would recommend going to ';
                  } else if (index === 1) {
                    text = 'You should also go to ';
                  } else if (index === 2) {
                    text = 'You will also want to go to ';
                  } else {
                    text = "Also visit ";
                  }
                }

                return (
                  <div key={index} style={{ textAlign: 'start' }} >
                    {objectKey === 'recommendedFoodTypes' ? (
                      <div>

                        <div className='nhoodRecommendationText'>
                          <span>
                            {index + 1 + "."}
                          </span>

                          <div style={{ display: 'inline', backgroundColor: 'yellow', padding: '4px' }}>
                            {item.assessment} food.
                          </div>
                          {item.explanation && (
                            <span className='nhoodRecommendationText' >
                              {` GO to ${removeTrailingPeriod(item.explanation)}.`}
                            </span>
                          )}</div>
                        <hr></hr>
                      </div>
                    ) : objectKey === 'nightLifeRecommendations' ? (
                      <div style={{ textAlign: "start" }}>
                        <p className='nhoodRecommendationText_'>{text + item.assessment.trimEnd()}
                          {item.explanation && (
                            <span className='nhoodRecommendationText'  >
                              {`, because ${item.explanation}.`}
                            </span>
                          )}</p>
                      </div>

                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  /** We are rendering information that comes in as an object: */
  if (typeof objectData_ === "object") {

    return (
      <div style={{ padding: "15px", width: "100%", position: "relative" }}>
        {

          (isEditing || (areValuesEmptyStrings(objectDataHistory) && isEditable) ) ? (
            <div>
              <div style={{ display: "flex", margin: "10px", flexDirection: "column" }}>
                <p style={{ textAlign: "start" }}> {complementaryText[0] + ":"}</p>
                <Form.Control id="assessment" onChange={handleChange} type="text" value={objectData_.assessment} style={{ marginLeft: "10px" }} />
              </div>
              <div style={{ display: "flex", margin: "10px", flexDirection: "column" }}>
                <p style={{ textAlign: "start" }}> {complementaryText[1] + ":"}</p>
                <Form.Control id="explanation" onChange={handleChange} type="text" value={objectData_.explanation} style={{ marginLeft: "10px" }} />
              </div>
              <div className="divSaveCancelBtns">
                <Button variant='outline-primary' style={{ width: "30%" }} className="buttonDataSave" onClick={handleSaveClick}>Save</Button>
                <Button variant='outline-danger' style={{ width: "30%" }} className="buttonDataSave" onClick={handleCancelClick}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div style={{ border: "1px dotted black ", padding: "15px", display: "flex" }}>
              {isEditable ? (
                <Button onClick={handleEditClick} className="editSvg" size='sm' style={{ fontSize: "11px" }} >Edit</Button>
              ) : null}
              <div style={{ marginBottom: "0px", margin: isEditable ? "5px" : "0px" }} className="nhoodRecommendationText">
                {<>
                  {complementaryText[0]}
                  <div style={{ fontWeight: "bold", display: "inline", backgroundColor: "yellow", padding: "4px" }}>
                    {removeTrailingPeriod(objectData_.assessment)}
                  </div>
                </>
                }
                {objectData_.explanation && objectData_.explanation !== "" ? (
                  <span style={{ marginBottom: "0px", margin: isEditable ? "5px" : "0px" }} className="nhoodRecommendationText">
                    {", " + complementaryText[1] + removeTrailingPeriod(objectData_.explanation.toLowerCase()) + "."}
                  </span>
                ) : (
                  null
                )}
              </div>
            </div>
          )}

      </div>
    )
  };

  /** When we render the neighboorhood images: */
  if (objectKey === 'neighborhoodImages') {

    // This if statement will take place when the user did not submit picutres. It will render the form to submit pictures. 
    if (nhoodImages.length === 0) {
      return (
        <div className="galleryParent" ref={galleryParentRef}
          style={{ position: "relative" }}
        >
          {isEditable ? (
            <div>
              <Slider {...settings} style={{ background: "transparent" }} >
                {nhoodImages.map((image, index) => (
                  <div
                    className={`placeImageEditContainer ${index === 0 ? "firstDiv" : ''}`}
                    key={index} >
                    <InputGroup style={{ marginBottom: "10px" }}>
                      <InputGroup.Text style={{ marginLeft: "5px", marginTop: "5px", fontSize: "10px" }}>Describe picture:</InputGroup.Text>
                      <Form.Control id={`photoDescriptionInput-${index}`} style={{ marginRight: "5px", marginTop: "5px", fontSize: "10px", width: "18%" }} onChange={handleChange} defaultValue={image.description} as="textarea" aria-label="With textarea" />
                    </InputGroup>
                    <img alt="neighborhoodimage"
                      ref={(el) => { imgRefs.current[index] = el }}
                      style={{ width: "100%", height: "300px", objectFit: "cover" }} src={"https://insiderhood.s3.amazonaws.com/" + image.image}
                    />
                    <Button
                      style={{
                        position: "relative",
                        fontSize: "10px",
                        marginTop: "5px"
                      }}
                      onClick={(e) => { removePhoto(index) }}
                      variant="danger">Delete photo
                    </Button>
                  </div>
                ))}

              </Slider>

              <Form.Group style={{
                marginTop: "10px",
                marginBottom: "10px"
              }}
                controlId="formFileMultiple" className="mb-3">
                <Form.Label style={{ fontSize: "15px" }} className="text-primary">Add neighborhood pictures:</Form.Label>
                <Form.Control
                  ref={addImagesInput}
                  type="file"
                  multiple
                  style={{
                    width: '30%',
                    position: 'relative',
                    left: "50%",
                    transform: "translate(-50%, 0)",
                    fontSize: "10px"
                  }}
                />
              </Form.Group>
              <div className="divSaveCancelBtns">
                <Button onClick={handleSaveClick} style={{ fontSize: "10px" }} variant="primary">Save</Button>
                <Button onClick={handleCancelClick} style={{ fontSize: "10px", marginLeft: "3px" }} variant="secondary">Cancel</Button>
                {/* {
                  addImagesInput.current.files.length > 0 ? (
                    <>
                    </>
                  ) : null
                } */}





              </div>


            </div>

          ) : null}
        </div>
      )
    }


    return (
      <div className="galleryParent" ref={galleryParentRef}
        style={{ position: "relative" }}
      >
        {isEditing ? (

          <div>
            <Slider {...settings} style={{ background: "transparent" }} >
              {nhoodImages.map((image, index) => (
                <div
                  className={`placeImageEditContainer ${index === 0 ? "firstDiv" : ''}`}
                  key={index} >
                  <InputGroup style={{ marginBottom: "10px" }}>
                    <InputGroup.Text style={{ marginLeft: "5px", marginTop: "5px", fontSize: "10px" }}>Describe picture:</InputGroup.Text>
                    <Form.Control id={`photoDescriptionInput-${index}`} style={{ marginRight: "5px", marginTop: "5px", fontSize: "10px", width: "18%" }} onChange={handleChange} defaultValue={image.description} as="textarea" aria-label="With textarea" />
                  </InputGroup>
                  <img alt="neighborhoodimage"
                    ref={(el) => { imgRefs.current[index] = el }}
                    style={{ width: "100%", height: "300px", objectFit: "cover" }} src={"https://insiderhood.s3.amazonaws.com/" + image.image}
                  />
                  <Button
                    style={{
                      position: "relative",
                      fontSize: "10px",
                      marginTop: "5px"
                    }}
                    onClick={(e) => { removePhoto(index) }}
                    variant="danger">Delete photo
                  </Button>
                </div>
              ))}

            </Slider>

            <Form.Group style={{
              marginTop: "10px",
              marginBottom: "10px"
            }}
              controlId="formFileMultiple" className="mb-3">
              <Form.Label style={{ fontSize: "15px" }} className="text-primary">Add neighborhood pictures:</Form.Label>
              <Form.Control
                ref={addImagesInput}
                type="file"
                multiple
                style={{
                  width: '30%',
                  position: 'relative',
                  left: "50%",
                  transform: "translate(-50%, 0)",
                  fontSize: "10px"
                }}
              />
            </Form.Group>
            <div className="divSaveCancelBtns">
              <Button onClick={handleSaveClick} style={{ fontSize: "10px" }} variant="primary">Save</Button>
              <Button onClick={handleCancelClick} style={{ fontSize: "10px", marginLeft: "3px" }} variant="secondary">Cancel</Button>
            </div>


          </div>



        ) : (
          <Slider  {...settings}>
            {nhoodImages.map((image, index) => (
              <Card key={index} style={{ width: '18rem', margin: '5px', background: "transparent" }}>
                <Card.Img style={{ width: "100%", height: "300px", objectFit: "cover", background: "#e4e4e4" }} variant="top" src={"https://insiderhood.s3.amazonaws.com/" + image.image} />
                {image.description !== "" ?
                  (<Card.Body>
                    <Card.Text>
                      {image.description}
                    </Card.Text>
                  </Card.Body>)
                  : null}
              </Card>
            ))}
          </Slider>
        )
        }
        {isEditable ? (

          <Button onClick={handleEditClick} className="editSvg" size='sm' style={{ fontSize: "11px" }} >Edit</Button>
        ) : null}
      </div>
    )

  };

  /** If we are going to render list of adjectives: */
  if (objectKey === 'neighborhoodAdjectives' || objectKey === 'residentAdjectives') {
    /** objectKey === 'neighborhoodAdjectives' ||  objectKey === 'residentAdjectives' adjectives.length > 0 */
    return (
      <div className="adjectivesDiv" style={{ position: "relative" }}>
        {isEditing || (isArrayEmpty(adjectivesTextHistory) && isEditable) ? (
          <div className="nhoodIntroItemList">
            <div style={{ textAlign: "start" }}>
              <label className="labelCommaSeparatedAdjs" htmlFor="wordListInput"> The {objectKey === 'neighborhoodAdjectives' ? 'neighborhood' : 'residents'} can be described as:</label>
              <input
                type="text"
                value={
                  adjectivesText.map((adjective, index) => {
                    return (index === 0 ? "" : " ") + adjective.toLowerCase();
                  })
                }
                onChange={handleChange}
                id="wordListInput"
                autoFocus
                className="inputNhoodIntro"
              />
              <span style={{ fontSize: "13px" }}>Include comma separated words</span>
            </div>

            <div className="divSaveCancelBtns">
              <Button variant='outline-primary' className="buttonDataSave" onClick={handleSaveClick}>Save</Button>
              <Button variant='outline-danger' className="buttonDataSave" onClick={handleCancelClick}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div style={{ border: "1px dotted black ", padding: "15px", width: "100%" }} className="nhoodIntroItemList">

            <div className="nhoodAdjectivesDivSpanContainer">
              {
                isEditable ? (
                  <Button onClick={handleEditClick} className="editSvg" size='sm' style={{ fontSize: "11px" }} >Edit</Button>
                  // <svg onClick={handleEditClick} className="editSvg" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>

                ) : null
              }
              <p style={{ marginBottom: "0px", margin: isEditable ? "0px" : "0px" }} className="nhoodRecommendationText">
                {complementaryText !== "" ? complementaryText : null}
                {
                  adjectivesTextHistory.map((adjective, index) => {
                    // const isLastItem = index === adjectivesText.length - 1;
                    return (
                      <span className="nhoodAdjectivesSpan" key={index}>
                        {adjective.toLowerCase()}
                      </span>
                    )
                  })
                }
              </p>
            </div>
          </div>
        )}
      </div>
    )

  };

  /** When we only render plain text: */
  return (
    <div style={{ padding: "15px", width: "100%", position: "relative" }}>
      {isEditing || (textHistory === "" && isEditable) ? (
        <div>
          {complementaryText !== "" ? (<p style={{ textAlign: "start" }}>{complementaryText}:</p>) : null}
          <input
            type="text"
            value={text}
            onChange={handleChange}
            autoFocus
            className="inputNhoodIntro"
          />
          <div className="divSaveCancelBtns">
            <Button variant='outline-primary' className="buttonDataSave" onClick={handleSaveClick}>Save</Button>
            <Button variant='outline-danger' className="buttonDataSave" onClick={handleCancelClick}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div style={{ border: "1px dotted black ", padding: "15px" }}>
          {isEditable ? (
            <Button onClick={handleEditClick} className="editSvg" size='sm' style={{ fontSize: "11px" }} >Edit</Button>
            // <svg onClick={handleEditClick} className="editSvg" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>

          ) : null}

          <div style={{ marginBottom: "0px", margin: isEditable ? "5px" : "0px" }} className="nhoodRecommendationText">
            {complementaryText !== "" ? complementaryText : null} {
              <p style={{ fontWeight: "bold", backgroundColor: "yellow", padding: "4px", display: "inline" }}>{text}</p>
            }
          </div>

        </div>

      )}

    </div>


  );

}

// The following two functions will be used to see if the structure of the data coming is an object of nested objects
function isObject(value) {
  // Check if value is an object and not null
  return value !== null && typeof value === 'object';
}
function hasNestedObjects(obj) {
  // First ensure obj is an object
  if (!isObject(obj)) {
    return false;
  }

  // Iterate over the object's properties
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      // If a property is an object, recursively check for nested objects
      if (isObject(obj[key])) {
        // If a nested object is found, return true
        return true;
      }
    }
  }

  // If no nested objects are found, return false
  return false;
}
function areArraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
}
function areObjectsDifferent(obj1, obj2) {
  // Assuming the two keys are known and called 'key1' and 'key2'
  const key1 = 'assessment';
  const key2 = 'explanation';

  // Check if both objects have the same keys and if not, return true
  if (!(key1 in obj1) || !(key2 in obj1) || !(key1 in obj2) || !(key2 in obj2)) {
    return true;
  }

  // Compare the values of the two keys
  if (obj1[key1] !== obj2[key1] || obj1[key2] !== obj2[key2]) {
    return true;
  }

  // If none of the above conditions are true, return false
  return false;
}
function objectsAreEqual(obj1, obj2) {
  // Get the keys of both objects
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  // Check if both objects have the same number of keys
  if (keys1.length !== keys2.length) {
    return false;
  }

  // Check if all keys in obj1 exist in obj2 and have the same values
  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  // If no differences were found, the objects are equal
  return true;
}
// function that will be used to check if the values of an object are all empty strings:
function areValuesEmptyStrings(obj) {


  // Extract the values of the object
  const values = Object.values(obj);
  // Check if every value is an empty string
  return values.every(value => value === '');
}
// function that will check if an array is empty:
function isArrayEmpty(arr) {

  const filteredArr = arr.filter(item => item !== '');
  // Check if the filtered array is empty
  return filteredArr.length === 0;

}
export default NeighborhoodEditableDiv;