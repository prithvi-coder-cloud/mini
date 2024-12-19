import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CourseDetails.css';
import logo from "./img/logo/job.jpg"; // Path to your logo image
import { useNavigate, useLocation } from 'react-router-dom';

const CourseDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const course = state?.course;
  
  const [courseMaterials, setCourseMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedMaterials, setCompletedMaterials] = useState({});
  const [isAnyCompleted, setIsAnyCompleted] = useState(false);

  useEffect(() => {
    if (!course) {
      alert('Course information is not available. Please go back and select a course.');
      navigate('/courselist');
    }
  }, [course, navigate]);

  useEffect(() => {
    const fetchCourseMaterials = async () => {
      if (course) {
        try {
          const response = await axios.get(`http://localhost:6005/courses/${course._id}/materials`);
          setCourseMaterials(response.data);
        } catch (error) {
          console.error('Error fetching course materials:', error);
          setError('Failed to fetch course materials.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCourseMaterials();
  }, [course]);

  const handleDownload = (materialUrl) => {
    const newWindow = window.open(`${process.env.REACT_APP_API_URL}${materialUrl}`, '_blank');
    if (newWindow) newWindow.focus();
    else alert('Please allow popups for this website');
  };

  const handleComplete = (materialName) => {
    if (!completedMaterials[materialName]) {
      setCompletedMaterials((prev) => ({
        ...prev,
        [materialName]: true,
      }));
      setIsAnyCompleted(true);
    }
  };

  const handleNext = () => {
    const combinedMaterials = courseMaterials.map(material => material.name).join("\n");
    // Pass course._id along with courseMaterials to the next page
    navigate(`/generatequestions/${course._id}`, { state: { courseId: course._id, course, courseMaterials: combinedMaterials } });
  };

  if (loading) return <div>Loading course materials...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <header className='head'>
        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li onClick={() => navigate('/courselist')}>
              <span className='nav-link' style={{ cursor: 'pointer' }}>Back</span>
            </li>
          </ul>
        </nav>
      </header>
      <div className="course-details-container">
        <h1>{course?.courseName}</h1>
        <h2>Course Materials</h2>
        {courseMaterials.length > 0 ? (
          <div className="materials-list">
            {courseMaterials.map((material, index) => (
              <div key={index} className="material-item">
                <div className="material-info">
                  <button onClick={() => handleDownload(material.url)}>
                    Open {material.name}
                  </button>
                  <button
                    id='complete'
                    className={`complete-button ${completedMaterials[material.name] ? 'completed' : ''}`}
                    onClick={() => handleComplete(material.name)}
                    disabled={completedMaterials[material.name]}
                  >
                    {completedMaterials[material.name] ? '✓' : 'Complete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No materials available for this course.</p>
        )}
        {isAnyCompleted && (
          <button id="next" onClick={handleNext} className="next-button">Next</button>
        )}
      </div>
    </div>
  );
};

export default CourseDetails;
