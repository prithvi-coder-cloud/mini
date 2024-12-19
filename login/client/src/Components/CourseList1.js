import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CourseList.css'; // Updated CSS file
import logo from './img/logo/job.jpg'; // Path to your logo image
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa'; // Import Font Awesome search icon

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
      <header className="course-header">
        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li onClick={() => navigate('/')} className="course-nav-link">Back</li>
          </ul>
        </nav>
      </header>
      <div className="course-content-container">
        <div className="course-main-content">
          <div className="course-search-container">
            <div className="course-search-input-container">
              <input
                type="text"
                placeholder="Search courses by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="course-search-input"
              />
            </div>
            <div className="course-search-icon-container">
              <FaSearch className="course-search-icon" />
            </div>
          </div>
          <div className="course-listing-container">
            <h1>Available Courses</h1>
            <div className="course-listing">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <div className="course-card" key={course._id}>
                    <img src={`${process.env.REACT_APP_API_URL}${course.courseLogo}`} alt={`${course.courseName} Logo`} className="course-logo" />
                    <div className="course-details">
                      <h2 className="course-title">{course.courseName}</h2>
                      <p><strong>Difficulty:</strong> {course.courseDifficulty}</p>
                      <p><strong>Fee:</strong> ${course.paymentFee}</p>
                      <p>{course.courseDescription}</p>
                      <div className="course-button-container">
                        <button className="course-button" onClick={() => viewCourseDetails(course)}>Enroll for free</button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No courses available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseList;
