import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css"; // Import CSS for styling
import logo from "./img/logo/job.jpg"; 
import Header from './Header';

const countryCodes = [
  { code: '+1', country: 'USA/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+91', country: 'India' },
  { code: '+61', country: 'Australia' },
  { code: '+86', country: 'China' },
  { code: '+81', country: 'Japan' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' },
  // Add more country codes as needed
];

const ProfilePage = () => {
  const [profile, setProfile] = useState(() => {
    // Initialize from sessionStorage if available
    const cachedProfile = sessionStorage.getItem('userProfile');
    if (cachedProfile) {
      return JSON.parse(cachedProfile);
    }
    return {
      firstName: "",
      middleName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      skills: "",
      linkedinProfile: "",
      city: "",
      state: "",
    };
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isEditing, setIsEditing] = useState(() => {
    const cachedProfile = sessionStorage.getItem('userProfile');
    return !cachedProfile; // Start in edit mode only if no profile exists
  });
  const navigate = useNavigate();

  // Add resume state
  const [resume, setResume] = useState(null);
  const [resumeError, setResumeError] = useState('');

  useEffect(() => {
    const email = sessionStorage.getItem("email");
    if (email) {
      setProfile(prevProfile => ({ 
        ...prevProfile, 
        email: email
      }));
      getUserProfile(email);
    }
  }, []);

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'firstName':
        if (!value || !value.trim()) {
          error = 'First Name is required';
        }
        break;
      case 'lastName':
        if (!value || !value.trim()) {
          error = 'Last Name is required';
        }
        break;
      case 'phoneNumber':
        if (!value) {
          error = 'Phone Number is required';
        } else if (!value.startsWith('+')) {
          error = 'Phone number must start with country code (+)';
        } else {
          const phoneRegex = /^\+\d{2,3}\d{10}$/;
          if (!phoneRegex.test(value)) {
            error = 'Please enter a valid phone number with country code (e.g., +911234567890)';
          }
        }
        break;
      case 'skills':
        if (!value || !value.trim()) {
          error = 'Skills are required';
        }
        break;
      case 'linkedinProfile':
        if (!value) {
          error = 'LinkedIn Profile is required';
        } else if (!value.includes('linkedin.com')) {
          error = 'Please enter a valid LinkedIn URL';
        } else if (!value.startsWith('http://') && !value.startsWith('https://')) {
          error = 'URL must start with http:// or https://';
        }
        break;
      case 'city':
        if (!value || !value.trim()) {
          error = 'City is required';
        }
        break;
      case 'state':
        if (!value || !value.trim()) {
          error = 'State is required';
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, profile[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    
    // Validate immediately on change
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const getUserProfile = async (email) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/profile?email=${email}`,
        { withCredentials: true }
      );
      
      if (response.data.profile) {
        setProfile(response.data.profile);
        setIsEditing(false); // Set to view mode when profile exists
        sessionStorage.setItem('userProfile', JSON.stringify(response.data.profile));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      const cachedProfile = sessionStorage.getItem('userProfile');
      if (cachedProfile) {
        setProfile(JSON.parse(cachedProfile));
        setIsEditing(false);
      }
    }
  };

  // Add this function to handle resume upload
  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        if (file.size <= 5 * 1024 * 1024) { // 5MB limit
          setResume(file);
          setResumeError('');
        } else {
          setResumeError('File size should be less than 5MB');
        }
      } else {
        setResumeError('Please upload only PDF files');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Keep existing validation code
    let hasErrors = false;
    Object.keys(profile).forEach(field => {
      if (field !== 'resume') {
        const error = validateField(field, profile[field]);
        if (error) hasErrors = true;
        setErrors(prev => ({ ...prev, [field]: error }));
      }
    });

    if (hasErrors) {
      alert('Please fix all errors before submitting');
      return;
    }

    try {
      const formData = new FormData();
      
      // Add all profile fields
      formData.append('firstName', profile.firstName);
      formData.append('lastName', profile.lastName);
      formData.append('phoneNumber', profile.phoneNumber);
      formData.append('email', profile.email);
      formData.append('skills', profile.skills);
      formData.append('linkedinProfile', profile.linkedinProfile);
      formData.append('city', profile.city);
      formData.append('state', profile.state);
      if (profile.middleName) {
        formData.append('middleName', profile.middleName);
      }

      // Add resume if selected
      if (resume) {
        formData.append('resume', resume);
      }

      // Log formData for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/profile`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setProfile(response.data.profile);
        setIsEditing(false);
        setResume(null);
        sessionStorage.setItem('userProfile', JSON.stringify(response.data.profile));
        alert('Profile saved successfully');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving profile. Please try again.');
    }
  };

  const handleEdit = () => {
    setIsEditing(true); // Switch to form mode
  };

  const handleBack = () => {
    // Get user data from sessionStorage
    const userData = JSON.parse(sessionStorage.getItem('user'));
    
    if (userData) {
      // Check user role and login type
      if (userData.googleId) {
        // Google login user
        navigate('/');
      } else if (userData.role === 'admin') {
        navigate('/admin');
      } else if (userData.role === 'company') {
        navigate('/companyhome');
      } else if (userData.role === 'course provider') {
        navigate('/course');
      } else {
        // Regular user
        navigate('/Home1');
      }
    } else {
      // Fallback to home page if no user data
      navigate('/');
    }
  };

  return (
    <div>
      <Header/>
      <br></br><br></br><br></br><br></br>
      <div className="profile-container">
        {isEditing ? (
          <>
            <h2>Update Profile</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>First Name:</label>
                <input
                  type="text"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('firstName')}
                  required
                />
                {errors.firstName && 
                  <span className="error-message">{errors.firstName}</span>}
              </div>
              <div className="form-group">
                <label>Middle Name:</label>
                <input
                  type="text"
                  name="middleName"
                  value={profile.middleName}
                  onChange={(e) => setProfile({ ...profile, middleName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Last Name:</label>
                <input
                  type="text"
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('lastName')}
                  required
                />
                {errors.lastName && 
                  <span className="error-message">{errors.lastName}</span>}
              </div>
              <div className="form-group">
                <label>Phone Number:</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={profile.phoneNumber}
                  onChange={handleChange}
                  onBlur={() => handleBlur('phoneNumber')}
                  placeholder="+911234567890"
                  required
                />
                {errors.phoneNumber && 
                  <span className="error-message">{errors.phoneNumber}</span>}
                <span className="hint">Format: +[country code][10-digit number] (e.g., +911234567890)</span>
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input type="email" value={profile.email} readOnly required />
              </div>
              <div className="form-group">
                <label>Skills:</label>
                <input
                  type="text"
                  name="skills"
                  value={profile.skills}
                  onChange={handleChange}
                  onBlur={() => handleBlur('skills')}
                  required
                />
                {errors.skills && 
                  <span className="error-message">{errors.skills}</span>}
              </div>
              <div className="form-group">
                <label>LinkedIn Profile:</label>
                <input
                  type="text"
                  name="linkedinProfile"
                  value={profile.linkedinProfile}
                  onChange={handleChange}
                  onBlur={() => handleBlur('linkedinProfile')}
                  placeholder="https://www.linkedin.com/in/yourprofile"
                  required
                />
                {errors.linkedinProfile && 
                  <span className="error-message">{errors.linkedinProfile}</span>}
              </div>
              <div className="form-group">
                <label>City:</label>
                <input
                  type="text"
                  name="city"
                  value={profile.city}
                  onChange={handleChange}
                  onBlur={() => handleBlur('city')}
                  required
                />
                {errors.city && 
                  <span className="error-message">{errors.city}</span>}
              </div>
              <div className="form-group">
                <label>State:</label>
                <input
                  type="text"
                  name="state"
                  value={profile.state}
                  onChange={handleChange}
                  onBlur={() => handleBlur('state')}
                  required
                />
                {errors.state && 
                  <span className="error-message">{errors.state}</span>}
              </div>
              <div className="form-group">
                <label>Resume (PDF only):</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeChange}
                  className="form-control"
                />
                {resumeError && <span className="error-message">{resumeError}</span>}
              </div>
              <button type="submit">Save Profile</button>
            </form>
          </>
        ) : (
          <>
            <h2>Profile Details</h2>
            <div className="profile-details">
              <p><strong>First Name:</strong> {profile.firstName}</p>
              <p><strong>Middle Name:</strong> {profile.middleName}</p>
              <p><strong>Last Name:</strong> {profile.lastName}</p>
              <p><strong>Phone Number:</strong> {profile.phoneNumber}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Skills:</strong> {profile.skills}</p>
              <p><strong>LinkedIn Profile:</strong> {profile.linkedinProfile}</p>
              <p><strong>City:</strong> {profile.city}</p>
              <p><strong>State:</strong> {profile.state}</p>
              {profile.resume && (
                <p>
                  <strong>Resume:</strong>{' '}
                  <a 
                    href={`${process.env.REACT_APP_API_URL}${profile.resume}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resume-link"
                  >
                    Download Resume
                  </a>
                </p>
              )}
            </div>
            <button onClick={handleEdit}>Edit Profile</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
