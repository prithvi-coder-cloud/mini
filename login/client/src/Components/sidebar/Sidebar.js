import React from 'react'
import Location from './Location'
import Salary from './Salary'
import JobPostingData from './JobPostingData'
const Sidebar = ({handleChange,handleClick}) => {
  return (
    <div>
      <h3>Filter</h3>
      <Location handleChange={handleChange}/>
      <Salary handleChange={handleChange} handleClick={handleClick}/>
      <JobPostingData handleChange={handleChange}/>
    </div>
  )
}

export default Sidebar
