import React from 'react'
import InputField from '../InputField'

const Location = ({handleChange}) => {
  return (
    <div>
      <h4>Location</h4>
      <div>
        <label className='sidebar-label-container'>
            <input type='radio' name='List' value="" onChange={handleChange}/>
            <span className='checkmark'></span>All
        </label>

        <InputField handleChange={handleChange} value="london" title="London" name="text"/>
        <InputField handleChange={handleChange} value="seattle" title="Seattle" name="text"/>
        <InputField handleChange={handleChange} value="haripad" title="Haripad" name="text"/>
        <InputField handleChange={handleChange} value="boston" title="Boston" name="text"/>
        <InputField handleChange={handleChange} value="brussels" title="Brussels" name="text"/>
        <InputField handleChange={handleChange} value="san Francisco" title="San Francisco" name="text"/>






      </div>
    </div>
  )
}

export default Location
