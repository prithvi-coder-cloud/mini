import React from 'react';
import { NavLink } from 'react-router-dom';
import './SideNav.css';
import { 
  FaBriefcase, 
  FaGraduationCap, 
  FaClipboardCheck, 
  FaComments, 
  FaFileAlt, 
  FaUser, 
  FaChartBar,
  FaSignOutAlt,
  FaTimes,
  FaHome,
  FaBars,
  FaUserCheck,
  FaUserTie
} from 'react-icons/fa';

const SideNav = ({ isOpen, toggleNav, logout, userdata }) => {
  return (
    <>
      <div className={`sidenav ${isOpen ? 'open' : ''}`}>
        <div className="sidenav-header">
          <button className="close-btn" onClick={toggleNav}>
            <FaBars />
          </button>
          <div className="nav-profile">
            <div className="profile-image">
              <img 
                src={userdata?.image || "default-avatar.png"} 
                alt="Profile" 
              />
            </div>
            <div className="profile-info">
              <h3>{userdata?.displayName || sessionStorage.getItem('email')}</h3>
            </div>
          </div>
        </div>

        <div className="nav-links">
          <NavLink to="/" onClick={toggleNav}>
            <FaHome /> <span>Home</span>
          </NavLink>
          
          <NavLink to="/Dashboard" onClick={toggleNav}>
            <FaBriefcase /> <span>Apply for Job</span>
          </NavLink>
          
          <NavLink to="/courselist" onClick={toggleNav}>
            <FaGraduationCap /> <span>Courses</span>
          </NavLink>
          
          <NavLink to="/jobtitles" onClick={toggleNav}>
            <FaClipboardCheck /> <span>Test</span>
          </NavLink>

          <NavLink to="/interview" onClick={toggleNav}>
            <FaUserTie /> <span>Interview</span>
          </NavLink>
          
          <NavLink to="/feedback" onClick={toggleNav}>
            <FaComments /> <span>Feedback</span>
          </NavLink>
          
          <NavLink to="/applicationview" onClick={toggleNav}>
            <FaFileAlt /> <span>Applied Jobs</span>
          </NavLink>
          
          <NavLink to="/profilepage" onClick={toggleNav}>
            <FaUser /> <span>Profile</span>
          </NavLink>
          
          <NavLink 
            to="/AtsChecker" 
            id="ats-score-link"
            onClick={toggleNav}
          >
            <FaChartBar /> <span>ATS Score</span>
          </NavLink>
          
          <div className="logout-section">
            <button onClick={logout} className="logout-btn">
              <FaSignOutAlt /> <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
      
      {isOpen && <div className="overlay" onClick={toggleNav}></div>}
    </>
  );
};

export default SideNav; 