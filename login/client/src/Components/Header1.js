import React, { useEffect, useState } from 'react';
import "./header1.css";
import { NavLink, useNavigate } from 'react-router-dom';
import axios from "axios";

const Header1 = () => {
//   const [userdata, setUserdata] = useState({});
  const navigate = useNavigate();

  const user = localStorage.getItem('user');
 // setUserdata(user);
//   const getUser = async () => {
//     try {
//       const response = await axios.get("http://localhost:6005/login/success", { withCredentials: true });
//       setUserdata(response.data.user);
    
//     } catch (error) {
//       console.log("error", error);
//     }
//   };

  // Logout function


  const logout2 = () => {
    localStorage.removeItem('user');
    window.open(`${process.env.REACT_APP_API_URL}/logout`, "_self");

  }
//   useEffect(() => {
//     getUser();
//   }, []);

  return (
    <>
      <header>
        <nav>
          <div className="logo-container">
            <img src='./img/logo/job.jpg' alt="Logo" className="logo" />
            <h1 className='left'>Job Board</h1>
          </div>
          
          <div className='right'>
            <ul>
              <li>
                <NavLink to="/">Home</NavLink>
              </li>
              { user ?(
                <>
                  <li>
                    <NavLink to="/Dashboard">Apply for job</NavLink>
                  </li>
                  <li>
                    <NavLink to="/courselist">Courses</NavLink>
                  </li>
                  {/* <li>
                    <NavLink to="/JobPostingForm">Post Job</NavLink>
                  </li> */}
                  {/* <li onClick={logout}>Logout</li> */}
                  <li onClick={logout2}>Logout</li>
                  {/* <li onClick={userdata ? logout : logout2}>Logout</li> */}


                  <li style={{ color: "black", fontWeight: "bold" }}>
                    { user ||""}
                   
                    
                  </li>
                  <li>
                    {/* <img src={userdata?.image} style={{ width: "40px", borderRadius: "50%" }} alt="" /> */}
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

export default Header1;
