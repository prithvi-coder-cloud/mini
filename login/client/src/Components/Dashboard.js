import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './dashboard.css';
import logo from "./img/logo/job.jpg"; // Path to your logo image
import { useNavigate } from 'react-router-dom';
import Location from '../Components/sidebar/Location'; // Import Location component
import Salary from '../Components/sidebar/Salary'; // Import Salary component
import Header from './Header';

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // State for search input
  const [locationFilter, setLocationFilter] = useState(''); // State for location filter
  const [salaryFilter, setSalaryFilter] = useState(''); // State for salary filter
  const [salaryType, setSalaryType] = useState(''); // State for salary type
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;
  const navigate = useNavigate();
  const [, setForceUpdate] = useState(0);

  // Add this function to filter out expired jobs
  const filterExpiredJobs = (jobs) => {
    const now = new Date();
    return jobs.filter(job => {
      const expiryDate = new Date(job.expireDate);
      return expiryDate > now;
    });
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/all-jobs`);
        // The backend now only returns active jobs (status: 1)
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError('Failed to fetch jobs.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();

    // Set up periodic refresh
    const refreshInterval = setInterval(() => {
      fetchJobs();
    }, 60000); // Refresh every minute

    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setForceUpdate(prev => prev + 1);
    }, 60000); // Updates every minute

    return () => clearInterval(timer);
  }, []);

  const viewJobDetails = (job) => {
    navigate(`/job/${job._id}`, { state: { job } });
  };

  // Update the filtered jobs logic
  const filteredJobs = jobs
    .filter(job =>
      (job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (locationFilter === '' || job.jobLocation.toLowerCase().includes(locationFilter.toLowerCase())) &&
      (salaryFilter === '' || job.maxPrice <= parseInt(salaryFilter)) &&
      (salaryType === '' || job.salaryType === salaryType)
    )
    .sort((a, b) => new Date(a.expireDate) - new Date(b.expireDate)); // Sort by expiry date

  // Calculate pagination values
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;

  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  // Handle page changes
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0); // Scroll to top when changing page
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    console.log('Current location filter:', locationFilter);
    console.log('Available locations:', jobs.map(job => job.jobLocation));
    console.log('Filtered jobs:', filteredJobs);
  }, [locationFilter, jobs, filteredJobs]);

  const calculateTimeRemaining = (expireDate) => {
    try {
      // Check if expireDate is valid
      if (!expireDate) {
        return { text: 'Invalid date', urgent: false };
      }

      const now = new Date();
      let expiryDate;

      try {
        // Try parsing the date in different formats
        if (typeof expireDate === 'string') {
          if (expireDate.includes('T')) {
            expiryDate = new Date(expireDate);
          } else {
            // If date string doesn't have time component
            expiryDate = new Date(expireDate + 'T00:00:00Z');
          }
        } else {
          expiryDate = new Date(expireDate);
        }

        // Validate if the date is valid
        if (isNaN(expiryDate.getTime())) {
          console.error('Invalid date after parsing:', expireDate);
          return { text: 'Invalid date format', urgent: false };
        }
      } catch (error) {
        console.error('Error parsing date:', error);
        return { text: 'Invalid date format', urgent: false };
      }

      // Debug logs
      console.log('Original expiry date:', expireDate);
      console.log('Parsed expiry date:', expiryDate);
      console.log('Current date:', now);

      const timeDiff = expiryDate.getTime() - now.getTime();

      if (timeDiff <= 0) {
        return { text: 'Expired', urgent: false };
      }

      // Calculate days, hours, minutes
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      const urgent = days === 0 && hours < 24;

      // Format the date and time remaining
      let timeText = '';
      if (days > 0) {
        timeText = `${days} day${days > 1 ? 's' : ''} `;
      }
      if (hours > 0 || days > 0) {
        timeText += `${hours} hour${hours > 1 ? 's' : ''} `;
      }
      timeText += `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;

      try {
        // Format the expiry date
        const formattedExpiryDate = expiryDate.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        });

        return {
          text: `Expires on ${formattedExpiryDate} (${timeText})`,
          urgent
        };
      } catch (error) {
        console.error('Error formatting date:', error);
        return { text: timeText, urgent };
      }
    } catch (error) {
      console.error('Error in calculateTimeRemaining:', error);
      return { text: 'Error calculating time', urgent: false };
    }
  };

  if (loading) return <div className="loading">Loading jobs...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    
    <div className="dashboard-container">
      {/* <header className='header'>
        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li onClick={() => navigate('/')} className="course-nav-link">Back</li>
          </ul>
        </nav>
      </header> */}
            <Header/>

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
                      {job.expireDate && (
                        <span 
                          className="expiry-timer" 
                          data-urgent={calculateTimeRemaining(job.expireDate).urgent}
                        >
                          {calculateTimeRemaining(job.expireDate).text}
                        </span>
                      )}
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

          {/* Add pagination controls */}
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

export default Dashboard;
