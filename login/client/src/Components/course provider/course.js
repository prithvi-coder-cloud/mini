import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './course.css'; // Ensure to import the CSS file
import logo from "../img/logo/job.jpg"; // Path to your logo image
import course1 from "../img/blog/course1.avif";
import course2 from "../img/blog/course2.avif";
import course3 from "../img/blog/course3.jpg"; // Import your images

const Course = () => {
  const navigate = useNavigate();

  // Array of imported images
  const images = [course1, course2, course3];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Set up the image slideshow effect with useEffect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval); // Clear the interval on component unmount
  }, [images.length]);

  const logout = () => {
    localStorage.removeItem('user'); // Clear user data
    sessionStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <div>
      <header className='header'>
        <img src={logo} alt="Logo" className="logo" />

        <nav>
          <ul>
          <li><NavLink to="/postcourse" className='nav-link' id="post-course-link">Post course</NavLink></li>
            <li><NavLink to="/changepassword" className='nav-link'>Change Password</NavLink></li>
            <li onClick={logout}>
              <a className='nav-link' style={{ cursor: 'pointer' }}>Logout</a>
            </li>
          </ul>
        </nav>
      </header>
      <div className="slideshow-container">
        <img
          src={images[currentImageIndex]}
          alt="Slideshow"
          className="slideshow-image"
        />
      </div>

      <div className="welcome-message">
        Welcome to the course provider home page
      </div>
    </div>
  );
};

export default Course;
