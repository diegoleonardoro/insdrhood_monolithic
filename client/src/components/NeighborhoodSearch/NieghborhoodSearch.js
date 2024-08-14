import "./neighborhoodSearch.css";
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { TextField, Box, createTheme, ThemeProvider } from '@mui/material';
import NeighborhoodReport from "../NeighborhoodReport/neighborhoodReport";
import Spinner from 'react-bootstrap/Spinner';


const SearchBar = () => {

  const [input, setInput] = useState('');
  const [nhood, setNhood] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const suggestionRefs = useRef([]);
  const [nhoodData, setNhoodData] = useState([]);
  const [waitingForData, setWaitingForData] = useState(false);
  const [nhoodDescriptions , setNhoodDescriptions]=useState({})

  const handleChange = (event) => {
    const value = event.target.value;
    setInput(value);

    if (value.length > 1) {
      const filtered = neighborhoods.filter(neighborhood =>
        neighborhood.toLowerCase().includes(value.toLowerCase())
      );

      setSuggestions(filtered);
      suggestionRefs.current = new Array(filtered.length).fill().map((_, i) => suggestionRefs.current[i] || React.createRef());
    } else {
      setSuggestions([]);
    }
    setActiveIndex(-1);
  };

  const makeRequest = async (nhood) => {
    setWaitingForData(true)
    const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/neighborhoodData/${nhood}`);
    setNhoodData(response.data.userInputs);
    if (response.data && response.data.neighborhood_summariesCollections && response.data.neighborhood_summariesCollections.response) {
      setNhoodDescriptions(response.data.neighborhood_summariesCollections.response);
      console.log(response.data.neighborhood_summariesCollections.response)
    } else {
      setNhoodDescriptions({});  // Optionally reset to an empty object if data is not available
    }
    setWaitingForData(false);
  }

  const handleSuggestionClick = async (nhood) => {
    setInput(nhood);
    setNhood(nhood); // Move this here to ensure it updates immediately with the correct value
    setSuggestions([]);
    setActiveIndex(-1);
    await makeRequest(nhood);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown' && activeIndex < suggestions.length - 1) {
      setActiveIndex(prevIndex => prevIndex + 1);
    } else if (event.key === 'ArrowUp' && activeIndex > 0) {
      setActiveIndex(prevIndex => prevIndex - 1);
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      handleSuggestionClick(suggestions[activeIndex]);
    }
  };

  useEffect(() => {

    axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/chat/sendChatInfo`, {
      webPageRoute: '/neighborhoodsearch',
      payLoad: JSON.stringify(validChatHistory)
    })
      .then(response => {
        console.log('vistig notification');
      })
      .catch(error => {
        console.error('Error sending chat info:', error);
      });


    if (activeIndex >= 0 && activeIndex < suggestions.length) {
      suggestionRefs.current[activeIndex].current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeIndex]);


  if (waitingForData) {
    return (<>
      <Spinner animation="border" variant="warning" />
    </>)
  }


  return (
    <div className="neighborhoodSearchContainer">
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            width: 500,
            maxWidth: '100%',
            margin: 'auto',
            position: 'relative',
            top: '20px',
          }}
        >
          <TextField
            fullWidth
            label="Type a Neighborhood"
            id="fullWidth"
            variant="outlined"
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />

          {suggestions.length > 0 && (
            <div style={{ marginTop: '10px', background: '#fff', position: 'absolute', width: '100%', zIndex: 5 }}>
              <div style={{ padding: '10px', background: '#eee', textAlign: 'center' }}>
                Choose an option
              </div>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  ref={suggestionRefs.current[index]}
                  style={{
                    padding: '10px',
                    cursor: 'pointer',
                    backgroundColor: index === activeIndex ? '#bde4ff' : '#fff'
                  }}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </Box>
      </ThemeProvider>

      <NeighborhoodReport nhoodData={nhoodData} nhoodsNarrative={nhoodDescriptions}neighborhood={nhood}></NeighborhoodReport>
    </div>
  );
};


const theme = createTheme({
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          // Styles applied to the root element
          '& label.Mui-focused': {
            color: 'grey', // Change label color when focused
          },
          '& .MuiInput-underline:after': {
            borderBottomColor: 'grey', // Change underline color when focused
          },
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              borderColor: 'grey', // Change border color for outlined variant when focused
            },
          },
        },
      },
    },
  },
});


