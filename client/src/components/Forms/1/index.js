import { useState, useRef, useEffect } from "react";
import "./form.css";
import axios from "axios";
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Alert from 'react-bootstrap/Alert';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip'
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from "react-router-dom";


let addLastPlace = false;
let addPlaceFromForm = true;
let addPlaceFromFormNightLife = true;

const FormComponent = ({ updateCurrentUser }) => {

  const [displayKeyWord, setDisplayKeyWord] = useState(["liveInNY"]);
  const [neighborhood, setNeighborhood] = useState("");
  const [liveinNYC, setLiveinNYC] = useState("no");
  const [liveinNYCSign, setLiveinNYCSign] = useState("yes");
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [shakie, setShakie] = useState("shakieCheck");
  const nehoodAdjectivesDivRef = useRef(null);
  const nehoodAdjectivesDivContainerDisplay = useRef(null);
  const residentAdjectivesDivRef = useRef(null);
  const residentAdjectivesDivContainer = useRef(null);
  const typesOfFoodRecommendationsRef = useRef(null);
  const favTypesOfFoodRef = useRef(null);
  const nightLifeRecommendationsRef = useRef([]);
  const foodRecommendationsRef = useRef([]);
  const divRefs = useRef([]);
  const neighborhoodsDiv = useRef();
  const [activeIndex, setActiveIndex] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [residentsAdjsSelectedOpts, setResidentsAdjsSelectedOpts] = useState([]);
  const [foodTypesSelectedOpts, setFoodTypesSelectedOpts] = useState([]);
  const [foodTypesInput, setFoodTypesInput] = useState("");
  const [nhoodAdjective, setNhoodAjective] = useState("");
  const [residentAdjective, setResidentAdjective] = useState("");
  const [userUIID, setUserUUID] = useState();
  const [showUserDataAlert, setShowUserDataAlert] = useState(false);
  const [neighborhoodId, setNeighborhoodId] = useState();
  const [isLoading, setIsLoading] = useState(false);

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
    neighborhoodId: '',
    formsResponded: 1,
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
    onePlaceToEat: { assessment: "", explanation: "" },
    foodPrices: { assessment: "", explanation: "" },
    foodIsAuthentic: { assessment: "", explanation: "" },
    nightLife: "",
    nightLifeRecommendations: [],
    onePlaceForNightLife: { assessment: "", explanation: "" },
    statements: {},
    neighborhoodImages: [],
    user: {}
  });

  const formUseRef = useRef(null);
  const letsTalkAboutFoodRef = useRef(null);
  const letsTalkAboutNightLifeRef = useRef(null);
  const letsTalkAboutGeneralInfo = useRef(null);
  const nhoodExplanationRef = useRef([]);
  const foodPriceExplanationRef = useRef(null);
  const foodDiversityExplanationRef = useRef(null);
  const nightLifeExplanationRef = useRef(null);
  const neighborhoodInput = useRef();
  const favoritePlacesContainerRef = useRef();
  const showFormToResident = liveinNYC === "yes" ? "visible" : "hidden";
  const onlyNYCResidentsSign = liveinNYCSign === "no" ? "block" : "none";
  const [loggedUser, setLoggedUser] = useState(null);

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 19;

  const [tooltipDisplay, setToolTipDisplay] = useState("none");



  const progressPercentage = (currentStep / totalSteps) * 100;


  useEffect(() => {

    if (loggedUser === null) {
      checkCurrentUser()
    };

    /** localStorage stated updates */
    // const savedFormData = JSON.parse(localStorage.getItem("formData"));
    // if (savedFormData) {
    //   setFormData(savedFormData)
    // };

    // const savedDisplayKeyWord = JSON.parse(localStorage.getItem("displayKeyWord"));
    // if (savedDisplayKeyWord) {
    //   console.log('savedDisplayKeyWord', savedDisplayKeyWord)
    //   setDisplayKeyWord(savedDisplayKeyWord)
    // }

    // const savedNeighborhood = JSON.parse(localStorage.getItem("neighborhood") );
    // if (savedNeighborhood){
    //   setNeighborhood(savedNeighborhood);
    // }

    // const savedLiveinNYC = JSON.parse(localStorage.getItem("liveinNYC"));
    // if (savedLiveinNYC){
    //   setLiveinNYC("yes");
    // }
    /** ------------------------------ */

  }, []);

  /** useEffects that will be used for localStorage: */
  // useEffect(() => {
  //   localStorage.setItem("formData", JSON.stringify(formData))
  // }, [formData]);

  // useEffect(() => {
  //   console.log('displayKeyWord', displayKeyWord)
  //   localStorage.setItem("displayKeyWord", JSON.stringify(displayKeyWord))
  // }, [displayKeyWord]);

  // useEffect(() => {
  //   localStorage.setItem("neighborhood", JSON.stringify(neighborhood))
  // }, [neighborhood]);
  /** ----------------------------------------------- */


  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // This function navigates back to the previous path
  };

  // a request to check the currently logged in user needs to be made:
  const checkCurrentUser = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/currentuser`, { withCredentials: true });
      setLoggedUser(response.data)
    } catch (error) {
    }
  }


  //  function that makes request to save the form data:
  async function sendFormData() {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/neighborhood/savedata`, formData);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  //  function that will be called if there is a logged in user and will update the formsResponded - residentId - userImagesId values 
  async function updateUser(dataToUpdate, id) {
    await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/updateuserdata/${id}`, dataToUpdate);
    navigate(`/neighborhood/${dataToUpdate.neighborhoodId[0]}`);
  }

  // function that will save the new user's data if they had not registered before
  const registerNewUser = async (data) => {
    /**
     * data: 
     * name:'',
     * email:'',
     * neighborhoodId:'',
     * formsResponded:1, 
     * userImagesId:''
     */

    // request to save new user's data:
    // make try catch block here to handle possible error of email alredy being registered.
    // request to update the neighborhood's data with the new user data:
    try {
      // this request saves a new user. If the user did not send his email or name. Those fields will be SAVED AS EMPTY STRINGS.
      const newuser = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/signup`,
        data);
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/updateneighborhood/${neighborhoodId}`, { user: { id: newuser.data.id, name: newuser.data.name, email: newuser.data.email } });

      await updateCurrentUser(newuser.data);
      navigate(`/neighborhood/${neighborhoodId}`);
      return;
    } catch (error) {
      console.log('errrrr', error);
    }
  }

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
    const tooltip = currentDiv.querySelector(".tooltip_");

    if (direction === "next") {

      if (currentDiv) {

        // check if the user has not responded a question that required to be responded:
        if (currentDiv.className.indexOf("shakieCheck") > -1) {

          if (currentDiv.className.indexOf("nhoodAdjectivesFlag") > -1) {
            const adjsContainer = currentDiv.querySelector(".adjsNhoodContainer") || currentDiv.querySelector(".adjsResContainer");
            if (!adjsContainer) {
              tooltip.style.display = "inline-block";
              return;
            };
          }

          // check if the current question is the neighborhood question
          if (currentDiv.className.indexOf("neighborhoodInput") > -1) {
            //select the borough input 
            const allInputs = currentDiv.querySelectorAll("input, textarea, select");
            // check that both the neighborhood and the borough inputs have values
            if (allInputs[0].value === '' || allInputs[1].value === '') {
              tooltip.style.display = "inline-block";
              return;
            }
          }

          const userInput = currentDiv.querySelector("input, textarea, select");

          if (userInput) {

            if (userInput.value === '' && userInput.name !== 'nhoodImages' && userInput.className !== "foodTypeInput") {
              tooltip.style.display = "inline-block";
              return;
            }
            else if (userInput.className.indexOf("statementResponseContainerInput") > -1) {
              const inputs = currentDiv.querySelectorAll("input");
              let isInputChecked = false;
              for (let i = 0; i < inputs.length - 1; i++) {
                if (inputs[i].checked) {
                  isInputChecked = true;
                  break;
                }
              }

              if (!isInputChecked) {

                tooltip.style.display = "inline-block";
                return;

              }
            }
          };

        } else if (
          currentDiv.className.indexOf("neighborhoodEvaluationFlag") > -1 ||
          currentDiv.className.indexOf("agreeOrDisagreeFoodQuestions") > -1 ||
          currentDiv.className.indexOf("nightlifeQuestions") > -1
        ) {

          const inputs = currentDiv.querySelectorAll("input");
          let hasValue = false;
          for (let i = 0; i < inputs.length; i++) {
            if (inputs[i].checked) {
              hasValue = true;
              break;
            }
          }
          if (!hasValue) {
            tooltip.style.display = "inline-block";
            return;
          }
        }

        // Check if we are about to show the food questions, so that we can change the display value of the header that annouces the upcoming food questions:
        if (currentDiv.className.indexOf("stereotypicalResident") > -1) {
          setTimeout(() => {
            letsTalkAboutFoodRef.current.style.display = "none";
          }, 2000);
        };

        // Check if we are about to show the night life questions, so that we can change the display value of the header that annouces the upcoming night life questions questions:
        if (currentDiv.className.indexOf("agreeOrDisagreeFoodQuestions") > -1) {
          setTimeout(() => {
            letsTalkAboutNightLifeRef.current.style.display = "none";
          }, 2000);
        };

        // Check if we are about to show the  general information questions, so that we can change the display value of the header that annouces the upcoming general information questions questions:
        if (currentDiv.className.indexOf("pickOneNightLifePlace") > -1) {
          setTimeout(() => {
            letsTalkAboutGeneralInfo.current.style.display = "none";
          }, 2000);
        };


        // This if statement sets the value the state "neighborhood", when the "next" arrow is clicked on the neighborhood input.
        if (currentDiv.className.indexOf("neighborhoodInput") > -1) {
          setNeighborhood(currentDiv.children[1].children[0].value);
        }

        // this block will check if there are inputs in the night life recommeded places 
        if (currentDiv.className.indexOf("nightLifeRecommendedPlaces") > -1) {
          const placeName = nightLifeRecommendationsRef.current.placeName.value;
          const placeDescription = nightLifeRecommendationsRef.current.placeDescription.value;

          if (placeName === "" && placeDescription === "") {
            return;
          }
          setFormData((prevFormData) => ({
            ...prevFormData,
            nightLifeRecommendations: [
              ...prevFormData.nightLifeRecommendations,
              {
                assessment: nightLifeRecommendationsRef.current.placeName.value,
                explanation: nightLifeRecommendationsRef.current.placeDescription.value,
              },
            ],
          }));
        }


        // The following if statement will check if the user has clicked the last question
        if (activeIndex === 19) {

          // make request to save the images:
          const imagesUrls = [];
          const randomUUID = uuidv4();
          setUserUUID(randomUUID);

          // get url images from aws s3:
          if (formData.neighborhoodImages.length > 0) {

            setIsLoading(true);

            for (var i = 0; i < formData.neighborhoodImages.length; i++) {
              const imageFile = formData.neighborhoodImages[i];
              const imageType = imageFile.type.split('/')[1];

              /** 
              * In this request we will send a random UUID which will be used to 
              * relate users to the images that they upload. 
              */
              const imageUploadConfig = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/neighborhood/imageupload/${neighborhood}/${randomUUID}/${imageType}`);

              imagesUrls.push({
                image: imageUploadConfig.data.key,
                description: ""
              });

              await axios.put(imageUploadConfig.data.url, imageFile, {
                headers: {
                  "Content-Type": 'image/jpeg',
                },
              });
            }
          };

          // store the images in the formData state:
          formData.neighborhoodImages = imagesUrls;

          // make request to save form data:
          const formDataResponse = await sendFormData();

          // update the neighborhoodDataId state. This state will be used to update the neighborhood data when a new user is registered:
          setNeighborhoodId(formDataResponse.insertedId);

          // if there is a logged in user, make a request to udpate the user
          if (loggedUser) {
            // request to update the user:
            await updateUser({
              formsResponded: 1,
              neighborhoodId: [formDataResponse.insertedId],
              userImagesId: randomUUID
            }, loggedUser.id);
            return;
          };

          // this state needs to be updated to save a new user in the database:
          setNewUserData(prevData => ({
            ...prevData,
            "neighborhoodId": [formDataResponse.insertedId],
            "userImagesId": randomUUID
          }));

          keyWord = "personalInfo";
          setIsLoading(false);
          let nextIndex = activeIndex + 1;
          setActiveIndex(nextIndex);
          setDisplayKeyWord([keyWord]);

          return;

        };

        setCurrentStep(currentStep + 1)

        // check if we are on the questiont that asks users for their data, and if so update the userData state.
        keyWord = currentDiv.className.split(" ")[1];
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

      setCurrentStep(currentStep - 1);
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
  };

  // This event handler will be trigered when the user is responding the question about how they would describe the night life of their neighborhood 
  const nightLifeDescriptionHandler = () => {
    nightLifeExplanationRef.current.style.display = 'flex'
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
      <Alert show={showUserDataAlert} variant="primary" className='userDataAlert'>
        <Alert.Heading>Alert</Alert.Heading>
        <p>
          When sending anonymous responses, editing or deleting your responses will not be possible.
        </p>
        <hr />
        <div className="d-flex" style={{ flexDirection: "column", alignItems: "center" }}>
          <Button style={{ width: "80%", marginBottom: "3px" }} variant="success" onClick={() => setShowUserDataAlert(false)}>Go back</Button>
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

  // function that will validate email format:
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  // The following function will make the request to save the user user in the database:
  const submitNewUserData = (event) => {

    event.preventDefault();
    // const emailValid = validateEmail(newUserData.email);
    // if (!emailValid) {
    //   // if the email is not valid, then show a pop that will alert the user that they are about to send the data without credentials:
    //   setShowUserDataAlert(true);
    // };

    // make request to save user
    registerNewUser(newUserData);
  };

  // The following functions will filter the neighborhoods when the user is responding what neighborhood they live in:
  const neighborhoodsArray = [];
  const displayNhoodsContainer = neighborhoods.length === 0 ? "none" : "flex";
  const selectNeighborhoods = (e) => {
    const val = e.target.value;
    setNeighborhoods([]);
    if (val.length > 2) {
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

  // THIS FUNCTION WILL BE ACTIVATED EVERY TIME ANY OF THE OPTION BUTTONS IN THE FORM ARE CLICKED.
  // IT WILL UPATE THE FORM WITH THE RESPECTIVE VALUE.

  const handleOptionSelect = (option, description, event) => {

    if (description === "nhood") {
      // if (selectedOptions.length < 5) {
      let updatedOptions
      event.target.style.backgroundColor = "#EBEBE4";
      if (!selectedOptions.includes(option)) {
        setSelectedOptions(prevOptions => {
          updatedOptions = [...prevOptions, option];
          setFormData(formData => ({ ...formData, neighborhoodAdjectives: updatedOptions }));
          return updatedOptions;
        });
      }
      setFormData(formData => ({ ...formData, neighborhoodAdjectives: updatedOptions }));

      if (nehoodAdjectivesDivContainerDisplay.current) {
        setTimeout(() => {
          nehoodAdjectivesDivContainerDisplay.current.scrollTop = nehoodAdjectivesDivContainerDisplay.current.scrollHeight;
        }, 0);
      }


      // }
    } else if (description === "resident") {

      // if (residentsAdjsSelectedOpts.length < 5) {
      let updatedOptions;
      event.target.style.backgroundColor = "#EBEBE4";
      if (!residentsAdjsSelectedOpts.includes(option)) {
        setResidentsAdjsSelectedOpts(prevOptions => {
          updatedOptions = [...prevOptions, option];
          setFormData(formData => ({ ...formData, residentAdjectives: updatedOptions }));
          return updatedOptions;
        })
      }
      setFormData(formData => ({ ...formData, residentAdjectives: updatedOptions }));

      if (residentAdjectivesDivContainer.current) {
        setTimeout(() => {
          residentAdjectivesDivContainer.current.scrollTop = residentAdjectivesDivContainer.current.scrollHeight
        }, 0);
      }


      // }
    } else if (description === "foodType") {

      if (foodTypesSelectedOpts.length < 5) {

        let updatedOptions;

        if (event) {
          event.target.style.backgroundColor = "#EBEBE4";
        }

        const containsSpecificWord = foodTypesSelectedOpts.some((obj) => obj.assessment.includes(option));

        if (!containsSpecificWord) {

          setFoodTypesSelectedOpts(prevOptions => {
            updatedOptions = [...prevOptions, { "assessment": option }];
            return updatedOptions;
          })

          setFormData(prevFormData => {
            return {
              ...prevFormData,
              recommendedFoodTypes: [
                ...prevFormData.recommendedFoodTypes,
                { assessment: option }
              ]
            };
          });
        }
      }

      const favTypesOfFoodDiv = favTypesOfFoodRef.current;
      if (favTypesOfFoodDiv) {
        setTimeout(() => {
          favTypesOfFoodDiv.scrollTop = favTypesOfFoodDiv.scrollHeight;
        }, 0);
      }

    }
  };

  const handleOptionRemove = (option, description) => {
    if (description === "neighborhood") {
      const advjectivesListDivs = [...nehoodAdjectivesDivRef.current.children];
      for (let i = 0; i < advjectivesListDivs.length; i++) {

        if (advjectivesListDivs[i].dataset.option === option) {
          advjectivesListDivs[i].style.backgroundColor = "rgb(137, 207, 240)";
        }
      }
      const updatedOptions = selectedOptions.filter((item) => item !== option);
      setSelectedOptions(prevOptions => {
        setFormData(formData => ({ ...formData, neighborhoodAdjectives: updatedOptions }));
        return updatedOptions;
      });
      setFormData(formData => ({ ...formData, neighborhoodAdjectives: updatedOptions }));
    } else if (description === "resident") {

      const advjectivesListDivs = [...residentAdjectivesDivRef.current.children];
      for (let i = 0; i < advjectivesListDivs.length; i++) {
        if (advjectivesListDivs[i].dataset.option === option) {
          advjectivesListDivs[i].style.backgroundColor = "rgb(137, 207, 240)";
        }
      }
      const updatedOptions = residentsAdjsSelectedOpts.filter((item) => item !== option);
      setResidentsAdjsSelectedOpts(prevOptions => {
        setFormData(formData => ({ ...formData, residentAdjectives: updatedOptions }));
        return updatedOptions
      })
      setFormData(formData => ({ ...formData, residentAdjectives: updatedOptions }));
    } else if (description === "foodTypes") {


      const advjectivesListDivs = [...typesOfFoodRecommendationsRef.current.children];
      for (let i = 0; i < advjectivesListDivs.length; i++) {
        if (advjectivesListDivs[i].dataset.option === option) {
          advjectivesListDivs[i].style.backgroundColor = "rgb(137, 207, 240)";
        }
      }

      const updatedOptions = formData.recommendedFoodTypes.filter((item) => item.assessment !== option);
      setFoodTypesSelectedOpts(updatedOptions);

      // update formData with updatedOptions 
      setFormData(formData => ({ ...formData, recommendedFoodTypes: updatedOptions }));

      return updatedOptions;

    }
  };

  // this function will be triggered when the user is adding restaurants to the recommended food types:
  const handleRecommendedRestaurant = (value, index) => {

    setFormData((prevFormData) => {
      // Map over the recommendedFoodTypes to create a new array
      const updatedFoodTypes = prevFormData.recommendedFoodTypes.map((item, idx) => {
        // Update the item at the specific index with the new value
        if (idx === index) {
          return { ...item, explanation: value };
        }
        // Return the item as is for other indices
        return item;
      });

      // Return the new state object with the updated recommendedFoodTypes
      return {
        ...prevFormData,
        recommendedFoodTypes: updatedFoodTypes,
      };
    });



  };

  const handleInputChange = (value) => {
    setFoodTypesInput(value);
  };

  const handleAddButton = (e) => {
    e.preventDefault();
    if (foodTypesInput.trim() !== "") {
      handleOptionSelect(foodTypesInput, "foodType", null)
    }
    setFoodTypesInput("");
  };

  const changeTooltipDisplay = (e, value) => {

    let tooltip = e.target.nextElementSibling;

    if (tooltip.className.indexOf("tooltip_") === -1) {
      const parent = e.target.parentElement;
      tooltip = parent.nextElementSibling;
    }

    if (!tooltip || tooltip.className.indexOf("tooltip_") === -1) {
      const parent = e.target.parentElement;
      const grandpa = parent.parentElement;
      const grandpagranpa = grandpa.parentElement;
      tooltip = grandpagranpa.nextElementSibling;
    }

    // If tooltip is undefined, select the nextElementSibling of the parent element
    if (!tooltip || tooltip.className.indexOf("tooltip_") === -1) {
      const parent = e.target.parentElement;
      const grandpa = parent.parentElement;
      tooltip = grandpa.nextElementSibling;
    }


    if (tooltip && tooltip.classList.contains('tooltip_')) {
      tooltip.style.display = value;
    }

  }

  // this function will add new rows when the user wants to recommend more places
  //  NOT SURE THIS FUNCTION IS DOING ANYTHING OTHER THAN ADDING NEW ROWS 
  const addNewPlace = (list) => {

    const items = {
      name: "",
      description: "",
    };

    addLastPlace = true;

    if (list === "food") {

      const placeName = foodRecommendationsRef.current.placeName.value;
      const placeAddress = foodRecommendationsRef.current.placeAddress.value;
      const placeDescription = foodRecommendationsRef.current.placeDescription.value;
      const placeImage = foodRecommendationsRef.current.placeImage.files[0];


      // If none of the input elements has a value:

      if (placeName === "" && placeAddress === "" && placeDescription === "" && placeImage === undefined) {
        return;
      }

      // IS THIS EVEN DOING ANYTHING?
      if (addPlaceFromForm) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          foodRecommendations: [
            ...prevFormData.foodRecommendations,
            {
              place: foodRecommendationsRef.current.placeName.value,
              directions: foodRecommendationsRef.current.placeAddress.value,
              description:
                foodRecommendationsRef.current.placeDescription.value,
              image: foodRecommendationsRef.current.placeImage.files[0],
            },
          ],
        }));
      }

      // ADD ANOTHER CHECK HERE TO MAKE SURE THAT THE STATE IS ONLY UPDATED WHEN THERE ARE VALUES TYPED

      setRows([...rows, items]);

      // IS THIS EVEN DOING ANYTHING?
      addPlaceFromForm = true; // needs to be set to true because it was set to false when the next question was clicked.

    } else if (list === "nightLife") {

      const placeName = nightLifeRecommendationsRef.current.placeName.value;
      const placeDescription = nightLifeRecommendationsRef.current.placeDescription.value;

      // If none of the input elements has a value:
      if (placeName === "" && placeDescription === "") {
        return;
      };


      // THIS WILL BE TRIGERED EVERY TIME THE USER CLICKS TO ADD A NEW NIGHTLIFE RECOMMENDATION 
      if (addPlaceFromFormNightLife) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          nightLifeRecommendations: [
            ...prevFormData.nightLifeRecommendations,
            {
              assessment: nightLifeRecommendationsRef.current.placeName.value,
              explanation: nightLifeRecommendationsRef.current.placeDescription.value,
            },
          ],
        }));
      };

      setNighLifeRows([...nighLifeRows, items]);//this state is being used just for adeeing new rows to the table.

      // IS THIS EVEN DOING ANYTHING?
      addPlaceFromFormNightLife = true;

    }
  };

  return (
    <div className="mainContainer">

      {isLoading ? (

        <Button style={{ margin: "30px" }} variant="primary" disabled>
          <Spinner
            as="span"
            animation="grow"
            size="sm"
            role="status"
            aria-hidden="true"
            style={{ marginRight: "10px" }}
          />
          Saving data...
        </Button>

      ) : (
        <div>
          <div
            style={{ display: onlyNYCResidentsSign }}
            className="onlyNYCResident"
          >
            <Alert style={{ textAlign: "center", marginTop: "15px" }} variant="danger">
              This form is only for New York City Residents
            </Alert>
          </div>

          <div style={{ position: "absolute", top: "10px", right: "10px" }} onClick={handleGoBack}>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-x" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
            </svg>
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
                "liveInNY yearsInNeighborhood neighborhoodInput  " +
                displayQuestion("neighborhood") +
                " " +
                shakie
              }
              ref={ref => divRefs.current[1] = ref}
            >

              <label htmlFor="neighborhood">
                What <span className="questionHighlight">neighborhood</span> do you live in?
              </label>
              <div>
                <input
                  value={formData.neighborhood}
                  onChange={(e) => {
                    setFormData({ ...formData, neighborhood: e.target.value });
                    localStorage.setItem("neighborhood", JSON.stringify(e.target.value))
                    selectNeighborhoods(e);
                    changeTooltipDisplay(e, "none");
                  }}
                  onKeyDown={(e) => {
                    highlightNhoods(e);
                  }}
                  name="neighborhood"
                  id="neighborhood"
                  placeholder="Type your neighborhood"
                  className={"neighborhoodInputElement inputCheck"}
                  ref={neighborhoodInput}

                ></input>
                <select
                  id="borough"
                  onChange={(e) => {
                    setFormData({ ...formData, borough: e.target.value });

                  }}
                  style={{ width: '100%' }}
                  className={"selectOptions inputCheck"} // Add your CSS classes as needed
                >
                  <option value="">Select Borough</option>
                  <option value="Brooklyn">Brooklyn</option>
                  <option value="Manhattan">Manhattan</option>
                  <option value="Queens">Queens</option>
                  <option value="Bronx">The Bronx</option>
                  <option value="Staten Island">Staten Island</option>
                </select>

              </div>


              <div className="tooltip_">This information is relevant </div>


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

            {/** How long have you been living in you neighborhood? */}
            <div
              className={
                "neighborhood nhoodAdjectives lengthLivingInHood " +
                displayQuestion("yearsInNeighborhood") +
                " " +
                shakie
              }
              ref={ref => divRefs.current[2] = ref}
            >
              <label>
                How long have you been living in{" "}
                <span className="questionHighlight nhoodName">{neighborhood}</span>
              </label>
              <select
                name="time_linving_in_nhood"
                id="yearsInNeighborhood"
                className="selectOptions inputCheck"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    timeLivingInNeighborhood: e.target.value,
                  });
                  changeTooltipDisplay(e, "none");
                }}
              >
                <option value="">Choose an option</option>
                <option value="Less than one year">Less than one year</option>
                <option value="Between 1 and 5 years">
                  Between 1 and 5 years
                </option>
                <option value="Between 6 and 10 years">
                  Between 6 and 10 years
                </option>
                <option value="Between 11 and 15 years">
                  Between 11 and 15 years
                </option>
                <option value="Between 16 and 20 years">
                  Between 16 and 20 years
                </option>
                <option value="For more than 20 years">
                  For more than 20 years
                </option>
                <option value="I do not live in this neighborhood">
                  I do not live in this neighborhood
                </option>
              </select>

              <div className="tooltip_">This information is relevant </div>

            </div>

            {/**  THE NEIGHBORHOOD */}
            {/** Adjectives to describe the neighborhood */}
            <div
              className={
                "yearsInNeighborhood completeSentence1 nhoodAdjectivesFlag " +
                displayQuestion("nhoodAdjectives") +
                " " +
                shakie
              }
              ref={ref => divRefs.current[3] = ref}
            >
              <label>
                What <span className="questionHighlight"> adjectives</span> describe
                <span style={{ textDecoration: "underline" }} className="nhoodName"> {neighborhood}: </span>
              </label>
              {selectedOptions.length > 0 && (
                <div ref={nehoodAdjectivesDivContainerDisplay} className="scrollbarContainer adjsNhoodContainer" style={{ display: 'flex', alignItems: 'center', margin: '10px', border: '1px solid #c9c9c9', padding: '5px', flexWrap: 'wrap', justifyContent: "space-evenly", height: "100px", overflow: "scroll" }}>
                  {selectedOptions.map((option, index) => (
                    <div style={{ margin: '6px', cursor: 'pointer', border: '1px solid black', borderRadius: '10px', padding: '5px', backgroundColor: '#89cFF0', display: 'flex' }} key={option} >
                      {option}
                      <div
                        onClick={(e) => {
                          handleOptionRemove(option, "neighborhood");
                        }}
                        style={{
                          marginLeft: '5px',
                          cursor: 'pointer',
                          width: '16px', // Adjust the width to make the SVG smaller
                          height: '16px', // Adjust the height to make the SVG smaller
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="scrollbarContainer" style={{ height: "150px", overflow: "scroll", marginTop: "20px", border: "1px solid rgb(201, 201, 201" }}>

                <div ref={nehoodAdjectivesDivRef}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    justifyContent: 'center',

                  }} >

                  {/** Type your own adjective */}
                  <div style={{
                    display: "flex",
                    border: "1px solid #dcd7d7",
                    padding: "5px",
                    marginTop: "15px",
                    margin: '10px',
                    borderRadius: '15px',
                    justifyContent: 'center'
                  }} >
                    {/* Input field for user to type an option */}
                    <input
                      className="foodTypeInput"
                      type="text"
                      placeholder="Type your own"
                      onChange={(e) => {
                        setNhoodAjective(e.target.value);
                        changeTooltipDisplay(e, "none");
                      }}
                      value={nhoodAdjective}
                      style={{ margin: "4px", padding: "5px", borderRadius: "10px", border: "1px solid black" }}

                    />
                    <button onClick={(e) => {
                      e.preventDefault();
                      handleOptionSelect(nhoodAdjective, 'nhood', e);
                      setNhoodAjective('')
                    }} className="addButton">
                      Add
                    </button>
                  </div>

                  {/** Adjectives: */}
                  <div onClick={(e) => {
                    handleOptionSelect('Vibrant', 'nhood', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Vibrant"
                  >
                    Vibrant
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Tranquil', 'nhood', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Tranquil"
                  >
                    Tranquil
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Safe', 'nhood', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Safe"
                  >
                    Safe
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Cosmopolitan', 'nhood', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Cosmopolitan"
                  >
                    Cosmopolitan
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Picturesque', 'nhood', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Picturesque"
                  >
                    Picturesque
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Historic', 'nhood', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Historic"
                  >
                    Historic
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Lively', 'nhood', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Lively"
                  >
                    Lively
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Charming', 'nhood', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Charming"
                  >
                    Charming
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Diverse', 'nhood', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Diverse"
                  >
                    Diverse
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Peaceful', 'nhood', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Peaceful"
                  >
                    Peaceful
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Bustling', 'nhood', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Bustling"
                  >
                    Bustling
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Eclectic', 'nhood', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Eclectic"
                  >
                    Eclectic
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Welcoming', 'nhood', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Welcoming"
                  >
                    Welcoming
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Serene', 'nhood', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Serene"
                  >
                    Serene
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Quaint', 'nhood', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Quaint"
                  >
                    Quaint
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Thriving', 'nhood', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Thriving"
                  >
                    Thriving
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Family-oriented', 'nhood', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Family-oriented"
                  >
                    Family-oriented
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Trendy', 'nhood', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Trendy"
                  >
                    Trendy
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Gritty', 'nhood', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Gritty"
                  >
                    Gritty
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Up-and-coming', 'nhood', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Up-and-coming"
                  >
                    Up-and-coming
                  </div>



                </div>

              </div>


              <div className="tooltip_">Your opinion on this is important. </div>
            </div>

            {/**  “Complete the sentence:  ‘The most unique thing about {neighborhood} is ________”*/}
            <div className={"nhoodAdjectives completeSentence2 " +
              displayQuestion("completeSentence1") +
              " " +
              shakie}
              ref={ref => divRefs.current[4] = ref}
            >


              <div>
                The most unique thing about {neighborhood} is:
              </div>

              <input
                className="textInput"
                onChange={
                  (e) => {
                    setFormData({
                      ...formData,
                      mostUniqueThingAboutNeighborhood: e.target.value
                    })
                    changeTooltipDisplay(e, "none");
                  }

                }

                style={{ textTransform: "lowercase" }}

              ></input>
              <div className="tooltip_">This information is relevant </div>



            </div>

            {/**  “Complete the sentence:  ‘People should visit {neighborhood} if they want ________”*/}
            <div className={"completeSentence1 describeNeighborhood " +
              displayQuestion("completeSentence2") +
              " " +
              shakie}
              ref={ref => divRefs.current[5] = ref}
            >
              <div>
                People should visit {neighborhood} if they want:
              </div>

              <input
                className="textInput"
                onChange={
                  (e) => {
                    setFormData({
                      ...formData, peopleShouldVisitNeighborhoodIfTheyWant: e.target.value
                    })
                    changeTooltipDisplay(e, "none");
                  }
                }

                style={{ textTransform: "lowercase" }}

              ></input>
              <div className="tooltip_">This information is relevant </div>
            </div>

            {/** In general, how would you describe {neighborhood}? as a neighborhood */}
            <div
              className={
                "completeSentence2 residentAdjectives nhoodDescript " +
                displayQuestion("describeNeighborhood") +
                " " +
                shakie
              }
              ref={ref => divRefs.current[6] = ref}
            >
              <label>
                How would you describe
                <span className="questionHighlight nhoodName">{neighborhood}</span> to someone who has never visited before?
              </label>
              <textarea
                className="textarea_text"
                name="neighborhood_description"
                id="nhoodDescription"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    neighborhoodDescription: e.target.value,
                  });
                  changeTooltipDisplay(e, "none");
                }}

                style={{ textTransform: "lowercase" }}

                placeholder="Write freely here"
              ></textarea>

              <div className="tooltip_"> Your opinion on this is important. </div>
            </div>

            {/**  THE RESIDENTS */}
            {/** Adjectives to describe the typical resident of the neighborhood */}
            <div
              className={
                "describeNeighborhood mustTryFood nhoodAdjectivesFlag stereotypicalResident " +
                displayQuestion("residentAdjectives") +
                " " +
                shakie
              }
              ref={ref => divRefs.current[7] = ref}
            >

              <label>
                <span className="questionHighlight">Adjectives that depict the typical resident</span> of
                <span className="nhoodName"> {neighborhood}: </span>
              </label>

              {residentsAdjsSelectedOpts.length > 0 && (
                <div ref={residentAdjectivesDivContainer} className="scrollbarContainer adjsResContainer" style={{ display: 'flex', alignItems: 'center', margin: '10px', border: '1px solid #c9c9c9', padding: '5px', flexWrap: 'wrap', justifyContent: "space-evenly", height: "100px", overflow: "scroll" }}>
                  {residentsAdjsSelectedOpts.map((option, index) => (
                    <div style={{ margin: '6px', cursor: 'pointer', border: '1px solid black', borderRadius: '10px', padding: '5px', backgroundColor: '#89cFF0', display: 'flex' }} key={option} >
                      {option}
                      <div
                        onClick={(e) => {
                          handleOptionRemove(option, "resident");
                        }}
                        style={{
                          marginLeft: '5px',
                          cursor: 'pointer',
                          width: '16px', // Adjust the width to make the SVG smaller
                          height: '16px', // Adjust the height to make the SVG smaller
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="scrollbarContainer" style={{ height: "200px", overflow: "scroll", marginTop: "20px", border: "1px solid #c9c9c9" }}>

                <div ref={residentAdjectivesDivRef}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                  }} >

                  {/** Type your own adjective */}
                  <div style={{
                    display: "flex",
                    border: "1px solid #dcd7d7",
                    padding: "5px",
                    marginTop: "15px",
                    margin: '10px',
                    borderRadius: '15px',
                    justifyContent: 'center'
                  }} >
                    {/* Input field for user to type an option */}
                    <input
                      className="foodTypeInput"
                      type="text"
                      placeholder="Type your own"
                      onChange={(e) => {
                        setResidentAdjective(e.target.value);
                        changeTooltipDisplay(e, "none");
                      }}
                      value={residentAdjective}
                      style={{ margin: "4px", padding: "5px", borderRadius: "10px", border: "1px solid black" }}
                    />
                    <button onClick={(e) => {
                      e.preventDefault();
                      handleOptionSelect(residentAdjective, 'resident', e);
                      setResidentAdjective('')
                    }} className="addButton">
                      Add
                    </button>
                  </div>

                  <div onClick={(e) => {
                    handleOptionSelect('Friendly', 'resident', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Friendly"
                  >
                    Friendly
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Welcoming', 'resident', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Welcoming"
                  >
                    Welcoming
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Harmonious', 'resident', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Harmonious"
                  >
                    Harmonious
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Inclusive', 'resident', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Inclusive"
                  >
                    Inclusive
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Active', 'resident', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Active"
                  >
                    Active
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Caring', 'resident', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Caring"
                  >
                    Caring
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Hospitable', 'resident', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Hospitable"
                  >
                    Hospitable
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Collaborative', 'resident', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Collaborative"
                  >
                    Collaborative
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Supportive', 'resident', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Supportive"
                  >
                    Supportive
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Community-oriented', 'resident', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Community-oriented"
                  >
                    Community-oriented
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Lively', 'resident', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Lively"
                  >
                    Lively
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Neighborly', 'resident', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Neighborly"
                  >
                    Neighborly
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Respectful', 'resident', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Respectful"
                  >
                    Respectful
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Progressive', 'resident', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Progressive"
                  >
                    Progressive
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Traditional', 'resident', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Traditional"
                  >
                    Traditional
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('United', 'resident', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="United"
                  >
                    United
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Empowered', 'resident', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Empowered"
                  >
                    Empowered
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Empathetic', 'resident', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Empathetic"
                  >
                    Empathetic
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Cohesive', 'resident', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Cohesive"
                  >
                    Cohesive
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Involved', 'resident', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Involved"
                  >
                    Involved
                  </div>

                </div>
              </div>

              <div className="tooltip_">Your opinion on this is important. </div>

            </div>

            {/** In general, the typical reisdent of __ can be described as: "____" */}

            {/** THE FOOD */}
            {/** What are the must-try foods in your neighborhood?*/}
            <div
              className={
                "residentAdjectives oncePlaceToEat nhoodAdjectivesFlag foodRecommendtions foodQuestion mustTryFoods " +
                displayQuestion("mustTryFood") +
                " " +
                shakie
              }
              ref={ref => divRefs.current[8] = ref}
            >

              <div className="introHeader" ref={letsTalkAboutFoodRef}>
                <h4> Let's talk about food </h4>
                <img alt="food" src="https://raw.githubusercontent.com/diegoleonardoro/multi-k8s/main/food.png" height="100px"></img>
              </div>

              <label>
                What food and restaurants should people try in <span className="nhoodName"> {neighborhood}? </span>
              </label>

              <div className="scrollbarContainer" style={{ height: "150px", overflow: "scroll", marginTop: "20px", border: "1px solid #d5d5d5" }}>

                <div ref={typesOfFoodRecommendationsRef}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                  }} >

                  <div onClick={(e) => {
                    handleOptionSelect('Italian', 'foodType', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Italian"
                  >
                    Italian
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Mexican', 'foodType', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Mexican"
                  >
                    Mexican
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Chinese', 'foodType', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Chinese"
                  >
                    Chinese
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Indian', 'foodType', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Indian"
                  >
                    Indian
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Japanese', 'foodType', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Japanese"
                  >
                    Japanese
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Mediterranean', 'foodType', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Mediterranean"
                  >
                    Mediterranean
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Thai', 'foodType', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Thai"
                  >
                    Thai
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('French', 'foodType', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="French"
                  >
                    French
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('American', 'foodType', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="American"
                  >
                    American
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Middle Eastern', 'foodType', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Middle Eastern"
                  >
                    Middle Eastern
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Greek', 'foodType', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Greek"
                  >
                    Greek
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Vietnamese', 'foodType', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Vietnamese"
                  >
                    Vietnamese
                  </div>
                  <div onClick={(e) => {
                    handleOptionSelect('Korean', 'foodType', e);
                    changeTooltipDisplay(e, "none");
                  }}
                    style={{
                      margin: "4px",
                      cursor: "pointer",
                      border: "1px solid black",
                      borderRadius: "10px",
                      padding: "5px",
                      backgroundColor: "rgb(137, 207, 240)",
                      display: "flex"
                    }}
                    data-option="Korean"
                  >
                    Korean
                  </div>


                  <div style={{ display: "flex", border: "1px solid #dcd7d7", padding: "5px", marginTop: "10px" }} onChange={(e) => {
                    changeTooltipDisplay(e, "none");
                  }} >
                    {/* Input field for user to type an option */}
                    <input
                      className="foodTypeInput"
                      type="text"
                      placeholder="Type another option..."
                      onChange={(e) => handleInputChange(e.target.value)}
                      value={foodTypesInput}
                      style={{ margin: "4px", padding: "5px", borderRadius: "10px", border: "1px solid black" }}
                    />
                    {/* Button to add the typed option */}
                    <button className="addButton" onClick={handleAddButton}>
                      Add
                    </button>

                  </div>


                </div>
              </div>

              <div className="tooltip_">Your opinion on this is important. </div>

              {foodTypesSelectedOpts.length > 0 && (
                <div ref={favTypesOfFoodRef} className="scrollbarContainer adjsResContainer" style={{
                  display: 'flex', alignItems: 'center', margin: '10px', padding: '5px', flexWrap: 'wrap', justifyContent: "space-evenly", height: "120px", overflow: "scroll",
                  border: "1px solid grey"
                }}>
                  {foodTypesSelectedOpts.map((option, index) => (

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #d5d5d5", padding: "5px", width: "100%", marginTop: "5px" }} key={option.assessment}>

                      {/* <div ref={(e) => { foodRecommendationsRef.current['explanation'] = e }} style={{ margin: '6px', cursor: 'pointer', border: '1px solid black', borderRadius: '10px', padding: '5px', backgroundColor: '#89cFF0', display: 'flex', height: "40px", alignItems: "center", width: "50%", justifyContent: "center" }}  >
                    {option.assessment}
                    <div
                      onClick={(e) => {
                        handleOptionRemove(option.assessment, "foodTypes");
                      }}
                      style={{
                        marginLeft: '5px',
                        cursor: 'pointer',
                        width: '16px', // Adjust the width to make the SVG smaller
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </div>
                  </div> */}


                      <div style={{ display: "flex" }}>
                        <div
                          onClick={(e) => {
                            handleOptionRemove(option.assessment, "foodTypes");
                          }}
                          style={{
                            marginLeft: '5px',
                            marginRight: '5px',
                            cursor: 'pointer',
                            width: '16px', // Adjust the width to make the SVG smaller
                            height: '20px'
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" height="20" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </div>

                        <label className="labelFavFoods" style={{ textAlign: "start" }} htmlFor={"foodTypePlaceRecommendation " + index}>
                          <span className="questionHighlight">Best {option.assessment} restaurant</span> in {neighborhood}:
                          <input
                            id={"foodTypePlaceRecommendation " + index}
                            className="foodTypeInput"
                            type="text"
                            onChange={(e) => handleRecommendedRestaurant(e.target.value, index)}
                          />
                        </label>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>

            {/** Complete the sentence: "If I were to suggest one place to eat in {neighborhood} it would be____
           because _____________" 
           */}
            <div
              className={"mustTryFood foodPrice " +
                displayQuestion("oncePlaceToEat") +
                " " +
                shakie}
              ref={ref => divRefs.current[9] = ref}
            >
              <div style={{ display: "fex", alignItems: "center", width: "100%", position: "relative" }}>
                <div style={{ display: "fex", alignItems: "center", lineHeight: "35px" }}>
                  <p style={{ display: "inline" }}>If you were to suggest <span className="questionHighlight">one place to eat</span> in {neighborhood} it would be </p>
                  <input style={{ width: "35%" }}
                    className="completeSentenceInput"
                    onChange={
                      (e) => {
                        setFormData({
                          ...formData,
                          onePlaceToEat: {
                            ...formData.onePlaceToEat,
                            assessment: e.target.value
                          }
                        })
                        changeTooltipDisplay(e, "none");
                      }
                    }
                    placeholder="One word only"
                  >
                  </input>

                  <p style={{ display: "inline" }}> because</p>
                  <input style={{ width: "35%", textTransform: "lowercase" }}
                    className="completeSentenceInput"
                    onChange={
                      (e) => {
                        setFormData({
                          ...formData,
                          onePlaceToEat: {
                            ...formData.onePlaceToEat,
                            explanation: e.target.value
                          }
                        })
                      }}
                  ></input>
                </div>

              </div>
              <div style={{ marginTop: "30px" }} className="tooltip_">Your opinion on this is relevant </div>

            </div>

            {/**Food in {neighborhood} tends to be expensive, affordable or both */}
            <div className={"oncePlaceToEat agreeOrDisagreeFood foodPricesQuestion " +
              displayQuestion("foodPrice") +
              " " +
              shakie}
              ref={ref => divRefs.current[10] = ref}
            >

              <h3 style={{ marginBottom: '20px', fontWeight: 'bold' }}>Food in {neighborhood} tends to be: </h3>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <div className="statementResponseContainer">
                  <input
                    type="radio"
                    className="statementResponseContainerInput"
                    name="foodPrices"
                    value="Expensive"
                    id="foodPricesExpensive"
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        foodPrices: {
                          ...formData.foodPrices,
                          assessment: e.target.value
                        }
                      });
                      changeTooltipDisplay(e, "none");
                    }}
                  ></input>
                  <label
                    onClick={() => foodPricesExplanationHandler()}
                    htmlFor="foodPricesExpensive"
                    className="nhoodEvalLabelTrue"
                    style={{ fontWeight: "normal", width: "100%", height: "auto" }}
                  >
                    Expensive
                  </label>
                </div>

                <div className="statementResponseContainer">
                  <input
                    type="radio"
                    className="statementResponseContainerInput"
                    name="foodPrices"
                    value="Affordable"
                    id="foodPricesAffordable"
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        foodPrices: {
                          ...formData.foodPrices,
                          assessment: e.target.value
                        }
                      });
                      changeTooltipDisplay(e, "none");
                    }}
                  ></input>
                  <label
                    onClick={() => foodPricesExplanationHandler()}
                    htmlFor="foodPricesAffordable"
                    className="nhoodEvalLabelTrue"
                    style={{ fontWeight: "normal", width: "100%", height: "auto" }}
                  >
                    Affordable
                  </label>
                </div>

                <div className="statementResponseContainer">
                  <input
                    type="radio"
                    className="statementResponseContainerInput"
                    name="foodPrices"
                    value="Both expensive and affordable"
                    id="bothExpensiveAndAffordable"
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        foodPrices: {
                          ...formData.foodPrices,
                          assessment: e.target.value
                        }
                      });
                      changeTooltipDisplay(e, "none");
                    }}
                  ></input>
                  <label
                    onClick={() => foodPricesExplanationHandler()}
                    htmlFor="bothExpensiveAndAffordable"
                    className="nhoodEvalLabelUnsure"
                    style={{ fontWeight: "normal", width: "100%", height: "auto" }}
                  >
                    Both expensive and affordable
                  </label>
                </div>
              </div>

              <div className="tooltip_">Your opinion on this is relevant </div>

              <div
                ref={foodPriceExplanationRef}
                className="elaborateNhoodEval"
              >
                <div>Could you further elaborate?</div>
                <input
                  name="public_transport_explanation"
                  className="inputElaborateNhoodEval"
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      foodPrices: {
                        ...formData.foodPrices,
                        explanation: e.target.value
                      }
                    });
                  }}
                ></input>
              </div>
            </div>

            {/** Do you agree or disagree withe the following statements: 
           * "food in {neighborhood} is authentic"
          */}
            <div className={"foodPrice describeNighLife agreeOrDisagreeFoodQuestions " +
              displayQuestion("agreeOrDisagreeFood")}
              ref={ref => divRefs.current[11] = ref}
            >

              <h3 style={{ textAlign: "center", marginBottom: '10px', fontWeight: 'bold' }}>Agree or disagree: </h3>
              <div>
                <label style={{ fontWeight: "normal", left: "50%", transform: "translate(-50%, 0)", marginBottom: "30px", marginTop: "25px" }}>"{neighborhood} is a good destination to explore diverse and authentic food" </label>

                <div style={{ height: "30px", width: "100%", borderBottom: "1px dotted black" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div className="statementResponseContainer">
                      <input
                        type="radio"
                        className="statementResponseContainerInput"
                        name="diverseAndAuthenticFood"
                        value="diverse and authentic"
                        id="AgreeDestinationForNewFood"
                        onChange={
                          (e) => {
                            setFormData({
                              ...formData,
                              foodIsAuthentic: {
                                ...formData.foodIsAuthentic,
                                assessment: e.target.value
                              }
                            })
                            changeTooltipDisplay(e, "none");
                          }

                        }
                      ></input>
                      <label
                        onClick={() => foodAuthenticityandDiversityHandler()}
                        htmlFor="AgreeDestinationForNewFood"
                        className="nhoodEvalLabelTrue"
                        style={{ fontWeight: "normal", height: "auto", left: "-2px" }}
                      // className="nhoodEvalLabelTrue"
                      // style={{fontWeight:"normal", width:"100%", height:"auto"}}
                      >
                        Agree
                      </label>
                    </div>

                    <div className="statementResponseContainer">
                      <input
                        type="radio"
                        className="statementResponseContainerInput"
                        name="diverseAndAuthenticFood"
                        value="not diverse and not very authentic"
                        id="DisagreeDestinationForNewFood"
                        onChange={
                          (e) => {
                            setFormData({
                              ...formData,
                              foodIsAuthentic: {
                                ...formData.foodIsAuthentic,
                                assessment: e.target.value
                              }
                            })
                            changeTooltipDisplay(e, "none");
                          }
                        }
                      ></input>
                      <label
                        onClick={() => foodAuthenticityandDiversityHandler()}
                        htmlFor="DisagreeDestinationForNewFood"
                        className="nhoodEvalLabelFalse"
                        style={{ fontWeight: "normal", height: "auto", right: "-2px", position: "relative" }}
                      >
                        Disagree
                      </label>
                    </div>

                  </div>
                  <div className="tooltip_">Your opinion is important</div>
                </div>

                <div
                  ref={foodDiversityExplanationRef}
                  className="elaborateNhoodEval"
                  style={{ marginTop: "50px" }}
                >
                  <div>Can you explain why?</div>
                  <input
                    name="public_transport_explanation"
                    className="inputElaborateNhoodEval"
                    onChange={
                      (e) => {
                        setFormData({
                          ...formData,
                          foodIsAuthentic: {
                            ...formData.foodIsAuthentic,
                            explanation: e.target.value
                          }
                        })
                      }}
                  ></input>
                </div>
              </div>

            </div>

            {/** NIGHTLIFE */}
            {/** How do you describe the nighlife of {neighborhood}*/}
            <div
              className={
                "agreeOrDisagreeFood nightLifePlacesRecommendations nightLifeRecommendations nightlifeQuestions " +
                displayQuestion("describeNighLife")
              }
              ref={ref => divRefs.current[12] = ref}
            >
              <div className="introHeader" ref={letsTalkAboutNightLifeRef}>
                <h4> Let's talk about the night life </h4>
                <img alt="nightlife" src="https://raw.githubusercontent.com/diegoleonardoro/multi-k8s/main/DALL%C2%B7E%202023-12-21%2018.35.59%20-%20A%20pencil%20sketch%20with%20a%20grain%20effect%2C%20emphasizing%20a%20_night_%20ambiance%20for%20a%20modern%20nightclub%20scene.%20The%20sketch%20should%20depict%20a%20contemporary%20nightclub%20at.png" height="170px"></img>
              </div>

              <div>
                <label style={{ fontWeight: "normal", left: "50%", transform: "translate(-50%, 0)", marginBottom: "30px", marginTop: "25px" }}>How would you describe the night life of {neighborhood}:</label>

                <div style={{ height: "30px", borderBottom: "1px dotted black", position: "relative", left: "50%", transform: "translate(-50%,0)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>


                    <div className="statementResponseContainer">
                      <input
                        type="radio"
                        className="nightLifeDescription"
                        name="diverseAndAuthenticFood"
                        value="vibrant"
                        id="vibrantNightLife"
                        onChange={
                          (e) => {
                            setFormData({
                              ...formData,
                              nightLife: {
                                ...formData.nightLife,
                                assessment: e.target.value
                              }
                            })
                            changeTooltipDisplay(e, "none");
                          }

                        }
                      ></input>
                      <label
                        onClick={() => nightLifeDescriptionHandler()}
                        htmlFor="vibrantNightLife"
                        className="nightLifeDescription"
                        style={{ fontWeight: "normal", height: "auto", left: "-2px" }}
                      // className="nhoodEvalLabelTrue"
                      // style={{fontWeight:"normal", width:"100%", height:"auto"}}
                      >
                        Vibrant
                      </label>
                    </div>

                    <div className="statementResponseContainer">
                      <input
                        type="radio"
                        className="nightLifeDescription"
                        name="diverseAndAuthenticFood"
                        value="moderate"
                        id="nightLifeModerate"
                        onChange={
                          (e) => {
                            setFormData({
                              ...formData,
                              nightLife: {
                                ...formData.nightLife,
                                assessment: e.target.value
                              }
                            })
                            changeTooltipDisplay(e, "none");
                          }
                        }
                      ></input>
                      <label
                        onClick={() => nightLifeDescriptionHandler()}
                        htmlFor="nightLifeModerate"
                        className="nightLifeDescription"
                        style={{ fontWeight: "normal", height: "auto", right: "-2px", position: "relative" }}
                      >
                        Moderate
                      </label>
                    </div>

                    <div className="statementResponseContainer">
                      <input
                        type="radio"
                        className="nightLifeDescription"
                        name="diverseAndAuthenticFood"
                        value="quiet"
                        id="quietNightLife"
                        onChange={
                          (e) => {
                            setFormData({
                              ...formData,
                              nightLife: {
                                ...formData.nightLife,
                                assessment: e.target.value
                              }
                            })
                            changeTooltipDisplay(e, "none");
                          }
                        }
                      ></input>
                      <label
                        onClick={() => nightLifeDescriptionHandler()}
                        htmlFor="quietNightLife"
                        className="nightLifeDescription"
                        style={{ fontWeight: "normal", height: "auto", right: "-2px", position: "relative" }}
                      >
                        Quiet
                      </label>
                    </div>

                  </div>
                  <div className="tooltip_">Your opinion is important</div>
                </div>

                <div
                  ref={nightLifeExplanationRef}
                  className="elaborateNightLifeEval"
                  style={{ marginTop: "50px" }}
                >
                  <div>Can you explain why?</div>
                  <input

                    className="inputElaborateNhoodEval"
                    onChange={
                      (e) => {
                        setFormData({
                          ...formData,
                          nightLife: {
                            ...formData.nightLife,
                            explanation: e.target.value
                          }
                        })
                      }}
                  ></input>
                </div>


              </div>

              {/* <label>
                How would you describe the <span className="questionHighlight">night life</span> of 
                <span className="nhoodName">{neighborhood}</span>?
              </label>
              <textarea
                className="textarea_text" 
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    nightLife: e.target.value,
                  });

                  changeTooltipDisplay(e, "none"); changeTooltipDisplay(e, "none"); changeTooltipDisplay(e, "none");
                }}
                placeholder="Write freely here"
              ></textarea> */}

              <div className="tooltip_">Your opinion is important</div>
            </div>

            {/** Are there any nightlife venues (bars, restaurants, nighclubs) that youd like to  */}
            <div
              className={
                "describeNighLife completeTheSentenceNightLifeVenue nightLifeRecommendedPlaces " +
                displayQuestion("nightLifePlacesRecommendations")
              }
              ref={ref => divRefs.current[13] = ref}
            >

              <label>
                Are there any <span className="questionHighlight">night life venues</span> in  <span className="nhoodName"> {neighborhood}</span> you'd like to recommend?
              </label>

              <div
                className="favPlacesCloseIconListContainer"
              >
                <div
                  className="favoritePlacesContainer"
                  ref={favoritePlacesContainerRef}
                >
                  <div className="favoritePlacesHeader">
                    <div>Name of venue:</div>
                    <div>Description: </div>
                  </div>

                  {nighLifeRows.map((item, index) => {
                    return (
                      <div
                        key={index}
                        className="favoritePlacesBody favPlacesDiv"
                      >
                        <div style={{ width: "50%" }}>
                          <textarea
                            className=
                            "favoritePlacesTextArea nameOfFavPlaceTextArea"
                            ref={(e) =>
                            (nightLifeRecommendationsRef.current["placeName"] =
                              e)
                            }
                          ></textarea>
                        </div>
                        <div style={{ width: "50%" }}>
                          <textarea
                            className="favoritePlacesTextArea"
                            ref={(e) =>
                            (nightLifeRecommendationsRef.current[
                              "placeDescription"
                            ] = e)
                            }
                          ></textarea>
                        </div>
                      </div>
                    );
                  })}


                  <div
                    onClick={() => addNewPlace("nightLife")}
                    className="addNewPlace"
                    id="addNewPlaceButton"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-plus"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                    </svg>
                    <b>Add another place</b>
                  </div>


                </div>
              </div>


            </div>

            {/** Complete the sentence: "If I had to pick one place to enjoy the nightlife of {neighborhood}, it would be _______, because ________" */}
            <div
              className={"nightLifePlacesRecommendations neighborhoodEvaluationFirstQuestion pickOneNightLifePlace " +
                displayQuestion("completeTheSentenceNightLifeVenue") +
                " " +
                shakie}
              ref={ref => divRefs.current[14] = ref}
            >
              {/* <h3 style={{ marginBottom: "30px", width: "100%", fontWeight: 'bold' }}>Complete the sentence:</h3> */}


              <div style={{ display: "fex", textAlign: 'start', position: "relative" }}>
                <div style={{ display: "fex", alignItems: "center", lineHeight: "40px" }}>
                  <p style={{ display: "inline" }}>If you had to pick <span className="questionHighlight"> one place to enjoy night life </span> in {neighborhood} it would be </p>
                  <input style={{
                    width: '35%',
                    height: '25px'
                  }}
                    className="completeSentenceInput"
                    onChange={
                      (e) => {
                        setFormData({
                          ...formData,
                          onePlaceForNightLife: {
                            ...formData.onePlaceForNightLife,
                            assessment: e.target.value
                          }
                        })
                        changeTooltipDisplay(e, "none");
                      }
                    }
                    placeholder="One word only"
                  >
                  </input>

                  <p style={{ display: "inline" }}> because</p>
                  <input style={{
                    width: '35%',
                    height: '25px',
                    textTransform: "lowercase"
                  }}
                    className="completeSentenceInput"
                    onChange={
                      (e) => {
                        setFormData({
                          ...formData,
                          onePlaceForNightLife: {
                            ...formData.onePlaceForNightLife,
                            explanation: e.target.value
                          }
                        })
                      }
                    }
                  ></input>
                </div>
              </div>
              <div className="tooltip_">Your opinion is important</div>
            </div>

            {/** GENERAL QUESTIONS */}
            {/** True or false statements, public transportation  */}
            <div
              className={
                "completeTheSentenceNightLifeVenue neighborhoodEvaluationSecondQuestion neighborhoodEvaluationFlag " +
                displayQuestion("neighborhoodEvaluationFirstQuestion") +
                " " +
                shakie
              }
              ref={ref => divRefs.current[15] = ref}
            >
              <div ref={letsTalkAboutGeneralInfo} className="introHeader" >
                <h4> Let's talk about some general information </h4>
                <img alt="generalinfo" src="https://raw.githubusercontent.com/diegoleonardoro/multi-k8s/main/DALL%C2%B7E%202023-12-22%2008.42.27%20-%20A%20black%20and%20white%2C%20highly%20minimalistic%20pencil%20sketch%2C%20focusing%20on%20the%20theme%20of%20'general%20questions.'%20This%20version%20should%20feature%20only%20a%20few%20floating%20qu.png" height="190px"></img>
              </div>

              <h3 style={{ fontWeight: 'bold' }}> True or False: </h3>

              <div>
                <div className="nhoodEvalHeader">
                  <span> "Public transportation in{" "}
                    <span className="nhoodName questionHighlight">{neighborhood}</span> is easily
                    accessible and convenient."
                  </span>
                </div>

                <div className="statementResponseContainer">
                  <input
                    type="radio"
                    className="statementResponseContainerInput"
                    name="publicTransport"
                    value="accessible and convenient"
                    id="yesPublicTransport"
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        statements: {
                          ...formData.statements,
                          "publicTransportation": {
                            ...formData.statements.publicTransportation,
                            assessment: e.target.value, //<<<<--------------------------------------
                          },
                        },
                      });
                      changeTooltipDisplay(e, "none");
                    }}
                  ></input>
                  <label
                    onClick={() => nhoodEvalHandler("transportation")}
                    htmlFor="yesPublicTransport"
                    className="nhoodEvalLabelTrue"
                  >
                    True
                  </label>
                </div>

                <div className="statementResponseContainer">
                  <input
                    type="radio"
                    className="statementResponseContainerInput"
                    name="publicTransport"
                    value="acceptable"
                    id="unsurePublicTransport"
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        statements: {
                          ...formData.statements,
                          "publicTransportation": {
                            ...formData.statements.publicTransportation,
                            assessment: e.target.value,
                          },
                        },
                      });
                      changeTooltipDisplay(e, "none");
                    }}
                  ></input>
                  <label
                    onClick={() => nhoodEvalHandler("transportation")}
                    htmlFor="unsurePublicTransport"
                    className="nhoodEvalLabelUnsure"
                  >
                    Unsure
                  </label>
                </div>

                <div className="statementResponseContainer">
                  <input
                    type="radio"
                    className="statementResponseContainerInput"
                    name="publicTransport"
                    value="inconvenient"
                    id="noPublicTransport"
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        statements: {
                          ...formData.statements,
                          "publicTransportation": {
                            ...formData.statements.publicTransportation,
                            assessment: e.target.value,
                          },
                        },
                      });
                      changeTooltipDisplay(e, "none");
                    }}
                  ></input>
                  <label
                    onClick={() => nhoodEvalHandler("transportation")}
                    htmlFor="noPublicTransport"
                    className="nhoodEvalLabelFalse"
                  >
                    False
                  </label>
                </div>

                <div
                  ref={(el) =>
                    (nhoodExplanationRef.current["transportation"] = el)
                  }
                  className="elaborateNhoodEval"
                >
                  <div>Can you explain why?</div>
                  <input
                    name="public_transport_explanation"
                    className="inputElaborateNhoodEval"
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        statements: {
                          ...formData.statements,
                          publicTransportation: {
                            ...formData.statements.publicTransportation,
                            "explanation": e.target.value,
                          },
                        },
                      });
                    }}
                  ></input>
                </div>
              </div>

              <div className="tooltip_">This information is important</div>

            </div>

            {/** True or false statements, having pets in your neighborhood is convenient */}
            <div
              className={
                "neighborhoodEvaluationFirstQuestion neighborhoodEvaluationThirdQuestion neighborhoodEvaluation neighborhoodEvaluationFlag " +
                displayQuestion("neighborhoodEvaluationSecondQuestion") +
                " " +
                shakie
              }
              ref={ref => divRefs.current[16] = ref}
            >
              <h3 style={{ fontWeight: 'bold' }}> True or False: </h3>
              <div>
                <div className="nhoodEvalHeader">
                  <span>
                    "Having pets in <span className="nhoodName questionHighlight">{neighborhood}</span> is convenient{" "}."
                  </span>
                </div>
                <div className="statementResponseContainer">
                  <input
                    type="radio"
                    className="statementResponseContainerInput"
                    name="havingPets"
                    value="recommend"
                    id="trueHavingPets"
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        statements: {
                          ...formData.statements,
                          "owningPets": {
                            ...formData.statements.owningPets,
                            assessment: e.target.value,
                          },
                        },
                      });
                      changeTooltipDisplay(e, "none");
                    }}
                  ></input>
                  <label
                    onClick={() => nhoodEvalHandler("pets")}
                    htmlFor="trueHavingPets"
                    className="nhoodEvalLabelTrue"
                  >
                    True
                  </label>
                </div>
                <div className="statementResponseContainer">
                  <input
                    type="radio"
                    className="statementResponseContainerInput"
                    value="am neutral on"
                    id="unsureHavingPets"
                    name="havingPets"
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        statements: {
                          ...formData.statements,
                          "owningPets": {
                            ...formData.statements.owningPets,
                            assessment: e.target.value,
                          },
                        },
                      });
                      changeTooltipDisplay(e, "none");
                    }}
                  ></input>
                  <label
                    onClick={() => nhoodEvalHandler("pets")}
                    htmlFor="unsureHavingPets"
                    className="nhoodEvalLabelUnsure"
                  >
                    Unsure
                  </label>
                </div>
                <div className="statementResponseContainer">
                  <input
                    type="radio"
                    className="statementResponseContainerInput"
                    name="havingPets"
                    value="do not recommend"
                    id="falseHavingPets"
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        statements: {
                          ...formData.statements,
                          "owningPets": {
                            ...formData.statements.owningPets,
                            assessment: e.target.value,
                          },
                        },
                      });
                      changeTooltipDisplay(e, "none");
                    }}
                  ></input>
                  <label
                    onClick={() => nhoodEvalHandler("pets")}
                    htmlFor="falseHavingPets"
                    className="nhoodEvalLabelFalse"
                  >
                    False
                  </label>
                </div>
                <div
                  ref={(el) => (nhoodExplanationRef.current["pets"] = el)}
                  className="elaborateNhoodEval"
                >
                  <div>Do you want to explain why?</div>
                  <input
                    name="having_pets_explanation"
                    className="inputElaborateNhoodEval"
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        statements: {
                          ...formData.statements,
                          owningPets: {
                            ...formData.statements.owningPets,
                            "explanation": e.target.value,
                          },
                        },
                      });
                    }}
                  ></input>
                </div>
              </div>
              <div className="tooltip_">This information is important</div>
            </div>

            {/** True or false statements, your neighborhood is safe */}
            <div
              className={
                "neighborhoodEvaluationSecondQuestion neighborhoodEvaluationFourthQuestion neighborhoodEvaluation neighborhoodEvaluationFlag " +
                displayQuestion("neighborhoodEvaluationThirdQuestion") +
                " " +
                shakie
              }
              ref={ref => divRefs.current[17] = ref}
            >
              <h3 style={{ fontWeight: 'bold' }}> True or False: </h3>
              <div>
                <div className="nhoodEvalHeader">
                  <span >
                    <span className="nhoodName questionHighlight">"{neighborhood}</span> is generally
                    a safe neighborhood."
                  </span>
                </div>
                <div className="statementResponseContainer">
                  <input
                    type="radio"
                    className="statementResponseContainerInput"
                    name="safe"
                    value="good"
                    id="trueSafe"
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        statements: {
                          ...formData.statements,
                          "safety": {
                            ...formData.statements.safety,
                            assessment: e.target.value,
                          },
                        },
                      });
                      changeTooltipDisplay(e, "none");
                    }}
                  ></input>
                  <label
                    onClick={() => nhoodEvalHandler("safety")}
                    htmlFor="trueSafe"
                    className="nhoodEvalLabelTrue"
                  >
                    True
                  </label>
                </div>

                <div className="statementResponseContainer">
                  <input
                    type="radio"
                    className="statementResponseContainerInput"
                    name="safe"
                    value="unpredictable"
                    id="unsureSafe"
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        statements: {
                          ...formData.statements,
                          "safety": {
                            ...formData.statements.safety,
                            assessment: e.target.value,
                          },
                        },
                      });
                      changeTooltipDisplay(e, "none");
                    }}
                  ></input>
                  <label
                    onClick={() => nhoodEvalHandler("safety")}
                    htmlFor="unsureSafe"
                    className="nhoodEvalLabelUnsure"
                  >
                    Unsure
                  </label>
                </div>

                <div className="statementResponseContainer">
                  <input
                    type="radio"
                    className="statementResponseContainerInput"
                    name="safe"
                    value="bad"
                    id="falseSafe"
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        statements: {
                          ...formData.statements,
                          "safety": {
                            ...formData.statements.safety,
                            assessment: e.target.value,
                          },
                        },
                      });
                      changeTooltipDisplay(e, "none");
                    }}
                  ></input>
                  <label
                    onClick={() => nhoodEvalHandler("safety")}
                    htmlFor="falseSafe"
                    className="nhoodEvalLabelFalse"
                  >
                    False
                  </label>
                </div>

                <div
                  ref={(el) => (nhoodExplanationRef.current["safety"] = el)}
                  className="elaborateNhoodEval"
                >
                  <div>Do you want to explain why?</div>
                  <input
                    name="safety_explanation"
                    className="inputElaborateNhoodEval"
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        statements: {
                          ...formData.statements,
                          safety: {
                            ...formData.statements.safety,
                            explanation: e.target.value,
                          },
                        },
                      });
                    }}
                  ></input>
                </div>

              </div>
              <div className="tooltip_">Your opinion is important</div>
            </div>

            {/** True or false statements, your neighborhood offer opportunities for meeting new people */}
            <div
              className={
                "neighborhoodEvaluationThirdQuestion neighborhoodPictures neighborhoodEvaluation neighborhoodEvaluationFlag " +
                displayQuestion("neighborhoodEvaluationFourthQuestion") +
                " " +
                shakie
              }
              ref={ref => divRefs.current[18] = ref}
            >
              <h3 style={{ fontWeight: 'bold' }}> True or False: </h3>
              <div>
                <div className="nhoodEvalHeader">
                  <span>
                    <span className="nhoodName questionHighlight">"{neighborhood}</span> offers good
                    opportunities for meeting new people.
                  </span>
                </div>
                <div className="statementResponseContainer">
                  <input
                    type="radio"
                    className="statementResponseContainerInput"
                    name="meetingNewPeople"
                    value="convenient"
                    id="trueMeetingNewPeople"
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        statements: {
                          ...formData.statements,
                          "socializing": {
                            ...formData.statements.socializing,
                            assessment: e.target.value,
                          },
                        },
                      });
                      changeTooltipDisplay(e, "none");
                    }}
                  ></input>
                  <label
                    onClick={() => nhoodEvalHandler("meetingPeople")}
                    htmlFor="trueMeetingNewPeople"
                    className="nhoodEvalLabelTrue"
                  >
                    True
                  </label>
                </div>

                <div className="statementResponseContainer">
                  <input
                    type="radio"
                    className="statementResponseContainerInput"
                    name="meetingNewPeople"
                    value="moderate"
                    id="unsureMeetingNewPeople"
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        statements: {
                          ...formData.statements,
                          "socializing": {
                            ...formData.statements.socializing,
                            assessment: e.target.value,
                          },
                        },
                      });
                      changeTooltipDisplay(e, "none");
                    }}
                  ></input>
                  <label
                    onClick={() => nhoodEvalHandler("meetingPeople")}
                    htmlFor="unsureMeetingNewPeople"
                    className="nhoodEvalLabelUnsure"
                  >
                    Unsure
                  </label>
                </div>

                <div className="statementResponseContainer">
                  <input
                    type="radio"
                    className="statementResponseContainerInput"
                    name="meetingNewPeople"
                    value="not the best"
                    id="falseMeetingNewPeople"
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        statements: {
                          ...formData.statements,
                          "socializing": {
                            ...formData.statements.socializing,
                            assessment: e.target.value,
                          },
                        },
                      });
                      changeTooltipDisplay(e, "none");
                    }}
                  ></input>
                  <label
                    onClick={() => nhoodEvalHandler("meetingPeople")}
                    htmlFor="falseMeetingNewPeople"
                    className="nhoodEvalLabelFalse"
                  >
                    False
                  </label>
                </div>

                <div
                  ref={(el) =>
                    (nhoodExplanationRef.current["meetingPeople"] = el)
                  }
                  className="elaborateNhoodEval"
                >
                  <div>Do you want to explain why?</div>
                  <input
                    name="meeting_new_people_explanation"
                    className="inputElaborateNhoodEval"
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        statements: {
                          ...formData.statements,
                          socializing: {
                            ...formData.statements.socializing,
                            explanation: e.target.value,
                          },
                        },
                      });
                    }}
                  ></input>
                </div>
              </div>
              <div className="tooltip_">Your opinion is important</div>
            </div>

            {/**PICTURES */}
            {/** Do you have any neighborhood pictures to share? */}
            <div className={
              "neighborhoodEvaluationFourthQuestion submit "
              // +  (loggedUser ? "submit " : "personalInfo ")
              + displayQuestion("neighborhoodPictures")
            }
              ref={ref => divRefs.current[19] = ref}
            >
              <label htmlFor="nhoodImagesInput">
                Do you have any <span className="questionHighlight">pictures of <span className="nhoodName"> {neighborhood}</span></span> to share?
              </label>
              <input className="nhoodImagesInput" onChange={(e) => { setFormData({ ...formData, neighborhoodImages: Array.from(e.target.files) }) }} id="nhoodImagesInput" type="file" name="nhoodImages" multiple></input>
            </div>

            {/* if the user is not logged in here, render a question that asks for his email, name and a password  */}
            <div
              className={
                "neighborhoodPictures submit " +
                displayQuestion("personalInfo") +
                " contactInfo " +
                shakie
              }
              ref={ref => divRefs.current[20] = ref}
            >
              {showUserDataAlert && sendInfoWithoutDataAlert}

              <h3 style={{ fontWeight: 'bold', marginBottom: '40px' }}>Sign up to edit your responses anytime later.</h3>
              <Form.Group as={Row} className="mb-3" controlId="formHorizontalFirstName">
                <Form.Label column sm={2}>
                  First Name:
                </Form.Label>
                <Col sm={10}>
                  <Form.Control style={{ width: '100%' }} onChange={updateNewUserData} name="name" />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3" controlId="formHorizontalEmail">
                <Form.Label column sm={2}>
                  Email:
                </Form.Label>
                <Col sm={10}>
                  <Form.Control style={{ width: '100%' }} onChange={updateNewUserData} name="email" />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3">
                <Col >
                  <Button variant="secondary" size="lg" style={{ width: "100%", marginTop: "10px" }} onClick={submitNewUserData} type="submit">Submit</Button>
                </Col>
              </Form.Group>
              {/* {errors2} */}
            </div>

            {/** Submit */}
            <div
              className={
                // (currentUser
                //   ? "neighborhoodEvaluationFourthQuestion "
                //   : "personalInfo ") +
                // " end " +

                "neighborhoodEvaluationFourthQuestion end " +
                displayQuestion("submit")
              }
              ref={ref => divRefs.current[21] = ref}
            >
              <input
                className="submitValuesInput"
                type="submit"
                value="Submit"
              />
            </div>

           

            {/** Arrows */}
            <div
              className="arrowsContainer"
              style={{ visibility: showFormToResident }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="60"
                height="60"
                viewBox="0 0 16 16"
                onClick={() => changeQuestion("prev")}

              >
                <path d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
              </svg>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="60"
                height="60"
                viewBox="0 0 16 16"
                onClick={() => changeQuestion("next")}

              >
                <path d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z" />
              </svg>
            </div>

          </form>
            <div style={{position:"absolute", bottom:"15px", left:"50%", transform:"translate(-50%, 0)"}}>
              {Math.floor(progressPercentage)}% completed
            </div>
        </div >
      )}


    </div >
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
  "DUMBO",
  "Vinegar Hill",
  "Downtown Brooklyn",
  "Boerum Hill",
  "Brighton Beach",
  "Homecrest",
  "Steinway",
];
