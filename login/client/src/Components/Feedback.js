import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Feedback.css';
import { useNavigate } from 'react-router-dom';
import logo from "./img/logo/job.jpg";
import Header from './Header';

const Feedback = () => {
  const [feedback, setFeedback] = useState({
    email: '',
    feedbackText: '',
    rating: 1,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const email = sessionStorage.getItem('email');
    if (email) {
      setFeedback(prevState => ({ ...prevState, email }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeedback(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/feedback`, feedback);
      setSuccess(true);
      setError(null);
    } catch (error) {
      setError('Error submitting feedback.');
      setSuccess(false);
    }
  };

  const handleBack = () => {
    const userData = JSON.parse(sessionStorage.getItem('user'));
    
    if (userData) {
      if (userData.googleId) {
        navigate('/');
      } else if (userData.role === 'admin') {
        navigate('/admin');
      } else if (userData.role === 'company') {
        navigate('/companyhome');
      } else if (userData.role === 'course provider') {
        navigate('/course');
      } else {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  return (
    <div>
      <Header/><br></br><br></br>
      <div className="feedback-container">
        <h2>Feedback</h2>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">Feedback submitted successfully!</p>}
        <form onSubmit={handleSubmit} className="feedback-form">
          <label>
            Email:
            <input type="email" name="email" value={feedback.email} readOnly />
          </label>
          <label>
            Feedback:
            <textarea name="feedbackText" value={feedback.feedbackText} onChange={handleChange} required />
          </label>
          <label>
            Rating:
            <select name="rating" value={feedback.rating} onChange={handleChange}>
              {[1, 2, 3, 4, 5].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
