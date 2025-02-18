import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CourseList.css'; // Updated CSS file
import logo from './img/logo/job.jpg'; // Path to your logo image
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa'; // Import Font Awesome search icon
import Header from './Header';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // Search query state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/coursesm`);
        console.log('Fetched Courses:', response.data); // Debugging log
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Failed to fetch courses.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchCourses();
  }, []);
  

  const viewCourseDetails = (course) => {
    navigate(`/course/${course._id}`, { state: { course } });
  };

  // Filter courses based on search query
  const filteredCourses = courses.filter(course => 
    course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.courseDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="course-loading">Loading courses...</div>;
  if (error) return <div className="course-error">{error}</div>;

  return (
    <div className="course-dashboard-container">
      {/* <header className="course-header">
        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li onClick={() => navigate('/')} className="course-nav-link">Back</li>
          </ul>
        </nav>
      </header> */}
      <Header/>
      <br></br><br></br><br></br>

      <div className="search-hero">
        <h1>Find Your Perfect Course</h1>
        <p className="search-subtitle">Browse through our course catalog</p>
        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search courses by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button className="search-button">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="course-content-container">
        <div className="course-main-content">
          <div className="course-listing-container">
            <h2>Available Courses ({filteredCourses.length})</h2>
            <div className="course-listing">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <div className="course-card" key={course._id}>
                    <div className="course-image-container">
                      <img 
                        src={course.courseLogo ? 
                          course.courseLogo.startsWith('/') 
                            ? `${process.env.REACT_APP_API_URL}${course.courseLogo}`
                            : `${process.env.REACT_APP_API_URL}/uploads/${course.courseLogo}`
                          : logo
                        }
                        alt={`${course.courseName} Logo`} 
                        className="course-logo"
                        onError={(e) => {
                          console.log('Failed to load image:', e.target.src); // Debug log
                          e.target.onerror = null;
                          e.target.src = logo;
                        }}
                      />
                    </div>
                    <div className="course-details">
                      <h2 className="course-title">{course.courseName}</h2>
                      <div className="course-info">
                        <p><i className="fas fa-layer-group"></i> {course.courseDifficulty}</p>
                        <p><i className="fas fa-dollar-sign"></i> ${course.paymentFee}</p>
                      </div>
                      <p className="course-description">{course.courseDescription}</p>
                      <div className="course-button-container">
                        <button className="course-button" onClick={() => viewCourseDetails(course)}>
                          Enroll for free
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <i className="fas fa-search"></i>
                  <h3>No courses found</h3>
                  <p>Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseList;
