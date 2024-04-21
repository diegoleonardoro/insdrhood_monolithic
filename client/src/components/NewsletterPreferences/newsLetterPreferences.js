import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import axios from "axios";
import { useLocation } from 'react-router-dom';

import "./newsLetterPreferences";


const NewsLetterPreferences = () => {

  const [user, setUser] = useState(null)

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const identifier = query.get('user_id');


  const makeRequest = async () => {



    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/newsletter/getuserinfo/${identifier}`);
      
      console.log("ress", response)
      setUser(response.data);
    } catch (error) {
      // setErrors(error.response.data.errors[0].message);
    }
  }


  useEffect(() => {


    makeRequest()

  }, []);









};

export default NewsLetterPreferences;
