import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SelectedCandidate.css';
import { useNavigate } from 'react-router-dom';
import logo from "../img/logo/job.jpg";

const SelectedCandidates = () => {
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [interviewLinks, setInterviewLinks] = useState({});
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

  const handleAddInterview = async (jobTitle, candidates) => {
    try {
      const emails = candidates.map(candidate => candidate.email);
      const roomName = `interview-${jobTitle.replace(/\s+/g, '-')}-${Date.now()}`;
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/create-interview`, {
        jobTitle,
        emails,
        roomName
      });

      if (response.data.success) {
        setInterviewLinks(prev => ({
          ...prev,
          [jobTitle]: roomName
        }));
        alert('Interview has been created and notifications sent to candidates');
      }
    } catch (error) {
      console.error('Error creating interview:', error);
      alert('Failed to create interview session');
    }
  };

  const handleJoinInterview = (roomName) => {
    window.open(`https://meet.jit.si/${roomName}`, '_blank');
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
                <div className="button-group">
                  <button 
                    onClick={() => handleAddInterview(jobTitle, groupedByJobTitle[jobTitle])} 
                    className="add-interview-button"
                  >
                    Add Interview
                  </button>
                  {interviewLinks[jobTitle] && (
                    <button 
                      className="join-interview-button"
                      onClick={() => handleJoinInterview(interviewLinks[jobTitle])}
                    >
                      Attend Interview
                    </button>
                  )}
                </div>
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
