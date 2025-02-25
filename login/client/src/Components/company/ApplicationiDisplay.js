import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from "../img/logo/job.jpg";
import DateTimeModal from './DateTimeModal';
import "./ApplicationDisplay.css";

const ApplicationDisplay = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJobTitle, setSelectedJobTitle] = useState(null);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [interviewSchedules, setInterviewSchedules] = useState({});
  const [interviewLinks, setInterviewLinks] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const user = sessionStorage.getItem('user');
        const parsedUser = user ? JSON.parse(user) : null;
        const companyId = parsedUser?._id;

        if (!companyId) {
          setError('Company ID not found. Please log in again.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/applications`, {
          params: { companyId: companyId.toString() }
        });

        if (!response.data) {
          setError('No data received from server');
          setLoading(false);
          return;
        }

        // Group applications by job
        const groupedApps = response.data.reduce((acc, app) => {
          const jobTitle = app.jobId?.jobTitle || 'Unknown Job';
          if (!acc[jobTitle]) {
            acc[jobTitle] = [];
          }
          acc[jobTitle].push(app);
          return acc;
        }, {});

        setApplications(response.data);
        console.log('Grouped applications:', groupedApps);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err.response?.data?.message || 'Failed to load applications.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const groupByJobTitle = (applications) => {
    return applications.reduce((acc, application) => {
      const jobTitle = application.jobId?.jobTitle || 'Unknown Job';
      if (!acc[jobTitle]) {
        acc[jobTitle] = [];
      }
      acc[jobTitle].push(application);
      return acc;
    }, {});
  };

  const handleSchedule = (jobTitle, applicants) => {
    setSelectedJobTitle(jobTitle);
    setSelectedApplications(applicants);
    setIsModalOpen(true);
  };

  const handleReject = async (applicationId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/applications/${applicationId}`);
      setApplications(applications.filter(app => app._id !== applicationId));
    } catch (err) {
      console.error('Failed to reject application:', err);
      alert('Failed to reject application. Please try again later.');
    }
  };

  const handleAddTest = (jobTitle, applicants) => {
    const emails = applicants.map((applicant) => applicant.email);
    navigate('/addtest', { state: { jobTitle, emails } });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleScheduleSet = (jobTitle, dateTime) => {
    setInterviewSchedules(prevSchedules => ({
      ...prevSchedules,
      [jobTitle]: dateTime
    }));
  };

  const handleAddInterview = async (jobTitle, applications) => {
    try {
      const emails = applications.map(app => app.email);
      const roomName = `interview-${jobTitle.replace(/\s+/g, '-')}-${Date.now()}`;
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/create-interview`, {
        jobTitle,
        emails,
        roomName
      });

      if (response.data.success) {
        setInterviewLinks(prev => ({
          ...prev,
          [jobTitle]: roomName
        }));
        alert('Interview has been created and notifications sent to candidates');
      }
    } catch (error) {
      console.error('Error creating interview:', error);
      alert('Failed to create interview session');
    }
  };

  // Add this new function to handle joining the interview
  const handleJoinInterview = (roomName) => {
    window.open(`https://meet.jit.si/${roomName}`, '_blank');
  };

  if (loading) return <div className="loading">Loading applications...</div>;
  if (error) return <div className="error">{error}</div>;

  const groupedApplications = groupByJobTitle(applications);

  return (
    <div>
      <header className='header'>
        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li onClick={() => navigate('/companyhome')}>
              <span className='course-nav-link'>Back</span>
            </li>
          </ul>
        </nav>
      </header>

      <div className="applications-container">
        <h2>Job Applications</h2>
        
        <div className="applications-content">
          {Object.keys(groupedApplications).length === 0 ? (
            <div className="no-applications">
              <h3>No applications found</h3>
            </div>
          ) : (
            Object.keys(groupedApplications).map((jobTitle) => (
              <div key={jobTitle} className="job-applications">
                <h3>{jobTitle}</h3>
                <div className="button-container">
                  <button 
                    className="schedule-button" 
                    onClick={() => handleSchedule(jobTitle, groupedApplications[jobTitle])}
                  >
                    Schedule Interview
                  </button>
                  <button 
                    className="addtest-button" 
                    onClick={() => handleAddTest(jobTitle, groupedApplications[jobTitle])}
                  >
                    Add Test
                  </button>
                  <button 
                    className="add-interview-button" 
                    onClick={() => handleAddInterview(jobTitle, groupedApplications[jobTitle])}
                  >
                    Add Interview
                  </button>
                  {interviewLinks[jobTitle] && (
                    <button 
                      className="join-interview-button"
                      onClick={() => handleJoinInterview(interviewLinks[jobTitle])}
                    >
                      Attend Interview
                    </button>
                  )}
                  {interviewSchedules[jobTitle] && (
                    <div className="interview-schedule">
                      Interview Scheduled: {new Date(interviewSchedules[jobTitle]).toLocaleString()}
                    </div>
                  )}
                </div>

                <table className="applications-table">
                  <thead>
                    <tr>
                      <th>First Name</th>
                      <th>Middle Name</th>
                      <th>Last Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>LinkedIn</th>
                      <th>Resume</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedApplications[jobTitle].map((application) => (
                      <tr key={application._id}>
                        <td>{application.firstName || 'N/A'}</td>
                        <td>{application.middleName || 'N/A'}</td>
                        <td>{application.lastName || 'N/A'}</td>
                        <td>{application.email || 'N/A'}</td>
                        <td>{application.phone || 'N/A'}</td>
                        <td>
                          {application.linkedInProfile ? (
                            <a href={application.linkedInProfile} target="_blank" rel="noopener noreferrer">
                              View Profile
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td>
                          {application.resume ? (
                            <a 
                              href={`${process.env.REACT_APP_API_URL}${application.resume}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              View Resume
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td>
                          <button 
                            className="reject-button"
                            onClick={() => handleReject(application._id)}
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      </div>
      
      {isModalOpen && (
        <DateTimeModal 
          isOpen={isModalOpen} 
          onRequestClose={handleModalClose} 
          jobTitle={selectedJobTitle} 
          applications={selectedApplications} 
          onScheduleSet={handleScheduleSet} 
          onhandleAddTest={handleAddTest} 
        />
      )}
    </div>
  );
};

export default ApplicationDisplay;