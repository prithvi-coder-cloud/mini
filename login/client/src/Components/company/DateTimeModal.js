import React, { useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import "./DateTimeModel.css"; // Import the CSS file

// Set the app element
Modal.setAppElement('#root'); // Make sure your app's root element has an ID of 'root'

const DateTimeModal = ({ isOpen, onRequestClose, applications, jobTitle, onScheduleSet }) => {
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

    const combinedDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    combinedDateTime.setHours(hours);
    combinedDateTime.setMinutes(minutes);

    try {
      const emailPromises = applications.map(async (application) => {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/send-interview-invite`, {
          applicantEmail: application.email,
          interviewDateTime: combinedDateTime,
          jobId: application.jobId._id,
        });

        console.log('Response from server:', response);
      });

      await Promise.all(emailPromises);

      alert('Interview invites sent successfully!');
      onScheduleSet(jobTitle, combinedDateTime);
      onRequestClose();
    } catch (error) {
      console.error('Failed to send interview invite:', error);
      alert('Failed to send interview invites. Please try again later.');
    }
  };

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      maxWidth: '500px',
      width: '90%'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      zIndex: 1000
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Select Date and Time"
      style={customStyles}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
    >
      <h2>Select Date and Time for Interview - {jobTitle}</h2>
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
