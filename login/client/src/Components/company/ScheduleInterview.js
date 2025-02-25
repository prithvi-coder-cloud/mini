import React, { useState } from "react";

const ScheduleInterview = () => {
    const [jobId, setJobId] = useState("");
    const [meetLink, setMeetLink] = useState(null);

    const handleSchedule = async () => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/schedule-interview`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jobId, companyEmail: "company@example.com" }),
        });

        const data = await response.json();
        if (data.success) {
            setMeetLink(data.meetLink);
        }
    };

    return (
        <div>
            <h2>Schedule Interview</h2>
            <input type="text" placeholder="Job ID" value={jobId} onChange={(e) => setJobId(e.target.value)} />
            <button onClick={handleSchedule}>Start Interview</button>

            {meetLink && (
                <div>
                    <h3>Meeting Link:</h3>
                    <a href={meetLink} target="_blank" rel="noopener noreferrer">{meetLink}</a>
                </div>
            )}
        </div>
    );
};

export default ScheduleInterview;
