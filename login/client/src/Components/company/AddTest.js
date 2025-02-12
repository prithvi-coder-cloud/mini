import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './AddTest.css';
import logo from "../img/logo/job.jpg";


const AddTest = () => {
  const user = sessionStorage.getItem('user');

  const location = useLocation();
  const { jobTitle, emails } = location.state || {};
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], correctAnswer: '' }
  ]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!jobTitle || !emails || emails.length === 0) {
      setMessage('Missing required data');
      setTimeout(() => navigate('/applicationd'), 2000);
    }
  }, [jobTitle, emails, navigate]);

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    
    // If updating correct answer, validate it matches one of the options
    if (field === 'correctAnswer') {
      const options = newQuestions[index].options;
      if (!options.includes(value)) {
        alert('Correct answer must match one of the options');
        newQuestions[index].correctAnswer = ''; // Reset the correct answer
      }
    }
    
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: '' }]);
  };
  console.log('Session Storage User Data:', JSON.parse(user));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate all questions before submitting
      const isValid = questions.every(q => {
        if (!q.options.includes(q.correctAnswer)) {
          alert(`Correct answer must match one of the options for question: "${q.question}"`);
          return false;
        }
        return true;
      });

      if (!isValid) return;

      const numberedQuestions = questions.map((q, index) => ({
        ...q,
        questionNumber: index + 1
      }));

      // Parse user data and get companyId
      const userData = JSON.parse(user);
      const companyId = userData._id;

      const testData = {
        jobTitle,
        questions: numberedQuestions,
        emails,
        companyId
      };

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/addtest`, testData);
      
      if (response.status === 201) {
        setMessage('Test added successfully and emails sent to applicants');
        setTimeout(() => navigate('/applicationd'), 2000);
      }
    } catch (error) {
      console.error('Error adding test:', error);
      setMessage('Error adding test: ' + error.response?.data?.error || error.message);
    }
  };

  return (
    <div>
      <header className="header">
        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li onClick={() => navigate('/applicationd')} className="coursenav-link">Back</li>
          </ul>
        </nav>
      </header>
      <div className="add-test-container">
        <h2>Add Test for {jobTitle}</h2>
        {message && <div className="message">{message}</div>}
        
        <form onSubmit={handleSubmit} className="test-form">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="question-container">
              <h3>Question {qIndex + 1}</h3>
              <div className="form-group">
                <label>Question:</label>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                  required
                  placeholder="Enter your question"
                />
              </div>
              
              {q.options.map((option, oIndex) => (
                <div key={oIndex} className="form-group">
                  <label>Option {oIndex + 1}:</label>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                    required
                    placeholder={`Enter option ${oIndex + 1}`}
                  />
                </div>
              ))}
              
              <div className="form-group">
                <label>Correct Answer:</label>
                <input
                  type="text"
                  value={q.correctAnswer}
                  onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                  required
                  placeholder="Enter the correct answer (must match one of the options)"
                  list={`options-${qIndex}`}
                />
                <datalist id={`options-${qIndex}`}>
                  {q.options.map((option, index) => (
                    <option key={index} value={option} />
                  ))}
                </datalist>
              </div>
            </div>
          ))}
          
          <div className="button-group">
            <button type="button" onClick={addQuestion} className="add-question-btn">
              Add Another Question
            </button>
            <button type="submit" className="submit-btn">
              Add Test
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTest;