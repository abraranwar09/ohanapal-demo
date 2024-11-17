const express = require('express');
const { google } = require('googleapis');
const router = express.Router();
const axios = require('axios');


router.get('/list', async (req, res) => {
    try {
        const accessToken = req.body.accessToken;
        const email = req.body.email;

        // Initialize the Google Calendar API client
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const calendar = google.calendar({ version: 'v3', auth });

        // Use the Google Calendar API to list calendars
        calendar.calendarList.list({}, (err, response) => {
            if (err) {
                console.error('The API returned an error: ' + err);
                return res.status(500).send('Error retrieving calendar events: ' + err.message);
            }
            const calendars = response.data.items;
            calendars.forEach(calendar => {
               if(calendar.id === email){
                res.json(calendar);
               }
            });

            // res.json(calendars);
        });

    } catch (error) {
        res.status(500).send('Error retrieving calendar events: ' + error.message);
    }
});

router.post('/events', async (req, res) => {
    try {
        const accessToken = req.body.accessToken;
        const calendarId = req.body.calendarId;
        const timePeriod = req.body.timePeriod;

        // Initialize the Google Calendar API client
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const calendar = google.calendar({ version: 'v3', auth });

        // Calculate the time range based on the timePeriod
        const now = new Date();
        let timeMin, timeMax;

        switch (timePeriod) {
            case 'last 30 days':
                timeMin = new Date(now);
                timeMin.setDate(now.getDate() - 30);
                timeMin.setHours(0, 0, 0, 0); // Start of the day 30 days ago
                timeMax = new Date(now.setHours(23, 59, 59, 999)); // End of today
                break;
            case 'last week':
                timeMin = new Date(now);
                timeMin.setDate(now.getDate() - 7);
                timeMax = new Date(now.setHours(23, 59, 59, 999)); // End of today
                break;
            case 'today':
                timeMin = new Date(now.setHours(0, 0, 0, 0));
                timeMax = new Date(now.setHours(23, 59, 59, 999));
                break;
            case 'next week':
                timeMin = new Date(now.setHours(0, 0, 0, 0)); // Start of today
                timeMax = new Date(now);
                timeMax.setDate(now.getDate() + 7);
                timeMax.setHours(23, 59, 59, 999); // End of the last day of the next week
                break;
            case 'next 30 days':
                timeMin = new Date(now.setHours(0, 0, 0, 0)); // Start of today
                timeMax = new Date(now);
                timeMax.setDate(now.getDate() + 30);
                timeMax.setHours(23, 59, 59, 999); // End of the last day of the next 30 days
                break;
            default:
                return res.status(400).send('Invalid time period specified.');
        }

        // Use the Google Calendar API to list events
        calendar.events.list({
            calendarId: calendarId,
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
        }, (err, response) => {
            if (err) {
                console.error('The API returned an error: ' + err);
                return res.status(500).send('Error retrieving calendar events: ' + err.message);
            }
            const events = response.data.items;
            if (events.length) {
                res.json(events);
            } else {
                res.status(404).send('No events found in the specified time range.');
            }
        });

    } catch (error) {
        res.status(500).send('Error retrieving calendar events: ' + error.message);
    }
});

router.post('/save-event', async (req, res) => {
    try {
        const { accessToken, calendarId, summary, location, description, start, end } = req.body;

        // Initialize the Google Calendar API client
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const calendar = google.calendar({ version: 'v3', auth });

        // Define the event object
        const event = {
            summary: summary,
            location: location,
            description: description,
            start: {
                dateTime: start, // e.g., '2023-10-01T09:00:00-07:00'
                timeZone: 'America/Los_Angeles', // Adjust the time zone as needed
            },
            end: {
                dateTime: end, // e.g., '2023-10-01T17:00:00-07:00'
                timeZone: 'America/Los_Angeles', // Adjust the time zone as needed
            },
        };

        // Use the Google Calendar API to insert the event
        calendar.events.insert({
            calendarId: calendarId,
            resource: event,
        }, (err, event) => {
            if (err) {
                console.error('The API returned an error: ' + err);
                return res.status(500).send('Error creating calendar event: ' + err.message);
            }
            res.status(201).json(event.data);
        });

    } catch (error) {
        res.status(500).send('Error creating calendar event: ' + error.message);
    }
});



module.exports = router;


