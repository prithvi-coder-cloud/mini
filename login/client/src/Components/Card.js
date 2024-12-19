import React from 'react';
import './card.css';
import { Link } from 'react-router-dom';
import { FiClock, FiDollarSign, FiMapPin, FiCalendar } from 'react-icons/fi';

const Card = ({ data }) => {
  const { companyName, jobTitle, companyLogo, minPrice, maxPrice, salaryType, jobLocation, employmentType, postingDate, description } = data;
  
  return (
    <section className='card'>
      <Link to={""} className='g4'>
        <img src={companyLogo} alt='' className='company-logo' />
        <div className='card-details'>
          <h1>{companyName}</h1>
          <h3>{jobTitle}</h3>
          <div className='job-details'>
            <span><FiMapPin /> {jobLocation}</span>
            <span><FiClock /> {employmentType}</span>
            <span><FiDollarSign /> {minPrice}-{maxPrice}k</span>
            <span><FiCalendar /> {postingDate}</span>
          </div>
          <p className='description'>{description}</p>
        </div>
      </Link>
    </section>
  );
}

export default Card;
