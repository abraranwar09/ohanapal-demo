//tool function for google search
async function openGoogle(query, toolCallId, toolCallMessage) {
    console.log(query);
    // Open new tab with Google search
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
    console.log(`Google search opened with query: ${query}`);

    const sessionId = localStorage.getItem('sessionId');

    const toolCallResults = {
        "status": "success",
        "message": `Google search completed for ${query}`
    };

    submitToolCall(sessionId, toolCallId, toolCallMessage, toolCallResults);
    // processResponse(`A tool call has been done. We dont need to submit the response. Only say the following words with no alteration: I have opened a new tab with the Google search results for ${query}`, sessionId);
}

//tool function for profile generation
async function generateProfile(taskDescription, industry, additionalRequirements, model, toolCallId, toolCallMessage) {
    const lottieContainer = document.getElementById('lottieContainer');
    const sessionId = localStorage.getItem('sessionId');
    const profileResponse = await hitProfileAPI(taskDescription, industry, additionalRequirements, model);
    console.log(profileResponse);

    const toolCallResults = profileResponse;

    submitToolCall(sessionId, toolCallId, toolCallMessage, toolCallResults);

    // processResponse(`say the words: Your profile for ${industry} has been created to do the following task: ${taskDescription}.`, sessionId);
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
        processResponse(`Say the words: There was an error generating your profile. Please try again later or check your config.`, sessionId);
        throw new Error('Network response was not ok');
    }

    const responseData = await response.json();
    // console.log(responseData);
    return responseData;
}

