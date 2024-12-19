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
    postingDate: '',
    experienceLevel: '',
    employmentType: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  // Retrieve company ID from sessionStorage
  const companyId = sessionStorage.getItem('user');
  
  useEffect(() => {
    // Log the company ID when the component mounts
    console.log("Company ID:", companyId);
  }, [companyId]);

  // Validate individual fields
  const validateField = (name, value) => {
    if (!value) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: `${name} is required` }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'companyLogo') {
      setFormData((prevData) => ({ ...prevData, companyLogo: files[0] }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
    validateField(name, value);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const fields = Object.keys(formData);
    for (const field of fields) {
      if (!formData[field] && field !== 'companyLogo') {
        newErrors[field] = `${field} is required`;
      }
    }
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return; // Prevent submission if there are errors

    // Append companyId to form data
    const jobData = new FormData();
    for (const key in formData) {
      jobData.append(key, formData[key]);
    }
    jobData.append('companyId', companyId); // Append the companyId

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/jobs`, jobData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAlert({ show: true, message: `Job posted successfully: ${response.data.jobTitle}`, type: 'success' });
    } catch (error) {
      setAlert({ show: true, message: `Error posting job: ${error.response?.data?.message || error.message}`, type: 'error' });
    }
  };

  const closeAlert = () => {
    setAlert({ show: false, message: '', type: '' });
  };

  return (
    <div className="job-posting-form-page">
      <header className='head'>
        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li onClick={() => navigate('/companyhome')}>
              <span className='nav-link' style={{ cursor: 'pointer' }}>Back</span>
            </li>
          </ul>
        </nav>
      </header>
      <form onSubmit={handleSubmit} className="job-posting-form">
        <h2>Post a Job</h2>

        <input
          type="text"
          name="companyName"
          placeholder="Company Name"
          value={formData.companyName}
          onChange={handleChange}
          onBlur={handleBlur}
          required
        />
        {errors.companyName && <div className="error">{errors.companyName}</div>}

        <input
          type="text"
          name="jobTitle"
          placeholder="Job Title"
          onChange={handleChange}
          onBlur={handleBlur}
          required
        />
        {errors.jobTitle && <div className="error">{errors.jobTitle}</div>}

        <input
          type="file"
          name="companyLogo"
          accept="image/*"
          onChange={handleChange}
          onBlur={handleBlur}
          required
        />
        {errors.companyLogo && <div className="error">{errors.companyLogo}</div>}

        <input
          type="number"
          name="minPrice"
          placeholder="Min Salary"
          onChange={handleChange}
          onBlur={handleBlur}
          required
        />
        {errors.minPrice && <div className="error">{errors.minPrice}</div>}

        <input
          type="number"
          name="maxPrice"
          placeholder="Max Salary"
          onChange={handleChange}
          onBlur={handleBlur}
          required
        />
        {errors.maxPrice && <div className="error">{errors.maxPrice}</div>}

        <input
          type="text"
          name="salaryType"
          placeholder="Salary Type"
          onChange={handleChange}
          onBlur={handleBlur}
          required
        />
        {errors.salaryType && <div className="error">{errors.salaryType}</div>}

        <input
          type="text"
          name="jobLocation"
          placeholder="Job Location"
          onChange={handleChange}
          onBlur={handleBlur}
          required
        />
        {errors.jobLocation && <div className="error">{errors.jobLocation}</div>}

        <input
          type="date"
          name="postingDate"
          onChange={handleChange}
          onBlur={handleBlur}
          required
        />
        {errors.postingDate && <div className="error">{errors.postingDate}</div>}

        <input
          type="text"
          name="experienceLevel"
          placeholder="Experience Level"
          onChange={handleChange}
          onBlur={handleBlur}
          required
        />
        {errors.experienceLevel && <div className="error">{errors.experienceLevel}</div>}

        <input
          type="text"
          name="employmentType"
          placeholder="Employment Type"
          onChange={handleChange}
          onBlur={handleBlur}
          required
        />
        {errors.employmentType && <div className="error">{errors.employmentType}</div>}

        <textarea
          name="description"
          placeholder="Job Description"
          onChange={handleChange}
          onBlur={handleBlur}
          required
        />
        {errors.description && <div className="error">{errors.description}</div>}

        <button type="submit">Post Job</button>
        {alert.show && (
          <div className={`alert ${alert.type}`}>
            {alert.message}
            <button onClick={closeAlert}>Close</button>
          </div>
        )}
      </form>
    </div>
  );
};

export default JobPostingForm;
