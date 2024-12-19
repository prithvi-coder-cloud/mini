import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = JSON.parse(sessionStorage.getItem('user'));
      if (userData && userData.email) {
        try {
          const res = await axios.post(`${process.env.REACT_APP_API_URL}/getUser`, { email: userData.email });
          setUser(res.data.user);
        } catch (e) {
          console.log(e);
          alert('Failed to fetch user data');
        }
      } else {
        navigate('/login'); // Redirect to login if user data is not available
      }
    };

    fetchUserData();
  }, [navigate]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className='profile-page'>
      <h1>User Profile</h1>
      <div className='profile-details'>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Date of Birth:</strong> {user.dob}</p>
        <p><strong>LinkedIn Profile:</strong> <a href={user.linkedIn} target="_blank" rel="noopener noreferrer">{user.linkedIn}</a></p>
      </div>
    </div>
  );
};

export default Profile;
