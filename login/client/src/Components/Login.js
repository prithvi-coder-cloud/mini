import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './login.css';
import logo from './img/logo/job.jpg'; // Path to your logo image
import 'bootstrap/dist/css/bootstrap.css'


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any existing session data on login page load
    sessionStorage.clear();
  }, []);

  const back = () => {
    navigate('/');
  };

  const loginWithGoogle = () => {
    window.open(`${process.env.REACT_APP_API_URL}/auth/google/callback`, '_self');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/login`, {
        email,
        password
      });

      if (response.data.success) {
        const userData = {
          ...response.data.user,
          displayName: response.data.user.name,
          email: email,
          _id: response.data.user._id,
          role: response.data.user.role
        };

        // Store user data and token
        sessionStorage.setItem('user', JSON.stringify(userData));
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('email', email);

        // Set default authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        // Navigate based on role
        switch (userData.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'company':
            navigate('/companyhome');
            break;
          case 'course provider':
            navigate('/course');
            break;
          default:
            navigate('/');
        }
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Invalid credentials');
    }
  };

  // Add logging for Google login success
  useEffect(() => {
    const checkGoogleLogin = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/login/success`, { 
          withCredentials: true 
        });
        if (response.data.user) {
          console.log('Google login user ObjectId:', response.data.user._id);
        }
      } catch (error) {
        console.error('Error checking Google login:', error);
      }
    };
    checkGoogleLogin();
  }, []);

  return (
    <div className='login-page'>
      <header className='head1'>
        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li onClick={back}>
              <a className='course-nav-link' style={{ cursor: 'pointer' }}>Back</a>
            </li>
          </ul>
        </nav>
      </header>
      
      <div className='welcome-text'>
        <h2>Welcome to Job Board</h2>
        <p>If you are a new user please signup</p>
        <Link to="/signup" className="signup-button">Sign Up</Link>
      </div>

      
      <div className='form'>
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form className='login-form' onSubmit={submit}>
          <label htmlFor='email'>Email</label>
          <input
            type='text'
            name='email'
            id='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='abc@gmail.com'
            required
          />
          <label htmlFor='password'>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              name='password'
              id='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='password'
              required
            />
            <span
              onClick={togglePasswordVisibility}
              style={{ position: 'absolute', right: '10px', top: '10px', cursor: 'pointer' }}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </span>
          </div>
          <button  id='login' type='submit'>Login</button>
          <p className='message'>
            Not registered? <Link to='/signup'>Create an account</Link>
          </p>
        </form>
        <button className='login-with-google-btn' onClick={loginWithGoogle}>
          Sign in with Google
        </button>
        <Link to='/forgotpass' className='for'>Forgot Password</Link>
      </div>
    </div>
  );
};

export default Login;






