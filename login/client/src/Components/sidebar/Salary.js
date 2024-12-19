import React from 'react';
import Button from './Button';
import InputField from '../InputField';
import './Salary.css'; // Make sure to import the CSS for styling

const Salary = ({ handleChange, handleClick }) => {
  return (
    <div>
      <h4>Salary</h4>
      <div>
        <Button onClickHandler={handleClick} value="hourly" title="Hourly" />
        <Button onClickHandler={handleClick} value="monthly" title="Monthly" />
        <Button onClickHandler={handleClick} value="yearly" title="Yearly" />
      </div>
      <div>
        <div className='radio-container'>
          <label className='sidebar-label-container'>
            <input type='radio' name='List' value="" onChange={handleChange} />
            <span className='checkmark'></span>All
          </label>
        </div>

        <InputField handleChange={handleChange} value={30000} title="<30000k" name="text2" />
        <InputField handleChange={handleChange} value={50000} title="<50000k" name="text2" />
        <InputField handleChange={handleChange} value={80000} title="<80000k" name="text2" />
        <InputField handleChange={handleChange} value={100000} title="<100000k" name="text2" />
      </div>
    </div>
  );
};

export default Salary;
