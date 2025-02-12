import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserDetails.css'; // Link to your stylesheet
import logo from "../img/logo/job.jpg"; // Path to your logo image

const UserDetails = () => {
  const [users, setUsers] = useState([]); // Active users
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch active users from backend
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use effect to fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to toggle user status
  const toggleUserStatus = async (id, currentStatus, email) => {
    const action = currentStatus === 1 ? 'disable' : 'enable';
    const confirmMessage = `Are you sure you want to ${action} this account?`;
    const isConfirmed = window.confirm(confirmMessage);

    if (isConfirmed) {
      try {
        const response = await axios.put(`${process.env.REACT_APP_API_URL}/toggleUserStatus/${id}`);
        const updatedStatus = response.data.status; // Get the new status from the response
        setUsers(users.map((user) =>
          user._id === id ? { ...user, status: updatedStatus } : user
        ));
        alert(`User status has been successfully ${action}d. An email notification has been sent to the user.`);
      } catch (error) {
        console.error(`Error ${action}ing user status:`, error);
        alert(`Error ${action}ing user status, please try again.`);
      }
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div>
      <header className='head'>
        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li onClick={() => navigate('/admin')}>
              <span className='nav-link' style={{ cursor: 'pointer' }}>Back</span>
            </li>
          </ul>
        </nav>
      </header>
      <div className="user-details-container">
<br></br><br></br><br></br>
<br></br>


        {/* Active Users Section */}
        <h2>Active Users</h2>
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id}>
                  <td>{user._id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.status === 1 ? 'Enabled' : 'Disabled'}</td>
                  <td>
                    <button id="btn"
                    
                      className="action-btn"
                      onClick={() => toggleUserStatus(user._id, user.status, user.email)}
                    >
                      {user.status === 1 ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-users">No active users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserDetails;
