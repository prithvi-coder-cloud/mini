import React, { useState, useContext,useEffect } from 'react';
import axios from 'axios';
import './PostCourse.css';
import { useNavigate } from 'react-router-dom';
import logo from '../img/logo/job.jpg';
import { QuestionContext } from './QuestionContext';

const PostCourse = () => {
  const [courseName, setCourseName] = useState('');
  const [courseTutor, setCourseTutor] = useState('');
  const [courseDifficulty, setCourseDifficulty] = useState('');
  const [paymentFee, setPaymentFee] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseMaterial, setCourseMaterial] = useState(null);
  const [courseLogo, setCourseLogo] = useState(null);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const { mcqQuestions, setMcqQuestions } = useContext(QuestionContext);
  const [isGenerating, setIsGenerating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem('user'));
    if (userData && userData._id) {
      console.log('Course Provider ID:', userData._id);
    } else {
      console.log('No course provider ID found');
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Check if file is PDF
      if (file.type === 'application/pdf') {
        setCourseMaterial(file);
        setErrors((prevErrors) => {
          const { courseMaterial, ...newErrors } = prevErrors;
          return newErrors;
        });
      } else {
        setCourseMaterial(null);
        setErrors((prevErrors) => ({
          ...prevErrors,
          courseMaterial: 'Please upload only PDF files'
        }));
        // Reset file input
        e.target.value = '';
      }
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Check if file is an image
      if (file.type.match('image.*')) {
        // Additional check for specific image types
        if (file.type.match('image/jpeg') || file.type.match('image/png') || file.type.match('image/jpg')) {
          setCourseLogo(file);
          setErrors((prevErrors) => {
            const { courseLogo, ...newErrors } = prevErrors;
            return newErrors;
          });
        } else {
          setCourseLogo(null);
          setErrors((prevErrors) => ({
            ...prevErrors,
            courseLogo: 'Please upload only JPG, JPEG or PNG images'
          }));
          e.target.value = '';
        }
      } else {
        setCourseLogo(null);
        setErrors((prevErrors) => ({
          ...prevErrors,
          courseLogo: 'Please upload only image files'
        }));
        // Reset file input
        e.target.value = '';
      }
    }
  };

  const handleBlur = (field) => {
    validateField(field);
  };

  const validateField = (field) => {
    let newErrors = { ...errors };

    const isEmptyOrSpaces = (str) => !str.trim().length;

    switch (field) {
      case 'courseName':
        if (!courseName || isEmptyOrSpaces(courseName)) {
          newErrors.courseName = 'Course Name is required and cannot be just spaces';
        } else {
          delete newErrors.courseName;
        }
        break;
      case 'courseTutor':
        if (!courseTutor || isEmptyOrSpaces(courseTutor)) {
          newErrors.courseTutor = 'Course Tutor is required and cannot be just spaces';
        } else {
          delete newErrors.courseTutor;
        }
        break;
      case 'courseDifficulty':
        if (!courseDifficulty) {
          newErrors.courseDifficulty = 'Course Difficulty is required';
        } else {
          delete newErrors.courseDifficulty;
        }
        break;
      case 'paymentFee':
        if (!paymentFee || isNaN(paymentFee) || paymentFee <= 0) {
          newErrors.paymentFee = 'Payment Fee is required and must be a positive number';
        } else {
          delete newErrors.paymentFee;
        }
        break;
      case 'courseDescription':
        if (!courseDescription || isEmptyOrSpaces(courseDescription)) {
          newErrors.courseDescription = 'Course Description is required and cannot be just spaces';
        } else {
          delete newErrors.courseDescription;
        }
        break;
      case 'courseMaterial':
        if (!courseMaterial) {
          newErrors.courseMaterial = 'Course Material is required';
        } else if (courseMaterial.type !== 'application/pdf') {
          newErrors.courseMaterial = 'Course Material must be a PDF file';
        } else {
          delete newErrors.courseMaterial;
        }
        break;
      case 'courseLogo':
        if (!courseLogo) {
          newErrors.courseLogo = 'Course Logo is required';
        } else {
          delete newErrors.courseLogo;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleMcqChange = (index, field, value) => {
    const newMcqQuestions = mcqQuestions.map((q, i) =>
      i === index
        ? {
            ...q,
            [field]: field === 'options' ? [...q.options] : value,
            options:
              field === 'options'
                ? q.options.map((option, optionIndex) =>
                    optionIndex === value.index ? value.option : option
                  )
                : q.options,
          }
        : q
    );
    setMcqQuestions(newMcqQuestions);
  };

  const addNewQuestion = () => {
    setMcqQuestions([
      ...mcqQuestions,
      { question: '', options: ['', '', '', ''], correctOption: '' },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const fieldsToValidate = [
      'courseName',
      'courseTutor',
      'courseDifficulty',
      'paymentFee',
      'courseDescription',
      'courseMaterial',
      'courseLogo',
    ];
    fieldsToValidate.forEach((field) => validateField(field));

    // Check if there are any errors
    if (Object.keys(errors).length > 0) return;

    try {
      const userData = JSON.parse(sessionStorage.getItem('user'));
      if (!userData || !userData._id) {
        setAlert({ show: true, message: 'User ID not found', type: 'error' });
        return;
      }

      const formData = new FormData();
      formData.append('courseName', courseName);
      formData.append('courseTutor', courseTutor);
      formData.append('courseDifficulty', courseDifficulty);
      formData.append('paymentFee', paymentFee);
      formData.append('courseDescription', courseDescription);
      formData.append('courseMaterial', courseMaterial);
      formData.append('courseLogo', courseLogo);
      formData.append('mcqQuestions', JSON.stringify(mcqQuestions));
      formData.append('courseProviderId', userData._id);

      console.log('Submitting course with provider ID:', userData._id);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/courses`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 201) {
        console.log('Course created successfully');
        setErrors({});
        setAlert({ show: true, message: 'Course uploaded successfully!', type: 'success' });
        
        // Clear form fields after successful submission
        setCourseName('');
        setCourseTutor('');
        setCourseDifficulty('');
        setPaymentFee('');
        setCourseDescription('');
        setCourseMaterial(null);
        setCourseLogo(null);
        setMcqQuestions([{ question: '', options: ['', '', '', ''], correctOption: '' }]);
        
        // Navigate back to course list
        setTimeout(() => {
          navigate('/course');
        }, 2000);
      }
    } catch (err) {
      console.error('Course upload error:', err);
      const errorMessage = err.response?.data?.error || err.message;
      setAlert({ 
        show: true, 
        message: `Course upload failed: ${errorMessage}`, 
        type: 'error' 
      });
    }
  };

  const closeAlert = () => {
    setAlert({ show: false, message: '', type: '' });
  };

  const handleGenerateQuiz = async () => {
    if (!courseMaterial) {
      setAlert({
        show: true,
        message: "Please upload course material first",
        type: "error"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Create a new FormData instance
      const formData = new FormData();
      formData.append('pdfFile', courseMaterial);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/generate-quiz`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.questions) {
        setMcqQuestions(response.data.questions.map(q => ({
          question: q.question,
          options: q.options,
          correctOption: q.correctOption
        })));
        
        setAlert({
          show: true,
          message: "Quiz generated successfully!",
          type: "success"
        });
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      setAlert({
        show: true,
        message: "Failed to generate quiz. Please try again.",
        type: "error"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Add CSS for the alert messages
  const alertStyle = {
    success: {
      backgroundColor: '#d4edda',
      color: '#155724',
      padding: '10px',
      borderRadius: '4px',
      marginBottom: '15px'
    },
    error: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '10px',
      borderRadius: '4px',
      marginBottom: '15px'
    }
  };

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
      <div className="post-course-container">
        <h2>Post a New Course</h2>
        <form onSubmit={handleSubmit} className="course-form">
          <div className="form-group">
            <label>Course Name:</label>
            <input
              id='courseName'
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              onBlur={() => handleBlur('courseName')}
              required
            />
            {errors.courseName && <p className="error-message">{errors.courseName}</p>}
          </div>
          <div className="form-group">
            <label>Course Tutor:</label>
            <input
              id='courseTutor'
              type="text"
              value={courseTutor}
              onChange={(e) => setCourseTutor(e.target.value)}
              onBlur={() => handleBlur('courseTutor')}
              required
            />
            {errors.courseTutor && <p className="error-message">{errors.courseTutor}</p>}
          </div>
          <div className="form-group">
            <label>Course Difficulty:</label>
            <select
              id='courseDifficulty'
              value={courseDifficulty}
              onChange={(e) => setCourseDifficulty(e.target.value)}
              onBlur={() => handleBlur('courseDifficulty')}
              required
            >
              <option value="">Select Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            {errors.courseDifficulty && <p className="error-message">{errors.courseDifficulty}</p>}
          </div>
          <div className="form-group">
            <label>Payment Fee:</label>
            <input
              id='paymentFee'
              type="number"
              value={paymentFee}
              onChange={(e) => setPaymentFee(e.target.value)}
              onBlur={() => handleBlur('paymentFee')}
              required
            />
            {errors.paymentFee && <p className="error-message">{errors.paymentFee}</p>}
          </div>
          <div className="form-group">
            <label>Course Description:</label>
            <textarea
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              onBlur={() => handleBlur('courseDescription')}
              required
            />
            {errors.courseDescription && <p className="error-message">{errors.courseDescription}</p>}
          </div>
          <div className="form-group">
            <label>Course Material (PDF only):</label>
            <input
              id='courseMaterial'
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              onBlur={() => handleBlur('courseMaterial')}
              required
            />
            {errors.courseMaterial && <p className="error-message">{errors.courseMaterial}</p>}
            {courseMaterial && (
              <p className="file-name">Selected file: {courseMaterial.name}</p>
            )}
          </div>
          <div className="form-group">
            <label>Course Logo (JPG, JPEG, PNG only):</label>
            <input
              id='courseLogo'
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleLogoChange}
              onBlur={() => handleBlur('courseLogo')}
              required
            />
            {errors.courseLogo && <p className="error-message">{errors.courseLogo}</p>}
          </div>
          <div className="mcq-section">
            <div className="mcq-header">
              <h3>MCQ Questions:</h3>
              <button 
                type="button" 
                onClick={handleGenerateQuiz}
                disabled={isGenerating || !courseMaterial}
                className="generate-button"
              >
                {isGenerating ? 'Generating...' : 'Generate Quiz from PDF'}
              </button>
            </div>
            {mcqQuestions.map((question, index) => (
              <div key={index} className="mcq-question">
                <div className="form-group">
                  <label>Question {index + 1}:</label>
                  <input
                    id='question'
                    type="text"
                    value={question.question}
                    onChange={(e) => handleMcqChange(index, 'question', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Options:</label>
                  {question.options.map((option, optionIndex) => (
                    <input
                      
                      key={optionIndex}
                      type="text"
                      value={option}
                      onChange={(e) =>
                        handleMcqChange(index, 'options', { index: optionIndex, option: e.target.value })
                      }
                    />
                  ))}
                </div>
                <div className="form-group">
                  <label>Correct Option:</label>
                  <input
                    type="text"
                    value={question.correctOption}
                    onChange={(e) => handleMcqChange(index, 'correctOption', e.target.value)}
                  />
                </div>
              </div>
            ))}
            <button type="button" onClick={addNewQuestion}>
              Add New Question
            </button>
          </div>
          <button type="submit">Post Course</button>
        </form>
        {alert.show && (
          <div 
            style={{
              ...alertStyle[alert.type],
              marginTop: '20px',
              position: 'fixed',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              minWidth: '300px',
              textAlign: 'center'
            }}
          >
            {alert.message}
            <button 
              onClick={closeAlert}
              style={{ 
                float: 'right', 
                border: 'none', 
                background: 'none', 
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCourse;
