import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './dashboard.css';
import logo from "./img/logo/job.jpg";
import { useNavigate } from 'react-router-dom';
import Location from '../Components/sidebar/Location';
import Salary from '../Components/sidebar/Salary';

const Dashboard1 = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [salaryFilter, setSalaryFilter] = useState('');
  const [salaryType, setSalaryType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;
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

  const filteredJobs = jobs.filter(job =>
    (job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.companyName.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (locationFilter === '' || job.jobLocation.toLowerCase().includes(locationFilter.toLowerCase())) &&
    (salaryFilter === '' || job.maxPrice <= parseInt(salaryFilter)) &&
    (salaryType === '' || job.salaryType === salaryType)
  );

  // Calculate pagination
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  // Handle page changes
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
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
        navigate('/Home1');
      }
    } else {
      navigate('/');
    }
  };

  if (loading) return <div className="loading">Loading jobs...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-container">
      <header className='header'>
        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li onClick={handleBack} className='nav-link'>Back</li>
          </ul>
        </nav>
      </header>

      <div className="search-hero">
        <h1>Find Your Dream Job Today</h1>
        <p className="search-subtitle">Search through thousands of job listings</p>
        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search jobs, companies, or keywords"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button className="search-button">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="content-container">
        <aside className="sidebar">
          <div className="filter-section">
            <h3>Filters</h3>
            <Location handleChange={(e) => setLocationFilter(e.target.value)} />
            <Salary 
              handleChange={(e) => setSalaryFilter(e.target.value)} 
              handleClick={(e) => setSalaryType(e.target.value)}
            />
          </div>
        </aside>

        <main className="main-content">
          <div className="results-header">
            <h2>Available Positions ({filteredJobs.length})</h2>
          </div>

          <div className="job-listing">
            {currentJobs.length > 0 ? (
              currentJobs.map((job) => (
                <div className="job-card" key={job._id}>
                  <div className="job-card-header">
                    <img src={job.companyLogo} alt={`${job.companyName} Logo`} className="company-logo" />
                    <div className="job-card-title">
                      <h3>{job.jobTitle}</h3>
                      <h4>{job.companyName}</h4>
                    </div>
                  </div>
                  <div className="job-card-details">
                    <div className="detail-item">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{job.jobLocation}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-money-bill-wave"></i>
                      <span>{job.minPrice} - {job.maxPrice} ({job.salaryType})</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-briefcase"></i>
                      <span>{job.experienceLevel}</span>
                    </div>
                  </div>
                  <p className="job-description">{job.description.substring(0, 150)}...</p>
                  <div className="job-card-footer">
                    <button className="view-details-button" onClick={() => viewJobDetails(job)}>
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <i className="fas fa-search"></i>
                <h3>No jobs found</h3>
                <p>Try adjusting your search criteria</p>
              </div>
            )}
          </div>

          {filteredJobs.length > jobsPerPage && (
            <div className="pagination">
              <button 
                className="pagination-button"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <i className="fas fa-chevron-left"></i> Previous
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                className="pagination-button"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard1;
