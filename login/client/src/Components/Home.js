import React from 'react';
import './Home.css'; // Import the CSS file
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import FontAwesome for the icons
import { useLocation } from 'react-router-dom';
import Header from './Header';
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"></link>
const Home = () => {
  const location = useLocation();
  
  return (
    <>
      <div>
      <Header/>

        <section>
          <div className="background">
            <h1>Job Board</h1>
            <h4>The Comprehensive Job Board Platform is designed to facilitate
seamless interactions between job seekers, employers, course providers, and
administrators. This platform offers a holistic solution for job listings, user
authentication, profile management, job applications, course enrollment, and feedback
mechanisms. </h4>
            {/* <h1>Hello {location.state.id} welcome to the Home</h1> */}
            {/* You can add other content here */}
          </div>
        </section>
        <section class="how-it-works-section">
        <div class="how-it-works">
            <h2 style={{fontFamily:'sans-serif', fontSize:'100px',color:'grey'}}>How it works</h2>
            <div class="steps">
                <div class="step">
                    <div class="icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>1. Search a job</h3>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
                <div class="step">
                    <div class="icon">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <h3>2. Apply for job</h3>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
                <div class="step">
                    <div class="icon">
                        <i class="fas fa-briefcase"></i>
                    </div>
                    <h3>3. Get your job</h3>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
            </div>
        </div>
    </section>
        <section>
          <footer className="footer">
            <div className="container">
              <div className="row">
                <div className="footer-col">
                  <h4>About Us</h4>
                  <p>Heaven fruitful doesn't cover lesser days appear creeping seasons so behold.</p>
                </div>
                <div className="footer-col">
                  <h4>Contact Info</h4>
                  <ul>
                    <li><span>Address:</span> Your address goes here, your demo address.</li>
                    <li><span>Phone:</span> +8880 44338899</li>
                    <li><span>Email:</span> info@colorlib.com</li>
                  </ul>
                </div>
                <div className="footer-col">
                  <h4>Important Link</h4>
                  <ul>
                    <li>View Project</li>
                    <li>Contact Us</li>
                    <li>Properties</li>
                    <li>Support</li>
                  </ul>
                </div>
                <div className="footer-col">
                  <h4>Newsletter</h4>
                  <p>Heaven fruitful doesn't over lesser in days. Appear creeping.</p>
                  <div className="subscribe-form">
                    <input type="email" placeholder="Enter your email" />
                    <button type="submit"><i className="fas fa-paper-plane"></i></button>
                  </div>
                </div>
              </div>
              <div className="footer-bottom">
                <div className="footer-logo">
                  <img src="./img/logo/logo.png" alt="Job Finder" />
                  <p>Get your dream job</p>
                </div>
                <div className="footer-stats">
                  <div>
                    <h3>5000+</h3>
                    <p>Talented Hunter</p>
                  </div>
                  <div>
                    <h3>451</h3>
                    <p>Talented Hunter</p>
                  </div>
                  <div>
                    <h3>568</h3>
                    <p>Talented Hunter</p>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </section>
      </div>
    </>
  );
};

export default Home;
