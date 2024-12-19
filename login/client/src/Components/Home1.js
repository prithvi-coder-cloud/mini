import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // Import NavLink
import logo from "./img/logo/job.jpg"; // Path to your logo image
import Home from './Home';
const Home1 = () => {
  const navigate = useNavigate();
  const logout = () => {
    // Implement your logout logic here (e.g., clear local storage, call API to logout)
    localStorage.removeItem('user'); // Clear user data
    sessionStorage.removeItem('user');

    navigate('/login');
  }
  return (
    <div>
      <header className='head'>
        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li>
              <NavLink to="/dashboard1" id='dashboard'>Dashboard</NavLink>
            </li>
            <li>
            <NavLink to="/courselist1" id="course">Course</NavLink>
            </li>
            {/* <li> 
                    <NavLink to="/profile1">Profile</NavLink>
            </li> */}
            <li>
              <NavLink to="/changepassword">Change Password</NavLink>
            </li>
            <li onClick={logout}>
              <a className='nav-link' style={{ cursor: 'pointer' }}>Logout</a>
            </li>
          </ul>
        </nav>
      </header>
      <Home/>
      <div className="welcome-message"> {/* Added a div for styling purposes */}
        <h1>Welcome Home</h1> {/* Use a heading tag for better semantics */}
      </div>
    </div>
  );
}

export default Home1;
