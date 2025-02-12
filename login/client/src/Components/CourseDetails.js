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
      return;
    }

    const fetchCourseMaterials = async () => {
      try {
        setLoading(true);
        // Check if course has materials
        if (!course.courseMaterial) {
          setCourseMaterials([]);
          setError('No materials available for this course.');
          return;
        }

        // Create an array with the single material
        const materials = [{
          name: 'Course Material',
          url: course.courseMaterial
        }];
        
        setCourseMaterials(materials);
        setError(null);

      } catch (error) {
        console.error('Error fetching course materials:', error);
        setError('Failed to fetch course materials. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseMaterials();
  }, [course, navigate]);

  const handleDownload = (materialUrl) => {
    try {
      // Remove any leading slash if present
      const cleanUrl = materialUrl.startsWith('/') ? materialUrl.substring(1) : materialUrl;
      const fileUrl = `${process.env.REACT_APP_API_URL}/${cleanUrl}`;
      window.open(fileUrl, '_blank');
    } catch (error) {
      console.error('Error downloading material:', error);
      alert('Failed to download material. Please try again.');
    }
  };

  const handleComplete = (materialName) => {
    if (!completedMaterials[materialName]) {
      setCompletedMaterials(prev => ({
        ...prev,
        [materialName]: true
      }));
      setIsAnyCompleted(true);
    }
  };

  const handleNext = () => {
    if (!course?._id) {
      alert('Course information is missing');
      return;
    }
    navigate(`/generatequestions/${course._id}`, { 
      state: { 
        courseId: course._id, 
        course,
        courseMaterials: courseMaterials.map(m => m.name).join("\n")
      } 
    });
  };

  if (loading) {
    return <div className="loading">Loading course materials...</div>;
  }

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
        
        {error ? (
          <div className="error-message">{error}</div>
        ) : courseMaterials.length > 0 ? (
          <div className="materials-list">
            {courseMaterials.map((material, index) => (
              <div key={index} className="material-item">
                <div className="material-info">
                  <button 
                    onClick={() => handleDownload(material.url)}
                    className="download-button"
                  >
                    Open Material
                  </button>
                  <button
                    className={`complete-button ${completedMaterials[material.name] ? 'completed' : ''}`}
                    onClick={() => handleComplete(material.name)}
                    disabled={completedMaterials[material.name]}
                  >
                    {completedMaterials[material.name] ? '✓ Completed' : 'Mark as Complete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-materials">No materials available for this course.</p>
        )}
        
        {isAnyCompleted && (
          <button onClick={handleNext} className="next-button">
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseDetails;
