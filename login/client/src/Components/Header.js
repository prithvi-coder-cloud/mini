import React, { useEffect, useState } from 'react';
import "./header.css";
import { NavLink, useNavigate } from 'react-router-dom';
import axios from "axios";
import logo from "./img/logo/job.jpg";

const Header = () => {
  const [userdata, setUserdata] = useState({});
  const navigate = useNavigate();

 
 // setUserdata(user);
  const getUser = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/login/success`, { withCredentials: true });
      setUserdata(response.data.user);
    
    } catch (error) {
      console.log("error", error);
    }
  };

  // Logout function
  const logout = () => {
    sessionStorage.removeItem('user');

    window.open(`${process.env.REACT_APP_API_URL}/logout`, "_self");
  }
  
  useEffect(() => {
    getUser();
  }, []);

  return (
    <>
      <header>
        <nav>
          <div className="logo-container">
            <img src={logo} alt="Logo" className="logo" />
            <h1 className='left'>Job Board</h1>
          </div>
          
          <div className='right'>
            <ul>
              <li>
                <NavLink to="/">Home</NavLink>
              </li>
              {Object.keys(userdata).length > 0 ?(
                <>
                  <li>
                    <NavLink to="/Dashboard">Apply for job</NavLink>
                  </li>
                  <li>
                    <NavLink to="/courselist">Courses</NavLink>
                  </li>
                  {/* <li>
                    <NavLink to="/profile">Profile</NavLink>
                  </li> */}
                  <li>
                    <NavLink to="/changepassword">Change Password</NavLink>
                  </li>
                  {/* <li>
                    <NavLink to="/jobposting">Post Job</NavLink>
                  </li> */}
                  <li onClick={logout}>Logout</li>
                  {/* {Object.keys(userdata).length > 0 ? (<li onClick={ logout }>Logout</li>)} */}
                  {/* <li onClick={userdata ? logout : logout2}>Logout</li> */}


                  <li style={{ color: "black", fontWeight: "bold" }}>
                    {userdata?.displayName}
                   
                    
                  </li>
                  <li>
                    <img src={userdata?.image} style={{ width: "40px", borderRadius: "50%" }} alt="" />
                  </li>
                </>
              ) : (
                <li>
                  <NavLink to="/Login">Login</NavLink>
                </li>
              )}
              
              
            </ul>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
