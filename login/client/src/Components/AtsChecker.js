import React, { useState } from 'react';
import axios from 'axios';
import './ATSChecker.css';
import Header from './Header';
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

      setScore(response.data);
      setFeedback(response.data.feedback);
    } catch (err) {
      setError(err.message || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
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
                <span className="score-number">{score.overallScore}%</span>
              </div>
            </div>

            <div className="section-scores">
              <h3>Section Analysis</h3>
              <div className="score-grid">
                {Object.entries(score.sectionScores).map(([section, data]) => (
                  <div className="section-score-card" key={section}>
                    <div className="section-icon">{data.icon}</div>
                    <div className="section-name">{section}</div>
                    <div className="section-score" style={{
                      color: data.score >= 70 ? '#28a745' : data.score >= 40 ? '#ffc107' : '#dc3545'
                    }}>
                      {data.score}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {score.strengths.length > 0 && (
              <div className="strengths-section">
                <h3>💪 Your Strengths</h3>
                <div className="strengths-grid">
                  {score.strengths.map((strength, index) => (
                    <div className="strength-card" key={index}>
                      <div className="strength-icon">{strength.icon}</div>
                      <div className="strength-text">Strong {strength.section}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {score.improvements.length > 0 && (
              <div className="improvements-section">
                <h3>🎯 Areas for Improvement</h3>
                {score.improvements.map((improvement, index) => (
                  <div className="improvement-card" key={index}>
                    <div className="improvement-header">
                      <span className="improvement-icon">{improvement.icon}</span>
                      <span className="improvement-section">{improvement.section}</span>
                      <span className="improvement-score">{improvement.score}%</span>
                    </div>
                    <ul className="improvement-suggestions">
                      {improvement.suggestions.map((suggestion, i) => (
                        <li key={i}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {score.generalSuggestions.length > 0 && (
              <div className="general-suggestions">
                <h3>📝 General Suggestions</h3>
                <ul>
                  {score.generalSuggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
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
