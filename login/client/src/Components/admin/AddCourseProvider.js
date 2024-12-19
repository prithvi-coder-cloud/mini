import React, { useState } from 'react';
import axios from 'axios';
import './AddCourseProvider.css';

const AddCourseProvider = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/addCourseProvider`, { name, email });
      setSuccess(response.data.message);
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || 'Failed to add course provider');
    }
  };

  return (
    <div className="add-course-provider-container">
      <h2>Add Course Provider</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <div>
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add Course Provider</button>
      </form>
    </div>
  );
};

export default AddCourseProvider;