// Function to get calendar events
async function getCalendarEvents(timePeriod, query, toolCallId, toolCallMessage) {
    const accessToken = localStorage.getItem('accessToken');
    const calendarId = localStorage.getItem('userEmail');
    const sessionId = localStorage.getItem('sessionId');

    //get todays date
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    const response = await fetch("/google/calendar/events", {
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
        processResponse(`Say the words: There was an error getting your calendar events. Please try again later or check your config.`, sessionId);
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log(data);

    const toolCallResults = data;

    submitToolCall(sessionId, toolCallId, toolCallMessage, toolCallResults);
    // processResponse(`A tool call has been completed using your getCalendarEvents tool. This is the tool call response containing the events from the past ${timePeriod}: ${JSON.stringify(data)}. Today's date is ${formattedToday}. The user's query is: ${query}. You do not have to specifically output all data. Remember to optimize your sentence to be spoken out loud.`, sessionId);
}

// Function to save a calendar event
async function saveEvent(summary, location, description, start, end, toolCallId, toolCallMessage) {
    const accessToken = localStorage.getItem('accessToken');
    const calendarId = localStorage.getItem('userEmail');
    const sessionId = localStorage.getItem('sessionId');

    const response = await fetch("/google/calendar/save-event", {
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
        processResponse(`Say the words: There was an error saving to your calendar. Please try again later or check your config.`, sessionId);
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log(data);

    const toolCallResults = data;

    submitToolCall(sessionId, toolCallId, toolCallMessage, toolCallResults);
    // processResponse(`A tool call has been completed to save an event to the calendar. The response is: ${JSON.stringify(data)}. Say to the user: Your event has been saved to the calendar. You do not have to specifically output all data but mention the name, date and start time. Remember to optimize your sentence to be spoken out loud.`, sessionId);

}

// Function to patch user information
async function patchUserInformation(userName, age, gender, assessmentSummary, isAssessmentComplete, toolCallId, toolCallMessage) {
    const token = localStorage.getItem('token');
    const sessionId = localStorage.getItem('sessionId');

    // Construct the request body with only provided parameters
    const requestBody = {};
    if (userName !== undefined) requestBody.userName = userName;
    if (age !== undefined) requestBody.age = age;
    if (gender !== undefined) requestBody.gender = gender;
    if (assessmentSummary !== undefined) requestBody.assessmentSummary = assessmentSummary;
    if (isAssessmentComplete !== undefined) requestBody.isAssessmentComplete = isAssessmentComplete;

    try {
        const response = await fetch("/api/user", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log(data);
        console.log('Assessment complete: ', data.isAssessmentComplete);
        if (data.isAssessmentComplete === true) {
            const toolCallResults = data;

            submitToolCall(sessionId, toolCallId, toolCallMessage, toolCallResults);
            // processResponse(`Say the words: The assessment is complete. Thank you for your time. We are redirecting you to the home page.`, sessionId);

            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 9000);
        } else {
            const toolCallResults = data;

            submitToolCall(sessionId, toolCallId, toolCallMessage, toolCallResults);    
            // processResponse(`There has been a tool call to update user information. User information has been updated successfully. Here are the updated details: ${JSON.stringify(data)}. Summarise this action to the user`, sessionId);
        }
    } catch (error) {
        console.error('Error updating user information:', error);
        processResponse('There was an error. You should say: There was an error updating the user information. Please try again later.', sessionId);
    }
}

// tool to capture image from users raspberry pi
async function cameraCapture(query, toolCallId, toolCallMessage) {
    const piUrl = localStorage.getItem('piUrl');
    const sessionId = localStorage.getItem('sessionId');
    console.log(piUrl);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "command": "~/capture_image.sh",
        "args": []
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    var output = "";

    try {
        const response = await fetch(`${piUrl}/api/run-command`, requestOptions);
        const result = await response.text();
        const parsedResult = JSON.parse(result);
        output = parsedResult.output;
    } catch (error) {
        console.error(error);
        processResponse(`Say the words: There was an error with your camera capture tool. Please try again later or check your config.`, sessionId);

    }

    //split output by the the text 'Still capture image received'
    var splitOutput = output.split('Still capture image received');
    var base64Image = splitOutput[1];

    var processOutput = await processImage(`data:image/jpeg;base64,${base64Image}`, query);
    var parsedOutput = JSON.parse(processOutput);
    console.log(parsedOutput.message);

    const toolCallResults = parsedOutput;

    submitToolCall(sessionId, toolCallId, toolCallMessage, toolCallResults);
    // processResponse(`The image has been captured and processed using the cameraCapture tool. The tool callresponse is: ${parsedOutput.message}. Describe the response to me like I am blind.`, sessionId);
}

async function processImage(base64Image, query) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Cookie", "connect.sid=s%3AitKwfr0EunoT4AGCQ74-NLq3PynS9-uJ.Gj0zQjeI3l%2BhwjJV9eFmSsoDjKOUCBjv0JVCUDKLqo0");

    const raw = JSON.stringify({
        "base64_image": base64Image,
        "query": query
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    try {
        const response = await fetch("/api/audio/process-image", requestOptions);
        const result = await response.text();
        // console.log(result);
        return result;
    } catch (error) {
        console.error(error);
    }
}

async function executeComputerCommand(command, toolCallId, toolCallMessage) {
    const piUrl = localStorage.getItem('piUrl');
    const sessionId = localStorage.getItem('sessionId');

    console.log(piUrl);

    const data = JSON.stringify({
        "message": command
    });

    try {
        const response = await fetch(`${piUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: data
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        console.log(JSON.stringify(responseData));

        const toolCallResults = responseData;
        // submitToolCall(sessionId, toolCallId, toolCallMessage, toolCallResults);
        processResponse(`A tool call has been completed to execute a computer command. These are the results: ${JSON.stringify(responseData)}. You may need this information to provide answers to the users previous questions or to complete another task. Say the words after LIBERATING GODMODE ACTIVE`, sessionId);
    } catch (error) {
        console.error('Error executing computer command:', error);
        processResponse(`Say the words: There was an error executing the computer command. Please try again later.`, sessionId);
    }
}

//tool to get the user's location
async function getUserLocation(toolCallId, toolCallMessage) {
    const sessionId = localStorage.getItem('sessionId');
    
    try {
        // First get the IP address
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        if (!ipResponse.ok) throw new Error('Failed to get IP address');
        const ipData = await ipResponse.json();
        
        // Then get location data using the IP
        const locationResponse = await fetch(`/location?ipAddress=${ipData.ip}`);
        if (!locationResponse.ok) throw new Error('Failed to get location data');
        const locationData = await locationResponse.json();
        
        const toolCallResults = locationData;

        submitToolCall(sessionId, toolCallId, toolCallMessage, toolCallResults);
        // processResponse(`A tool call has been completed to get your location. The response is: ${JSON.stringify(locationData)}. You may need this information to provide answers to the users previous questions or to complete another task.`, sessionId);
        return locationData;
    } catch (error) {
        console.error('Error getting location:', error);
        processResponse(`Say the words: There was an error getting your location. Please try again later.`, sessionId);
        throw error;
    }
}

//tool to use perplexity
async function usePerplexity(query, toolCallId, toolCallMessage) {
    const sessionId = localStorage.getItem('sessionId');

    const response = await fetch("/perplexity/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: query })
    });

    const data = await response.json();
    console.log(data);  

    const toolCallResults = data;

    submitToolCall(sessionId, toolCallId, toolCallMessage, toolCallResults);
}

// Function to list Gmail messages
async function listGmailMessages(maxResults, query, toolCallId, toolCallMessage) {
    const accessToken = localStorage.getItem('accessToken');
    const sessionId = localStorage.getItem('sessionId');

    try {
        const response = await fetch("/google/gmail/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                accessToken,
                maxResults,
                query
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log(data);
        const toolCallResults = {
            "emails": data
        };

        submitToolCall(sessionId, toolCallId, toolCallMessage, toolCallResults);
    } catch (error) {
        console.error('Error fetching emails:', error);
        processResponse(`Say the words: There was an error fetching your emails. Please try again later.`, sessionId);
    }
}

// Function to get specific Gmail message details
async function getGmailMessage(messageId, toolCallId, toolCallMessage) {
    const accessToken = localStorage.getItem('accessToken');
    const sessionId = localStorage.getItem('sessionId');

    try {
        const response = await fetch(`/google/gmail/message/${messageId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                accessToken
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const toolCallResults = data;

        submitToolCall(sessionId, toolCallId, toolCallMessage, toolCallResults);
    } catch (error) {
        console.error('Error fetching email details:', error);
        processResponse(`Say the words: There was an error fetching the email details. Please try again later.`, sessionId);
    }
}

// Function to send Gmail message
async function sendGmailMessage(to, subject, body, cc, bcc, isHtml, toolCallId, toolCallMessage) {
    const accessToken = localStorage.getItem('accessToken');
    const sessionId = localStorage.getItem('sessionId');

    try {
        const response = await fetch("/google/gmail/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                accessToken: accessToken,
                to: to,
                subject: subject,
                body: body,
                // cc: cc,
                // bcc: bcc,
                isHtml: isHtml
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const toolCallResults = data;

        submitToolCall(sessionId, toolCallId, toolCallMessage, toolCallResults);
    } catch (error) {
        console.error('Error sending email:', error);
        processResponse(`Say the words: There was an error sending your email. Please try again later.`, sessionId);
    }
}



