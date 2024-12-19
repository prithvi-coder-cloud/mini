import React, { useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import "./DateTimeModel.css"; // Import the CSS file

const DateTimeModal = ({ isOpen, onRequestClose, application, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time.');
      return;
    }

    // Combine the date and time into a single Date object
    const combinedDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    combinedDateTime.setHours(hours);
    combinedDateTime.setMinutes(minutes);

    // Check if email and jobId are available in the application prop
    if (!application || !application.email || !application.jobId) {
      alert('Applicant email or jobId not found.');
      return;
    }

    try {
      // Send email to the applicant with the interview details
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/send-interview-invite`, {
        applicantEmail: application.email,  // Ensure this is the correct email
        interviewDateTime: combinedDateTime,
        jobId: application.jobId,  // Ensure jobId is passed
      });

      console.log('Response from server:', response);

      if (response.status === 200) {
        alert('Interview invite sent successfully!');
        onSuccess(); // Notify success
        onRequestClose(); // Close the modal
      } else {
        alert(`Failed to send interview invite: ${response.data.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send interview invite:', error);
      alert('Failed to send interview invite. Please try again later.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Select Date and Time"
      className="modal"
      overlayClassName="overlay"
    >
      <h2>Select Date and Time for Interview</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            required
          />
        </div>
        <div>
          <label>Time:</label>
          <input
            type="time"
            value={selectedTime}
            onChange={handleTimeChange}
            required
          />
        </div>
        <button type="submit">Send Invite</button>
      </form>
    </Modal>
  );
};

export default DateTimeModal;
