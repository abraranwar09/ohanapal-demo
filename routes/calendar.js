const express = require('express');
const { google } = require('googleapis');
const router = express.Router();
const axios = require('axios');


router.get('/list/calendars', async (req, res) => {
    try {
        const accessToken = req.body.accessToken;

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://www.googleapis.com/calendar/v3/users/me/calendarList',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        };

        axios.request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
                res.json(response.data);
            })
            .catch((error) => {
                console.log(error);
                res.status(500).send('Error retrieving calendar events: ' + error.message);
            });

    } catch (error) {
        res.status(500).send('Error retrieving calendar events: ' + error.message);
    }
});

module.exports = router;