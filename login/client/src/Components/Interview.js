import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Interview.css';
import Header from './Header';

const Interview = () => {
  const [interviews, setInterviews] = useState([]);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
      fetchInterviews(storedEmail);
    }
  }, []);

  const fetchInterviews = async (userEmail) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/interviews`, {
        params: { email: userEmail }
      });
      setInterviews(response.data);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    }
  };

  const handleJoinInterview = (interview) => {
    // Open Jitsi meet in a new tab
    window.open(`https://meet.jit.si/${interview.roomName}`, '_blank');
  };

  return (
    <div>
    <Header />

    <div className="interview-container">
      <div className="interview-list">
        <h2>Your Interviews</h2>
        {interviews.length === 0 ? (
          <p>No interviews scheduled at the moment.</p>
        ) : (
          interviews.map((interview) => (
            <div key={interview._id} className="interview-card">
              <div className="interview-details">
                <h3>{interview.jobTitle}</h3>
                <p>Created: {new Date(interview.createdAt).toLocaleString()}</p>
              </div>
              <button 
                className="join-interview-btn"
                onClick={() => handleJoinInterview(interview)}
              >
                Join Interview
              </button>
            </div>
          ))
        )}
      </div>
    </div>
    </div>

  );
};

export default Interview;
