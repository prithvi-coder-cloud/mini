import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SelectedCandidate.css';
import { useNavigate } from 'react-router-dom';
import logo from "../img/logo/job.jpg";

const SelectedCandidates = () => {
  const [selectedCandidates, setSelectedCandidates] = useState([]);
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
    fetchSelectedCandidates();
  }, [user]);

  console.log('Session Storage User Data:', JSON.parse(user));

  const fetchSelectedCandidates = async () => {
    try {
      const userData = JSON.parse(user);
      const companyId = userData._id;
      
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/selections`, {
        params: { companyId }
      });
      
      if (response.data) {
        setSelectedCandidates(response.data);
      }
    } catch (error) {
      console.error('Error fetching selected candidates:', error);
      setError('Error fetching selected candidates.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async (jobTitle) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/send-invitations`, { jobTitle });
      if (response.data.success) {
        alert(`Invitations sent successfully for ${jobTitle}`);
      }
    } catch (error) {
      console.error('Error sending invitations:', error);
      alert('Error sending invitations.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const groupedByJobTitle = selectedCandidates.reduce((acc, user) => {
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
          </ul>
        </nav>
      </header>
      <div className="selected-candidates-container">
        <h2>Selected Candidates</h2>
        {Object.keys(groupedByJobTitle).length > 0 ? (
          Object.keys(groupedByJobTitle).map(jobTitle => (
            <div key={jobTitle} className="job-title-section">
              <h3>
                <span>{jobTitle}</span>
                <button 
                  onClick={() => handleSendInvitation(jobTitle)} 
                  className="send-invitation-button"
                >
                  Send Invitation
                </button>
              </h3>
              <table className="selected-candidates-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedByJobTitle[jobTitle].map((user, index) => (
                    <tr key={index} className="selected-candidate-item">
                      <td>{user.email}</td>
                      <td>{user.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        ) : (
          <p>No selected candidates found</p>
        )}
      </div>
    </div>
  );
};

export default SelectedCandidates;
