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

  const back = () => {
    navigate('/companyhome');
  };

  useEffect(() => {
    // Get the companyId from sessionStorage
    const companyId = sessionStorage.getItem('user'); 
    console.log('Company ID:', companyId); // Debugging line to check if companyId is retrieved

    if (!companyId) {
      setError('Company not logged in.');
      setLoading(false);
      return;
    }

    const fetchJobs = async () => {
      try {
        // Fetch jobs that belong to the company using companyId as a query parameter
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/jobbs`, {
          params: { companyId }, // Pass companyId to filter jobs by the company
        });

        console.log('Jobs response:', response.data); // Debugging line to check API response

        // Assuming jobs are filtered by companyId on the backend, otherwise filter here
        const filteredJobs = response.data.filter(job => job.companyId === companyId);
        
        // Set the jobs
        setJobs(filteredJobs);
      } catch (error) {
        console.error('Error fetching job listings:', error);

        // Log error details for debugging
        if (error.response) {
          // Server responded with a status other than 200
          console.error('Response error:', error.response.data);
        } else if (error.request) {
          // Request was made but no response was received
          console.error('Request error:', error.request);
        } else {
          // Something else happened in setting up the request
          console.error('Error message:', error.message);
        }

        setError('Error fetching job listings');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []); // Empty dependency array ensures this runs once on mount

  const handleUpdate = (job) => {
    navigate('/editjob', { state: { jobId: job._id } }); // Pass jobId instead of the whole job
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <header className='header'>
        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li onClick={back}>
              <a className='nav-link' style={{ cursor: 'pointer' }}>Back</a>
            </li>
          </ul>
        </nav>
      </header>
      <div className="table-container">
        <h2>Job Listings</h2>
        <table>
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Company Logo</th>
              <th>Job Title</th>
              <th>Min Salary</th>
              <th>Max Salary</th>
              <th>Salary Type</th>
              <th>Job Location</th>
              <th>Posting Date</th>
              <th>Experience Level</th>
              <th>Employment Type</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job._id}>
                <td>{job.companyName}</td>
                <td>
                  {job.companyLogo && (
                    <img
                      src={`${process.env.REACT_APP_API_URL}${job.companyLogo}`} // Ensure this URL is correct
                      alt={`${job.companyName} Logo`}
                      style={{ width: '50px', height: '50px' }} // Adjust size as needed
                    />
                  )}
                </td>
                <td>{job.jobTitle}</td>
                <td>{job.minPrice}</td>
                <td>{job.maxPrice}</td>
                <td>{job.salaryType}</td>
                <td>{job.jobLocation}</td>
                <td>{new Date(job.postingDate).toLocaleDateString()}</td>
                <td>{job.experienceLevel}</td>
                <td>{job.employmentType}</td>
                <td>{job.description}</td>
                <td>
                  <button onClick={() => handleUpdate(job)}>Update</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewJobs;