var neighborhoods = [
  "Albemarle",
  "St. Albans",
  "Van Cortlandt Village",
  "South Ozone Park",
  "Windsor Terrace",
  "Canarsie",
  "Upper West Side",
  "Mount Hope",
  "North Corona",
  "West Brighton",
  "Ozone Park",
  "Springfield Gardens",
  "Brookville",
  "Fort Greene",
  "Starrett City",
  "Ocean Hill",
  "Pomonok",
  "Hillcrest",
  "Madison",
  "South Jamaica",
  "Rikers Island",
  "Hollis",
  "Rosedale",
  "Auburndale",
  "Stuyvesant Heights",
  "Kensington",
  "Bedford",
  "Bushwick",
  "Douglas Manor",
  "Douglaston",
  "Little Neck",
  "Cambria Heights",
  "Glen Oaks",
  "Floral Park",
  "New Hyde Park",
  "Parkchester",
  "SoHo",
  "TriBeCa",
  "Civic Center",
  "Little Italy",
  "Georgetown",
  "Marine Park",
  "Bergen Beach",
  "Mill Basin",
  "Manhattanville",
  "Bronxdale",
  "Westerleigh",
  "New Brighton",
  "St. George",
  "Woodhaven",
  "Queensboro Hill",
  "Charleston",
  "Richmond Valley",
  "Tottenville",
  "Far Rockaway",
  "Bayswater",
  "Grymes Hill",
  "Clifton",
  "Fox Hills",
  "Silver Lake",
  "Arden Heights",
  "Pelham Bay",
  "Country Club",
  "City Island",
  "Schuylerville",
  "Throgs Neck",
  "Edgewater Park",
  "Longwood",
  "Oakland Gardens",
  "Kew Gardens Hills",
  "Co-op City",
  "Brownsville",
  "Briarwood",
  "New Springville",
  "Bloomfield",
  "Melrose",
  "Stapleton",
  "Rosebank",
  "East Tremont",
  "College Point",
  "Woodlawn",
  "Wakefield",
  "Queensbridge",
  "Ravenswood",
  "Long Island City",
  "Hammels",
  "Arverne",
  "Edgemere",
  "Bayside",
  "Bayside Hills",
  "Elmhurst",
  "Maspeth",
  "East Flatbush",
  "Farragut",
  "Erasmus",
  "Laurelton",
  "Fresh Meadows",
  "Utopia",
  "Brooklyn Heights",
  "Cobble Hill",
  "Ridgewood",
  "Astoria",
  "Annadale",
  "Huguenot",
  "Prince's Bay",
  "Eltingville",
  "Rossville-Woodrow",
  "Battery Park City",
  "Lower Manhattan",
  "Richmond Hill",
  "Mariner's Harbor",
  "Arlington",
  "Port Ivory",
  "Graniteville",
  "Port Richmond",
  "Norwood",
  "Prospect Heights",
  "Soundview-Bruckner",
  "Fort Totten-Bay",
  "Clearview",
  "Whitestone",
  "Hunts Point",
  "Middle Village",
  "Crown Heights South",
  "Fort Wadsworth",
  "Arrochar",
  "Belmont",
  "Seagate",
  "Coney Island",
  "Gravesend",
  "North Riverdale",
  "Fieldston",
  "Riverdale",
  "Glendale",
  "Sunset Park East",
  "Eastchester",
  "Edenwald",
  "Baychester",
  "Allerton",
  "Pelham Gardens",
  "Forest Hills",
  "Kew Gardens",
  "Williamsbridge",
  "Olinville",
  "West Farms",
  "Crotona Park",
  "Spuyten Duyvil",
  "Kingsbridge",
  "Kingsbridge Heights",
  "East Elmhurst",
  "Bath Beach",
  "West Concourse",
  "Bedford Park",
  "Fordham",
  "Flushing",
  "Murray Hill",
  "Marble Hill",
  "Inwood",
  "Springfield Gardens North",
  "Baisley Park",
  "East Concourse",
  "Concourse Village",
  "Morrisania",
  "Jackson Heights",
  "Woodside",
  "Borough Park",
  "Turtle Bay",
  "East Midtown",
  "Lincoln Square",
  "Clinton",
  "Washington Heights",
  "Prospect Lefferts Gardens",
  "Wingate",
  "Flatbush",
  "Lindenwood",
  "Howard Beach",
  "Queens Village",
  "Bellerose",
  "Holliswood",
  "Jamaica",
  "Central Harlem North",
  "Polo Grounds",
  "Hamilton Heights",
  "Stuyvesant Town",
  "Cooper Village",
  "Bensonhurst West",
  "Bensonhurst East",
  "Mott Haven",
  "Port Morris",
  "Williamsburg",
  "Oakwood",
  "Flatlands",
  "Remsen Village",
  "Murray Hill-Kips Bay",
  "East Williamsburg",
  "North Side-South Side",
  "Westchester",
  "Unionport",
  "Breezy Point",
  "Belle Harbor",
  "Broad Channel",
  "Rockaway Park",
  "Sheepshead Bay",
  "Gerritsen Beach",
  "Manhattan Beach",
  "Highbridge",
  "University Heights",
  "Morris Heights",
  "West Village",
  "New Dorp",
  "Midland Beach",
  "Todt Hill",
  "Emerson Hill",
  "Lighthouse Hill",
  "Heartland Village",
  "Old Town",
  "Dongan Hills",
  "South Beach",
  "East Harlem North",
  "Chinatown",
  "Gramercy",
  "Lenox Hill",
  "Roosevelt Island",
  "Upper East Side",
  "Carnegie Hill",
  "East Village",
  "Lower East Side",
  "East Harlem South",
  "Sunset Park West",
  "Carroll Gardens",
  "Columbia Street",
  "Red Hook",
  "Crown Heights North",
  "Clinton Hill",
  "Corona",
  "Rego Park",
  "Dyker Heights",
  "Bay Ridge",
  "Claremont",
  "Bathgate",
  "Soundview",
  "Castle Hill",
  "Harding Park",
  "Clason Point",
  "Pelham Parkway",
  "Van Nest",
  "Morris Park",
  "Westchester Square",
  "Midwood",
  "Ocean Parkway",
  "Great Kills",
  "Morningside Heights",
  "Central Harlem South",
  "Hudson Yards",
  "Chelsea",
  "Flatiron",
  "Union Square",
  "Midtown",
  "Midtown South",
  "East New York",
  "Cypress Hills",
  "City Line",
  "Greenpoint",
  "Hunters Point",
  "Sunnyside",
  "West Maspeth",
  "Yorkville",
  "Old Astoria",
  "Park Slope",
  "Gowanus",
  "DUMBO",
  "Vinegar Hill",
  "Downtown Brooklyn",
  "Boerum Hill",
  "Brighton Beach",
  "Homecrest",
  "Steinway",
  "Bedford-Stuyvesant",
  "Brooklyn Navy Yard",
  "Dyker Beach Park",
  "Fort Hamilton",
  "Greenwood Cemetery",
  "Greenwood Heights",
  "Highland Park",
  "Los Sures - Southside",
  "Mapleton",
  "Mill Island",
  "New Lots",
  "North Williamsburg",
  "Paerdegat",
  "Parkville",
  "Prospect Park",
  "Prospect Park South",
  "Sea Gate",
  "South Slope",
  "South Williamsburg",
  "Victorian Flatbush",
  "Alphabet City",
  "Bloomingdale District",
  "Bowery",
  "Central Park",
  "East Harlem",
  "Financial District",
  "Flatiron District",
  "Fort George",
  "Garment District",
  "Governors Island",
  "Greenwich Village",
  "Harlem",
  "Hell's Kitchen (Clinton)",
  "Hudson Heights",
  "Hudson Square",
  "Kips Bay",
  "Little Italy_NoLIta",
  "Manhattan Valley",
  "Manhattantville",
  "Meatpacking District",
  "Metropolitan Hill",
  "Midtown East",
  "NoHo",
  "NoMad",
  "Randall's Island",
  "Rose Hill",
  "South Street Seaport",
  "Spanish Harlem (El Barrio)",
  "Sugar Hill",
  "Sutton Place",
  "The Highline",
  "Theater District (Times Square)",
  "Tudor City",
  "Two Bridges",
  "World Trade Center",
  "Indian Village",
  "Jerome Park",
  "Laconia",
  "Locust Point",
  "Silver Beach",
  "Alley Pond Park",
  "Astoria Heights",
  "Bay Terrace",
  "Bayside Hills",
  "Beechhurst",
  "Bellaire",
  "Belle Harbor",
  "Bellerose Manor",
  "Broad Channel",
  "Broadway-Flushing",
  "Brookville Park",
  "Cambria Heights",
  "Cunningham Park",
  "Ditmars-Steinway",
  "Douglas Manor",
  "Downtown Flushing",
  "Floral Park",
  "Flushing Heights",
  "Flushing Meadows Corona Park",
  "Forest Hills Gardens",
  "Forest Park",
  "Fort Tilden-Jacob Riis Parks",
  "Fresh Meadows",
  "Glen Oaks",
  "Glendale",
  "Hamilton Beach",
  "Hillcrest",
  "The Hole",
  "Hollis Hills",
  "Holliswood",
  "Hunter's Point",
  "Jamaica Center",
  "Jamaica Estates",
  "Jamaica Hills",
  "Kissena",
  "Kissena Park",
  "Linden Hill",
  "Locust Manor",
  "Malba",
  "Meadowmere",
  "Middle Village",
  "Murray Hill",
  "Neponsit",
  "Old Howard Beach",
  "Pomonok",
  "Queensboro Hill",
  "Richmond Hill East",
  "Rochdale",
  "Rockaway Beach",
  "Rockaway Park",
  "Roxbury",
  "South Richmond Hill",
  "Utopia",
  "Whitestone",
  "Willet's Point"

];


export default SearchBar;
