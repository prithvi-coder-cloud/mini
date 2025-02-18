import React, { useState } from 'react';
import axios from 'axios';
import './ATSChecker.css';
import Home1 from './Home1';

const AtsChecker = () => {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      setUploadStatus('File selected: ' + selectedFile.name);
    } else {
      setFile(null);
      setError('Please select a PDF file');
      setUploadStatus('');
    }
  };

  const uploadResume = async () => {
    try {
      if (!file) {
        throw new Error('Please select a resume to upload');
      }

      const formData = new FormData();
      formData.append('resume', file);
      formData.append('email', sessionStorage.getItem('email'));

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/upload-resume`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setUploadStatus('Resume uploaded successfully!');
        return true;
      } else {
        throw new Error('Failed to upload resume');
      }
    } catch (err) {
      setError(err.message || 'Failed to upload resume');
      return false;
    }
  };

  const checkAtsScore = async () => {
    try {
      setLoading(true);
      setError(null);
      const email = sessionStorage.getItem('email');
      
      if (!email) {
        throw new Error('User not logged in');
      }

      // First upload the resume if a file is selected
      if (file) {
        const uploadSuccess = await uploadResume();
        if (!uploadSuccess) {
          throw new Error('Failed to upload resume');
        }
      }

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/ats-score`, {
        email: email
      });

      setScore(response.data.score);
      setFeedback(response.data.feedback);
    } catch (err) {
      setError(err.message || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="ats-checker-container">
        <h1>ATS Resume Checker</h1>
        <p className="description">
          Check how well your resume performs against Applicant Tracking Systems (ATS)
        </p>

        <div className="upload-section">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="file-input"
            id="resume-upload"
          />
          <label htmlFor="resume-upload" className="upload-label">
            Choose Resume (PDF)
          </label>
          {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
        </div>
        
        <button 
          className="analyze-button"
          onClick={checkAtsScore}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Analyze Resume'}
        </button>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {score !== null && (
          <div className="results-container">
            <div className="score-display">
              <h2>Your ATS Score</h2>
              <div className="score-circle">
                <span className="score-number">{score}%</span>
              </div>
            </div>

            {feedback && (
              <div className="feedback-section">
                <h3>Feedback</h3>
                <ul>
                  {feedback.map((item, index) => (
                    <li key={index} className={`feedback-item ${item.type}`}>
                      {item.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AtsChecker;
