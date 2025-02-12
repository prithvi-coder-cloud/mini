import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './TestDisplay.css';
import tick from './img/hero/tick.jpg'

const TestDisplay = () => {
  const { jobTitle } = useParams();
  const [test, setTest] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [showPopup, setShowPopup] = useState(false); // To control popup visibility
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/test/${jobTitle}`);
        setTest(response.data);
        console.log('Company ID for this test:', response.data.companyId);
      } catch (error) {
        setError('Error fetching test.');
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [jobTitle]);

  const handleOptionChange = (questionNumber, option) => {
    setSelectedOptions({
      ...selectedOptions,
      [questionNumber]: option,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm('Do you want to submit this test?')) {
      return;
    }

    const storedEmail = sessionStorage.getItem('email');
    setEmail(storedEmail);

    const submitData = { 
      email: storedEmail, 
      jobTitle, 
      selectedOptions,
      companyId: test.companyId
    };

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/submitTest`, submitData);

      // Show success popup
      setShowPopup(true);

      // Mark the test as submitted in sessionStorage
      const submittedJobTitles = JSON.parse(sessionStorage.getItem('submittedJobTitles')) || {};
      if (!submittedJobTitles[storedEmail]) {
        submittedJobTitles[storedEmail] = [];
      }
      if (!submittedJobTitles[storedEmail].includes(jobTitle)) {
        submittedJobTitles[storedEmail].push(jobTitle);
        sessionStorage.setItem('submittedJobTitles', JSON.stringify(submittedJobTitles));
      }
    } catch (error) {
      console.error('Error submitting test:', error.response ? error.response.data : error);
      setError('Error submitting test.');
    }
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    navigate('/jobtitles'); // Navigate to job titles after closing popup
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!test) {
    return <div>No test found for job title: {jobTitle}</div>;
  }

  return (
    <div className="questions-container">
      <h2>Test for {test.jobTitle}</h2>
      <form onSubmit={handleSubmit} className="questions-content">
        {test.questions.map((q, index) => (
          <div key={index} className="question-item">
            <h3>Question {q.questionNumber}</h3>
            <p>{q.question}</p>
            <ul className="questions-list">
              {q.options.map((option, oIndex) => (
                <li key={oIndex}>
                  <label>
                    <input
                      type="radio"
                      name={`question-${q.questionNumber}`}
                      value={option}
                      checked={selectedOptions[q.questionNumber] === option}
                      onChange={() => handleOptionChange(q.questionNumber, option)}
                      required
                    />
                    {option}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <button type="submit" className="submit-button">Submit</button>
      </form>

      {showPopup && (
        <div className="testdisplay-popup-overlay">
          <div className="testdisplay-popup-content">
            <div className="testdisplay-checkmark-container">
              <div className="testdisplay-checkmark-circle">
                <img src={tick} alt="Success" className="testdisplay-tick-image" />
              </div>
            </div>
            <h3>Test Submitted Successfully!</h3>
            <button onClick={handlePopupClose} className="testdisplay-popup-button">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestDisplay;
