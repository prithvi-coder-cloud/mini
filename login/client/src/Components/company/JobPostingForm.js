const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const formData = new FormData();
    // ... append your form data ...

    const response = await axios.post(`${process.env.REACT_APP_API_URL}/jobs`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success) {
      // Success case
      alert('Job posted successfully!');
      // Reset form or redirect
    } else {
      // Handle error case
      alert(response.data.error || 'Failed to post job');
    }
  } catch (error) {
    console.error('Error:', error);
    alert(error.response?.data?.error || 'Error posting job');
  }
}; 