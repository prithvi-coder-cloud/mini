import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './HighScorers.css';
import { useNavigate } from 'react-router-dom';
import logo from "../img/logo/job.jpg";

const HighScorers = () => {
  const [highScorers, setHighScorers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = sessionStorage.getItem('user');

  useEffect(() => {
    const userData = JSON.parse(user);
    if (!userData || !userData._id) {
      setError('No company ID found');
      return;
    }
    fetchHighScorers();
  }, [user]);

  const fetchHighScorers = async () => {
    try {
      const userData = JSON.parse(user);
      const companyId = userData._id;

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/highscorers`, {
        params: { companyId }
      });

      if (response.data) {
        setHighScorers(response.data);
      }
    } catch (error) {
      console.error('Error fetching high scorers:', error);
      setError('Error fetching high scorers.');
    } finally {
      setLoading(false);
    }
  };

  console.log('Session Storage User Data:', JSON.parse(user));

  const handleSelect = async (candidate) => {
    try {
      const userData = JSON.parse(user);
      const companyId = userData._id;

      // Add to selections
      await axios.post(`${process.env.REACT_APP_API_URL}/selections`, {
        email: candidate.email,
        jobTitle: candidate.jobTitle,
        score: candidate.score,
        companyId
      });

      // Update the UI by removing the selected candidate
      setHighScorers(prevScorers => 
        prevScorers.filter(scorer => 
          !(scorer.email === candidate.email && scorer.jobTitle === candidate.jobTitle)
        )
      );

      alert('Candidate selected successfully!');
    } catch (error) {
      console.error('Error selecting candidate:', error);
      alert('Error selecting candidate.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const groupedByJobTitle = highScorers.reduce((acc, user) => {
    if (!acc[user.jobTitle]) {
      acc[user.jobTitle] = [];
    }
    acc[user.jobTitle].push(user);
    return acc;
  }, {});

  return (
    <div>
      <header className="header">
        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li onClick={() => navigate('/companyhome')} className="course-nav-link">Back</li>
            {/* <li onClick={() => navigate('/selected-candidates')} className="course-nav-link">
              View Selected Candidates
            </li> */}
          </ul>
        </nav>
      </header>
      <div className="highscorers-container">
        <h2>High Scorers</h2>
        {Object.keys(groupedByJobTitle).length > 0 ? (
          Object.keys(groupedByJobTitle).map(jobTitle => (
            <div key={jobTitle} className="job-title-section">
              <h3>{jobTitle}</h3>
              <table className="highscorers-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Score</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedByJobTitle[jobTitle].map((user, index) => (
                    <tr key={index} className="highscorer-item">
                      <td>{user.email}</td>
                      <td>{user.score}</td>
                      <td>
                        <button 
                          onClick={() => handleSelect(user)}
                          className="select-button"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        ) : (
          <p>No high scorers found</p>
        )}
      </div>
    </div>
  );
};

export default HighScorers;
