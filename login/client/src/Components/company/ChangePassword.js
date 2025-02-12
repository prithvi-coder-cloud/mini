import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ChangePassword.css';  // Ensure the CSS file is correctly referenced
import logo from "../img/logo/job.jpg"; // Path to your logo image

const ChangePassword = () => {
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/change-password`, {
        email,
        oldPassword,
        newPassword,
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response.data.message);
    }
  };
  const logout = () => {
    // Clear user data on logout
    sessionStorage.removeItem('user');
    localStorage.removeItem('user'); // Optional, if you're using both

    navigate('/login'); // Redirect to login page
  }
  return (
    <div className="change-password-container">
      <header className="changepassword-header">
        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li onClick={() => navigate('/login')} className="changepassword-nav-link">Back to login</li>
          </ul>
        </nav>
      </header>
      <div className="form-c">
        <h2>Change Password</h2>
        <form onSubmit={handleChangePassword}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Old Password:</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label>New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Change Password</button>
        </form>
        {message && <p className={message.includes('successfully') ? 'success' : 'error'}>{message}</p>}
      </div>
    </div>
  );
};

export default ChangePassword;
