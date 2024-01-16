import React, { createContext, useState, useContext, useCallback } from 'react';
import axios from 'axios';

const UserContext = createContext(); //The createContext function creates a Context object. When React renders a component that subscribes to this Context object, it will read the current context value from the nearest matching Provider above it in the tree. 


export const useUser = () => useContext(UserContext); // This is a custom hook that simplifies the consumption of UserContext. Any component that wants to access the UserContext can simply call useUser() instead of using useContext(UserContext).

export const UserProvider = ({ children }) => { // This is a component that allows consuming components to subscribe to context changes.

  const [currentuser, setCurrentUser] = useState(null); // This will be updated later when the user data is fetched.

  const updateCurrentUser = useCallback(async () => {

    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/currentuser`, { withCredentials: true });
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    }

  }, []);

  // Fetch user on mount
  React.useEffect(() => {//  React's Effect Hook is used here to perform the updateCurrentUser operation when the component mounts.
    updateCurrentUser();
  }, [updateCurrentUser]);

  // The value passed to the provider is an object containing currentuser and updateCurrentUser, which any consumer of this context can access.
  return (
    <UserContext.Provider value={{ currentuser, updateCurrentUser }}> 
      {children}
    </UserContext.Provider>
  );
};