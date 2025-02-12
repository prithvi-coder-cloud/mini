// Chatbot.js
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Chatbot.css'; // Create a CSS file for styling
import chatbotImage from '../Components/img/hero/chatbot.jpg'; // Your chatbot image
import { IoSend } from 'react-icons/io5'; // Add this import at the top

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll when chat window opens
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return; // Prevent sending empty messages

    const newMessage = { text: userInput, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Call the backend to get a response
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/chatbot`, {
        message: userInput,
      });

      const botMessage = { text: response.data.reply, sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error fetching response from backend:', error);
      const errorMessage = { text: 'Sorry, I cannot fetch the information at the moment.', sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }

    setUserInput(''); // Clear input field
  };

  return (
    <div className="chatbot-container">
      <img
        src={chatbotImage}
        alt="Chatbot"
        className={`chatbot-image ${isOpen ? 'active' : ''}`}
        onClick={toggleChat}
      />
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>Job Board Assistant</h3>
          </div>
          <div className="chatbot-messages" ref={messagesContainerRef}>
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                <div className="message-content">
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbot-input">
            <textarea
              value={userInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your question..."
              rows="1"
            />
            <button onClick={handleSendMessage}>
              <IoSend size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;