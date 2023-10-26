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

  async function checkCurrentUser() {
    try {
      const response = await axios.get('http://localhost:4000/api/currentuser', { withCredentials: true });

      console.log(response);

      setCurrentUser(response.data);

    } catch (error) {
    }
  }
  useEffect(() => {
    checkCurrentUser()
  }, [])

  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home  />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/questionnaire" element={<Signin />} />
        </Routes>
      </div>

    </Router>
  );
}

export default App;
