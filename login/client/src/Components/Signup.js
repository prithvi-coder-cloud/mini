import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './signup.css';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setCPassword] = useState('');
  const [dob, setDob] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const history = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*_])(?=.*\d)[A-Za-z\d!@#$%^&*_]{8,}$/;
  const nameRegex = /^[A-Za-z]+$/;

  useEffect(() => {
    const newErrors = {};
    if (touched.name && !nameRegex.test(name)) {
      newErrors.name = 'Name must contain only alphabets';
    }
    if (touched.email && !emailRegex.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    if (touched.password && !passwordRegex.test(password)) {
      newErrors.password = 'Password must be at least 8 characters long, include at least 1 uppercase letter, 1 number, and 1 special character';
    }
    if (touched.cpassword && password !== cpassword) {
      newErrors.cpassword = 'Passwords do not match';
    }
    setErrors(newErrors);
  }, [name, email, password, cpassword, touched]);

  const handleBlur = (field) => () => {
    setTouched({ ...touched, [field]: true });
  };

  // Set max date for the Date of Birth input field to the last day of 2005 (December 31, 2005)
  const maxDob = new Date();
  maxDob.setFullYear(2005, 11, 31); // Set to December 31, 2005 (month is 0-indexed, 11 represents December)
  const maxDobString = maxDob.toISOString().split('T')[0]; // Format as YYYY-MM-DD

  async function submit(e) {
    e.preventDefault();

    // Frontend validation
    if (Object.keys(errors).length > 0) {
      alert('Please fix the errors before submitting');
      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/signup`, {
        name,
        email,
        password,
        cpassword,
        dob,
        linkedIn,
      });

      if (res.data === 'exist') {
        alert('User already exists');
      } else if (res.data === 'passwordmismatch') {
        alert('Passwords do not match');
      } else if (res.data === 'notexist') {
        alert('Signup successful');
        history('/login'); // Redirect to login page after successful signup
      } else {
        alert('Something went wrong');
      }
    } catch (e) {
      console.log(e);
      alert('An error occurred during signup');
    }
  }

  return (
    <div className='login-page'>
      <div className='form-cc'>
        <h2>Signup</h2>
        <form className='form' onSubmit={submit}>
          <div className='form-group'>
            <label>Name</label>
            <input
              type='text'
              name='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleBlur('name')}
              className={`input ${errors.name && touched.name ? 'invalid' : ''}`}
              placeholder='Enter your full name'
              required
            />
            {errors.name && touched.name && <span className='error'>{errors.name}</span>}
          </div>

          <div className='form-group'>
            <label>Email</label>
            <input
              type='email'
              name='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleBlur('email')}
              className={`input ${errors.email && touched.email ? 'invalid' : ''}`}
              placeholder='Enter your email'
              required
            />
            {errors.email && touched.email && <span className='error'>{errors.email}</span>}
          </div>

          <div className='form-group'>
            <label>Password</label>
            <div className='input-wrapper'>
              <input
                type={showPassword ? 'text' : 'password'}
                name='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={handleBlur('password')}
                className={`input ${errors.password && touched.password ? 'invalid' : ''}`}
                placeholder='Enter your password'
                required
              />
              <span className='toggle-icon' onClick={togglePasswordVisibility}>
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            </div>
            {errors.password && touched.password && <span className='error'>{errors.password}</span>}
          </div>

          <div className='form-group'>
            <label>Confirm Password</label>
            <div className='input-wrapper'>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name='cpassword'
                value={cpassword}
                onChange={(e) => setCPassword(e.target.value)}
                onBlur={handleBlur('cpassword')}
                className={`input ${errors.cpassword && touched.cpassword ? 'invalid' : ''}`}
                placeholder='Confirm your password'
                required
              />
              <span className='toggle-icon' onClick={toggleConfirmPasswordVisibility}>
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
              </span>
            </div>
            {errors.cpassword && touched.cpassword && <span className='error'>{errors.cpassword}</span>}
          </div>

          <div className='form-group'>
            <label>Date of Birth</label>
            <input
              type='date'
              name='dob'
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              onBlur={handleBlur('dob')}
              className={`input ${errors.dob && touched.dob ? 'invalid' : ''}`}
              placeholder='Enter your date of birth'
              required
              max={maxDobString} // Set max date to December 31, 2005
            />
            {errors.dob && touched.dob && <span className='error'>{errors.dob}</span>}
          </div>

          <div className='form-group'>
            <label>LinkedIn Profile</label>
            <input
              type='url'
              name='linkedIn'
              value={linkedIn}
              onChange={(e) => setLinkedIn(e.target.value)}
              onBlur={handleBlur('linkedIn')}
              className={`input ${errors.linkedIn && touched.linkedIn ? 'invalid' : ''}`}
              placeholder='Enter your LinkedIn profile link'
              required
            />
            {errors.linkedIn && touched.linkedIn && <span className='error'>{errors.linkedIn}</span>}
          </div>

          <button type='submit' className='btn'>
            Signup
          </button>

          <p className='message'>
            Already registered? <Link to='/login'>Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
