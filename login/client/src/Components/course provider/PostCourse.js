import React, { useState, useContext } from 'react';
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
  const [courseMaterials, setCourseMaterials] = useState([]);
  const [courseLogo, setCourseLogo] = useState(null);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const { mcqQuestions, setMcqQuestions } = useContext(QuestionContext);

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setCourseMaterials(e.target.files);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setCourseLogo(file);
      setErrors((prevErrors) => {
        const { courseLogo, ...newErrors } = prevErrors;
        return newErrors;
      });
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        courseLogo: 'Course Logo must be an image file',
      }));
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
      case 'courseMaterials':
        if (courseMaterials.length === 0) {
          newErrors.courseMaterials = 'Course Materials are required';
        } else {
          delete newErrors.courseMaterials;
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
      'courseMaterials',
      'courseLogo',
    ];
    fieldsToValidate.forEach((field) => validateField(field));

    // Check if there are any errors
    if (Object.keys(errors).length > 0) return;

    const formData = new FormData();
    formData.append('courseName', courseName);
    formData.append('courseTutor', courseTutor);
    formData.append('courseDifficulty', courseDifficulty);
    formData.append('paymentFee', paymentFee);
    formData.append('courseDescription', courseDescription);
    for (let i = 0; i < courseMaterials.length; i++) {
      formData.append('courseMaterials', courseMaterials[i]);
    }
    formData.append('courseLogo', courseLogo);

    // Append MCQ questions to the form data
    formData.append('mcqQuestions', JSON.stringify(mcqQuestions));

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/courses`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setErrors({});
      setAlert({ show: true, message: 'Course uploaded successfully!', type: 'success' });
    } catch (err) {
      setAlert({ show: true, message: 'Course upload failed', type: 'error' });
    }
  };

  const closeAlert = () => {
    setAlert({ show: false, message: '', type: '' });
  };

  return (
    <div>
      <header className='header'>
        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li onClick={() => navigate('/course')} className='nav-link'>Back</li>
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
            <label>Course Materials:</label>
            <input
              id='courseMaterials'
              type="file"
              multiple
              onChange={handleFileChange}
              onBlur={() => handleBlur('courseMaterials')}
              required
            />
            {errors.courseMaterials && <p className="error-message">{errors.courseMaterials}</p>}
          </div>
          <div className="form-group">
            <label>Course Logo:</label>
            <input
              id='courseLogo'
              type="file"
              onChange={handleLogoChange}
              onBlur={() => handleBlur('courseLogo')}
              required
            />
            {errors.courseLogo && <p className="error-message">{errors.courseLogo}</p>}
          </div>
          <div className="mcq-section">
            <h3>MCQ Questions:</h3>
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
          <div className={`alert ${alert.type}`}>
            <span className="closebtn" onClick={closeAlert}>&times;</span>
            {alert.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCourse;
