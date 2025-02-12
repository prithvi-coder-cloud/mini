// Status.js
import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import './Status.css'; // Ensure you have your CSS file for styling
import { useNavigate } from 'react-router-dom';
import logo from "../img/logo/job.jpg";
// Register the necessary components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Status = () => {
  const [feedbackData, setFeedbackData] = useState([]);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [jobsCount, setJobsCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch feedback data - change to correct endpoint
        const feedbackResponse = await axios.get(`${process.env.REACT_APP_API_URL}/feedbacka`);
        setFeedbackData(feedbackResponse.data);
        console.log('Feedback data:', feedbackResponse.data);

        // Fetch all jobs - change to correct endpoint
        const jobsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/jobsa`);
        setJobsCount(jobsResponse.data.length);
        console.log('Jobs count:', jobsResponse.data.length);

        // Fetch all applications - change to correct endpoint
        const applicationsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/applicationsa`);
        setApplicationsCount(applicationsResponse.data.length);
        console.log('Applications count:', applicationsResponse.data.length);

        // Fetch all courses - change to correct endpoint
        const coursesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/coursesa`);
        setCoursesCount(coursesResponse.data.length);
        console.log('Courses count:', coursesResponse.data.length);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Prepare data for the pie chart
  const pieChartData = {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [
      {
        data: [
          feedbackData.filter(f => f.rating === 1).length,
          feedbackData.filter(f => f.rating === 2).length,
          feedbackData.filter(f => f.rating === 3).length,
          feedbackData.filter(f => f.rating === 4).length,
          feedbackData.filter(f => f.rating === 5).length,
        ],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        borderColor: ['#fff', '#fff', '#fff', '#fff', '#fff'],
        borderWidth: 1,
      },
    ],
  };

  // Bar chart data for applications, jobs, and courses
  const barChartData = {
    labels: ['Applications', 'Jobs', 'Courses'],
    datasets: [
      {
        label: 'Count',
        data: [applicationsCount, jobsCount, coursesCount],
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
        borderColor: ['#2993D9', '#FF4F72', '#FFB41F'],
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Platform Statistics'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div>
      <header className="header">
        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li onClick={() => navigate('/admin')} className="course-nav-link">Back</li>
          </ul>
        </nav>
      </header>
    <div className="status-container">
      <h2>Dashboard Overview</h2>
      <div className="charts">
        <div className="chart">
          <h3>Feedback Ratings Distribution</h3>
          <Pie 
            data={pieChartData} 
            options={{
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }}
          />
        </div>
        <div className="chart">
          <h3>Platform Statistics</h3>
          <Bar data={barChartData} options={barChartOptions} />
        </div>
      </div>
    </div>
    </div>

  );
};

export default Status;