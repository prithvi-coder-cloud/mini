import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './GenerateQuestions.css';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from "./img/logo/job.jpg"; 

const GenerateQuestions = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const course = state?.course;
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);

  useEffect(() => {
    if (!course) {
      alert('Course information is not available. Please go back and select a course.');
      navigate('/courselist');
    }
  }, [course, navigate]);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (course) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/courses/${course._id}/questions`);
          setQuestions(response.data);
        } catch (error) {
          console.error('Error fetching questions:', error);
          setError('Failed to fetch questions.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchQuestions();
  }, [course]);

  const handleOptionChange = (questionIndex, option) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: option,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newScore = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctOption) {
        newScore += 1;
      }
    });
    setScore(newScore);
  };

  const handleNext = () => {
    // Pass course._id along with courseName to the next page
    navigate(`/certificate/${course._id}`, { state: { courseId: course._id, courseName: course?.courseName } });
  };

  if (loading) return <div>Loading questions...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <header className='header'>
        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li onClick={() => navigate('/courselist')} className='course-nav-link'>Back</li>
          </ul>
        </nav>
      </header>
    
      <div className="questions-container">
        <div className="questions-content">
          <h1>{course?.courseName} - Questions</h1>
          {questions.length > 0 ? (
            <form className="questions-list" onSubmit={handleSubmit}>
              {questions.map((question, index) => (
                <div key={index} className="question-item">
                  <p><strong>Question {index + 1}:</strong> {question.question}</p>
                  <ul>
                    {question.options.map((option, idx) => (
                      <li key={idx}>
                        <label>
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={option}
                            checked={selectedAnswers[index] === option}
                            onChange={() => handleOptionChange(index, option)}
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
          ) : (
            <p>No questions available for this course.</p>
          )}
        </div>
        {score !== null && (
          <div className="score-popup">
            <div className="score-content">
              <h2>Your Score: {score} / {questions.length}</h2>
              {score >= questions.length * 0.5 ? (
                <button onClick={handleNext}>Next</button>
              ) : (
                <p>Sorry, you failed. Please try again.</p>
              )}
              <button onClick={() => setScore(null)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateQuestions;
