import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from "../img/logo/job.jpg";
import DateTimeModal from './DateTimeModal';

const ApplicationDisplay = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null); // Manage selected application here
  const navigate = useNavigate();

  useEffect(() => {
    const user = sessionStorage.getItem('user');
    const parsedUser = user ? JSON.parse(user) : null;
    const companyId = parsedUser ? parsedUser._id : null;

    if (!companyId) {
      setError('Company ID not found.');
      setLoading(false);
      return;
    }

    const fetchApplications = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/applications`, {
          params: { companyId },
        });

        const filteredApplications = response.data.filter((application) =>
          application.companyId._id === companyId
        );

        setApplications(filteredApplications);
      } catch (err) {
        setError('Failed to load applications.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleAccept = (application) => {
    setSelectedApplication(application); // Set the selected application
    setIsModalOpen(true);  // Open the modal
  };

  const handleModalClose = () => {
    setIsModalOpen(false);  // Close the modal
  };

  if (loading) {
    return <div>Loading applications...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <header className="header">
        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li onClick={() => navigate('/companyhome')} className="nav-link">Back</li>
          </ul>
        </nav>
      </header>
      <h2>Applications for Your Company</h2>
      {applications.length === 0 ? (
        <p>No applications available.</p>
      ) : (
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Job Title</th>
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
            {applications.map((application) => (
              <tr key={application._id}>
                <td>{application.jobTitle}</td>
                <td>{application.firstName}</td>
                <td>{application.middleName}</td>
                <td>{application.lastName}</td>
                <td>{application.email}</td>
                <td>{application.phone}</td>
                <td>{application.linkedInProfile}</td>
                <td>
                  <a href={application.resume} target="_blank" rel="noopener noreferrer">
                    View Resume
                  </a>
                </td>
                <td>
                  <button onClick={() => handleAccept(application)}>Accept</button>
                  <button>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {isModalOpen && <DateTimeModal isOpen={isModalOpen} onRequestClose={handleModalClose} application={selectedApplication} />}
    </div>
  );
};

export default ApplicationDisplay;
