import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logo from "./img/logo/job.jpg"; // Path to your logo image
import { useNavigate } from 'react-router-dom';
import "./JobPostingForm.css";

const JobPostingForm = () => {
  const navigate = useNavigate();

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
  });

  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  const companyId = JSON.parse(sessionStorage.getItem('user'))?._id;
  
  useEffect(() => {
    if (!companyId) {
      navigate('/login');
    }
  }, [companyId, navigate]);

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'companyName':
      case 'jobTitle':
      case 'jobLocation':
      case 'description':
        if (!value.trim()) error = `${name} is required`;
        break;
      case 'minPrice':
      case 'maxPrice':
        if (!value) error = `${name} is required`;
        if (isNaN(value) || value <= 0) error = `${name} must be a positive number`;
        if (name === 'maxPrice' && parseInt(value) <= parseInt(formData.minPrice)) {
          error = 'Maximum price must be greater than minimum price';
        }
        break;
      case 'expireDate':
      case 'expireTime':
        if (!value) error = `${name === 'expireDate' ? 'Expiry date' : 'Expiry time'} is required`;
        if (name === 'expireDate') {
          const dateTime = new Date(`${value}T${formData.expireTime || '23:59'}`);
          if (dateTime <= new Date()) {
            error = 'Expiry date and time must be in the future';
          }
        }
        break;
      case 'companyLogo':
        if (!value) error = 'Company logo is required';
        break;
      case 'salaryType':
        if (!['hourly', 'monthly', 'yearly'].includes(value)) {
          error = 'Please select a valid salary type';
        }
        break;
      case 'employmentType':
        if (!['full-time', 'part-time', 'contract', 'internship'].includes(value)) {
          error = 'Please select a valid employment type';
        }
        break;
      case 'experienceLevel':
        if (!['entry', 'intermediate', 'senior', 'expert'].includes(value)) {
          error = 'Please select a valid experience level';
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'companyLogo') {
      if (files[0] && files[0].type.startsWith('image/')) {
        setFormData(prev => ({ ...prev, [name]: files[0] }));
        setErrors(prev => ({ ...prev, [name]: '' }));
      } else {
        setErrors(prev => ({ ...prev, [name]: 'Please upload a valid image file' }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate form data
      if (!formData.companyName || !formData.jobTitle || !formData.companyLogo ||
          !formData.minPrice || !formData.maxPrice || !formData.salaryType ||
          !formData.jobLocation || !formData.expireDate || !formData.experienceLevel ||
          !formData.employmentType || !formData.description) {
        setAlert({
          show: true,
          message: 'Please fill in all required fields',
          type: 'error'
        });
        return;
      }

      // Create FormData object
      const jobData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'companyLogo') {
          jobData.append('companyLogo', formData.companyLogo);
        } else if (key === 'expireDate') {
          const dateStr = formData.expireDate;
          const timeStr = formData.expireTime || '23:59';
          const combinedDateTime = new Date(`${dateStr}T${timeStr}`);
          jobData.append('expireDate', combinedDateTime.toISOString());
        } else if (key !== 'expireTime') {
          jobData.append(key, formData[key]);
        }
      });

      // Add companyId
      jobData.append('companyId', companyId);

      // Make API request
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/jobs`,
        jobData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setAlert({
          show: true,
          message: 'Job posted successfully!',
          type: 'success'
        });
        setTimeout(() => navigate('/companyhome'), 2000);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error posting job:', error);
      setAlert({
        show: true,
        message: error.response?.data?.message || 'Error posting job',
        type: 'error'
      });
    }
  };

  return (
    <div>
       <header className='header'>
        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li onClick={() => navigate('/companyhome')}>
              <span className='course-nav-link'>Back</span>
            </li>
          </ul>
        </nav>
      </header>
    <div className="job-posting-form-page">
     
      <form onSubmit={handleSubmit} className="job-posting-form">
        <h2>Post a Job</h2>

        <div className="form-group">
          <input
            type="text"
            name="companyName"
            placeholder="Company Name"
            value={formData.companyName}
            onChange={handleChange}
            required
          />
          {errors.companyName && <div className="error">{errors.companyName}</div>}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="jobTitle"
            placeholder="Job Title"
            value={formData.jobTitle}
            onChange={handleChange}
            required
          />
          {errors.jobTitle && <div className="error">{errors.jobTitle}</div>}
        </div>

        <div className="form-group">
          <input
            type="file"
            name="companyLogo"
            accept="image/*"
            onChange={handleChange}
            required
          />
          {errors.companyLogo && <div className="error">{errors.companyLogo}</div>}
        </div>

        <div className="form-group">
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
          {errors.salaryType && <div className="error">{errors.salaryType}</div>}
        </div>

        <div className="form-group">
          <input
            type="number"
            name="minPrice"
            placeholder="Minimum Salary"
            value={formData.minPrice}
            onChange={handleChange}
            required
          />
          {errors.minPrice && <div className="error">{errors.minPrice}</div>}
        </div>

        <div className="form-group">
          <input
            type="number"
            name="maxPrice"
            placeholder="Maximum Salary"
            value={formData.maxPrice}
            onChange={handleChange}
            required
          />
          {errors.maxPrice && <div className="error">{errors.maxPrice}</div>}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="jobLocation"
            placeholder="Job Location"
            value={formData.jobLocation}
            onChange={handleChange}
            required
          />
          {errors.jobLocation && <div className="error">{errors.jobLocation}</div>}
        </div>

        <div className="form-group date-time-group">
          <div className="date-input">
            <label>Expiry Date:</label>
            <input
              type="date"
              name="expireDate"
              value={formData.expireDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
            {errors.expireDate && <div className="error">{errors.expireDate}</div>}
          </div>
          
          <div className="time-input">
            <label>Expiry Time:</label>
            <input
              type="time"
              name="expireTime"
              value={formData.expireTime}
              onChange={handleChange}
              required
            />
            {errors.expireTime && <div className="error">{errors.expireTime}</div>}
          </div>
        </div>

        <div className="form-group">
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
          {errors.experienceLevel && <div className="error">{errors.experienceLevel}</div>}
        </div>

        <div className="form-group">
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
          {errors.employmentType && <div className="error">{errors.employmentType}</div>}
        </div>

        <div className="form-group">
          <textarea
            name="description"
            placeholder="Job Description"
            value={formData.description}
            onChange={handleChange}
            required
          />
          {errors.description && <div className="error">{errors.description}</div>}
        </div>

        <button type="submit">Post Job</button>

        {alert.show && (
          <div className={`alert ${alert.type}`}>
            {alert.message}
          </div>
        )}
      </form>
    </div>
    </div>

  );
};

export default JobPostingForm;
