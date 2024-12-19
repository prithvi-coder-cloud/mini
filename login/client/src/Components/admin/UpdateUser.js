import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // To access route params and navigate
import axios from 'axios';

const UpdateUser = () => {
  const { id } = useParams(); // Get the user ID from the route params
  const [name, setName] = useState(''); // Store the user's name
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // For redirecting after update

  // Fetch user details when the component mounts
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/${id}`);
        setName(response.data.name); // Set the name state with fetched data
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user", error);
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // Function to handle form submission and update user
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/users/${id}`, { name });
      alert("User updated successfully!");
      navigate('/admin'); // Redirect back to the main page after updating
    } catch (error) {
      console.error("Error updating user", error);
    }
  };

  if (loading) {
    return <p>Loading...</p>; // Show loading until the user data is fetched
  }

  return (
    <div>
      <h1>Update User</h1>
      <form onSubmit={handleUpdate}>
        <div>
          <label>Name:</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Update Name</button>
      </form>
    </div>
  );
}

export default UpdateUser;
