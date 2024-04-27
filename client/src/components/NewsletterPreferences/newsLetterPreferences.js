import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import axios from "axios";
import { useLocation } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import "./newsLetterPreferences.css";
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Alert from 'react-bootstrap/Alert';
import { useNavigate } from "react-router-dom";

const NewsLetterPreferences = () => {

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const identifier = query.get('user_id');

  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [referralSuceess, setReferralSetSuccess] = useState(false);

  const [referralErrors, setReferralErrors] = useState(null);

  const [frequencyUpdatesSuccess, setFrequencyUpdatesSuccess] = useState(false);

  const [referralFormData, setReferralFormData] = useState({
    email: '',
  });

  const [unsubscribeSuccess, setUnsubscribeSuccess] = useState(false)

  const [frequencyFormData, setFrequencyFormdata] = useState({
    frequency: ''
  });

  const [frequency, setFrequency] = useState()

  const emailRegex = /\S+@\S+\.\S+/;

  const handleReferralChange = (e) => {

    setReferralErrors(null)
    const { name, value, type } = e.target;
    setReferralFormData({
      ...setReferralFormData,
      [name]: value
    });
  };

  const handleReferralSubmit = async (e) => {
    e.preventDefault();
    console.log("referralFormData", referralFormData);
    if (!referralFormData.email) {
      // setErrors("Email is required.");
      return;
    } else if (!emailRegex.test(referralFormData.email)) {
      // setErrors("Please enter a valid email address.");
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/newsletter/newsletterreferral`, referralFormData);
      setReferralSetSuccess(true);
      // setTimeout(() => {
      //   navigate('/');
      // }, 1000);
    } catch (error) {
      console.error("There was an error submitting the form:", error);
      // setErrors(error?.response?.data?.errors?.[0]?.message);
      setReferralErrors(error?.response?.data?.errors?.[0]?.message);
    }

  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    console.log('frequencyFormData', frequencyFormData);
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/newsletter/udpate`, {
        identifier: identifier,
        updates: { frequency: frequencyFormData.frequency }
      });
      setFrequencyUpdatesSuccess(true);

    } catch (error) {
      console.error("There was an error submitting the form:", error);
      // setErrors(error?.response?.data?.errors?.[0]?.message);
    }
  };

  const handUnsubscribeSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/newsletter/udpate`, {
        identifier: identifier,
        updates: { newsletter: false }
      });
      setUnsubscribeSuccess(true);
      // setTimeout(() => {
      //   navigate('/');
      // }, 2000);
    } catch (error) {
    }
  }
  console.log(identifier)
  const makeRequest = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/newsletter/getuserinfo/${identifier}`);
      setUser(response.data);
      setFrequency(response.data.frequency)
    } catch (error) {
      // setErrors(error.response.data.errors[0].message);
    }
  }

  useEffect(() => {
    makeRequest()
  }, []);

  if (!user) {
    return <div>Loading...</div>; // Show loading or some other placeholder until user data is loaded
  }

  let freq;
  if (frequency === "1") {
    freq = "every week";
  } else if (frequency === "2") {
    freq = "every two weeks";
  } else if (frequency === "3") {
    freq = "every three weeks";
  } else if (frequency === "4") {
    freq = "every month";
  }

  const handleFrequencyChange = (event) => {
    setUser({ ...user, frequency: event.target.value });
    setFrequencyFormdata({ frequency: event.target.value });
  };

  return (
    <div className="newsletterPreferencesParent">
      <div className="newsLetterContainer">
        <h1>Newsletter Preferences</h1>
        <hr></hr>
        <div className="current-settings">
          <h3>Current Settings</h3>
          <p>You are currently set to receive the newsletter <strong>{freq}</strong>.</p>
        </div>
        <Form className="frequency-form">

          <h5>Update Frequency:</h5>
          <Form.Check
            type="radio"
            id="one-week"
            label="One week"
            name="newsletterFrequency"
            value="1"
            checked={user && user.frequency === "1"}
            onChange={handleFrequencyChange}
          />
          <Form.Check
            type="radio"
            id="two-weeks"
            label="Two weeks"
            name="newsletterFrequency"
            value="2"
            checked={user && user.frequency === "2"}
            onChange={handleFrequencyChange}
          />
          <Form.Check
            type="radio"
            id="three-weeks"
            label="Three weeks"
            name="newsletterFrequency"
            value="3"
            checked={user && user.frequency === "3"}
            onChange={handleFrequencyChange}
          />
          <Form.Check
            type="radio"
            id="one-month"
            label="One month"
            name="newsletterFrequency"
            value="4"
            checked={user && user.frequency === "4"}
            onChange={handleFrequencyChange}
          />
          {!frequencyUpdatesSuccess && (
            <Button className="button" onClick={handlePreferencesSubmit} variant="dark">Update</Button>)}
          {frequencyUpdatesSuccess && (
            <Alert variant='success'>
              Preferences updated!
            </Alert>
          )}
        </Form>
        <hr></hr>
        <h3>Refer a Friend</h3>
        <InputGroup className="mb-3 button">
          <Form.Control
            placeholder="Recipient's email"
            aria-label="Recipient's username"
            aria-describedby="basic-addon2"
            name="email"
            value={referralFormData.email}
            onChange={handleReferralChange}
          />
          {!referralSuceess && (
            <Button variant="outline-secondary" id="button-addon2"
              onClick={handleReferralSubmit}
            > Send Invite </Button>)}
          {referralSuceess && (
            <Alert variant='success'>
              Thank you for for sharing the word!
            </Alert>
          )}

        </InputGroup>
        {
          referralErrors && (
            <Alert style={{ textAlign: "center" }} variant='danger'>
              {referralErrors}
            </Alert>
          )
        }
        <hr></hr>
        <h3>Unsubscribe</h3>
        <p>If you'd like to unsubscribe, click the button below.</p>
        {!unsubscribeSuccess && (<Button className="button" onClick={handUnsubscribeSubmit} variant="dark">Unsubscribe</Button>)}
        {unsubscribeSuccess && (<Button variant="warning">You have been unsubscribed</Button>)}

      </div>
    </div>
  );

};

export default NewsLetterPreferences;
