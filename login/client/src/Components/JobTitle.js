import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './JobTitles.css'; // Ensure to import the CSS file
import logo from './img/logo/job.jpg'; // Path to your logo image
import Header from './Header';

const JobTitles = () => {
  const [jobTitles, setJobTitles] = useState([]);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('email');
    if (storedEmail) {
      setEmail(storedEmail);
      console.log('Stored Email:', storedEmail);

      const fetchJobTitles = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/jobtitles`, {
            params: { email: storedEmail },
          });

          console.log('API Response:', response.data);
          response.data.forEach(job => {
            console.log('Company Logo Path:', job.companyLogo);
          });

          if (response.data && Array.isArray(response.data)) {
            setJobTitles(response.data);
          } else {
            console.log('No job titles found');
            setJobTitles([]);
          }
        } catch (error) {
          console.error('Error fetching job titles:', error);
          setJobTitles([]);
        }
      };

      fetchJobTitles();
    }
  }, []);

  const handleJobTitleClick = (jobTitle) => {
    navigate(`/test/${jobTitle}`);
  };

  const getJobTitleButtonState = (jobTitle) => {
    const email = sessionStorage.getItem('email');
    if (!email) return false;

    const submittedJobTitles = JSON.parse(sessionStorage.getItem('submittedJobTitles')) || {};
    return submittedJobTitles[email] ? submittedJobTitles[email].includes(jobTitle) : false;
  };

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
          <h2>Available Test</h2>
          <div className="job-titles-list">
            {jobTitles.length > 0 ? (
              jobTitles.map((job, index) => (
                <div key={index} className="job-item-container">
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
                      onClick={() => handleJobTitleClick(job.jobTitle)}
                      disabled={getJobTitleButtonState(job.jobTitle)}
                    >
                      Attend Exam
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No job titles available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobTitles;
