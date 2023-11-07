import React, { useEffect, useState, useRef } from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import axios from "axios";

import "./neighborhoodEditableDiv.css";


const NeighborhoodEditableDiv = ({
  isEditable, // this state will be set to true if whoever is logged in is the owner of the neighbohood profile. 
  neighborhoodid,
  objectKey,
  content = "",
  adjectives = [],
  recommendations = [],
  images = [],
  recommendationsType = "",
  neighborhood = "",
  complementaryText = "" // complementarytext is text that is going to be rendered by this editable component but the user will not have the option to edit. 
}) => {

  console.log('isEditable', isEditable);


  // this state will be set to true wheneber the user clicks the "edit" button.
  const [isEditing, setIsEditing] = useState(false);

  // these two states will be used when we are editing a section that only contains text:
  const [text, setText] = useState(content);
  const [textHistory, setTextHistory] = useState(content)


  // the following two states will be used when editing a section of adjectives:
  const [adjectivesText, setAdjectivesText] = useState(adjectives);
  const [adjectivesTextHistory, setAdjectivesTextHistory] = useState(adjectives)

  // the following states will be used when editing an array of recommendations:
  const [recommendationsArray, setRecommendationsArray] = useState(recommendations);
  const [recommendationsHistory, setRecommendations_History] = useState(recommendations);


  // the following state will be used when creating the request body to update the neighborhood data:
  const [reqBody, setReqBody] = useState({ key: "", data: "" });


  // the following function will enable editing functionality:
  const handleEditClick = () => {
    setIsEditing(true);
  };



  const handleChange = (event) => {
    setText(event.target.value);
  };


  // function to save edited data:
  const handleSaveClick = async () => {
    setTextHistory(prevText => {
      if (prevText !== text) {
        setReqBody({ key: objectKey, data: text });
      }
      return text;
    });
    setIsEditing(false);
  }

  const handleCancelClick = () => {
    setText(textHistory);
    setIsEditing(false);
  };



  return (
    <div>

      {isEditing ? (

        <div>

          <input
            type="text"
            value={text}
            onChange={handleChange}
            autoFocus
            className="inputNhoodIntro"
          />

          <div className="divSaveCancelBtns">
            <button className="saveButton" onClick={handleSaveClick}>Save</button>
            <button className="cancelButton" onClick={handleCancelClick}>Cancel</button>
          </div>


        </div>

      ) : (

        <div>

          {isEditable ? (<svg onClick={handleEditClick} className="editSvg" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>) : null}


          <p style={{ marginBottom: "0px", margin: isEditable ? "5px" : "0px" }} className="nhoodRecommendationText">
            {complementaryText !== "" ? complementaryText : null} {text}
          </p>


        </div>

      )}

    </div>


  )
}

export default NeighborhoodEditableDiv;