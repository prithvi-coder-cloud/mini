import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ViewJobs.css';
import logo from "../img/logo/job.jpg"; // Path to your logo image
import { useNavigate } from 'react-router-dom';

const ViewJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (!user || !user._id) {
          setError('Please login first');
          setLoading(false);
          return;
        }

        // Fetch all jobs for the company, including both active and expired
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/jobbs`, {
          params: { companyId: user._id }
        });
        
        console.log('Company jobs:', response.data);
        setJobs(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError('Failed to fetch jobs');
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleUpdate = (job) => {
    navigate('/editjob', { 
      state: { 
        jobId: job._id,
        jobData: job 
      } 
    });
  };

  const getStatusBadgeClass = (status) => {
    return status === 1 ? 'status-badge active' : 'status-badge expired';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="view-jobs-container">
      <header className="header">
        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li onClick={() => navigate('/companyhome')}>
              <span className="course-nav-link">Back</span>
            </li>
          </ul>
        </nav>
      </header>

      <div className="table-container">
        <h2>Posted Jobs</h2>

        {loading ? (
          <div className="loading">Loading jobs...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : jobs.length === 0 ? (
          <div className="no-jobs">No jobs posted yet</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company Logo</th>
                <th>Salary Range</th>
                <th>Location</th>
                <th>Experience</th>
                <th>Type</th>
                <th>Posted Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job._id}>
                  <td>{job.jobTitle}</td>
                  <td>
                    <img
                      src={job.companyLogo ? 
                        job.companyLogo.startsWith('http') ? 
                          job.companyLogo : 
                          `${process.env.REACT_APP_API_URL}${job.companyLogo}`
                        : logo}
                      alt="Company Logo"
                      className="company-logo-small"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = logo;
                      }}
                    />
                  </td>
                  <td>{`${job.minPrice} - ${job.maxPrice} (${job.salaryType})`}</td>
                  <td>{job.jobLocation}</td>
                  <td>{job.experienceLevel}</td>
                  <td>{job.employmentType}</td>
                  <td>{formatDate(job.postingDate)}</td>
                  <td>{formatDate(job.expireDate)}</td>
                  <td>
                    <span className={getStatusBadgeClass(job.status)}>
                      {job.status === 1 ? 'Active' : 'Expired'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="update-button"
                      onClick={() => handleUpdate(job)}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ViewJobs;
