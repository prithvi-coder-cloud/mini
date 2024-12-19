import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './dashboard.css';
import logo from "./img/logo/job.jpg"; // Path to your logo image
import { useNavigate } from 'react-router-dom';
import Location from '../Components/sidebar/Location'; // Import Location component
import Salary from '../Components/sidebar/Salary'; // Import Salary component

const Dashboard1 = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // State for search input
  const [locationFilter, setLocationFilter] = useState(''); // State for location filter
  const [salaryFilter, setSalaryFilter] = useState(''); // State for salary filter
  const [salaryType, setSalaryType] = useState(''); // State for salary type
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/all-jobs`);
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError('Failed to fetch jobs.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const viewJobDetails = (job) => {
    navigate(`/job/${job._id}`, { state: { job } });
  };

  // Filter jobs based on search query, location, and salary
  const filteredJobs = jobs.filter(job =>
    (job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.companyName.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (locationFilter === '' || job.jobLocation.toLowerCase() === locationFilter.toLowerCase()) &&
    (salaryFilter === '' || job.maxPrice <= parseInt(salaryFilter)) &&
    (salaryType === '' || job.salaryType === salaryType)
  );

  if (loading) return <div className="loading">Loading jobs...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-container">
      <header className='header'>
        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li onClick={() => navigate('/home1')} className='nav-link'>Back</li>
          </ul>
        </nav>
      </header>
      <div className="content-container">
        <div className="sidebar">
          <Location handleChange={(e) => setLocationFilter(e.target.value)} />
          <Salary 
            handleChange={(e) => setSalaryFilter(e.target.value)} 
            handleClick={(e) => setSalaryType(e.target.value)}
          />
        </div>
        <div className="main-content">
          <div className="search-container">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by job title or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button className="search-button">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>
          <div className="job-listing-container">
            <h1>Available Jobs</h1>
            <div className="job-listing">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <div className="job-card" key={job._id}>
                    <img src={job.companyLogo} alt={`${job.companyName} Logo`} className="company-logo" />
                    <div className="job-details">
                      <h2 className="job-title">{job.companyName}</h2>
                      <p><strong>Role:</strong> {job.jobTitle}</p>
                      <p><strong>Location:</strong> {job.jobLocation}</p>
                      <p><strong>Salary:</strong> {job.minPrice} - {job.maxPrice} ({job.salaryType})</p>
                      <p><strong>Experience Level:</strong> {job.experienceLevel}</p>
                      <p>{job.description}</p>
                      <div className="apply-button-container">
                        <button className="apply-button" id='view' onClick={() => viewJobDetails(job)}>View Details</button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No jobs available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard1;
