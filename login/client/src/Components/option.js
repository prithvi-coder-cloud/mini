


import React,{useState,useEffect} from 'react'
import axios from 'axios';
import {useNavigate}from 'react-router-dom';

import './Home.css'; 
const Option = ({query , handleInputChange}) => {
  // const [query,setQuery] = useState("");
  // const handleInputChange = (event) =>{
  //   setQuery(event.target.value);
  //   console.log(event.target.value)
  // }


  const navigate = useNavigate();
  const getUser = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/login/success`, { withCredentials: true });
      console.log("response",response)
    } catch (error) {
      navigate("*")
    }
  };
  useEffect(() => {
    getUser();
  }, [])
  return (
    <div className="backgrounds">
    <main>
        <section className="hero">
          <div className="hero-content">
            <h1>Find the most exciting startup jobs</h1>
            <div className="search-bar">
              <input type="text" placeholder="what position are you looking for"  onChange={handleInputChange} value={query}/>
              <input type="text" placeholder="Location"/>
              <button className="find-job-btn">Find Job</button>
            </div>
          </div>
        </section>
        
      </main>
    
</div>

  )
}

export default Option
