import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ApplicationView.css';
import Header from './Header';

const ApplicationView = () => {
    const navigate = useNavigate();
    const [userdata, setUserdata] = useState({});
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const getUser = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/login/success`, { withCredentials: true });
            setUserdata(response.data.user);

            // Get user details from server
            const email = response.data.user.email;
            const userDetailsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/getUserDetails/${email}`);
            console.log("User Details:", userDetailsResponse.data);

            // Use the ID from userDetails
            const userId = userDetailsResponse.data.id;
            console.log("User ID:", userId);

            // Fetch applications using the user's ID
            const userApplications = await axios.get(`${process.env.REACT_APP_API_URL}/view-applications/${userId}`);
            console.log("Applications Data:", userApplications.data);
            setApplications(userApplications.data.applications);
            setLoading(false);

        } catch (error) {
            console.error("Error:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        getUser();
    }, []);

    return (
        <div>
         <Header/><br></br><br></br><br></br><br></br>            
            {loading ? (
                <div className="loading">Loading applications...</div>
            ) : applications.length === 0 ? (
                <div className="no-applications">You haven't submitted any applications yet.</div>
            ) : (
                <table className="application-table">
                    <thead>
                        <tr>
                            <th>Job Title</th>
                            <th>Company</th>
                            <th>Location</th>
                            <th>Employment Type</th>
                            <th>Experience Level</th>
                            <th>Salary Range</th>
                            <th>Applied Date</th>
                            <th>Resume</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map((app) => (
                            <tr key={app._id}>
                                <td>{app.jobTitle}</td>
                                <td>{app.companyName}</td>
                                <td>{app.jobLocation}</td>
                                <td>{app.employmentType}</td>
                                <td>{app.experienceLevel}</td>
                                <td>{app.salary}</td>
                                <td>{new Date(app.appliedDate).toLocaleDateString()}</td>
                                <td>
                                    <button 
                                        className="view-resume-btn"
                                        onClick={() => window.open(`${process.env.REACT_APP_API_URL}${app.resume}`, '_blank')}
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ApplicationView;