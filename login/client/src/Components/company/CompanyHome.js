import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CompanyHome.css';
import logo from "../img/logo/job.jpg";

const CompanyHome = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Check if the user is logged in
    const user = sessionStorage.getItem('user');
    const email = sessionStorage.getItem('email');
    
    console.log('Session Storage User Data:', JSON.parse(user));
    
    
    if (!user) {
      navigate('/login');
    } else {
      // Fetch user name from backend using email
      fetchUserName(email);
    }
  }, [navigate]);

  const fetchUserName = async (email) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/company/profile?email=${email}`);
      if (response.data.name) {
        setUserName(response.data.name);
      }
    } catch (error) {
      console.error('Error fetching user name:', error);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('email');
    navigate('/login');
  }

  return (
    <div className='company-home'>
      <header className='header'>
        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li>
              <NavLink to="/jobposting" className='course-nav-link'>Post Job</NavLink>
            </li>
            <li>
              <NavLink to="/viewjobs" className='course-nav-link'>View Posted Job</NavLink>
            </li>
            <li>
              <NavLink to="/applicationd" className='course-nav-link'>Applications</NavLink>
            </li>
            <li>
              <NavLink to="/highscorers" className='course-nav-link'>Eligible Candidates</NavLink>
            </li>
            <li>
              <NavLink to="/selectedcandidate" className='course-nav-link'>Selected Candidates</NavLink>
            </li>
            <li>
              <NavLink to="/changepassword" className='course-nav-link'>Change Password</NavLink>
            </li>
            <li onClick={logout}>
              <span className='course-nav-link' style={{ cursor: 'pointer' }}>Logout</span>
            </li>
          </ul>
        </nav>
      </header>
      <main className='pp1'>
        <div className='welcome-message'>
          <h1>Welcome to Company Home</h1>
          <h2 className='user-name'>{userName}</h2>
        </div>
      </main>
    </div>
  );
}

export default CompanyHome;
