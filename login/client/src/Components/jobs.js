
import React from 'react'

const jobData = ({ result }) => {
  return (
    <>
      <div>
        <h3 style={{ color: "black" }}>{result.length} Jobs</h3>


      </div>
      <section>

        {result}
      </section>

    </>
  );
};

export default jobData

