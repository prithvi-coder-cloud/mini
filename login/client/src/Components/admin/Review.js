import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Review.css';
import { useNavigate } from 'react-router-dom';
import logo from "../img/logo/job.jpg";

const Review = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/feedbacks`);
        setFeedbacks(response.data);
      } catch (error) {
        setError('Error fetching feedbacks.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <header className="header">
        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li onClick={() => navigate('/admin')} className="course-nav-link">Back</li>
          </ul>
        </nav>
      </header>
      <div className="review-container">
        <h2>User Feedbacks</h2>
        {feedbacks.length > 0 ? (
          <div className="feedback-list">
            {feedbacks.map((feedback, index) => (
              <div key={index} className="feedback-item">
                <h3>{feedback.email}</h3>
                <p>{feedback.feedbackText}</p>
                <p className="rating">Rating: {feedback.rating}/5</p>
                <p className="date">{new Date(feedback.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No feedbacks found</p>
        )}
      </div>
    </div>
  );
};

export default Review;
