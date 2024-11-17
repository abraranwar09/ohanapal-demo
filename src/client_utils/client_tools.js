//tool function for google search
async function openGoogle(query, toolCallId) {
    console.log(query);
    // Open new tab with Google search
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
    console.log(`Google search opened with query: ${query}`);

    const sessionId = localStorage.getItem('sessionId');

    processResponse(`A tool call has been done. We dont need to submit the response. Only say the following words with no alteration: I have opened a new tab with the Google search results for ${query}`, sessionId);
}

//tool function for profile generation
async function generateProfile(taskDescription, industry, additionalRequirements, model) {
    const lottieContainer = document.getElementById('lottieContainer');
    const sessionId = localStorage.getItem('sessionId');
    const profileResponse = await hitProfileAPI(taskDescription, industry, additionalRequirements, model);
    console.log(profileResponse);

    processResponse(`say the words: Your profile for ${industry} has been created to do the following task: ${taskDescription}.`, sessionId);
}


//tool function for profile generation - helper function to hit the API
async function hitProfileAPI(taskDescription, industry, additionalRequirements, model) {
    console.log(taskDescription, industry, additionalRequirements, model);

    const data = JSON.stringify({
        "taskDescription": taskDescription,
        "industry": industry,
        "additionalRequirements": additionalRequirements,
        "model": "gpt-4o"
    });

    const response = await fetch("https://oi-profile-creator.replit.app/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: data
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const responseData = await response.json();
    // console.log(responseData);
    return responseData;
}

// Function to get calendar events
async function getCalendarEvents(timePeriod, query) {
    const accessToken = localStorage.getItem('accessToken');
    const calendarId = localStorage.getItem('userEmail');
    const sessionId = localStorage.getItem('sessionId');

    //get todays date
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    const response = await fetch("http://localhost:3000/calendar/events", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            accessToken: accessToken,
            calendarId: calendarId,
            timePeriod: timePeriod
        })
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log(data);

    processResponse(`A function call has been completed using your getCalendarEvents tool. Here are the events from the past ${timePeriod}: ${JSON.stringify(data)}. Today's date is ${formattedToday}. The user's query is: ${query}`, sessionId);
}

// Function to save a calendar event
async function saveEvent(summary, location, description, start, end) {
    const accessToken = localStorage.getItem('accessToken');
    const calendarId = localStorage.getItem('userEmail');
    const sessionId = localStorage.getItem('sessionId');

    const response = await fetch("http://localhost:3000/calendar/save-event", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            accessToken: accessToken,
            calendarId: calendarId,
            summary: summary,
            location: location,
            description: description,
            start: start,
            end: end
        })
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log(data);

    processResponse(`A function call has been completed to save an event to the calendar. Say to the user: Your event has been saved to the calendar. The name is ${data.summary}. Your link is ${data.htmlLink}`, sessionId);

}


