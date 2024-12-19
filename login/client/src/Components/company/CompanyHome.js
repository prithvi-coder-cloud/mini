import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './CompanyHome.css'; // Ensure to import the CSS file
import logo from "../img/logo/job.jpg"; // Path to your logo image

const CompanyHome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is logged in
    const user = sessionStorage.getItem('user'); // Use sessionStorage to check if the user is logged in
    if (!user) {
      navigate('/login'); // Redirect to login if not logged in
    }
  }, [navigate]);

  const logout = () => {
    // Clear user data on logout
    sessionStorage.removeItem('user');
    localStorage.removeItem('user'); // Optional, if you're using both

    navigate('/login'); // Redirect to login page
  }

  return (
    <div className='company-home'>
      <header className='header'>
        <img src={logo} alt="Logo" className="logo" />

        <nav>
          <ul>
            <li>
              <NavLink to="/jobposting" className='nav-link'>Post Job</NavLink>
            </li>
            <li>
              <NavLink to="/viewjobs" className='nav-link'>View Posted Job</NavLink>
            </li>
            <li>
              <NavLink to="/applicationd" className='nav-link'>Application</NavLink>
            </li>
            <li>
              <NavLink to="/changepassword" className='nav-link'>Change Password</NavLink>
            </li>
            <li onClick={logout}>
              <a className='nav-link' style={{ cursor: 'pointer' }}>Logout</a>
            </li>
          </ul>
        </nav>
      </header>
      <main className='pp1'> {/* Use <main> instead of <body> for semantic HTML */}
        <div className='welcome-message'>
          <h1>Welcome to Company Home</h1>
        </div>
      </main>
    </div>
  );
}

export default CompanyHome;
