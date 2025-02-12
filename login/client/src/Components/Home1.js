import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from "./img/logo/job.jpg";
import './Home.css';

const Home1 = ({ showContent = true }) => {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('user');
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
              <NavLink to="/dashboard1" id='dashboard'>Apply for Job</NavLink>
            </li>
            <li>
            <NavLink to="/courselist1" id="course">Course</NavLink>
            </li>
            <li>
              <NavLink to="/jobtitles">Test</NavLink>
            </li>
            <li>
              <NavLink to="/feedback">Feedback</NavLink>
            </li>
            <li>
              <NavLink to="/applicationview">Applied Jobs</NavLink>
            </li>
            {/* <li> 
              <NavLink to="/changepassword">Change Password</NavLink>
            </li> */}
            
            <li>
              <NavLink to="/profilepage">Profile</NavLink>
            </li>
            <li>
              <NavLink to="/changepassword">Change Password</NavLink>
            </li>
            <li onClick={logout}>
              <a className='nav-link' style={{ cursor: 'pointer' }}>Logout</a>
            </li>
          </ul>
        </nav>
      </header>

      {showContent && (
        <section className="hero-section">
          <div className="hero-content">
            <h1>Find Your Dream Career Path</h1>
            <h4>The Comprehensive Job Board Platform connects talented individuals with their ideal opportunities. 
              Explore jobs, enhance your skills with courses, and take the next step in your career journey.</h4>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">5000+</span>
                <span className="stat-label">Active Jobs</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">2000+</span>
                <span className="stat-label">Companies</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">150+</span>
                <span className="stat-label">Courses</span>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="how-it-works-section">
        <div className="section-container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="icon">
                <i className="fas fa-search"></i>
              </div>
              <h3>Search Jobs</h3>
              <p>Browse through thousands of job listings tailored to your skills and preferences.</p>
            </div>
            <div className="step">
              <div className="icon">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <h3>Learn Skills</h3>
              <p>Enhance your qualifications with our curated selection of professional courses.</p>
            </div>
            <div className="step">
              <div className="icon">
                <i className="fas fa-briefcase"></i>
              </div>
              <h3>Get Hired</h3>
              <p>Apply to your dream jobs and start your journey towards success.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="section-container">
          <h2>Why Choose Us</h2>
          <div className="features-grid">
            <div className="feature-card">
              <i className="fas fa-bolt"></i>
              <h3>Quick Applications</h3>
              <p>Apply to multiple jobs with just a few clicks using your saved profile.</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-certificate"></i>
              <h3>Verified Employers</h3>
              <p>All companies are thoroughly vetted to ensure legitimate opportunities.</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-book-reader"></i>
              <h3>Quality Courses</h3>
              <p>Access high-quality learning materials from industry experts.</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-chart-line"></i>
              <h3>Career Growth</h3>
              <p>Find opportunities that match your career goals and aspirations.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-grid">
            <div className="footer-col">
              <h4>About JobBoard</h4>
              <p>Connecting talent with opportunity through innovative job matching and skill development. We help professionals find their dream careers.</p>
              <div className="social-links">
                <a href="#"><i className="fab fa-facebook-f"></i></a>
                <a href="#"><i className="fab fa-linkedin-in"></i></a>
                <a href="#"><i className="fab fa-instagram"></i></a>
              </div>
            </div>
            
            <div className="footer-col">
              <h4>Contact Us</h4>
              <div className="contact-info">
                <div className="contact-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <p>123 Career Street,<br />Tech Valley, NY 12345</p>
                </div>
                <div className="contact-item">
                  <i className="fas fa-phone-alt"></i>
                  <p>+1 234 567 8900</p>
                </div>
                <div className="contact-item">
                  <i className="fas fa-envelope"></i>
                  <p>contact@jobboard.com</p>
                </div>
              </div>
            </div>

            <div className="footer-col">
              <h4>Newsletter</h4>
              <p>Subscribe to receive job updates and career tips.</p>
              <div className="subscribe-form">
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2024 JobBoard. All rights reserved.</p>
          </div>
      </div>
      </footer>
    </div>
  );
}

export default Home1;
