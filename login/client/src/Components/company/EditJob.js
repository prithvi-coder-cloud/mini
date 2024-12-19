import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './EditJob.css';

const EditJob = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const jobId = location.state?.jobId; // Get job ID from navigation state, handle possible undefined

  const [formData, setFormData] = useState({
    companyName: '',
    companyLogo: '',
    jobTitle: '',
    minPrice: '',
    maxPrice: '',
    salaryType: '',
    jobLocation: '',
    postingDate: '',
    experienceLevel: '',
    employmentType: '',
    description: '',
  });

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!jobId) {
      setMessage('No job ID provided');
      console.error('No job ID provided');
      return;
    }

    // Fetch job details by ID
    const fetchJob = async () => {
      try {
        const response = await axios.get(`http://localhost:6005/jobbs/${jobId}`);
        const job = response.data;
        setFormData({
          companyName: job.companyName,
          companyLogo: job.companyLogo,
          jobTitle: job.jobTitle,
          minPrice: job.minPrice,
          maxPrice: job.maxPrice,
          salaryType: job.salaryType,
          jobLocation: job.jobLocation,
          postingDate: job.postingDate ? new Date(job.postingDate).toISOString().substr(0, 10) : '',
          experienceLevel: job.experienceLevel,
          employmentType: job.employmentType,
          description: job.description,
        });
      } catch (error) {
        console.error('Error fetching job:', error);
        setMessage('Error fetching job');
      }
    };

    fetchJob();
  }, [jobId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobId) {
      setMessage('No job ID provided');
      console.error('No job ID provided');
      return;
    }

    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    if (file) {
      data.append('companyLogo', file);
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/jobbs/${jobId}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        setMessage('Job updated successfully!');
        console.log('Job updated successfully!');
        setTimeout(() => {
          setMessage('');
          navigate('/viewjobs'); // Redirect to the job listings page
        }, 2000);
      } else {
        setMessage('Error updating job');
        console.error('Error updating job:', response);
      }
    } catch (error) {
      setMessage('Error updating job');
      console.error('Error updating job:', error);
    }
  };

  return (
    <div className="edit-job-container">
      <h2>Edit Job</h2>
      {message && <div className="message-popup">{message}</div>}
      {jobId ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Company Name</label>
            <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Company Logo</label>
            {formData.companyLogo && (
              <img
                src={`http://localhost:6005${formData.companyLogo}`} // Ensure this URL is correct
                alt="Company Logo"
                style={{ width: '50px', height: '50px' }} // Adjust size as needed
              />
            )}
            <input type="file" name="companyLogo" onChange={handleFileChange} />
          </div>
          <div className="form-group">
            <label>Job Title</label>
            <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Min Salary</label>
            <input type="number" name="minPrice" value={formData.minPrice} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Max Salary</label>
            <input type="number" name="maxPrice" value={formData.maxPrice} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Salary Type</label>
            <input type="text" name="salaryType" value={formData.salaryType} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Job Location</label>
            <input type="text" name="jobLocation" value={formData.jobLocation} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Posting Date</label>
            <input type="date" name="postingDate" value={formData.postingDate} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Experience Level</label>
            <input type="text" name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Employment Type</label>
            <input type="text" name="employmentType" value={formData.employmentType} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required />
          </div>
          <button type="submit">Update Job</button>
        </form>
      ) : (
        <div>No job selected for editing.</div>
      )}
    </div>
  );
};

export default EditJob;
