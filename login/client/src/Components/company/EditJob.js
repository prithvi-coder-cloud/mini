import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './EditJob.css';
import logo from "../img/logo/job.jpg";

const EditJob = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const jobData = location.state?.jobData;

  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    companyLogo: null,
    minPrice: '',
    maxPrice: '',
    salaryType: '',
    jobLocation: '',
    expireDate: '',
    expireTime: '',
    experienceLevel: '',
    employmentType: '',
    description: '',
    status: 1
  });

  useEffect(() => {
    if (jobData) {
      // Convert expiry date to input format
      const expireDate = new Date(jobData.expireDate);
      const dateString = expireDate.toISOString().split('T')[0];
      const timeString = expireDate.toTimeString().slice(0, 5);

      setFormData({
        companyName: jobData.companyName,
        jobTitle: jobData.jobTitle,
        minPrice: jobData.minPrice,
        maxPrice: jobData.maxPrice,
        salaryType: jobData.salaryType,
        jobLocation: jobData.jobLocation,
        expireDate: dateString,
        expireTime: timeString,
        experienceLevel: jobData.experienceLevel,
        employmentType: jobData.employmentType,
        description: jobData.description,
        status: jobData.status
      });
    }
  }, [jobData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const jobId = location.state?.jobId;
      if (!jobId) {
        throw new Error('Job ID not found');
      }

      const updatedData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'expireDate') {
          const dateStr = formData.expireDate;
          const timeStr = formData.expireTime || '23:59';
          const combinedDateTime = new Date(`${dateStr}T${timeStr}`);
          updatedData.append('expireDate', combinedDateTime.toISOString());
        } else if (key !== 'expireTime') {
          updatedData.append(key, formData[key]);
        }
      });

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/jobs/${jobId}`,
        updatedData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        alert('Job updated successfully!');
        navigate('/viewjobs');
      }
    } catch (error) {
      console.error('Error updating job:', error);
      alert('Failed to update job: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'companyLogo' && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (!jobData) {
    return <div>No job data found</div>;
  }

  return (
    <div>
       <header className="header">
        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li onClick={() => navigate('/viewjobs')}>
              <span className="course-nav-link">Back</span>
            </li>
          </ul>
        </nav>
      </header>
    <div className="edit-job-container">
     

      <form onSubmit={handleSubmit} className="edit-job-form">
        <h2>Edit Job</h2>

        <div className="form-group">
          <label>Company Name</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Job Title</label>
          <input
            type="text"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group file-input">
          <label>Company Logo</label>
          <input
            type="file"
            name="companyLogo"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Minimum Salary</label>
          <input
            type="number"
            name="minPrice"
            value={formData.minPrice}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Maximum Salary</label>
          <input
            type="number"
            name="maxPrice"
            value={formData.maxPrice}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Salary Type</label>
          <select
            name="salaryType"
            value={formData.salaryType}
            onChange={handleChange}
            required
          >
            <option value="">Select Salary Type</option>
            <option value="hourly">Hourly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="jobLocation"
            value={formData.jobLocation}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Expiry Date</label>
          <input
            type="date"
            name="expireDate"
            value={formData.expireDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Expiry Time</label>
          <input
            type="time"
            name="expireTime"
            value={formData.expireTime}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Experience Level</label>
          <select
            name="experienceLevel"
            value={formData.experienceLevel}
            onChange={handleChange}
            required
          >
            <option value="">Select Experience Level</option>
            <option value="entry">Entry Level</option>
            <option value="intermediate">Intermediate</option>
            <option value="senior">Senior</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        <div className="form-group">
          <label>Employment Type</label>
          <select
            name="employmentType"
            value={formData.employmentType}
            onChange={handleChange}
            required
          >
            <option value="">Select Employment Type</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Update Job</button>
      </form>
    </div>
    </div>

  );
};

export default EditJob;
