import React from 'react'
import {useNavigate} from 'react-router-dom'
import './Error.css'

const Error = () => {
  const navigate=useNavigate();
  return (
    <div className="error-page">
      <div className="error-container">
        <h1 className="error-code">404</h1>
        <div className="error-message">
          <div className="error-text">
            <h2>Oops! Page Not Found</h2>
            <p>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
          </div>
          <div className="gears">
            <div className="gear-outer">
              <div className="gear-inner"></div>
            </div>
            <div className="gear-outer second">
              <div className="gear-inner"></div>
            </div>
          </div>
        </div>
        <button className="back-button" onClick={()=>navigate("/")}>Back To Home</button>
      </div>
    </div>
  )
}

export default Error
