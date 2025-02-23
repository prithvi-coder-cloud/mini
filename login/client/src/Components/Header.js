import React, { useEffect, useState, useRef } from 'react';
import "./header.css";
import { NavLink, useNavigate } from 'react-router-dom';
import axios from "axios";
import logo from "./img/logo/job.jpg";
import Chatbot from './ChatBot'; // Import the Chatbot component
import SideNav from './SideNav';
import { FaBars } from 'react-icons/fa';

const Header = () => {
  const [userdata, setUserdata] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const progressBarRef = useRef(null);
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);

  useEffect(() => {
    let timer;
    if (showPopup) {
      // Auto close popup after 5 seconds
      timer = setTimeout(() => {
        setShowPopup(false);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [showPopup]);

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) {
      setUserdata(storedUser);
    }
  }, []);

  const getUser = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/login/success`, { withCredentials: true });
      
      if (response.data.user) {
        setUserdata(response.data.user);
        sessionStorage.setItem('email', response.data.user.email);
        
        // Check if recommendations were already shown
        const hasShownRecommendations = sessionStorage.getItem('hasShownRecommendations');
        if (!hasShownRecommendations) {
          await fetchProfileData(response.data.user.email);
        }
      } else {
        const storedUser = JSON.parse(sessionStorage.getItem('user'));
        if (storedUser) {
          setUserdata(storedUser);
          const hasShownRecommendations = sessionStorage.getItem('hasShownRecommendations');
          if (!hasShownRecommendations) {
            await fetchProfileData(storedUser.email);
          }
        }
      }
    } catch (error) {
      console.log("error", error);
      const storedUser = JSON.parse(sessionStorage.getItem('user'));
      if (storedUser) {
        setUserdata(storedUser);
        const hasShownRecommendations = sessionStorage.getItem('hasShownRecommendations');
        if (!hasShownRecommendations) {
          await fetchProfileData(storedUser.email);
        }
      }
    }
  };

  const fetchProfileData = async (email) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/profile?email=${email}`);
      if (response.data.profile && response.data.profile.skills) {
        await fetchRecommendations(email); // Fetch recommendations if skills are found
        // Set the flag to indicate recommendations have been shown
        sessionStorage.setItem('hasShownRecommendations', 'true');
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };
  
  const fetchRecommendations = async (email) => {
    try {
      console.log('Fetching recommendations for:', email);
      const recommendationsResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/recommendations`, 
        { email }
      );
   
      console.log('Recommendations response:', recommendationsResponse.data);
  
      if (recommendationsResponse.data.recommendations && 
          recommendationsResponse.data.recommendations.length > 0) {
        setRecommendations(recommendationsResponse.data.recommendations);
        setShowPopup(true);
        // Mark that recommendations have been shown
        sessionStorage.setItem('hasShownRecommendations', 'true');
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };
 
  // Logout function
  const logout = () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('hasShownRecommendations'); // Clear the flag on logout
    window.open(`${process.env.REACT_APP_API_URL}/logout`, "_self");
  };

  useEffect(() => {
    getUser();
  }, []);

  // Check if user is logged in
  const isLoggedIn = () => {
    return Object.keys(userdata).length > 0 || sessionStorage.getItem('email');
  };

  return (
    <>
      <header>
        <nav>
          <div className="logo-container">
            {isLoggedIn() && (
              <button className="menu-button" id="menu" onClick={() => setIsSideNavOpen(true)}>
                <FaBars />
              </button>
            )}
            <img src={logo} alt="Logo" className="logo" />
            <h1 className='left'>Job Board</h1>
          </div>
          
          <div className='right'>
            <ul>
              {Object.keys(userdata).length > 0 ? (
                <>
                  <li style={{ color: "white", fontWeight: "bold" }}>
                    {userdata.displayName}
                  </li>
                  <li>
                    <img src={userdata.image} alt="" />
                  </li>
                  <li>
                    <span className="user-email">{userdata.email}</span>
                  </li>
                </>
              ) : (
                <li>
                  <NavLink to="/Login">Login</NavLink>
                </li>
              )}
            </ul>
          </div>
        </nav>
      </header>

      {/* Only render SideNav if user is logged in */}
      {isLoggedIn() && (
        <SideNav 
          isOpen={isSideNavOpen} 
          toggleNav={() => setIsSideNavOpen(false)}
          logout={logout}
          userdata={userdata}
        />
      )}

      {showPopup && recommendations.length > 0 && (
        <>
          <div className="popup-backdrop" />
          <div className="recommendation-popup">
            <h3>Recommended Courses Based on Your Skills</h3>
            <ul>
              {recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
            <div className="progress-container">
              <div 
                className="progress-bar"
                onAnimationEnd={() => setShowPopup(false)}
                style={{ willChange: 'width' }}
              />
            </div>
          </div>
        </>
      )}

      <Chatbot />

      {/* Add to your navigation links */}
      <NavLink to="/AtsChecker">ATS Resume Checker</NavLink>
    </>
  );
};

export default Header;
