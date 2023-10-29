import './App.css';
import 'bootstrap/dist/css/bootstrap.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from "axios"
import React, { useEffect, useState } from "react";
import Home from "./views/Home";
import Header from "./components/Header";
import Signin from './components/Signin';
import SignUp from './components/Signup';

function App() {

  const [currentuser, setCurrentUser] = useState(null);

  const updateCurrentUser = (data) => {

    return new Promise((resolve, reject) => {
      if (data !== undefined) {
        setCurrentUser(data)
        resolve()
      } else {
        reject(new Error('No user data provided.'))
      }
    })

  }

  async function checkCurrentUser() {
    try {
      const response = await axios.get('http://localhost:4000/api/currentuser', { withCredentials: true });
      console.log('okuju', response.data)
      // setCurrentUser(response.data);
      updateCurrentUser(response.data)
    } catch (error) {
    }
  }

  useEffect(() => {

    checkCurrentUser()


  }, []);

  return (
    <Router>
      <div className="App">
        <Header updateCurrentUser={updateCurrentUser} currentuser={currentuser} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp updateCurrentUser={updateCurrentUser} />} />
          <Route path="/signin" element={<Signin pdateCurrentUser={updateCurrentUser} />} />
          <Route path="/questionnaire" element={<Signin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
