import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CourseList.css';
import logo from './img/logo/job.jpg';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import Home1 from './Home1';

const CourseList1 = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const email = sessionStorage.getItem('email');
      if (!email) {
        throw new Error('User not logged in');
      }

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/coursesm`, {
        headers: {
          'Content-Type': 'application/json',
        },
        params: { email },
        withCredentials: true
      });

      if (response.data) {
        console.log('Fetched Courses:', response.data);
        setCourses(response.data);
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError(error.response?.data?.message || 'Failed to fetch courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const viewCourseDetails = (course) => {
    navigate(`/course/${course._id}`, { state: { course } });
  };

  const filteredCourses = courses.filter(course => 
    course.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.courseDescription?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="course-loading">Loading courses...</div>;
  if (error) return (
    <div className="course-error">
      <p>{error}</p>
      <button onClick={fetchCourses}>Retry</button>
    </div>
  );

  return (
    <div>
      <Home1 showContent={false} />
      <div className="course-content">
        <div className="search-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <FaSearch className="search-icon" />
          </div>
        </div>

        <div className="courses-section">
          <h1>Available Courses</h1>
          <div className="courses-grid">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <div className="course-card" key={course._id}>
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
                  <div className="course-details">
                    <h2 className="course-title">{course.courseName}</h2>
                    <p className="course-difficulty">
                      <strong>Difficulty:</strong> {course.courseDifficulty}
                    </p>
                    <p className="course-fee">
                      <strong>Fee:</strong> ${course.paymentFee}
                    </p>
                    <p className="course-description">{course.courseDescription}</p>
                    <button 
                      className="enroll-button" 
                      onClick={() => viewCourseDetails(course)}
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-courses">
                <p>No courses available.</p>
                <button onClick={fetchCourses}>Refresh</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseList1;
