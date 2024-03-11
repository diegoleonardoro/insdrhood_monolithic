import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
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

  const addPath = useMemo(() => () => {
    setPathsVisited((prevPathsVisited) => prevPathsVisited + 1);
  }, []);

  const contextValue = useMemo(() => ({
    pathsVisited,
    addPath,
  }), [pathsVisited, addPath]);

  return (
    <NavigationHistoryContext.Provider value={contextValue}>
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