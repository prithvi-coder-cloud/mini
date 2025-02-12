import React from 'react';
import './admin.css';
import { NavLink, useNavigate } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();

  const logout = () => {
    // Implement your logout logic here
    sessionStorage.removeItem('user');

    navigate("/login");
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <nav className="admin-nav">
          <ul>
            <li><NavLink exact to="/">Home</NavLink></li>
            <li><NavLink to="/UserDetails" id='us1'>User Management</NavLink></li>
            <li><NavLink to="/AddCompany" id='us2'>Add Company</NavLink></li> {/* New NavLink */}
            <li><NavLink to="/AddCourseProvider">Add Course Provider</NavLink></li>
            <li><NavLink to="/status">Status</NavLink></li>

            <li><NavLink to="/review">Reviews</NavLink></li>

            <li onClick={logout}><a>Logout</a></li>
          </ul>
        </nav>
      </header>
      <h1>Admin Dashboard</h1>

      <main className="admin-main">
        <section className="welcome-section">
          <h2>Welcome to the Admin Page</h2>
          <p>Manage your platform, review user details, and oversee administrative tasks efficiently.</p>
        </section>
        
        <section className="admin-cards">
          <div className="card">
            <h3>User Management</h3>
            <p>View, edit, and manage all user information.</p>
          </div>
          <div className="card">
            <h3>Settings</h3>
            <p>Configure system settings and administrative tools.</p>
          </div>
          <div className="card">
            <h3>Reports</h3>
            <p>Generate and review detailed reports of system usage.</p>
          </div>
        </section>
      </main>

      <footer className="admin-footer">
        <p>© 2024 Admin Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Admin;
