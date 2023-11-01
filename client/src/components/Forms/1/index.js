import { useState, useRef, useEffect } from "react";
import "./form.css";
import axios from "axios";
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Alert from 'react-bootstrap/Alert';
import { v4 as uuidv4 } from 'uuid';



const FormComponent = () => {

  const [displayKeyWord, setDisplayKeyWord] = useState(["liveInNY"]);
  const [neighborhood, setNeighborhood] = useState("");
  const [liveinNYC, setLiveinNYC] = useState("no");
  const [liveinNYCSign, setLiveinNYCSign] = useState("yes");
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [shakie, setShakie] = useState("shakieCheck");

  const nehoodAdjectivesDivRef = useRef(null);
  const residentAdjectivesDivRef = useRef(null);
  const typesOfFoodRecommendationsRef = useRef(null);
  const favTypesOfFoodRef = useRef(null);
  const nightLifeRecommendationsRef = useRef([]);


  const divRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(1);

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [residentsAdjsSelectedOpts, setResidentsAdjsSelectedOpts] = useState([]);
  const [foodTypesSelectedOpts, setFoodTypesSelectedOpts] = useState([]);
  const [foodTypesInput, setFoodTypesInput] = useState("");
  const neighborhoodsDiv = useRef();

  const [userUIID, setUserUUID] = useState();
  const [showUserDataAlert, setShowUserDataAlert] = useState(false);

  const [rows, setRows] = useState([
    {
      name: "",
      directions: "",
      description: "",
      file: { fileName: "Upload" },
    },
  ]);

  const [nighLifeRows, setNighLifeRows] = useState([
    {
      name: "",
      description: "",
    },
  ]);


  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    residentId: '',
    formsResponded: 0,
    userImagesId: userUIID
  });

  const [formData, setFormData] = useState({
    neighborhood: "",
    timeLivingInNeighborhood: "",
    neighborhoodDescription: "",
    neighborhoodAdjectives: [],
    mostUniqueThingAboutNeighborhood: "",
    peopleShouldVisitNeighborhoodIfTheyWant: "",
    residentAdjectives: [],
    typicalResidentDescription: "",
    foodCulture: "",
    recommendedFoodTypes: [],
    onePlaceToEat: { place: "", explanation: "" },
    foodPrices: { price: "", explanation: "" },
    foodIsAuthentic: { assesment: "", explanation: "" },
    nightLife: "",
    nightLifeRecommendations: [],
    onePlaceForNightLife: { place: "", explanation: "" },
    statements: {},
    neighborhoodImages: []
  });

  const formUseRef = useRef(null);
  const letsTalkAboutFoodRef = useRef(null);
  const letsTalkAboutNightLifeRef = useRef(null);
  const letsTalkAboutGeneralInfo = useRef(null);
  const nhoodExplanationRef = useRef([]);
  const foodPriceExplanationRef = useRef(null);
  const foodDiversityExplanationRef = useRef(null);
  const neighborhoodInput = useRef();


  const onlyNYCResidentsSign = liveinNYCSign === "no" ? "block" : "none";// 


  // a request to check the currently logged in user needs to be made:
  //   const loggedUser = currentUser;


  // Create function that makes request to save the form data:


  // Create function that will save the user's data if they had not registered before


  // Create function that will be called if the user was alredy logged in. This function will update the errorsFromUserUpdate value of the user.



  // The following function will check if the user is a NYC resident. If not, it will close the form and direct the user to the home page. If yes, it will continue showing the form to the user:
  const nycResidentChecker = (value) => {
    // const form = document.getElementsByClassName("Form_form__Buw7X")[0];
    const form = formUseRef.current;
    if (value === "yes") {
      setLiveinNYC("yes");
      setDisplayKeyWord(["neighborhood"]);
    } else if (value === "no") {
      setLiveinNYCSign("no");
      form.style.display = "none";
      setTimeout(() => {
        setLiveinNYCSign("yes");
        // make request to send user to the home page:

      }, 3000);
    }
  };

  // The following function will be in charge of changing the quesitons:
  const changeQuestion = async (direction, flag, errs) => {


    let keyWord;
    const currentDiv = divRefs.current[activeIndex];

    if (direction === "next") {
      if (currentDiv) {

        // check if the user has not responded a question that required to be responded:
        if (currentDiv.className.indexOf("shakieCheck") > -1) {
          if (currentDiv.className.indexOf("nhoodAdjectivesFlag") > -1) {
            const adjsContainer = currentDiv.querySelector(".adjsNhoodContainer") || currentDiv.querySelector(".adjsResContainer");
            if (!adjsContainer) {
              setShakie("apply_shake");
              const timeout = setTimeout(() => {
                setShakie('shakieCheck');
              }, 1000);
              return () => clearTimeout(timeout);
            }
          }
        } else if (currentDiv.className.indexOf("neighborhoodEvaluationFlag") > -1) {
          const inputs = currentDiv.querySelectorAll("input");
          let hasValue = false;

          for (let i = 0; i < inputs.length; i++) {
            if (inputs[i].checked) {
              hasValue = true;
              break;
            }
          }
          if (!hasValue) {
            setShakie("apply_shake");
            const timeout = setTimeout(() => {
              setShakie('shakieCheck');
            }, 1000);
            return () => clearTimeout(timeout);
          }
        } else {
          const userInput = currentDiv.querySelector("input, textarea, select");
          if (userInput.value === '') {
            setShakie("apply_shake");
            const timeout = setTimeout(() => {
              setShakie('shakieCheck');
            }, 1000);
            return () => clearTimeout(timeout);
          }
        }

        // Check if we are about to show the food questions, so that we can change the display value of the header that annouces the upcoming food questions:
        if (currentDiv.className.indexOf("stereotypicalResident") > -1) {
          setTimeout(() => {
            letsTalkAboutFoodRef.current.style.display = "none";
          }, 1000);
        };

        // Check if we are about to show the night life questions, so that we can change the display value of the header that annouces the upcoming night life questions questions:
        if (currentDiv.className.indexOf("agreeOrDisagreeFoodQuestions") > -1) {
          setTimeout(() => {
            letsTalkAboutNightLifeRef.current.style.display = "none";
          }, 1000);
        };

        // Check if we are about to show the  general information questions, so that we can change the display value of the header that annouces the upcoming general information questions questions:
        if (currentDiv.className.indexOf("pickOneNightLifePlace") > -1) {
          setTimeout(() => {
            letsTalkAboutGeneralInfo.current.style.display = "none";
          }, 1000);
        };


        // The following if statement will check if the user has clicked the last question
        if (activeIndex === 21) {

          // make request to save the images:
          const imagesUrls = [];
          const randomUUID = uuidv4();
          setUserUUID(randomUUID);

          if (formData.neighborhoodImages.length > 0) {
            for (var i = 0; i < formData.neighborhoodImages.length; i++) {
              const imageFile = formData.neighborhoodImages[i];
              const imageType = imageFile.type.split('/')[1];
              console.log('imageType', imageType)
              /** 
              * In this request we will send a random UUID which will be used to 
              * relate users to the images that they upload. 
              */
              const imageUploadConfig = await axios.get(`/api/residents/upload/${neighborhood}/${randomUUID}/${imageType}`);

              imagesUrls.push({
                image: imageUploadConfig.data.key,
                description: ""
              });

              await axios.put(imageUploadConfig.data.url, imageFile, {
                headers: {
                  "Content-Type": imageType,
                },
              });

            }
          };

          // store the images in the formData state:
          formData.neighborhoodImages = imagesUrls;


          // make request to save the resident data and update the residentId, formsResponded and userImagesId values of the user (if the user is alredy logged in):



          // If the user is not logged in, show the sign up form:
          keyWord = "personalInfo";


        };


        // if the last key word is "end", then  do not display another question
        keyWord = currentDiv.className.split(" ")[1];
        if (keyWord === "end") {
          return;
        }

        // check if we are on the questiont that asks users for their data, and if so update the userData state.


        let nextIndex = activeIndex + 1;
        setActiveIndex(nextIndex);


      }
    } else if (direction === "prev") {
      if (currentDiv) {
        keyWord = currentDiv.className.split(" ")[0];
        if (keyWord === "start") {
          return;
        }

        // change the position of the houses svg:
        // slideVal = slideVal - 200;
        // houses.style.transform = `translateX(${-slideVal}px)`;

        if (keyWord === "__") {
          return;
        }
      }
      let nextIndex = activeIndex - 1;
      setActiveIndex(nextIndex);

    }
    setDisplayKeyWord([keyWord]);
  }

  //This event handler will be triggered when the user is responding the "true of flase"questions. It will show an input asking users to expand on the answer that they selected. 
  const nhoodEvalHandler = (aspect) => {
    const element = nhoodExplanationRef.current[aspect];
    element.style.display = "flex";
  };


  //This event hanlder will be triggered when the user is responding the questions about  how pricy food is in their neighborhood. It will show an input asking users to expand on  the option that they selected. 
  const foodPricesExplanationHandler = () => {
    foodPriceExplanationRef.current.style.display = "flex"
  }


  // This event hanlder will be triggered when the user is responding the questions about how authentic and diverse food is in their neighborhood. It will show an input asking users to expand on the option that they selected. 
  const foodAuthenticityandDiversityHandler = () => {
    foodDiversityExplanationRef.current.style.display = "flex"
  }



  const displayQuestion = (keyWord) => {
    if (displayKeyWord.indexOf(keyWord) > -1) {
      return 'display';
    } else {
      return 'notDisplay';
    }
  };

  // The followinf jsx will be rendered if the user sends the form data without registering. It will only be shown if there is no user logged in:
  const sendInfoWithoutDataAlert = (
    <>
      <Alert show={showUserDataAlert} variant="primary" className={'userDataAlert'}>
        <Alert.Heading>Alert</Alert.Heading>
        <p>
          When sending anonymous responses, editing or deleting your responses will not be possible.
        </p>
        <hr />
        <div className="d-flex" style={{ flexDirection: "column", alignItems: "center" }}>
          <Button style={{ width: "80%", marginBottom: "3px" }} variant="success" onClick={() => setShowUserDataAlert(false)}>Register</Button>
          <Button style={{ width: "80%" }} variant="danger" onClick={() => { setShowUserDataAlert(false); hideForm('hide') }}>Send form data without authenticating</Button>
        </div>
      </Alert>
    </>
  );


  // The following function will ne triggered when the use closes the form. They will be redirected to the home page
  const hideForm = () => {

  };


  // The following function will update the userData state and it will be triggered when the user is responding the regustration form:
  const updateNewUserData = (event) => {
    const { name, value } = event.target;
    setNewUserData((prevData) => ({
      ...prevData,
      [name]: value
    }))
  };


  // The following function will make the request to save the user user in the database:
  const submitNewUserData = (event) => {

  };



  // The following functions will filter the neighborhoods when the user is responding what neighborhood they live in:
  const neighborhoodsArray = [];
  const displayNhoodsContainer = neighborhoods.length === 0 ? "none" : "flex";
  const selectNeighborhoods = (e) => {
    const val = e.target.value;
    setNeighborhoods([]);
    if (val.length > 0) {
      for (var i = 0; i < arr.length; i++) {
        if (
          arr[i].substring(0, val.length).toUpperCase() === val.toUpperCase()
        ) {
          neighborhoodsArray.push(arr[i]);
        }
      }
      setNeighborhoods(neighborhoodsArray);
    }
  };
  var currentFocus = -1;
  const highlightNhoods = (e) => {
    const hoodsDivs = neighborhoodsDiv.current.children;

    if (e.keyCode === 40) {
      currentFocus++;
      addActive(hoodsDivs);
    } else if (e.keyCode === 38) {
      currentFocus--;
      addActive(hoodsDivs);
    } else if (e.keyCode === 39) {
      currentFocus++;
      addActive(hoodsDivs);
    } else if (e.keyCode === 37) {
      currentFocus--;
      addActive(hoodsDivs);
    } else if (e.keyCode === 13) {
      e.preventDefault();

      if (currentFocus > -1) {
        if (hoodsDivs) {
          neighborhoodInput.current.value = hoodsDivs[currentFocus].innerHTML;
          setTimeout(() => {
            setNeighborhoods([]);
          }, 100);
        }
      }
      currentFocus = 0;
    }
  };
  function addActive(x) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = x.length - 1;
    x[currentFocus].classList.add("autocomplete-active");
    x[currentFocus].style.backgroundColor = "rgb(124, 182, 240)";
  }
  function removeActive(x) {
    for (var i = 0; i < x.length; i++) {
      x[i].style.backgroundColor = "transparent";
    }
  }
  const selectNeighborhood = (e) => {
    neighborhoodInput.current.value = e.target.innerHTML;
    formData.neighborhood = e.target.innerHTML;
    setNeighborhoods([]);
  };
  // ------- -------- --------- ---------- --------- ---------- ----------



  return (
  <div className="mainContainer">



      <div
        style={{ display: onlyNYCResidentsSign }}
        className="onlyNYCResident"
      >
        <Alert style={{ textAlign: "center", marginTop: "15px" }} variant="danger">
          This form is only for New York City Residents
        </Alert>
      </div>


      <form ref={formUseRef} className="form" >

        {/** Do you live in NYC? */}
        <div
          className={
            "start neighborhood liveInNY " + displayQuestion("liveInNY")
          }
          ref={ref => divRefs.current[0] = ref}
        >
          <label htmlFor="neighborhood">Do you live in New York City?</label>

          <div
            onClick={() => nycResidentChecker("yes")}
            className="inputGroup"
          >
            <input
              className="inputCheck"
              id="radio1"
              name="radio"
              type="radio"
            />
            <label className="liveNYCLabel" htmlFor="radio1">
              Yes
            </label>
          </div>

          <div
            onClick={() => nycResidentChecker("no")}
            className="inputGroup"
          >
            <input
              className="inputCheck"
              id="radio2"
              name="radio"
              type="radio"
            />
            <label className="liveNYCLabel" htmlFor="radio2">
              No
            </label>
          </div>
        </div>


        {/** What neighborhood do you live in? */}
        <div
          className={
            "liveInNY yearsInNeighborhood neighborhoodInput " +
            displayQuestion("neighborhood") +
            " " +
            shakie
          }
          ref={ref => divRefs.current[1] = ref}
        >
          <label htmlFor="neighborhood">
            What <span className="questionHighlight">neighborhood</span> do you live in?
          </label>

          <input
            value={formData.neighborhood}
            onChange={(e) => {
              setFormData({ ...formData, neighborhood: e.target.value });
              selectNeighborhoods(e);
            }}
            onKeyDown={(e) => {
              highlightNhoods(e);
            }}
            name="neighborhood"
            id="neighborhood"
            placeholder=" "
            className={"textInput inputCheck"}
            ref={neighborhoodInput}
          ></input>

          <div
            ref={neighborhoodsDiv}
            className="neighborhoodsContainer"
            style={{ display: displayNhoodsContainer }}
          >
            {neighborhoods.map((nhood, index) => {
              return (
                <div onClick={(e) => selectNeighborhood(e)} key={index}>
                  {nhood}
                </div>
              );
            })}
          </div>
        </div>


      </form>




  </div>
  )




}

export default FormComponent;


var arr = [
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
  "DUMBO---",
  "Vinegar Hill",
  "Downtown Brooklyn",
  "Boerum Hill",
  "Brighton Beach",
  "Homecrest",
  "Steinway",
];
