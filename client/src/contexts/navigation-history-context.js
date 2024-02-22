import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const NavigationHistoryContext = createContext({
  pathsVisited: 0,
  addPath: () => { },
});

export const NavigationHistoryProvider = ({ children }) => {
  const [pathsVisited, setPathsVisited] = useState(0);
  const location = useLocation();

  useEffect(() => {
    setPathsVisited((prevPathsVisited) => prevPathsVisited + 1);
  }, [location]);

  const addPath = () => {
    setPathsVisited((prevPathsVisited) => prevPathsVisited + 1);
  };

  return (
    <NavigationHistoryContext.Provider value={{ pathsVisited, addPath }}>
      {children}
    </NavigationHistoryContext.Provider>
  );
};

export const useNavigationHistory = () => {
  const context = useContext(NavigationHistoryContext);
  if (context === undefined) {
    throw new Error('useNavigationHistory must be used within a NavigationHistoryProvider');
  }
  return context;
};