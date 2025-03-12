import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './JobTitles.css'; // Ensure to import the CSS file
import logo from './img/logo/job.jpg'; // Path to your logo image
import Header from './Header';

const JobTitles = () => {
  const [jobTitles, setJobTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const userEmail = sessionStorage.getItem('email');

  useEffect(() => {
    if (userEmail) {
      fetchJobTitles(userEmail);
    }
  }, [userEmail]);

  const fetchJobTitles = async (email) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/jobtitles`, {
        params: { email }
      });

      if (response.data && Array.isArray(response.data)) {
        setJobTitles(response.data);
      } else {
        console.log('No job titles found');
        setJobTitles([]);
      }
    } catch (error) {
      console.error('Error fetching job titles:', error);
      setError(error.response?.data?.message || 'Failed to fetch job titles');
    } finally {
      setLoading(false);
    }
  };

  const handleJobTitleClick = (jobId, jobTitle) => {
    // Get the user-specific removed jobs
    const allRemovedJobs = JSON.parse(sessionStorage.getItem('userRemovedJobs') || '{}');
    
    // Initialize array for current user if doesn't exist
    if (!allRemovedJobs[userEmail]) {
      allRemovedJobs[userEmail] = [];
    }
    
    // Add the job ID to the user's removed jobs
    allRemovedJobs[userEmail].push(jobId);
    
    // Save back to session storage
    sessionStorage.setItem('userRemovedJobs', JSON.stringify(allRemovedJobs));
    
    // Update state to remove the job from display
    setJobTitles(prevJobs => prevJobs.filter(job => job._id !== jobId));
    
    // Navigate to test page
    navigate(`/test/${jobTitle}`);
  };

  // Filter out removed jobs for current user
  const availableJobs = jobTitles.filter(job => {
    const allRemovedJobs = JSON.parse(sessionStorage.getItem('userRemovedJobs') || '{}');
    const userRemovedJobs = allRemovedJobs[userEmail] || [];
    return !userRemovedJobs.includes(job._id);
  });

  if (loading) return <div className="course-loading">Loading tests...</div>;
  if (error) return (
    <div className="course-error">
      <p>{error}</p>
      <button onClick={() => fetchJobTitles(userEmail)}>Retry</button>
    </div>
  );

  return (
    <div className="job-titles-page">
      {/* Header Section */}
      {/* <header className="course-header">
        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li onClick={() => navigate('/')} className="course-nav-link">
              Back
            </li>
          </ul>
        </nav>
      </header> */}
<Header/>
      {/* Main Content Section */}
      <div className="page-container">
        <div className="job-titles-container">
          <h2>Available Tests</h2>
          <div className="job-titles-list">
            {availableJobs.length > 0 ? (
              availableJobs.map((job) => (
                <div key={job._id} className="job-item-container">
                  {/* Company Logo */}
                  <img
                    src={job.companyLogo ? 
                      job.companyLogo.startsWith('/uploads/') 
                        ? `${process.env.REACT_APP_API_URL}${job.companyLogo}`
                        : `${process.env.REACT_APP_API_URL}/uploads/${job.companyLogo}`
                      : logo
                    }
                    alt={`${job.companyName} Logo`}
                    className="job-logo"
                    onError={(e) => {
                      console.log('Failed to load image:', e.target.src);
                      e.target.onerror = null;
                      e.target.src = logo;
                    }}
                  />

                  {/* Job Title */}
                  <div className="job-title-box">
                    <p>
                      <strong>Job Title:</strong> {job.jobTitle}
                    </p>
                  </div>

                  {/* Company Name */}
                  <div className="company-name-box">
                    <p>
                      <strong>Company:</strong> {job.companyName}
                    </p>
                  </div>

                  {/* Attend Quiz Button */}
                  <div className="quiz-button-box">
                    <button
                      className="job-title-button"
                      onClick={() => handleJobTitleClick(job._id, job.jobTitle)}
                    >
                      Attend Exam
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-tests">
                <p>No tests available at the moment.</p>
                <button onClick={() => fetchJobTitles(userEmail)}>
                  Refresh Tests
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobTitles;
