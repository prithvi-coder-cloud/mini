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
    e.preventDefault(); // Prevent form default submission
    
    if (!window.confirm('Do you want to submit this test?')) {
      return;
    }

    const storedEmail = sessionStorage.getItem('email');
    if (!storedEmail) {
      setError('User email not found. Please login again.');
      return;
    }

    // Check if all questions are answered
    const totalQuestions = test.questions.length;
    const answeredQuestions = Object.keys(selectedOptions).length;
    
    if (answeredQuestions < totalQuestions) {
      setError('Please answer all questions before submitting.');
      return;
    }

    const submitData = {
      email: storedEmail,
      jobTitle: jobTitle,
      answers: selectedOptions,
      companyId: test.companyId
    };

    try {
      console.log('Submitting test data:', submitData); // Debug log

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/submitTest`, 
        submitData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.success) {
        // Store the completed test in session storage
        const submittedTests = JSON.parse(sessionStorage.getItem('submittedTests')) || {};
        if (!submittedTests[storedEmail]) {
          submittedTests[storedEmail] = [];
        }
        if (!submittedTests[storedEmail].includes(jobTitle)) {
          submittedTests[storedEmail].push(jobTitle);
          sessionStorage.setItem('submittedTests', JSON.stringify(submittedTests));
        }

        // Show success popup
        setShowPopup(true);

        // Wait for 3 seconds before navigating back
        setTimeout(() => {
          navigate('/jobtitles');
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to submit test.');
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      setError(error.response?.data?.message || 'Error submitting test. Please try again.');
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
