import React, { useEffect, useState, useRef } from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import axios from "axios";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';


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
  imagesId// this will be used to associate images with an user when the user adds more images
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
  const [newImages, setNewImages] = useState([])
  const imgRefs = useRef([]);
  const addImagesInput = useRef(null);


  const galleryParentRef = useRef(null);


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
  const updateNeighborhoodData = async (dataToUpdate) => {
    await axios.put(`http://localhost:4000/api/updateneighborhood/${neighborhoodid}`, dataToUpdate);
  }


  const removePhoto = (index) => {

    const url = imgRefs.current[index].src;
    const prefix = "https://populace.s3.amazonaws.com/";
    const extractedPart = url.substring(url.indexOf(prefix) + prefix.length);
    const cleanedString = extractedPart.replace(/%20/g, " ");
    const filteredUrls = nhoodImages.filter((item) => item.image !== cleanedString);
    setNhoodImages(filteredUrls);

  }

  // the following function will enable editing functionality:
  const handleEditClick = () => {
    // galleryParentRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    setIsEditing(true);
  };


  const handleChange = (event) => {

    // If user is trying to edit any of the data came as an  object:
    if (typeof objectData === "object") {
      setObjectData_(prevState => {
        return { ...prevState, [event.target.id]: event.target.value }
      })
    };

    // If the user is adding or removing neighborhood adjectives:
    if (adjectivesText.length > 0) {
      setAdjectivesText(event.target.value.split(", "));
      return
    };
    setText(event.target.value);

  };


  // function to save edited data:
  const handleSaveClick = async () => {

    setObjectDataHistory(prevState => {
      if (areObjectsDifferent(objectData_, objectDataHistory)) {
        // make request:
        updateNeighborhoodData({ [objectKey]: objectData_ })
      }
      return { ...objectData_ }
    })


    // user is editing the images of the neighborhood:
    if (addImagesInput.current !== null && addImagesInput.current.files.length > 0) {
      const newImages = Array.from(addImagesInput.current.files);

      const uploadPromises = newImages.map(async imageFile => {
        const imageType = imageFile.type.split('/')[1];
        const imageUploadConfig = await axios.get(`http://localhost:4000/api/neighborhood/imageupload/${neighborhood}/${imagesId}/${imageType}`);

        await axios.put(imageUploadConfig.data.url, imageFile, {
          headers: {
            "Content-Type": imageType,
          }
        });
        return { image: imageUploadConfig.data.key, description: "" };
      });

      const imagesUrls = await Promise.all(uploadPromises);

      setNhoodImagesHistory(prevNhoodImagesArray => {
        const newImages = [...prevNhoodImagesArray, ...imagesUrls];
        // updating the newImages state will trigger the server request to save the new images
        setNewImages(newImages);
        return newImages;
      });

      setNhoodImages(prevNhoodImagesArray => {
        const newImages = [...prevNhoodImagesArray, ...imagesUrls]
        return newImages
      });

      updateNeighborhoodData({ [objectKey]: imagesUrls })
      setIsEditing(false);
      return;
    };

    // user is editing the list of neighborhood adjectives 
    setAdjectivesTextHistory(prevAdjectivesText => {
      if (!areArraysEqual(prevAdjectivesText, adjectivesText)) {
        updateNeighborhoodData({ [objectKey]: adjectivesText })
      }
      return [...adjectivesText];
    });

    // user is editing a text-based section of the neighborhood profile:
    setTextHistory(prevText => {
      if (prevText !== text) {
        updateNeighborhoodData({ [objectKey]: text })
      }
      return text;
    });

    setIsEditing(false);

  };


  const handleCancelClick = () => {
    setAdjectivesText(adjectivesTextHistory);
    setText(textHistory);
    setIsEditing(false);
  };

  /** we are rendering an object that contains information of recommended restaurants or nightlife venues */



  if (Array.isArray(recommendationsArrayOfObjects)) {

    console.log('recommendationsArrayOfObjects', recommendationsArrayOfObjects);

    <div>
      {isEditing ? (

        <div>

        </div>


      ) : (

        <div>

          {recommendationsArrayOfObjects.map((item, index) => (
            <div key={index}>
              <p>{item.recommendation}</p>
              <p>{item.explanation }</p>
            </div>
          ))}

        </div>

      )}

    </div>


  }



  /** We are rendering information that comes in as an object: */
  if (typeof objectData_ === "object") {

    return (
      <div style={{ padding: "15px", width: "100%" }}>
        {isEditing ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", margin: "10px" }}>
              <p style={{ textAlign: "start" }}> {complementaryText[0] + ":"}</p>
              <Form.Control id="assesment" onChange={handleChange} type="text" value={objectData_.assesment.toLowerCase()} style={{ width: "50%", marginLeft: "10px" }} />
            </div>

            <div style={{ display: "flex", alignItems: "center", margin: "10px" }}>
              <p style={{ textAlign: "start" }}> {complementaryText[1] + ":"}</p>
              <Form.Control id="explanation" onChange={handleChange} type="text" value={objectData_.explanation.toLowerCase()} style={{ width: "50%", marginLeft: "10px" }} />
            </div>

            <div className="divSaveCancelBtns">
              <Button variant='outline-primary' style={{ width: "30%" }} className="buttonDataSave" onClick={handleSaveClick}>Save</Button>
              <Button variant='outline-danger' style={{ width: "30%" }} className="buttonDataSave" onClick={handleCancelClick}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div style={{ border: "1px dotted black ", padding: "15px", display: "flex" }}>

            {isEditable ? (<svg onClick={handleEditClick} className="editSvg" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>) : null}

            <p style={{ marginBottom: "0px", margin: isEditable ? "5px" : "0px" }} className="nhoodRecommendationText">
              {complementaryText[0] + objectData_.assesment.toLowerCase()}
            </p>

            {objectData_.explanation !== "" ? (
              <p style={{ marginBottom: "0px", margin: isEditable ? "5px" : "0px" }} className="nhoodRecommendationText">
                {complementaryText[1] + objectData_.explanation.toLowerCase()}
              </p>
            ) : (
              null
            )}
          </div>
        )}

      </div>
    )
  }


  /** When we render the neighboorhood images: */
  if (images.length > 0) {

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
                    style={{ width: "100%", height: "300px", objectFit: "cover" }} src={"https://populace.s3.amazonaws.com/" + image.image}
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
              <Form.Label style={{ fontSize: "15px" }} className="text-primary">Add more pictures:</Form.Label>
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
                <Card.Img style={{ width: "100%", height: "300px", objectFit: "cover", background: "#e4e4e4" }} variant="top" src={"https://populace.s3.amazonaws.com/" + image.image} />
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
        {isEditable ? (<svg onClick={handleEditClick} className="editSvgRecommendedPlaces" cursor="pointer" fill="none" height="24" stroke="currentColor" strokeLinecap="round" zindex="3" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>) : null}
      </div>
    )

  }

  /** If we are going to render list of adjectives: */
  if (adjectives.length > 0) {

    return (
      <div className="adjectivesDiv">
        {isEditing ? (
          <div className="nhoodIntroItemList">

            <div>
              <label className="labelCommaSeparatedAdjs" htmlFor="wordListInput">Make sure you include a comma-separated list of words:</label>
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
                isEditable ? (<svg onClick={handleEditClick} className="editSvg" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>) : null
              }

              <p style={{ marginBottom: "0px", margin: isEditable ? "0px" : "0px" }} className="nhoodRecommendationText">
                {complementaryText !== "" ? complementaryText : null}

                {
                  adjectivesText.map((adjective, index) => {
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

  }

  /** When we only render plain text: */
  return (
    <div style={{ padding: "15px", width: "100%" }}>

      {isEditing ? (

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

          {isEditable ? (<svg onClick={handleEditClick} className="editSvg" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>) : null}


          <p style={{ marginBottom: "0px", margin: isEditable ? "5px" : "0px" }} className="nhoodRecommendationText">
            {complementaryText !== "" ? complementaryText : null} {text}
          </p>


        </div>

      )}

    </div>


  )


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
  const key1 = 'assesment';
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

export default NeighborhoodEditableDiv;