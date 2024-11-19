const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const router = express.Router();
const axios = require('axios');

//route to get the user's location from ip address
router.get('/', async (req, res) => {
    try {
        const { ipAddress } = req.query;
        console.log(ipAddress);
        
        // Make request to IP API using axios
        const response = await axios.get(`https://ipapi.co/${ipAddress}/json/`);
        const locationData = response.data;

        if (locationData.error) {
            return res.status(400).json({ 
                success: false, 
                message: 'Failed to fetch location data'
            });
        }

        // Return relevant location data
        res.json({
            success: true,
            locationData: locationData,
            // location: {
            //     city: locationData.city,
            //     region: locationData.region,
            //     country: locationData.country_name,
            //     latitude: locationData.latitude,
            //     longitude: locationData.longitude
            // }
        });

    } catch (error) {
        console.error('Location fetch error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching location'
        });
    }
});

module.exports = router;
