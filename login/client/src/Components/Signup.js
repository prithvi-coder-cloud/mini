import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './login.css';
import logo from './img/logo/job.jpg';
import 'bootstrap/dist/css/bootstrap.css'

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const back = () => {
    navigate('/');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/signup`, {
        email,
        password,
        name
      });

      if (res.data === "exist") {
        alert("User already exists");
      } else if (res.data === "notexist") {
        navigate("/login");
        alert("Account created successfully!");
      }
    } catch (e) {
      alert("Wrong details");
      console.log(e);
    }
  }

  return (
    <div className='signup-page'>
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

      <div className='welcome-text-signup'>
        <h2>Welcome Back!</h2>
        <p>Already have an account? Please login to continue</p>
        <Link to="/login" className="login-button">Login</Link>
      </div>

      <div className='signup-form-container'>
        <form className='signup-form' onSubmit={submit}>
          <label htmlFor='name'>Name</label>
          <input
            type='text'
            name='name'
            id='name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='Enter your name'
            required
          />
          
          <label htmlFor='email'>Email</label>
          <input
            type='email'
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
              placeholder='Enter password'
              required
            />
            <span
              onClick={togglePasswordVisibility}
              style={{ position: 'absolute', right: '10px', top: '10px', cursor: 'pointer' }}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </span>
          </div>

          <button type='submit'>Sign Up</button>
          {/* <p className='message'>
            <Link to='/login'>Already registered? Login</Link>
          </p> */}
        </form>
      </div>
    </div>
  );
};

export default Signup;
