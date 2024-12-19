import React, { useState } from 'react';
import axios from 'axios';
import './addCompany.css';

const AddCompany = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/addCompany`, { name, email });
      setSuccess(response.data.message);
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || 'Failed to add company');
    }
  };

  return (
    <div className="add-company-container">
      <h2>Add Company</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <div>
          <label>Name</label>
          <input
            id='a1'
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email</label>
          <input
            id='a2'
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" id='add'>Add Company</button>
      </form>
    </div>
  );
};

export default AddCompany;
