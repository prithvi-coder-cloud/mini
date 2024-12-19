import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    linkedIn: '',
    dob: ''
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      const userEmail = sessionStorage.getItem('userEmail');
      if (userEmail) {
        try {
          const res = await axios.post('http://localhost:6005/getProfile', { email: userEmail });
          if (res.data.profile) {
            setProfile(res.data.profile);
          }
        } catch (e) {
          console.error(e);
          alert('Failed to fetch profile data');
        }
      }
    };

    fetchProfileData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/saveProfile`, profile);
      alert('Profile saved successfully');
    } catch (e) {
      console.error(e);
      alert('Failed to save profile');
    }
  };

  return (
    <div className='profile-page'>
      <h1>User Profile</h1>
      <form className='profile-form' onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type='text'
            name='name'
            value={profile.name}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Email:
          <input
            type='email'
            name='email'
            value={profile.email}
            onChange={handleChange}
            required
            readOnly
          />
        </label>
        <label>
          Phone Number:
          <input
            type='text'
            name='phoneNumber'
            value={profile.phoneNumber}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          LinkedIn Profile:
          <input
            type='url'
            name='linkedIn'
            value={profile.linkedIn}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Date of Birth:
          <input
            type='date'
            name='dob'
            value={profile.dob}
            onChange={handleChange}
            required
          />
        </label>
        <button type='submit'>Save Profile</button>
      </form>
    </div>
  );
};

export default Profile;
