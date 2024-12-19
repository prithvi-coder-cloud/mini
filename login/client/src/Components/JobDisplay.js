import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './JobDisplay.css'; // Path to your CSS file
import logo from "./img/logo/job.jpg"; // Path to your logo image

const JobDisplay = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const back = () => {
    navigate('/dashboard');
  };

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/jobbs/${jobId}`);
        setJob(response.data);
        console.log('Company ID:', response.data.companyId); // Log the company ID to the console
      } catch (error) {
        console.error('Error fetching job details:', error);
        setError('Failed to fetch job details.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  if (loading) return <div className="loading">Loading job details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!job) return <div>No job details available.</div>;

  const apply = () => {
    // Navigate to the application form and pass the job details
    navigate('/applicationform', { state: { job } });
  };

  return (
    <div className="job-display-container">
      <header className='head'>
        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li onClick={back}>
              <span className='nav-link' style={{ cursor: 'pointer' }}>Back</span>
            </li>
          </ul>
        </nav>
      </header>
      <div className="job-display-card">
        <img src={job.companyLogo} alt={`${job.companyName} Logo`} className="company-logo1" />
        <div className="job-details">
          <h1 className="job-title">{job.jobTitle}</h1>
          <h2 className="company-name">{job.companyName}</h2>
          <p><strong>Location:</strong> {job.jobLocation}</p>
          <p><strong>Salary:</strong> {job.minPrice} - {job.maxPrice} ({job.salaryType})</p>
          <p><strong>Experience Level:</strong> {job.experienceLevel}</p>
          <p><strong>Employment Type:</strong> {job.employmentType}</p>
          <p className="job-description">{job.description}</p>
        </div>
        <button onClick={apply} className="apply-button" id='app' aria-label="Apply for this job">Apply</button>
      </div>
    </div>
  );
};

export default JobDisplay;
