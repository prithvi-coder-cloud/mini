import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import './CourseDisplay.css'; // Import the CSS file
import logo from '../img/logo/job.jpg';

const CourseDisplay = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (!user || !user._id) {
          throw new Error('User not found');
        }

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/courses/${user._id}`
        );

        if (response.data && response.data.courses) {
          setCourses(response.data.courses);
        } else {
          setCourses([]); // Set empty array if no courses found
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError(error.message || 'Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <div className="coursedisplay_loading">Loading...</div>;
  }

  if (error) {
    return <div className="coursedisplay_error">Error: {error}</div>;
  }

  return (
    <div>
      <header className='header'>
        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li onClick={() => navigate('/course')} className='course-nav-link'>Back</li>
          </ul>
        </nav>
      </header>
    <div className="coursedisplay_container">
      <h1 className="coursedisplay_title">Your Courses</h1>
      {courses.length === 0 ? (
        <p className="coursedisplay_noCourses">No courses found.</p>
      ) : (
        <table className="coursedisplay_table">
          <thead>
            <tr>
              <th className="coursedisplay_tableHeader">Course Name</th>
              <th className="coursedisplay_tableHeader">Tutor</th>
              <th className="coursedisplay_tableHeader">Difficulty</th>
              <th className="coursedisplay_tableHeader">Payment Fee</th>
              <th className="coursedisplay_tableHeader">Course Description</th>
              <th className="coursedisplay_tableHeader">Course Materials</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course._id} className="coursedisplay_tableRow">
                <td className="coursedisplay_tableCell">{course.courseName}</td>
                <td className="coursedisplay_tableCell">{course.courseTutor}</td>
                <td className="coursedisplay_tableCell">{course.courseDifficulty}</td>
                <td className="coursedisplay_tableCell">${course.paymentFee}</td>
                <td className="coursedisplay_tableCell">{course.courseDescription}</td>
                <td className="coursedisplay_tableCell">
                  {course.courseMaterial ? (
                    <div className="coursedisplay_material">
                      <a
                        href={`${process.env.REACT_APP_API_URL}/${course.courseMaterial}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="coursedisplay_downloadLink"
                      >
                        <button className="coursedisplay_downloadButton">
                          Download Material
                        </button>
                      </a>
                    </div>
                  ) : (
                    <p className="coursedisplay_noMaterials">No materials available</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
    </div>
  );
};

export default CourseDisplay;
