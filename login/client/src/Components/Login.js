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
  const navigate = useNavigate();

  const back = () => {
    navigate('/');
  };

  const loginWithGoogle = () => {
    window.open(`${process.env.REACT_APP_API_URL}/auth/google/callback`, '_self');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/login`, { email, password });

      if (res.data.user) {
        const userData = {
          ...res.data.user,
          displayName: res.data.user.name,
          email: email,
          _id: res.data.user._id
        };
        
        sessionStorage.setItem('user', JSON.stringify(userData));
        sessionStorage.setItem('email', email);

        // Navigate based on role
        if (res.data.user?.role === 'admin') {
          navigate('/admin');
        } else if (res.data.user?.role === 'company') {
          navigate('/companyhome');
        } else if (res.data.user?.role === 'course provider') {
          navigate('/course');
        } else {
          navigate('/');
        }
      } else if (res.data === 'notexist') {
        alert("User doesn't exist or incorrect credentials");
      }
    } catch (e) {
      console.error('Login error:', e);
      if (e.response && e.response.data) {
        alert(e.response.data.message || 'Something went wrong');
      } else {
        alert('Something went wrong');
      }
    }
  }

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
      <br></br>
      <h1 style={{ textAlign: 'center' }}>Login</h1>
      <div className='form'>
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
            <Link to='/signup'>Not registered? Create an account</Link>
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






