import React from 'react'
import InputField from '../InputField'

const Location = ({handleChange}) => {
  return (
    <div>
      <h4>Location</h4>
      <div>
        <label className='sidebar-label-container'>
            <input type='radio' name='test' value="" onChange={handleChange}/>
            <span className='checkmark'></span>All
        </label>

        <InputField 
          handleChange={handleChange} 
          value="Kochi" 
          title="Kochi" 
          name="test"
        />
        <InputField 
          handleChange={handleChange} 
          value="Haripad" 
          title="Haripad" 
          name="test"
        />
        {/* You can keep other locations if needed */}
      </div>
    </div>
  )
}

export default Location
