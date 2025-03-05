import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ApplicationForm.css'; // Import the CSS file
import { useNavigate, useLocation } from 'react-router-dom';
import logo from "./img/logo/job.jpg"; // Path to your logo image

const ApplicationForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const job = location.state?.job || {}; // Get the job details from state or default to an empty object
  const [userdata, setUserdata] = useState({});

  // Initialize formData with empty values
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    birthDate: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    email: '', // This will be populated from sessionStorage
    phone: '',
    linkedInProfile: '',
    companyName: job.companyName || '', // Use the job's company name
    jobId: job._id || '', // Include the job ID
    companyId: job.companyId || '' // Include the company ID
  });

  const [resume, setResume] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state
  const minDate = "2000-01-01";
  const maxDate = "2003-12-31";

  // Get user data and set email
  useEffect(() => {
    const getUser = async () => {
      try {
        // First try to get Google login user data
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/login/success`, { withCredentials: true });
        
        // Get email either from Google login response or session storage
        let userEmail;
        if (response.data.user) {
          setUserdata(response.data.user);
          userEmail = response.data.user.email;
        } else {
          // If no Google user, get email from session storage
          userEmail = sessionStorage.getItem('email');
        }

        if (userEmail) {
          console.log("User email in ApplicationForm:", userEmail);

          // Update formData with the email
          setFormData(prev => ({
            ...prev,
            email: userEmail
          }));

          // Fetch profile data using the email
          try {
            const profileResponse = await axios.get(`${process.env.REACT_APP_API_URL}/profile?email=${userEmail}`);
            console.log("Profile Response:", profileResponse.data);
            
            if (profileResponse.data.profile) {
              const profileData = profileResponse.data.profile;
              console.log("Found matching profile:", profileData);
              
              // Update form data with profile information
              setFormData(prev => ({
                ...prev,
                firstName: profileData.firstName || '',
                middleName: profileData.middleName || '',
                lastName: profileData.lastName || '',
                phone: profileData.phoneNumber || '',
                linkedInProfile: profileData.linkedinProfile || '',
                city: profileData.city || '',
                state: profileData.state || '',
                email: userEmail // Keep the email from the session
              }));
            } else {
              console.log("No matching profile found for email:", userEmail);
            }
          } catch (profileError) {
            console.error("Error fetching profile data:", profileError);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // If Google login fetch fails, try getting email from session storage
        const userEmail = sessionStorage.getItem('email');
        if (userEmail) {
          // Repeat the profile fetching logic here
          try {
            const profileResponse = await axios.get(`${process.env.REACT_APP_API_URL}/profile?email=${userEmail}`);
            if (profileResponse.data.profile) {
              const profileData = profileResponse.data.profile;
              setFormData(prev => ({
                ...prev,
                firstName: profileData.firstName || '',
                middleName: profileData.middleName || '',
                lastName: profileData.lastName || '',
                phone: profileData.phoneNumber || '',
                linkedInProfile: profileData.linkedinProfile || '',
                city: profileData.city || '',
                state: profileData.state || '',
                email: userEmail
              }));
            }
          } catch (profileError) {
            console.error("Error fetching profile data:", profileError);
          }
        }
      }
    };

    getUser();
  }, []);

  // Log company and job IDs
  useEffect(() => {
    console.log('Company ID:', formData.companyId);
    console.log('Job ID:', formData.jobId);
  }, [formData.companyId, formData.jobId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== 'application/pdf') {
      setErrors((prevErrors) => ({
        ...prevErrors,
        resume: 'Only PDF files are allowed.',
      }));
    } else {
      setResume(file);
      setErrors((prevErrors) => ({
        ...prevErrors,
        resume: '',
      }));
    }
  };

  const validateField = (name, value) => {
    let error = '';
    const birthYear = new Date(formData.birthDate).getFullYear();

    switch (name) {
      case 'firstName':
        if (!value) error = 'First Name is required.';
        break;
      case 'lastName':
        if (!value) error = 'Last Name is required.';
        break;
      case 'birthDate':
        if (!value) {
          error = 'Birth Date is required.';
        } else if (birthYear < 2000 || birthYear > 2003) {
          error = 'Birth Date must be between 2000 and 2003.';
        }
        break;
      case 'street':
        if (!value) error = 'Street is required.';
        break;
      case 'city':
        if (!value) error = 'City is required.';
        break;
      case 'state':
        if (!value) error = 'State is required.';
        break;
      case 'zipCode':
        if (!value) error = 'Zip Code is required.';
        break;
      case 'phone':
        if (!value) {
          error = 'Phone number is required.';
        } else if (!/^\+\d{1,3}\d{10}$/.test(value)) {
          error = 'Phone number must include country code and be valid.';
        }
        break;
      case 'resume':
        if (!resume) {
          error = 'Resume is required.';
        } else if (resume.type !== 'application/pdf') {
          error = 'Only PDF files are allowed.';
        }
        break;
      default:
        break;
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
    return error === '';
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent form from submitting if already submitting
    setIsSubmitting(true); // Set submitting state to true

    const formIsValid = Object.keys(formData).every((key) =>
      validateField(key, formData[key])
    );
    if (!formIsValid) {
      setIsSubmitting(false); // Reset submitting state if form is not valid
      return;
    }

    const data = new FormData();
    for (let key in formData) {
      data.append(key, formData[key]);
    }
    if (resume) {
      data.append('resume', resume);
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/apply`, data);
      alert('Application submitted successfully!');
      navigate('/dashboard'); // Redirect to dashboard or another page
    } catch (error) {
      console.error('Error submitting application:', error);
      setIsSubmitting(false); // Reset submitting state on error
    }
  };

  const isDisabled = (fieldName) => {
    // Return false for all fields to make them always editable
    return false;
  };

  return (
    <div>
      <header className='header'>
        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li onClick={() => navigate('/dashboard')} className='nav-link'>Back</li>
          </ul>
        </nav>
      </header>

      <form onSubmit={handleSubmit} className='application-form'>
        <h2>Job Application Form for {job.jobTitle} at {job.companyName}</h2>

        <div className="form-group">
          <label>First Name</label>
          <input
            id='o'
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="First Name"
            required
          />
          {errors.firstName && <span className="error">{errors.firstName}</span>}
        </div>

        <div className="form-group">
          <label>Middle Name</label>
          <input
            id='p'
            type="text"
            name="middleName"
            value={formData.middleName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Middle Name"
          />
        </div>

        <div className="form-group">
          <label>Last Name</label>
          <input
            id='q'
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Last Name"
            required
          />
          {errors.lastName && <span className="error">{errors.lastName}</span>}
        </div>

        <div className="form-group">
          <label>Birth Date</label>
          <input
            id="birth-date-input"
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            onBlur={handleBlur}
            min={minDate}
            max={maxDate}
            required
          />
          {errors.birthDate && <span className="error">{errors.birthDate}</span>}
        </div>

        <div className="form-group">
          <label>Street</label>
          <input
            id="street-input"
            type="text"
            name="street"
            value={formData.street}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Street"
            required
          />
          {errors.street && <span className="error">{errors.street}</span>}
        </div>

        <div className="form-group">
          <label>City</label>
          <input
            id='t'
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="City"
            required
          />
          {errors.city && <span className="error">{errors.city}</span>}
        </div>

        <div className="form-group">
          <label>State</label>
          <input
            id='u'
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="State"
            required
          />
          {errors.state && <span className="error">{errors.state}</span>}
        </div>

        <div className="form-group">
          <label>Zip Code</label>
          <input
            id="zipcode-input"
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Zip Code"
            required
          />
          {errors.zipCode && <span className="error">{errors.zipCode}</span>}
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            id="email-input"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Email"
            required
            disabled={true}
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            id='x'
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Phone"
            required
          />
          {errors.phone && <span className="error">{errors.phone}</span>}
        </div>

        <div className="form-group">
          <label>LinkedIn Profile</label>
          <input
            id='y'
            type="url"
            name="linkedInProfile"
            value={formData.linkedInProfile}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="LinkedIn Profile"
          />
        </div>

        <div className="form-group">
          <label>Resume (PDF only)</label>
          <input
            id="resume-upload"
            type="file"
            name="resume"
            accept="application/pdf"
            onChange={handleFileChange}
            required
          />
          {errors.resume && <span className="error">{errors.resume}</span>}
        </div>

        <div className="form-group">
          <button 
            type="submit" 
            id="submit-application"
            disabled={isSubmitting || !resume || Object.keys(errors).some((key) => errors[key])}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm;
